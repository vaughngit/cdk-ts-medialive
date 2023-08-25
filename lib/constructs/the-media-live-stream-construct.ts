//import * as cdk from '@aws-cdk/core';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as medialive from 'aws-cdk-lib/aws-medialive';
import * as mediapackage from 'aws-cdk-lib/aws-mediapackage';
import * as mediaconnect from 'aws-cdk-lib/aws-mediaconnect';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Effect, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnOutput, Fn, StackProps, Tags } from 'aws-cdk-lib';
import {config, mediaConfiguration} from '../../config'

export interface IStackProps extends StackProps{
   environment: string; 
   costcenter: string; 
   solutionName: string; 
 }

export class TheMediaLiveStreamConstructs extends Construct {

  public readonly mediaPackageUrlStream: string 
  public readonly inputUri: string 
  public readonly mediaLiveChannelId: string 

  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id);

    /*
    * First step: Create MediaPackage Channel
    */
    const channel = new mediapackage.CfnChannel(scope = this,id = `media-package-channel-${mediaConfiguration["id_channel"]}`, {
      id: mediaConfiguration["id_channel"],
      description: `Channel ${mediaConfiguration["id_channel"]}`
    });

    // const testChannel = new mediaconnect.CfnFlow(this,"mediaConnectTest",{
    //   name: "newobsFlow",
    //   source: {
    //     name: "myobs2",
    //     description: `Channel ${configuration["id_channel"]}`,
    //     ingestPort: 5010,
    //     protocol: 'SRT listener',
    //   }
    // } )

    /*
    * Second step: Add a HLS endpoint to MediaPackage Channel and output the URL of this endpoint
    */
    const hlsPackage: mediapackage.CfnOriginEndpoint.HlsPackageProperty = {
      segmentDurationSeconds: mediaConfiguration["hls_segment_duration_seconds"],
      playlistWindowSeconds: mediaConfiguration["hls_playlist_window_seconds"],
      streamSelection: {
        minVideoBitsPerSecond: mediaConfiguration["hls_min_video_bits_per_second"],
        maxVideoBitsPerSecond: mediaConfiguration["hls_max_video_bits_per_second"],
        streamOrder: mediaConfiguration["hls_stream_order"]
      }
    }
    
    const hls_endpoint = new mediapackage.CfnOriginEndpoint(scope = this,
      id = `endpoint${mediaConfiguration["id_channel"]}`, {
      //channelId: configuration["id_channel"],
      channelId: channel.id,
      id: `endpoint${mediaConfiguration["id_channel"]}`,
      hlsPackage
    });

    

    /*
    * Third step: Create MediaLive SG, MediaLive Input and MediaLive Channel
    */

    const security_groups_input = new medialive.CfnInputSecurityGroup(scope = this,
      id = "media-live-sg-input", {
      whitelistRules: [{ "cidr": mediaConfiguration["ip_sg_input"] }]
    });

    /*
    * Input with destinations output
    */
    const medialive_input = new medialive.CfnInput(scope = this,
      id = "media-input-channel", {
      name: `input-${mediaConfiguration["id_channel"]}`,
      //type: "RTMP_PUSH",
      type: "RTMP_PUSH",
      inputSecurityGroups: [security_groups_input.ref],
      destinations: [{ streamName: mediaConfiguration["stream_name"] }]
    });

 
    

    /*
    * Media Live Channel Block
    */

    // IAM Role
    let iamRole = new iam.Role(scope = this, id = "medialive_role", {
      roleName: "medialive_role",
      assumedBy: new iam.ServicePrincipal('medialive.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElementalMediaLiveFullAccess'),
      ],
      inlinePolicies: {
        MediaLiveInlinePolicy: new PolicyDocument({
          assignSids:true,
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ["arn:aws:logs:*:*:*"],
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams",
                "logs:DescribeLogGroups"
              ],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ["*"],
              actions: [
                "mediaconnect:ManagedDescribeFlow",
                "mediaconnect:ManagedAddOutput",
                "mediaconnect:ManagedRemoveOutput"
              ],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ["*"],
              actions: [
                "ec2:describeSubnets",
                "ec2:describeNetworkInterfaces",
                "ec2:createNetworkInterface",
                "ec2:createNetworkInterfacePermission",
                "ec2:deleteNetworkInterface",
                "ec2:deleteNetworkInterfacePermission",
                "ec2:describeSecurityGroups"
              ],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ["*"],
              actions: [
                "mediapackage:DescribeChannel"            
              ],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: [
                "arn:aws:s3:::*",
                "arn:aws:s3:::*/*"
              ],
              actions: [
                "s3:ListBucket",
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"           
              ],
            }),
          ],
        })
      }
    });

    // MediaLive Channel
    var channelLive = new medialive.CfnChannel(this, `media-live-channel-${mediaConfiguration["id_channel"]}`, {
      channelClass: "SINGLE_PIPELINE",
      name: mediaConfiguration["id_channel"],
      inputSpecification: {
        codec: "AVC",
        maximumBitrate: "MAX_20_MBPS",
        resolution: "HD"
      },
      inputAttachments: [{
        inputId: medialive_input.ref,
        inputAttachmentName: "attach-input"
      }],
      destinations: [{
        id: "media-destination",
        mediaPackageSettings: [{
          channelId: mediaConfiguration["id_channel"]
        }]
      }],
      encoderSettings: {
        timecodeConfig: {
          source: "EMBEDDED"
        },
        
        // Audio descriptions
        audioDescriptions: [{
          audioSelectorName: "Default",
          audioTypeControl: "FOLLOW_INPUT",
          languageCodeControl: "FOLLOW_INPUT",
          name: "audio_1",
          codecSettings: {
            aacSettings: {
              bitrate: 192000,
              codingMode: "CODING_MODE_2_0",
              inputType: "NORMAL",
              profile: "LC",
              rateControlMode: "CBR",
              rawFormat: "NONE",
              sampleRate: 48000,
              spec: "MPEG4"
            }
          }
        },
        {
          audioSelectorName: "Default",
          audioTypeControl: "FOLLOW_INPUT",
          languageCodeControl: "FOLLOW_INPUT",
          name: "audio_2",
          codecSettings: {
            aacSettings: {
              bitrate: 192000,
              codingMode: "CODING_MODE_2_0",
              inputType: "NORMAL",
              profile: "LC",
              rateControlMode: "CBR",
              rawFormat: "NONE",
              sampleRate: 48000,
              spec: "MPEG4"
            }
          }
        }],
        // Video descriptions
        videoDescriptions: [{
          codecSettings: {
            h264Settings: {
              adaptiveQuantization: "HIGH",
              afdSignaling: "NONE",
              bitrate: 5000000,
              colorMetadata: "INSERT",
              entropyEncoding: "CABAC",
              flickerAq: "ENABLED",
              framerateControl: "SPECIFIED",
              framerateDenominator: 1,
              framerateNumerator: 50,
              gopBReference: "ENABLED",
              gopClosedCadence: 1,
              gopNumBFrames: 3,
              gopSize: 60,
              gopSizeUnits: "FRAMES",
              level: "H264_LEVEL_AUTO",
              lookAheadRateControl: "HIGH",
              numRefFrames: 3,
              parControl: "SPECIFIED",
              profile: "HIGH",
              rateControlMode: "CBR",
              scanType: "PROGRESSIVE",
              sceneChangeDetect: "ENABLED",
              slices: 1,
              spatialAq: "ENABLED",
              syntax: "DEFAULT",
              temporalAq: "ENABLED",
              timecodeInsertion: "DISABLED"
            }
          },
          height: 1080,
          name: "video_1080p30",
          respondToAfd: "NONE",
          scalingBehavior: "DEFAULT",
          sharpness: 50,
          width: 1920
        },
        {
          codecSettings: {
            h264Settings: {
              adaptiveQuantization: "HIGH",
              afdSignaling: "NONE",
              bitrate: 3000000,
              colorMetadata: "INSERT",
              entropyEncoding: "CABAC",
              flickerAq: "ENABLED",
              framerateControl: "SPECIFIED",
              framerateDenominator: 1,
              framerateNumerator: 50,
              gopBReference: "ENABLED",
              gopClosedCadence: 1,
              gopNumBFrames: 3,
              gopSize: 60,
              gopSizeUnits: "FRAMES",
              level: "H264_LEVEL_AUTO",
              lookAheadRateControl: "HIGH",
              numRefFrames: 3,
              parControl: "SPECIFIED",
              profile: "HIGH",
              rateControlMode: "CBR",
              scanType: "PROGRESSIVE",
              sceneChangeDetect: "ENABLED",
              slices: 1,
              spatialAq: "ENABLED",
              syntax: "DEFAULT",
              temporalAq: "ENABLED",
              timecodeInsertion: "DISABLED"
            }
          },
          height: 720,
          name: "video_720p30",
          respondToAfd: "NONE",
          scalingBehavior: "DEFAULT",
          sharpness: 100,
          width: 1280
        }
        ],
        // Output groups
        outputGroups: [{
          name: "HD",
          outputGroupSettings: {
            mediaPackageGroupSettings: {
              destination: {
                destinationRefId: "media-destination"
              }
            }
          },
          outputs: [{
            audioDescriptionNames: ["audio_1"],
            outputName: "1080p30",
            videoDescriptionName: "video_1080p30",
            outputSettings: {
              mediaPackageOutputSettings: {}
            }
          },
          {
            audioDescriptionNames: ["audio_2"],
            outputName: "720p30",
            videoDescriptionName: "video_720p30",
            outputSettings: {
              mediaPackageOutputSettings: {}
            }
          }]
        }]
      },
      roleArn: iamRole.roleArn
    });





    hls_endpoint.addDependency(channel)
    channelLive.addDependency(channel)

  
    this.mediaLiveChannelId = channelLive.attrArn

    this.inputUri = Fn.select(0, medialive_input.attrDestinations)

    this.mediaPackageUrlStream = hls_endpoint.attrUrl

      //  // Output the url stream to player
      //  new CfnOutput(scope = this, id = "media-package-url-stream", {
      //   value: `https://hlsjs.video-dev.org/demo/?src=${hls_endpoint.attrUrl}`
      // });
  

    Tags.of(this).add("environment", props.environment)
    Tags.of(this).add("solution", props.solutionName)
    Tags.of(this).add("costcenter", props.costcenter)

  }

}

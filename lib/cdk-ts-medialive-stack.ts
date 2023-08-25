import { CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TheMediaLiveStreamConstructs } from './constructs/the-media-live-stream-construct';

export interface IStackProps extends StackProps{
  environment: string; 
  costcenter: string; 
  solutionName: string; 
}


export class MedialiveStack extends Stack {
  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);

    const {mediaPackageUrlStream, inputUri, mediaLiveChannelId} = new TheMediaLiveStreamConstructs(this, 'MediaLiveStreamConstructs', {...props});
    //new TheMediaLiveStreamWebsiteStack(app, 'TheMediaLiveStreamWebsiteStack', {env}).addDependency(mediaChannel);

   
   
      // Output the url stream to player
      new CfnOutput(scope = this, id = "webPlayer-url-stream", {
      value: `https://hlsjs.video-dev.org/demo/?src=${mediaPackageUrlStream}`
    });
      
   
   
    const inputChannel = inputUri.substring(inputUri.lastIndexOf("/") + 1) // extracts the stream key
    // Output the input channel
    new CfnOutput(this, "media-package-url-input-channel", {
      value: inputChannel
    });


      const channelId = Fn.select(6, Fn.split(':', mediaLiveChannelId)); // extracts channel id from the arn 
      console.log("channelId: ", channelId)
      // Output the url stream to player
      new CfnOutput(this, "media-live-channel-id", {
        value: channelId
      });


      // Output the MediaLive Console 
      new CfnOutput(this, "media-live-console", {
        value: `https://${this.region}.console.aws.amazon.com/medialive/home?region=${this.region}#/`
      });
      

  }
  
  
}

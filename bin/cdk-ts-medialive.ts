#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
//import { CdkTsMedialiveStack } from '../lib/cdk-ts-medialive-stack';
import { TheMediaLiveStreamStack } from '../lib/the-media-live-stream-stack';
import { TheMediaLiveStreamWebsiteStack } from '../lib/the-media-live-stream-website';


const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION
//const region = 'us-west-2' // static region configuration to target region different from default region configured in cli profile
const env = {account, region}; 



//stackName: `${config.solutionName}-${config.environment}`,

const app = new cdk.App();
// new CdkTsMedialiveStack(app, 'CdkTsMedialiveStack', {

// });

var mediaChannel = new TheMediaLiveStreamStack(app, 'TheMediaLiveStreamStack', {env});
//new TheMediaLiveStreamWebsiteStack(app, 'TheMediaLiveStreamWebsiteStack', {env}).addDependency(mediaChannel);
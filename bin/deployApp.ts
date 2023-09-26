#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { MedialiveStack } from '../lib/cdk-ts-medialive-stack';

import {config} from '../config'; 


const account = process.env.CDK_DEFAULT_ACCOUNT;
//const region = process.env.CDK_DEFAULT_REGION
const region = 'us-west-2' // static region configuration to target region different from default region configured in cli profile
const env = {account, region}; 


const app = new App();
 new MedialiveStack(app, 'MedialiveStack', {
  stackName: `${config.solutionName}-${config.environment}`,
  env,
  ...config
 });


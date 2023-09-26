# Welcome to the CDK TypeScript Media Live project

## Getting Started: 

- You must run bootstrap your AWS account to deploy CDK solutions. This command has to be executed once per AWS Account:
    `cdk bootstrap `

- This solution creates an [AWS Elemental MediaPackage](https://aws.amazon.com/mediapackage/) input which provides an single video input channel to stream live video from a local network streaming software solution, such as [OBS](https://obsproject.com/). 

- This solution also creates an [AWS Elemental MediaLive](https://aws.amazon.com/medialive/) channel which receives the video input, processes the live content, and delivers the broadcast to TVs, internet-connected devices, and/or other AWS media services for processing and encoding. This solution also leverages AWS Elemental MediaPackage to deliver the content in 730p and HD1080p to a [web content demo service](https://hlsjs.video-dev.org/demo/) that content providers can use to test HLS streams in supported browsers (Chrome/Firefox/IE11/Edge/Safari). 

### Deploy the Solution: 

1. Adjust the `mediaConfiguration` parameters in the `cdk-ts-medialive/config/staticConfig.ts` to modified LiveStream channel configuration as desired

2. Deploy this solution via the command below: 
    ```bash
      cdk deploy --profile dev  
    ```

3. Option a: Start the MediaLive Channel via console
    - Navigate to the AWS Elemental MediaLive Console 
    - click the Channels link in the sidebar. 
    - Check the box next to the "demo-channel" 
    - Click the start button in the top right corner of the screen. 


3. Option b: Start Media Live Channels via aws cli 
    - ` aws medialive start-channel --channel-id 5204063 --profile dev --region us-west-2    `
**Remember to stop your channel after you are done testing as it charges per second**

4. Connect Your Local Broadcast Software (ex OBS) using the value provided in the Outputs in the terminal:
    - `MedialiveStack.mediapackageurlinputchannel` 
        - Server source:  `rtmp://ip/demo`  
        - Server Key : `channel` 




## Teardown Instructions 
 1. Stop Media Live Channel 
    - ` aws medialive stop-channel --channel-id 3284674 --profile dev --region us-west-2   `










The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

# Welcome to the CDK TypeScript Media Live project








### References: 
-[CDK-SPA-Deploy](https://github.com/nideveloper/CDK-SPA-Deploy)

-[The Media Live Stream](https://github.com/cdk-patterns/serverless/blob/main/the-media-live-stream/typescript/README.md)


- You must run `cdk bootstrap ` before run the other commands. 

- This solution creates an [AWS Elemental MediaPackage](https://aws.amazon.com/mediapackage/) input which provides an single video input channel to stream live video from a local network streaming software solution, such as [OBS](https://obsproject.com/). 
- This solution also creates an [AWS Elemental MediaLive](https://aws.amazon.com/medialive/) channel which receives the video input, processes the live content, and delivers the broadcast to TVs, internet-connected devices, and/or other AWS media services for processing and encoding. This solution also leverages AWS Elemental MediaPackage to deliver the content in 730p and HD1080p to a [web content demo service](https://hlsjs.video-dev.org/demo/) that content providers can use to test HLS streams in supported browsers (Chrome/Firefox/IE11/Edge/Safari). 

### Deploy the Solution: 

- Adjust the `mediaConfiguration` parameters in the `cdk-ts-medialive/config/staticConfig.ts` to modified LiveStream channel configuration as desired
- Deploy this solution via the command below: 
    ```bash
    npm run deploy
    ```
- Start the MediaLive Channel to enable streaming > Navigate to the AWS Elemental MediaLive Console and click the Channels link in the sidebar. Check the box next to the "demo-channel" and now click the start button in the top right corner of the screen. **Remember to stop your channel after you are done testing as it charges per second**

- Connect Your Local Broadcast Software using the value provided in the Outputs in the terminal:
    - `MedialiveStack.mediapackageurlinputchannel` 
        - Server source:  `rtmp://ip/demo`  
        - Server Key : `channel` 
        
- Verify Instead the 










The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

export const config ={
     environment: "demo", //Environment name should be between 2 and 10 characters (only lowercase alphabets)
     costcenter: "npo", 
     solutionName: "MediaLive", 
 }


export const mediaConfiguration = {
    id_channel: `${config.environment}-channel`,
    ip_sg_input: "0.0.0.0/0",  // Input Security Group: update with your public ip address
    stream_name: `${config.environment}/channel`,
    hls_segment_duration_seconds: 5,
    hls_playlist_window_seconds: 60,
    hls_max_video_bits_per_second: 2147483647,
    hls_min_video_bits_per_second: 0,
    hls_stream_order: "ORIGINAL"
  }


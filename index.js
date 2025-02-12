const { execSync } = require("child_process");

function zoomVideo(iw, ih, z, ptX, ptY) {

    // Calculate crop dimensions based on the provided parameters
    const X = Math.floor((iw / 2) + ((ptX - (iw / 2)) * (z / (z - 1))));
    const Y = Math.floor((ih / 2) + ((ptY - (ih / 2)) * (z / (z - 1))));


    const outputFile = `output/${ptX}x${ptY}.mp4`

    // Construct the FFmpeg command. Newlines have been escaped with backslashes.
    const ffmpegCommand = `ffmpeg -i input.mp4 -filter_complex "[0:v]split=4[lefttop][leftbottom][righttop][rightbottom];[lefttop]crop=${X}:${Y}:0:0,zoompan=z='if(between(time,0,3),1+${(z - 1) / 3}*(time-0),if(between(time,5,8),${z}-${(z - 1) / 3}*(time-5),if(between(time,3,5),${z},1)))':x=${X}:y=${Y}:d=1:s=${X}x${Y}:fps=25[lt];[leftbottom]crop=${X}:${ih - Y}:0:${Y},zoompan=z='if(between(time,0,3),1+${(z - 1) / 3}*(time-0),if(between(time,5,8),${z}-${(z - 1) / 3}*(time-5),if(between(time,3,5),${z},1)))':x=${X}:y=0:d=1:s=${X}x${ih - Y}:fps=25[lb];[righttop]crop=${iw - X}:${Y}:${X}:0,zoompan=z='if(between(time,0,3),1+${(z - 1) / 3}*(time-0),if(between(time,5,8),${z}-${(z - 1) / 3}*(time-5),if(between(time,3,5),${z},1)))':x=0:y=${Y}:d=1:s=${iw - X}x${Y}:fps=25[rt];[rightbottom]crop=${iw - X}:${ih - Y}:${X}:${Y},zoompan=z='if(between(time,0,3),1+${(z - 1) / 3}*(time-0),if(between(time,5,8),${z}-${(z - 1) / 3}*(time-5),if(between(time,3,5),${z},1)))':x=0:y=0:d=1:s=${iw - X}x${ih - Y}:fps=25[rb];color=c=ffffff:s=${iw}x${ih}:r=25:d=10,settb=1/10[bg];[bg][lt]overlay=0:0:enable='between(t,0,10)'[bglt];[bglt][lb]overlay=0:${Y}:enable='between(t,0,10)'[bglb];[bglb][rt]overlay=${X}:0:enable='between(t,0,10)'[bgrt];[bgrt][rb]overlay=${X}:${Y}:enable='between(t,0,10)'" -c:v libx264 -preset ultrafast ${outputFile}`;

    console.log(ffmpegCommand);

    console.log("Running command:", ffmpegCommand);
    execSync(ffmpegCommand, { stdio: "inherit" });

}


// Assign the Values here.
const inputWidth = 1920;
const inputHeight = 1080;
const Scale = 4;
const ptX = 1440;
const ptY = 675;

zoomVideo(inputWidth, inputHeight, Scale, ptX, ptY);

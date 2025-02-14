const { execSync } = require("child_process");

function sortAndGroupZoomIntervals(zoomIntervals) {
    zoomIntervals.sort((a, b) => a.startTime - b.startTime);
    let finalZoom = [];
    let grouped = [];
    for (let i = 0; i < zoomIntervals.length; i++) {
        if (i != 0 && zoomIntervals[i - 1].endZoom == 1) {
            finalZoom.push(grouped);
            grouped = [];

        }
        grouped[grouped.length] = zoomIntervals[i];
    }
    if (grouped.length) finalZoom.push(grouped);
    return finalZoom;
}

function generateZoompanExpression(iw, ih, zoomIntervals) {
    let zoomCommand = `zoompan=z='`;
    let zoomCount = zoomIntervals[i].length;
    for (let j = 0; j < zoomCount; j++) {
        zoomCommand = `${zoomCommand}if(between(time,${zoomIntervals[i][j].startTime},${zoomIntervals[i][j].endTime}),1+(${zoomIntervals[i][j].endZoom}-1)/${zoomIntervals[i][j].startZoom}*(time-${zoomIntervals[i][j].startTime}),`;
    }
    zoomCommand = `${zoomCommand}1${')'.repeat(zoomCount)}'`;
    console.log("zoomCommand : ", zoomCommand);
    return zoomCommand;
}

function zoomVideo(iw, ih, z, ptX, ptY, zoomVals) {

    // let zoomCmd = '';
    // const zoominterVals = sortAndGroupZoomIntervals(zoomVals);
    // console.log("zoominterVals : ", zoominterVals);
    // for (let i = 0; i < zoominterVals.length; i++) {
    //     zoomCmd = generateZoompanExpression(iw, ih, zoominterVals[i]);
    //     zoomCommand = `${zoomCommand}'`;
    // }
    // console.log("zoomCmd : \n", zoomCmd);

    

    const outputFile = `${ptX}x${ptY}.mp4`
    const output2File = `${ptX}x${ptY}_jitter.mp4`
    const X = Math.floor((iw / 2) + ((ptX - (iw / 2)) * (z / (z - 1))));
    const Y = Math.floor((ih / 2) + ((ptY - (ih / 2)) * (z / (z - 1))));
    let zoomCmd = `zoompan=z='if(between(time,0,2),1+${(z - 1) / 2}*(time-0),if(between(time,4,6),${z}-${(z - 1) / 2}*(time-4),if(between(time,2,4),${z},1)))'`;
    const ffmpegCommand = `ffmpeg -i input.mp4 -filter_complex "[0:v]split=4[lefttop][leftbottom][righttop][rightbottom];[lefttop]crop=${X}:${Y}:0:0,${zoomCmd}:x=${X}:y=${Y}:d=1:s=${X}x${Y}:fps=25[lt];[leftbottom]crop=${X}:${ih - Y}:0:${Y},${zoomCmd}:x=${X}:y=0:d=1:s=${X}x${ih - Y}:fps=25[lb];[righttop]crop=${iw - X}:${Y}:${X}:0,${zoomCmd}:x=0:y=${Y}:d=1:s=${iw - X}x${Y}:fps=25[rt];[rightbottom]crop=${iw - X}:${ih - Y}:${X}:${Y},${zoomCmd}:x=0:y=0:d=1:s=${iw - X}x${ih - Y}:fps=25[rb];color=c=ffffff:s=${iw}x${ih}:r=25:d=10,settb=1/10[bg];[bg][lt]overlay=0:0:enable='between(t,0,10)'[bglt];[bglt][lb]overlay=0:${Y}:enable='between(t,0,10)'[bglb];[bglb][rt]overlay=${X}:0:enable='between(t,0,10)'[bgrt];[bgrt][rb]overlay=${X}:${Y}:enable='between(t,0,10)'" -c:v libx264 -preset ultrafast ${outputFile}`;
    // execSync(ffmpegCommand, { stdio: "inherit" });
    const scaledCommand = `ffmpeg -i input.mp4 -filter_complex "[0:v]split=4[lefttop][leftbottom][righttop][rightbottom];[lefttop]crop=${X}:${Y}:0:0,scale=${X * jitter}x${Y * jitter},${zoomCmd}:x=${X * jitter}:y=${Y * jitter}:d=1:s=${X}x${Y}:fps=25[lt];[leftbottom]crop=${X}:${ih - Y}:0:${Y},scale=${X * jitter}x${(ih - Y) * jitter},${zoomCmd}:x=${X * jitter}:y=0:d=1:s=${X}x${ih - Y}:fps=25[lb];[righttop]crop=${iw - X}:${Y}:${X}:0,scale=${(iw - X) * jitter}x${Y * jitter},${zoomCmd}:x=0:y=${Y * jitter}:d=1:s=${iw - X}x${Y}:fps=25[rt];[rightbottom]crop=${iw - X}:${ih - Y}:${X}:${Y},scale=${(iw - X) * jitter}x${(ih - Y) * jitter},${zoomCmd}:x=0:y=0:d=1:s=${iw - X}x${ih - Y}:fps=25[rb];color=c=ffffff:s=${iw}x${ih}:r=25:d=10,settb=1/10[bg];[bg][lt]overlay=0:0:enable='between(t,0,10)'[bglt];[bglt][lb]overlay=0:${Y}:enable='between(t,0,10)'[bglb];[bglb][rt]overlay=${X}:0:enable='between(t,0,10)'[bgrt];[bgrt][rb]overlay=${X}:${Y}:enable='between(t,0,10)'" -c:v libx264 -preset ultrafast ${output2File}`;
    // execSync(scaledCommand, { stdio: "inherit" });
    console.log("Running command without Jitter Fix : \n", ffmpegCommand);
    console.log("\n\n\n\n\nRunning Command with Jitter Fix : \n", scaledCommand);
}


// Assign the Values here.
const inputWidth = 1920;
const inputHeight = 1080;
const Scale = 4;
const ptX = 1440;
const ptY = 675;
const jitter = 10;

const zoomVals2 = [
    { x: 1440, y: 675, startTime: 5, endTime: 6, startZoom: 1, endZoom: 1.5 },
    { x: 1440, y: 675, startTime: 0, endTime: 1, startZoom: 1, endZoom: 2 },
    { x: 1440, y: 675, startTime: 6, endTime: 8, startZoom: 1.5, endZoom: 1.5 },
    { x: 1440, y: 675, startTime: 1, endTime: 3, startZoom: 2, endZoom: 2 },
    { x: 1440, y: 675, startTime: 8, endTime: 9, startZoom: 1.5, endZoom: 1 },
    { x: 1440, y: 675, startTime: 3, endTime: 4, startZoom: 2, endZoom: 1 },
];

zoomVideo(inputWidth, inputHeight, Scale, ptX, ptY, zoomVals2);

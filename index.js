const { execSync } = require("child_process");

function sortAndGroupZoomIntervals(iw, ih, zoomIntervals) {
    // const X = Math.floor((iw / 2) + ((ptX - (iw / 2)) * (z / (z - 1))));
    // const Y = Math.floor((ih / 2) + ((ptY - (ih / 2)) * (z / (z - 1))));
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
    for (let i = 0; i < zoomIntervals.length; i++) {
        let zoomCount = zoomIntervals[i].length;
        let zoomCommand = `zoompan=z='`;
        for (let j = 0; j < zoomCount; j++) {
            zoomCommand = `${zoomCommand}if(between(time,${zoomIntervals[i][j].startTime},${zoomIntervals[i][j].endTime}),1+(${zoomIntervals[i][j].endZoom}-1)/${zoomIntervals[i][j].startZoom}*(time-${zoomIntervals[i][j].startTime}),`;
        }
        // let topLeft = `${zoomCommand}:x=${X}:y=${Y}:d=1:s=${X}x${Y}:fps=${fps}`;
        // let bottomLeft = `${zoomCommand},1):x=${X}:y=0:d=1:s=${X}x${ih - Y}:fps=${fps}`;
        // let topRight = `${zoomCommand}:x=0:y=${Y}:d=1:s=${iw - X}x${Y}:fps=${fps}`;
        // let bottomRight = `${zoomCommand}:x=0:y=0:d=1:s=${iw - X}x${ih - Y}:fps=${fps}`;

    }
    // zoomCommand = `${zoomCommand}1${')'.repeat(zoomCount)}'`;
    // console.log("zoomCommand : ", zoomCommand);
    // return zoomCommand;
}

function zoomVideo(iw, ih, z, ptX, ptY, fps, jitter) {
    // const zoomVals = [
    //     { x: 1440, y: 675, startTime: 5, endTime: 6, startZoom: 1, endZoom: 1.5 },
    //     { x: 1440, y: 675, startTime: 0, endTime: 1, startZoom: 1, endZoom: 2 },
    //     { x: 1440, y: 675, startTime: 6, endTime: 8, startZoom: 1.5, endZoom: 1.5 },
    //     { x: 1440, y: 675, startTime: 1, endTime: 3, startZoom: 2, endZoom: 2 },
    //     { x: 1440, y: 675, startTime: 8, endTime: 9, startZoom: 1.5, endZoom: 1 },
    //     { x: 1440, y: 675, startTime: 3, endTime: 4, startZoom: 2, endZoom: 1 },
    // ];
    // const zoominterVals = sortAndGroupZoomIntervals(iw, ih, zoomVals);
    // // console.log("zoominterVals : ", zoominterVals);
    // const zoomCmd = generateZoompanExpression(iw, ih, zoominterVals);
    // console.log("zoomCmd : \n", zoomCmd);



    const outputFile = `${ptX}x${ptY}.mp4`
    const output2File = `${ptX}x${ptY}_jitter.mp4`
    const X = Math.floor((iw / 2) + ((ptX - (iw / 2)) * (z / (z - 1))));
    const Y = Math.floor((ih / 2) + ((ptY - (ih / 2)) * (z / (z - 1))));
    let zoomCmd = `zoompan=z='if(between(time,0,2),1+${(z - 1) / 2}*(time-0),if(between(time,4,6),${z}-${(z - 1) / 2}*(time-4),if(between(time,2,4),${z},1)))'`;
    const ffmpegCommand = `ffmpeg -i input.webm -filter_complex "[0:v]split=4[lefttop][leftbottom][righttop][rightbottom];[lefttop]crop=${X}:${Y}:0:0,${zoomCmd}:x=${X}:y=${Y}:d=1:s=${X}x${Y}:fps=${fps}[lt];[leftbottom]crop=${X}:${ih - Y}:0:${Y},${zoomCmd}:x=${X}:y=0:d=1:s=${X}x${ih - Y}:fps=${fps}[lb];[righttop]crop=${iw - X}:${Y}:${X}:0,${zoomCmd}:x=0:y=${Y}:d=1:s=${iw - X}x${Y}:fps=${fps}[rt];[rightbottom]crop=${iw - X}:${ih - Y}:${X}:${Y},${zoomCmd}:x=0:y=0:d=1:s=${iw - X}x${ih - Y}:fps=${fps}[rb];[lt][lb]vstack[left];[rt][rb]vstack[right];[left][right]hstack" -c:v libx264 -preset ultrafast ${outputFile}`;
    // execSync(ffmpegCommand, { stdio: "inherit" });
    const scaledCommand = `ffmpeg -i input.webm -filter_complex "[0:v]split=4[lefttop][leftbottom][righttop][rightbottom];[lefttop]crop=${X}:${Y}:0:0,scale=${X * jitter}x${Y * jitter},${zoomCmd}:x=${X * jitter}:y=${Y * jitter}:d=1:s=${X}x${Y}:fps=${fps}[lt];[leftbottom]crop=${X}:${ih - Y}:0:${Y},scale=${X * jitter}x${(ih - Y) * jitter},${zoomCmd}:x=${X * jitter}:y=0:d=1:s=${X}x${ih - Y}:fps=${fps}[lb];[righttop]crop=${iw - X}:${Y}:${X}:0,scale=${(iw - X) * jitter}x${Y * jitter},${zoomCmd}:x=0:y=${Y * jitter}:d=1:s=${iw - X}x${Y}:fps=${fps}[rt];[rightbottom]crop=${iw - X}:${ih - Y}:${X}:${Y},scale=${(iw - X) * jitter}x${(ih - Y) * jitter},${zoomCmd}:x=0:y=0:d=1:s=${iw - X}x${ih - Y}:fps=${fps}[rb];[lt][lb]vstack[left];[rt][rb]vstack[right];[left][right]hstack" -c:v libx264 -preset ultrafast ${output2File}`;
    // execSync(scaledCommand, { stdio: "inherit" });
    console.log("Running command without Jitter Fix : \n", ffmpegCommand);
    console.log("\n\n\n\n\nRunning Command with Jitter Fix : \n", scaledCommand);
}

function main() {
    // Assign the Values here.
    const inputWidth = 3360;
    const inputHeight = 1506;
    const Scale = 1.6;
    const ptX = 1106;
    const ptY = 1051;
    const jitter = 5;
    const fps = 25;
    zoomVideo(inputWidth, inputHeight, Scale, ptX, ptY, fps, jitter);
}

main();





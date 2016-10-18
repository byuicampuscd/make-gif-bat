/*jslint plusplus: true, node: true, devel: true, nomen:true */
"use strict";
var args, pngsAll, pngsMain, ends, finalList, fileText, fileTextOut, framesInGroupCount, htmlText,
    fs = require('fs'),
    path = require('path'),
    combo = require('js-combinatorics'),
    newFolderName = 'processedGifs';

function derationToDelay(duration, numberOfFrames) {
    return parseInt(duration / numberOfFrames / 10, 10);
}

function makeFileName(fileObj){
   return fileObj.startStep + '-' + fileObj.endStep + '.gif';
}

//get the pings in this folder
pngsAll = fs.readdirSync('.').filter(function (file) {
    return path.extname(file).toLowerCase() === '.png';
});

//parse the input
args = require('./getArgs')(pngsAll.length);
framesInGroupCount = (pngsAll.length - 1) / (args.s - 1);

//get the main frames
pngsMain = pngsAll.filter(function (file, i) {
    return i % framesInGroupCount === 0;
});

//get all the start and ending points
ends = combo.permutation(pngsMain, 2).toArray().sort(function (a, b) {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    }
    return 0;
});

//loop the pngsAll list from the start and end points add to array
finalList = ends.map(function (startEnd) {
    var startFile = pngsAll.indexOf(startEnd[0]),
        endFile = pngsAll.indexOf(startEnd[1]),
        startStep = pngsMain.indexOf(startEnd[0]) + 1,
        endStep = pngsMain.indexOf(startEnd[1]) + 1,
        arrayOut = [],
        step = 1,
        i;

    if (endFile < startFile) {
        step = -1;
    }

    for (i = startFile; i !== endFile; i += step) {
        arrayOut.push(pngsAll[i]);
    }

    //put the last one on    
    arrayOut.push(pngsAll[endFile]);

    return {
        startFile: startFile,
        endFile: endFile,
        startStep:startStep, 
        endStep:endStep,
        files: arrayOut
    };
});

//convert to text
fileText = finalList.map(function (file) {
    var command = "magick convert -dispose previous -delay " + derationToDelay(args.d, file.files.length),
        currentFolder = __dirname.split(path.sep),
        fileNameOut = makeFileName(file);
    return command + ' ' + file.files.join(' ') + ' -loop ' + args.l + ' ' + path.join(newFolderName, fileNameOut);
});

htmlText = finalList.map(function (file) {
    return '^<img src=\'' + makeFileName(file) + '\' ^>';
});

fileTextOut = "mkdir " +
    newFolderName +
    '\r\n' + fileText.join('\r\n') +
    '\r\n' + 'echo ^<style^>img{border: 1px solid black;}^</style^>' + htmlText.join(' ') + ' > ' + path.join(newFolderName, "allGifs.html") +
    '\r\npause';

console.log(fileTextOut);

fs.writeFileSync('makeGifs.bat', fileTextOut);

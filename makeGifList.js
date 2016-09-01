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
    var start = pngsAll.indexOf(startEnd[0]),
        end = pngsAll.indexOf(startEnd[1]),
        arrayOut = [],
        step = 1,
        i;

    if (end < start) {
        step = -1;
    }

    for (i = start; i !== end; i += step) {
        arrayOut.push(pngsAll[i]);
    }

    //put the last one on    
    arrayOut.push(pngsAll[end]);

    return {
        start: start,
        end: end,
        files: arrayOut
    };
});

//convert to text
fileText = finalList.map(function (file) {
    var command = "magick convert -dispose previous -delay " + derationToDelay(args.d, file.files.length),
        currentFolder = __dirname.split(path.sep),
        fileNameOut = file.start + '-' + file.end + '.gif';
    return command + ' ' + file.files.join(' ') + ' -loop ' + args.l + ' ' + path.join(newFolderName, fileNameOut);
});

htmlText = finalList.map(function (file) {
    return '^<img src=\'' + file.start + '-' + file.end + '.gif' + '\' ^>';
});

fileTextOut = "mkdir " +
    newFolderName +
    '\r\n' + fileText.join('\r\n') +
    '\r\n' + 'echo ' + htmlText.join(' ') + ' > ' + path.join(newFolderName, "allGifs.html") +
    '\r\npause';

console.log(fileTextOut);

fs.writeFileSync('makeGifs.bat', fileTextOut);

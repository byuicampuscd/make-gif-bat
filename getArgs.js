/*jslint plusplus: true, node: true, devel: true */
module.exports = function (numberOfPings) {
    "use strict";

    function validateS(stepsIn) {
        var pngMaxId = numberOfPings - 1,
            steps = parseInt(stepsIn, 10);
        if (isNaN(steps) || steps < 1) {
            throw new Error('Steps has to be a positive number greater than or equal to 1.');
        }

        if (pngMaxId % (steps - 1) !== 0) {
            throw new Error('(Steps - 1) has to divide (number of pngs in the folder - 1) evenly.');
        }

        return steps;
    }

    function validateNum(name, valIn) {
        var pngMaxId = numberOfPings - 1,
            val = parseInt(valIn, 10);
        if (isNaN(val) || val < 1) {
            throw new Error(name + ' has to be a number greater than 0.');
        }

        return val;
    }

    function validateL(num) {
        return validateNum('Length', num);
    }

    function validateD(num) {
        return validateNum('Duration', num);
    }

    return require('yargs')
        .usage('Usage: $0 -s [num] -d [num] -l [num]')
        .alias('s', 'steps')
        .describe('s', 'The number of major frames there are')
        .nargs('s', 1)
        .coerce('s', validateS)
        .alias('d', 'duration')
        .describe('d', 'gif animation duration in milliseconds')
        .nargs('d', 1)
        .coerce('d', validateD)
        .alias('l', 'loop')
        .describe('l', 'loop count, 0 for infinite')
        .nargs('l', 1)
        .coerce('l', validateL)
        .help('h')
        .alias('h', 'help')
        .demand(['s', 'd', 'l'])
        .argv;

};

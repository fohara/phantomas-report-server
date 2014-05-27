var fs = require('fs-extra');
var path = require('path');
var execFile = require('child_process').execFile;
var extend = require('util')._extend;
var express = require('express');
var directory = require('serve-index');
var app = express();
var moment = require('moment');
var CronJob = require('cron').CronJob;
var defaultConfig = require('./config-default');

app.get('/status', function (req, res) {
    res.send('ready');
});

app.use(express.static('reports'));
app.use(directory('reports'));

var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});

// Parse configs.
var config = {};
fs.readFile('config.json', 'utf8', function (err, data) {
    if (err) {
        console.log("No config.json found; config-default.json will be used instead. Details: \n" + err);
        return;
    }

    config = JSON.parse(data);
    console.log("Parsed config data :" + config);
});
config = extend(defaultConfig, config);

// Remove old files on a schedule.

if (config.scheduledRemoval) {
    new CronJob(config.schedule, function () {
        console.log('Removing old files.');
        var limit = config.daysUntilRemoval;
        execFile('find', ['reports'], function (err, stdout, stderr) {
            var files = stdout.split('\n');
            files.forEach(function (filePath, index, array) {
                if (/\/data\/\d+.json$/.test(filePath)) {
                    var epochStr = path.basename(filePath, '.json');
                    removeOldPath(epochStr, filePath, limit);
                } else if (/\/images\/\d+.$/.test(filePath)) {
                    var epochStr = path.basename(filePath);
                    removeOldPath(epochStr, filePath, limit);
                }
            });
        });
    }, function () {
        console.log('Finished removing old files.');
    }, true);
}

// Helper functions

function removeOldPath(epochStr, filePath, limit) {
    if (numDaysOld(epochStr) >= limit) {
        console.log(filePath + ' is at least ' + limit + ' days old and will be deleted.');
        fs.removeSync(filePath);
    }
}

function numDaysOld(epochStr) {
    var fileTime = moment(parseInt(epochStr, 10));
    var now = moment();
    return moment.duration(now.diff(fileTime)).asDays();
}

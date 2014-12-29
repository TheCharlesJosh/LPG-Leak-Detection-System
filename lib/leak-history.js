var buffer;
var lastTimeStamp;

//This generates the HTML listing all previous (and ongoing) leaks, based on the info log.
var leakHistory = function () {
  var fs = require('fs');
  var dateFormat = require('./date-format');
  var objectArray = [];
  var bucket = {
    'timestamp': [],
    'message': []
  };
  fs.readFile('./logs/info.log', 'utf8', function (err, data) {
    buffer = data.split('\n');
    buffer.pop();
    buffer.forEach(function (string) {
      objectArray.push(JSON.parse(string));
    });
    objectArray = objectArray.filter(function (element) {
      return element.level === 'warn';
    });
    objectArray.forEach(function (obj) {
      bucket.timestamp.push(new Date(Date.parse(obj.timestamp)));
      if (obj.message[0] === 'A') {
        bucket.message.push('start');
      } else {
        bucket.message.push(+obj.message.substring(43, obj.message.length - 9));
      }
    });
    buffer = '';
    bucket.timestamp.forEach(function (date, i) {
      if (lastTimeStamp) {
        buffer = '<li><span class="time">' + dateFormat(lastTimeStamp, "dddd, mmmm dS, yyyy, h:MM:ss TT") + ' <span class="to">to</span> ' + dateFormat(date, "dddd, mmmm dS, yyyy, h:MM:ss TT") + '</span><span class="duration">' + bucket.message[i] + ' seconds</span></li>\n' + buffer;
        lastTimeStamp = null;
      } else if (bucket.message[i] === 'start') {
        lastTimeStamp = date;
      }
    });
    if (lastTimeStamp) {
        buffer = '<li><span class="time">' + dateFormat(lastTimeStamp, "dddd, mmmm dS, yyyy, h:MM:ss TT") + '</span><span class="duration">Ongoing</span></li>\n' + buffer;
    }
  });
  return buffer;
}

module.exports = leakHistory;
var socket = io();
var restart = false;
var dataLength = 1000;

$(function () {
  var options = {
    backgroundColor: null,
    axisX: {
      title: "Time (Local)",
      valueFormatString: "hh:mm:ss TT"
    },
    axisY: {
      title: "Concentration (ppm)",
      minimum: 0
    },
    data: [{
      type: "area",
      color: "#20788c",
      dataPoints: [],
      lineThickness: 2,
      fillOpacity: .2
    }, {
      type: "area",
      color: "#8c2720",
      dataPoints: [],
      lineThickness: 2,
      fillOpacity: .2
    }]
  };

  $("#chartContainer").CanvasJSChart(options);
  socket.emit('history update');
});

var zerofier = function (timeElement) {
  if (timeElement / 10) {
    return timeElement;
  } else {
    return '0' + timeElement;
  }
}


$('input[type="range"]').rangeslider({
  polyfill: false,
  onSlide: function (position, value) {
    $("label .slide-val", $(this.$range).parent()).text(value);
  },
  onSlideEnd: function (position, value) {
    if ($('input', this.$range.parent()).attr('id') == 'leak-threshold') {
      socket.emit('leak threshold', value);
    } else {
      socket.emit('leak duration', value);
    }
  }
});

$('#board-switch').on('click', function () {
  socket.emit('board switch', $('#board-switch:checked').length);
});

$('#board-startup').on('click', function () {
  socket.emit('board startup', $('#board-startup:checked').length);
});

socket.on('console message', function (msg) {
  var code = msg.substr(0, 4);
  var string = '<span class="console-' + code.toLowerCase() + '">' + code + ':</span>' + msg.substr(5);
  $('#machine-log ul').prepend($('<li>').html(string));

  if (msg === 'INFO: LPG detection system down.') {
    location.reload(true);
  } else if (msg === 'INFO: Nodemon restart.') {
    restart = true;
  } else if (msg === 'INFO: Good day!' && restart) {
    location.reload(true);
  }
});

socket.on('update board', function (value, newVerbose, newDescription) {
  $('#board-switch').prop('checked', Boolean(value));
  $('#curr-stat').html(newVerbose);
  $('#curr-desc').html(newDescription);
  if (value) {
    var chart = $("#chartContainer").CanvasJSChart();
    chart.options.data[0].dataPoints = [];
    chart.render();
  }
});

socket.on('update startup', function (value) {
  $('#board-startup').prop('checked', Boolean(value));
});

socket.on('update leak', function (value) {
  $('#leak-threshold').val(value).change();
});


socket.on('update duration', function (value) {
  $('#leak-duration').val(value).change();
});

socket.on('is leaking', function (value, newVerbose, newDescription) {
  socket.emit('history update');
  $('#curr-stat').html(newVerbose);
  $('#curr-desc').html(newDescription);
});

socket.on('calibrating', function (value, newVerbose, newDescription) {
  socket.emit('history update');
  $('#curr-stat').html(newVerbose);
  $('#curr-desc').html(newDescription);
});

socket.on('new reading', function (sensorResistance, rawSensor) {
  var time = new Date();
  var chart = $("#chartContainer").CanvasJSChart();
  var length = chart.options.data[0].dataPoints.length;
  sensorResistance = sensorResistance > 10000 ? 10000 : sensorResistance; //The sensor only works accurately for values between 100 and 10000.

  chart.options.data[0].dataPoints.push({
    x: time,
    y: sensorResistance
  });

  /*  chart.options.data[1].dataPoints.push({ 
      x: time, 
      y: rawSensor
    });*/

  if (length > dataLength) {
    chart.options.data[0].dataPoints.shift();
    // chart.options.data[1].dataPoints.shift();        
  }

  chart.render();
});

socket.on('get history', function (string) {
  if (string) {
    $('#machine-histo').html(string);
  }
});
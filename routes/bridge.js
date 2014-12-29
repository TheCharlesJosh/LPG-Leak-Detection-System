var leakHistory = require('../lib/leak-history');
var infoLogger;
var globalIO;
var connections = 0;

//The prompts used in the console and the log file.
var prompts = {
  'on connect': function () {
    return 'INFO: Good day!'
  },
  'board switch': function (isOn) {
    if (isOn) return 'INFO: Activating leak detection system.';
    else return 'INFO: Deactivating leak detection system.';
  },
  'board startup': function (isOn) {
    if (isOn) return 'INFO: Leak detection system automatically enabled on startup.';
    else return 'INFO: Leak detection system disabled on startup. Detection must be manually activated.';
  },
  'leak threshold': function (concentrationCap) {
    return 'INFO: Trigger threshold adjusted to LPG concentrations of ' + concentrationCap + ' ppm.';
  },
  'leak duration': function (duration) {
    return 'INFO: Trigger duration adjusted to ' + duration + ' seconds.';
  },
  'calibrating': function (isTrue, calibrationResistance) {
    if (isTrue) return 'INFO: Sensor calibration (simulated in 1000 ppm) finished with a resistance of ' + calibrationResistance.toFixed(2) + ' ohms.';
    else return 'INFO: Sensor calibration started. Please make sure that the sensor is not exposed to significant concentrations of LPG.';
  },
  'is leaking': function (isTrue, duration) {
    if (isTrue) return 'WARN: An LPG leak is currently detected. Immediate action is required. Automatic valve closing is executed.';
    else return 'WARN: Leak successfully subdued. Leak lasted for ' + (duration / 1000) + ' seconds.';
  }
};

//Broadcasts to the log as well as to the connected client(s), if any.
var messenger = function (string) {
  infoLogger.log(string.substr(0, 4).toLowerCase(), string.substr(6)); //Substr removes the starting code (INFO, WARN, etc).
  if (connections) {
    globalIO.emit('console message', string);
  }
}

function Bridge(io, gasSensor, infoLog) {
  infoLogger = infoLog;
  globalIO = io;

  //Client-based events (Option triggers)
  io.on('connection', function (socket) {
    connections++;
    io.emit('console message', prompts['on connect']());

    socket.on('disconnect', function () {
      connections--;
    });

    socket.on('board switch', function (isOn) {
      gasSensor.update('board switch', isOn);
      settings = gasSensor.object();
      messenger(prompts['board switch'](isOn));
      io.emit('update board', isOn, settings.verbose, settings.description);
    });

    socket.on('board startup', function (isOn) {
      gasSensor.update('board startup', isOn);
      messenger(prompts['board startup'](isOn));
      io.emit('update startup', isOn);
    });

    socket.on('leak threshold', function (concentrationCap) {
      gasSensor.update('leak threshold', concentrationCap);
      messenger(prompts['leak threshold'](concentrationCap));
      io.emit('update leak', concentrationCap);
    });

    socket.on('leak duration', function (duration) {
      gasSensor.update('leak duration', duration);
      io.emit('update duration', duration);
      messenger(prompts['leak duration'](duration));
    });

    socket.on('history update', function () {
      io.emit('get history', leakHistory());
    });
  });

  //Galileo-based events.
  gasSensor.on('custom message', function (string) {
    messenger(string);
  });

  gasSensor.on('new reading', function (concentration, rawSensor) {
    if (connections) {
      io.emit('new reading', concentration, rawSensor);
    }
  });

  gasSensor.on('calibrating', function (isTrue, calibrationResistance) {
    gasSensor.update('calibrating', isTrue);
    messenger(prompts['calibrating'](isTrue, calibrationResistance));
    if (connections) {
      settings = gasSensor.object();
      io.emit('calibrating', isTrue, settings.verbose, settings.description);
    }
  });

  gasSensor.on('is leaking', function (isTrue, duration) {
    gasSensor.update('is leaking', isTrue);
    messenger(prompts['is leaking'](isTrue, duration));
    if (connections) {
      settings = gasSensor.object();
      io.emit('is leaking', isTrue, settings.verbose, settings.description);
      setTimeout(function () {
        io.emit('get history', leakHistory());
      }, 200);
    }
  });

}

module.exports = Bridge;
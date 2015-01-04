var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var Galileo = require('galileo-io');
var board = new Galileo();
var dangerTimeStart = null;
var infoLogger;
var rgb = [8, 10, 11, 9]; //Red Pin, Green Pin, Blue Pin, Ground
var stepperConfig = [720, 50, 720, 5, 6]; //Steps per revolution, Speed, Calibrated turns for the closing of LPG Valve, Control Pin 1, Control Pin 2
var rgbLED;
var stepper;
var timer;

var rawSensor;
var sensorResistance;
var voltageAcrossSensor;
var loadResistance = 9790; //Grabbed with a multimeter.
var calibrated = false;
var samplesPerSecond = 4;
var calibrationTime = 5; //in seconds

var descriptor = {
  verbose: {
    'turned-off': 'Galileo is offline.',
    'board-ready': 'Galileo is ready.',
    'board-on': 'Galileo is working.',
    'is-leaking': 'Leak detected.',
    'calibrating': 'Calibrating sensor.'
  },
  description: {
    'turned-off': 'If the Galileo is turned on, try rebooting the device. Else, the IP address might have changed.',
    'board-ready': 'You may now turn it on in the <a href="#options">options</a>.',
    'board-on': 'The Galileo will keep you updated about the nearby LPG concentration levels.',
    'is-leaking': 'Trying to subdue leak automatically. If it fails, please check your LPG tank and take action.',
    'calibrating': 'Galileo is calibrating the sensor, assuming it is in an area of clean air (no significant concentration of LPG).<br>Drink some coffee, take a walk; it won\'t last long.'
  }
};

var options = {
  status: 'turned-off',
  verbose: 'Galileo is offline.',
  description: 'If the Galileo is turned on, try rebooting the device. Else, the IP address might have changed.',
  startup: false,
  on: false,
  leaking: false,
  leak: 5000,
  duration: 5
};

function GasSensor(analogPin, infoLog) {
  var self = this;
  var RGBLed = require('./rgb-led');
  rgbLED = new RGBLed(board);
  var Stepper = require('./stepper-motor');
  stepper = new Stepper(board);
  var ready = false;
  infoLogger = infoLog;

  //If options.log exists (and is a JSON object), read existing configuration. Else, replace/create file with default options.
  fs.exists('logs/options.log', function (exists) {
    if (exists) {
      fs.readFile('logs/options.log', function (err, data) {
        if (err) throw err;
        infoLogger.log('info', 'Reading from existing configuration.');
        try {
          options = JSON.parse(data);
        } catch (e) {
          fs.open('logs/options.log', 'w', function (err, fd) {
            if (err) throw err;
            fs.writeFile('logs/options.log', JSON.stringify(options, null, '\t'), function (err) {
              if (err) throw err;
              infoLogger.log('info', 'Error parsing, new options.log created.');
            });
            ready = true;
          });
        }
        ready = true;
      });
    } else {
      fs.open('logs/options.log', 'w', function (err, fd) {
        if (err) throw err;
        fs.writeFile('logs/options.log', JSON.stringify(options, null, '\t'), function (err) {
          if (err) throw err;
          infoLogger.log('info', 'New options.log created.');
        });
        ready = true;
      });
    }
  });

  //On board ready, initialize RGB and Stepper pins and execute startup function.
  //Then, read values from analog pin.
  board.on('ready', function () {
    if (ready) {
      rgbLED.init(rgb[0], rgb[1], rgb[2], rgb[3]);
      stepper.init(stepperConfig[0], stepperConfig[3], stepperConfig[4]);
      stepper.setSpeed(stepperConfig[1]);
      self.actuate('startup');
    }

    this.analogRead(analogPin, function (data) {
      rawSensor = data;
    });
  });

}

//Extend the EventEmitter class to the constructor GasSensor.
GasSensor.prototype = Object.create(EventEmitter.prototype);

//Start reading values.
GasSensor.prototype.startReading = function () {
  var self = this;
  var rebound = false;
  var concentrationSlope = -(Math.log10(5) / Math.log10(50)); //Derivation of formula in the documentation.
  var concentrationIntercept = Math.log10(2) + (Math.log10(5) * Math.log10(200)) / Math.log10(50);
  var calibrationSamples = calibrationTime * samplesPerSecond;
  var calibrationSamplesLeft = calibrationSamples;
  var calibrationResistance = 0;
  var partialResult = 0;
  var concentration = 0;
  calibrated = false;

  options.status = 'calibrating';
  self.emit('calibrating', 0);

  timer = setInterval(function () {
    voltageAcrossSensor = rawSensor / 1023 * 5;
    sensorResistance = (voltageAcrossSensor * loadResistance) / (5 - voltageAcrossSensor);

    if (calibrationSamplesLeft > 0) {
      //Begin sampling data.
      calibrationResistance += sensorResistance;
      calibrationSamplesLeft--;
    } else if (calibrationSamplesLeft === 0) {
      //Finish sampling data; calculate base resistance.
      options.status = 'board-on';
      calibrationResistance /= calibrationSamples; //Get the average of the resistance in clean air.
      calibrationResistance /= 10; //According to the datasheet, the ratio between the clean air resistance and the resistance in 1000 ppm of LPG is 10.
      self.emit('calibrating', 1, calibrationResistance);
      calibrationSamplesLeft--;
    } else {
      //Begin transmitting concentration.
      partialResult = (Math.log10(sensorResistance / calibrationResistance) - concentrationIntercept) / concentrationSlope;
      concentration = Math.pow(partialResult, 10);

      self.emit('new reading', concentration, sensorResistance);

      //If concentration is greater than the leak threshold, take note of time.
      if (concentration > options.leak) {
        dangerTimeStart = dangerTimeStart || +new Date();
      }

      //If a leak is ongoing, and the concentration is less than the leak threshold, emit that the leak is subdued.
      if (rebound && concentration < options.leak) {
        self.emit('is leaking', 0, +new Date() - dangerTimeStart);
        dangerTimeStart = null;
        rebound = false;
      }

      //If concentration has persisted longer than the leak duration, emit that a leak is ongoing.
      if (dangerTimeStart && (+new Date() - dangerTimeStart > options.duration * 1000)) {
        if (rebound === false) {
          rgbLED.blink['red'](500);
          self.emit('is leaking', 1);
          rebound = true;
        }
      }
    }

  }, 1000 / samplesPerSecond); //In milliseconds
}

//Deactivate reading by clearing the timer.
GasSensor.prototype.stopReading = function () {
  clearTimeout(timer);
}

//Used by EJS, generates current data then passes the options as an object.
GasSensor.prototype.object = function () {
  this.generate();
  return options;
}

//Updates the verbose and description values, then overwrites the current options file.
GasSensor.prototype.generate = function () {
  var _args = arguments;

  options.verbose = descriptor.verbose[options.status];
  options.description = descriptor.description[options.status];

  fs.writeFile('logs/options.log', JSON.stringify(options, null, '\t'), function (err) {
    if (err) throw err;
  });
}

//Updates the state values in the options, then actuates based on new data, then generates options file.
GasSensor.prototype.update = function (happening, value) {
  if (happening === 'board switch') {
    options.on = Boolean(value);
  } else if (happening === 'board startup') {
    options.startup = Boolean(value);
  } else if (happening === 'leak threshold') {
    options.leak = value;
  } else if (happening === 'leak duration') {
    options.duration = value;
  } else if (happening === 'is leaking') {
    options.leaking = Boolean(value);
  }
  this.actuate(happening);
  this.generate(happening, value);
}

//Executes actions with respect to the previous happening.
GasSensor.prototype.actuate = function (happening) {
  if (happening === 'startup') {
    if (options.startup === true) {
      options.on = true;
    } else if (options.startup === false) {
      options.on = false;
    }
  }

  if (happening === 'startup' || happening === 'board switch') {
    if (options.on === true) {
      options.leaking = false;
      rgbLED.solid['green']();
      this.startReading();
    } else if (options.on === false) {
      options.status = 'board-ready';
      options.leaking = false;
      rgbLED.solid['blue']();
      this.stopReading();
    }
  }

  if (happening === 'is leaking') {
    if (options.on === true) {
      if (options.leaking === true) {
        options.status = 'is-leaking';
        stepper.step(stepperConfig[2]);
      } else {
        options.status = 'board-on';
        rgbLED.solid['green']();
      }
    }
  }
}

GasSensor.prototype.exit = function () {
  rgbLED.blank();
}
module.exports = GasSensor;
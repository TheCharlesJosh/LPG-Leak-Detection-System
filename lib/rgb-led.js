var redLED;
var greenLED;
var blueLED;
var board;
var blinking = null;
var blink = 1;

//How to use: 
//init - rgbLED.init(red led, green led, blue led [, ground]) - Initializes the pins for the RGB LED.
//solid - rgbLED.solid[color]() - Emits a solid color.
//blink - rgbLED.blink[color](delay) - Emits a blinking color oscillating at specified interval.
//blank - rgbLED.blank() - Clears the colors.

function RGBLed(officialBoard) {
  board = officialBoard;
}

RGBLed.prototype.init = function (red, green, blue, ground) {
  redLED = red;
  greenLED = green;
  blueLED = blue;
  board.pinMode(redLED, board.MODES.OUTPUT);
  board.pinMode(greenLED, board.MODES.OUTPUT);
  board.pinMode(blueLED, board.MODES.OUTPUT);
  if (isNaN(ground)) {
    board.pinMode(ground, board.MODES.OUTPUT);
    board.digitalWrite(ground, 0);
  }
}

RGBLed.prototype.solid = {
  'red': function () {
    clearInterval(blinking);
    blinking = null;
    board.digitalWrite(redLED, 1);
    board.digitalWrite(greenLED, 0);
    board.digitalWrite(blueLED, 0);
  },
  'green': function () {
    clearInterval(blinking);
    blinking = null;
    board.digitalWrite(redLED, 0);
    board.digitalWrite(greenLED, 1);
    board.digitalWrite(blueLED, 0);
  },
  'blue': function () {
    clearInterval(blinking);
    blinking = null;
    board.digitalWrite(redLED, 0);
    board.digitalWrite(greenLED, 0);
    board.digitalWrite(blueLED, 1);
  }
}

RGBLed.prototype.blink = {
  'red': function (delay) {
    delay = delay || 100;
    clearInterval(blinking);
    blinking = setInterval(function () {
      board.digitalWrite(redLED, (blink ^= 1));
      board.digitalWrite(greenLED, 0);
      board.digitalWrite(blueLED, 0);
    }, delay);
  },
  'green': function (delay) {
    delay = delay || 100;
    clearInterval(blinking);
    blinking = setInterval(function () {
      board.digitalWrite(redLED, 0);
      board.digitalWrite(greenLED, (blink ^= 1));
      board.digitalWrite(blueLED, 0);
    }, delay);
  },
  'blue': function (delay) {
    delay = delay || 100;
    clearInterval(blinking);
    blinking = setInterval(function () {
      board.digitalWrite(redLED, 0);
      board.digitalWrite(greenLED, 0);
      board.digitalWrite(blueLED, (blink ^= 1));
    }, delay);
  }
}

RGBLed.prototype.blank = function () {
  clearInterval(blinking);
  blinking = null;
  board.digitalWrite(redLED, 0);
  board.digitalWrite(greenLED, 0);
  board.digitalWrite(blueLED, 0);
}

module.exports = RGBLed;
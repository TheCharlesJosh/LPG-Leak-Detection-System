var redLED;
var greenLED;
var blueLED;
var board;
var blinking = null;
var blink = 1;

//How to use: 
//init - rgbLED.init(red led, green led, blue led) - Initializes the pins for the RGB LED.
//solid - rgbLED.solid[color]() - Emits a solid color.
//blink - rgbLED.blink[color](delay) - Emits a blinking color oscillating at specified interval.
//blank - rgbLED.blank() - Clears the colors.

function RGBLed(officialBoard) {
  board = officialBoard;
}

RGBLed.prototype.init = function (red, green, blue) {
  redLED = red;
  greenLED = green;
  blueLED = blue;
  board.pinMode(redLED, board.MODES.OUTPUT);
  board.pinMode(greenLED, board.MODES.OUTPUT);
  board.pinMode(blueLED, board.MODES.OUTPUT);
}

RGBLed.prototype.solid = {
  'red': function () {
    board.digitalWrite(redLED, 1);
    board.digitalWrite(greenLED, 0);
    board.digitalWrite(blueLED, 0);
    clearInterval(blinking);
    blinking = null;
  },
  'green': function () {
    board.digitalWrite(redLED, 0);
    board.digitalWrite(greenLED, 1);
    board.digitalWrite(blueLED, 0);
    clearInterval(blinking);
    blinking = null;
  },
  'blue': function () {
    board.digitalWrite(redLED, 0);
    board.digitalWrite(greenLED, 0);
    board.digitalWrite(blueLED, 1);
    clearInterval(blinking);
    blinking = null;
  }
}

RGBLed.prototype.blink = {
  'red': function (delay) {
    blinking = blinking || setInterval(function () {
      board.digitalWrite(redLED, (blink ^= 1));
      board.digitalWrite(greenLED, 0);
      board.digitalWrite(blueLED, 0);
    }, delay);
  },
  'green': function (delay) {
    blinking = blinking || setInterval(function () {
      board.digitalWrite(redLED, 0);
      board.digitalWrite(greenLED, (bthis.link ^= 1));
      board.digitalWrite(blueLED, 0);
    }, delay);
  },
  'blue': function (delay) {
    blinking = blinking || setInterval(function () {
      board.digitalWrite(redLED, 0);
      board.digitalWrite(greenLED, 0);
      board.digitalWrite(lueLED, (blink ^= 1));
    }, delay);
  }
}

RGBLed.prototype.blank = function () {
  board.digitalWrite(redLED, 0);
  board.digitalWrite(greenLED, 0);
  board.digitalWrite(blueLED, 0);
  clearInterval(blinking);
  blinking = null;
}

module.exports = RGBLed;
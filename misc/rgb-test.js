var Galileo = require('galileo-io');
var board = new Galileo();
var RGBLed = require('./lib/rgb-led');
var rgbLED = new RGBLed(board);
var rgb = [8, 10, 11, 9]; //Red Pin, Green Pin, Blue Pin
rgbLED.init(rgb[0], rgb[1], rgb[2], rgb[3]);
console.log("Running.");
setInterval(function () {
	setTimeout(rgbLED.blink["red"], 0);
	setTimeout(rgbLED.blink["green"], 1000);
	setTimeout(rgbLED.blink["blue"], 2000);
	setTimeout(rgbLED.blank, 3000);
}, 5000);

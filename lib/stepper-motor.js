/* 
 * Stepper-Motor.js
 * Node.js port of Stepper library for Wiring/Arduino - Version 0.4
 * Stripped four-wire version down and left the two-wire configuration.
 * 
 * Original library     (0.1) by Tom Igoe.
 * Two-wire modifications   (0.2) by Sebastian Gassner
 * Combination version   (0.3) by Tom Igoe and David Mellis
 * Bug fix for four-wire   (0.4) by Tom Igoe, bug fix from Noah Shibley  
 * Node.js two-wire port	by Charles Josh
 * 
 * More information: http://arduino.cc/en/Reference/Stepper
 * Circuits: http://arduino.cc/en/Tutorial/Stepper
 */

var board;

function Stepper(galileoBoard) {
	this.stepNumber = 0;		//which step
	this.stepperSpeed = 0;	//revolutions per minute
	this.rotation = 0;			//motor rotation
	board = galileoBoard;
}

Stepper.prototype.init = function (totalSteps, pin1, pin2) {
	this.totalSteps = totalSteps; //total steps for one revolution.
	this.pin1 = pin1;
	this.pin2 = pin2;
	board.pinMode(pin1, board.MODES.OUTPUT);
	board.pinMode(pin2, board.MODES.OUTPUT);
}

Stepper.prototype.setSpeed = function (whatSpeed) {
	this.stepDelay = 60 * 1000 / this.totalSteps / whatSpeed;
}

Stepper.prototype.stepMotor = function (thisStep) {
	switch (thisStep) {
		case 0:
			board.digitalWrite(this.pin1, 0);
			board.digitalWrite(this.pin2, 1);
			break;
		case 1:
			board.digitalWrite(this.pin1, 1);
			board.digitalWrite(this.pin2, 1);
			break;
		case 2:
			board.digitalWrite(this.pin1, 1);
			board.digitalWrite(this.pin2, 0);
			break;
		case 3:
			board.digitalWrite(this.pin1, 0);
			board.digitalWrite(this.pin2, 0);
			break;
	}
}

Stepper.prototype.step = function (stepsToMove) {
	var self = this;
	var stepsLeft = Math.abs(stepsToMove);
	this.rotation = (stepsToMove > 0) ? 1 : 0;
	var stepTimer = setInterval(function () {
		if (self.rotation) {
			self.stepNumber++;
			if (self.stepNumber === self.totalSteps) {
				self.stepNumber = 0;
			} 
		} else {
			if (self.stepNumber === 0) {
				self.stepNumber = self.totalSteps;
			}
			self.stepNumber--;
		}
		stepsLeft--;
		self.stepMotor(self.stepNumber % 4);
		if (stepsLeft === 0) {
			clearInterval(stepTimer);
		}
	}, this.stepDelay);
}

module.exports = Stepper;
Bayanihan Labs - LPG Leak Detection System
=========================

## Introduction

Another addition to the Internet of Things, this time utilizing an MQ-6 Gas Sensor, a Neocene 2T3542142 Bipolar Stepper Motor, and an Intel Galileo version 1. This detects the LPG concentration (parts per million) within the vicinity, pushes data online real-time, and switches the gas valve automatically, online, or through an app.

## Features

1. Detects leaks (event can be defined by the user through the control panel) and actuates immediately via stepper motor.
2. Real-time monitoring via web control panel accessible through LAN.
3. RGB LED tells current status for offline monitoring.

## Caveats

1. The sensor's scope is limited to 200-10000 ppm. Anything outside the scope is considered inaccurate.
2. The program assumes that the environment in which the device is booted on has no detectable trace of LPG (during calibration).
3. The stepper motor occassionaly staggers, resulting in missed steps, subsequently, a misaligned valve (possibly due to blocking code).
4. The time in the Intel Galileo must be calibrated before the program starts. A shell script (misc/housekeeping.sh) takes care of this.
	 The shell script must be placed in (/etc/networking/if-up.d/).

## To-do

1. Create a 3D model to connect the stepper motor to the LPG valve.
2. Identify specific code that triggers the stepper staggering and refactor it to be non-blocking.
3. Add more features to the control panel.
4. If possible, allow remote access to the control panel. 
5. Build a mobile app.
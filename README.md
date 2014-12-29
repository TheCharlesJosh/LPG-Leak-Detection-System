Bayanihan Labs - LPG Leak Detection System
=========================

## Introduction

Another addition to the Internet of Things, this time utilizing an MQ-6 Gas Sensor, a Neocene 2T3542142 Bipolar Stepper Motor, and an Intel Galileo version 1. This detects the LPG concentration (parts per million) within the vicinity, pushes data online real-time, and switches the gas valve automatically, online, or through an app.

## How to use

### RGB LED
Red pin - Pin 11

Green pin - Pin 10

Blue pin - Pin 9

### Neocene 2T3542142 Bipolar Stepper Motor 
Control pin 1 - Pin 5

Control pin 2 - Pin 6

### MQ-6 Gas Sensor (mounted on a [Pololu Carrier for MQ Gas Sensors](http://www.pololu.com/product/1479) with a load resistance of 10K)
Out - Analog Pin 0 (A0)

### Usage

To configure, clone this repository, and check the contents of misc/housekeeping.sh. This is important.

#### housekeeping.sh (Default)
```Shell
#!/bin/sh

echo "nameserver 8.8.4.4" >> /etc/resolv.conf
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
ntpdate -b time.upd.edu.ph
```
This runs after the network interface is configured properly.
Since the Galileo has issues on grabbing proper nameservers, we need to manually append third-party nameservers.
Then, assuming that the user does not have any RTC (real time clock) configured, we need to recalibrate the time by ntp.
Change these lines to suit your liking.

After fixing the content, execute

```
npm install --unsafe-perm
```

Lastly, to run the program,
```
npm start
```
or, 
```
pm2 start ../main.js --name 'LPG Leak Detector'
```

To run the program instead,
```
node main.js
```

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
5. Prior to usage, if the user has no RTC (real time clock) installed, the user must build and install ntp from http://www.ntp.org/ to deal with the time in the logs. Else, this is not required.

## To-do

1. Create a 3D model to connect the stepper motor to the LPG valve.
2. Identify specific code that triggers the stepper staggering and refactor it to be non-blocking.
3. Add more features to the control panel.
4. If possible, allow remote access to the control panel. 
5. Build a mobile app.

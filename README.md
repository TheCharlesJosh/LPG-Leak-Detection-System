Bayanihan Labs - LPG Leak Detection System
=========================

## Introduction

Another addition to the Internet of Things, this time utilizing an MQ-6 Gas Sensor, a Neocene 2T3542142 Bipolar Stepper Motor, and an Intel Galileo version 1. This detects the LPG concentration (parts per million) within the vicinity, pushes data online real-time, and switches the gas valve automatically, online, or through an app.

## How to use

### RGB LED
Red pin - Pin 8  
Green pin - Pin 10  
Blue pin - Pin 11  
Ground pin - Pin 9  

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

1. Several pre-installation steps are required for the internal program to work properly.
For setups without a real-time clock installed, the user must build, install, and configure ntp, as well as have it run automatically during startup (a script is provided to automate this).  
For setups connected to the router via Ethernet, additional nameservers must be added for the Galileo to properly connect to the Internet (a script is provided to automate this.)
For setups connected to the router via WiFi, additional drivers may be required.
2. During startup, the setup is assumed to be in a place free from significant flammable gas concentrations (i.e., the LPG stove is not in use, etc.). The first few seconds is used to calibrate the sensor and provide near-accurate data.
3. The Gas Sensor is limited to concentrations of 200 to 10 000 parts per million (ppm). Data outside this scope is considered inaccurate. Because of this, the web interface caps the data to 10 000 ppm, meaning, registered data that exceed this value is treated as 10 000 ppm.
4. During operation, the stepper motor staggers, missing a few steps, which may result in an incompletely closed gas valve. Code refactoring to reduce the instances of blocking code may be done.
5. During tests, a generic AC-DC adaptor used to supply 12 volts to the stepper motor overheated over long durations of usage. A better power supply is required. 

## To do

1. Create, print and bind a 3D model to the stepper motor and the gas valve.
2. Using the 3D printed model, fine-tune the stepper motor to properly open and close the valve.
3. Add more features to the web interface (i.e., manually open and close the valve, disable automatic closing etc.).
4. Create and fabricate an Intel Galileo-specific shield with the stepper motor circuit on-board, as well as header pins for the sensor and the stepper motor.
5. Develop a mobile application for easy access, optionally, remote access to the control panel may also be configured. 

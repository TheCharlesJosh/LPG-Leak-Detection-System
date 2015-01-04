#!/bin/sh

echo "[INFO] Checking for housekeeping script"
if [ ! -e "/etc/network/if-up.d/housekeeping.sh" ]; then
	echo "[INFO] Placing script into startup"
	mkdir -p /etc/network/if-up.d
	cp misc/housekeeping.sh /etc/network/if-up.d/
fi

echo "[INFO] Executing housekeeping"
./misc/housekeeping.sh
echo "[INFO] Done housekeeping"

echo "[INFO] Configuring PM2"
if [ ! -d "/usr/lib/node_modules/pm2" ]; then
	echo "[INFO] Installing PM2"
	npm install -g pm2
fi

if [ ! -e "/etc/init.d/pm2-init.sh" ]; then
	echo "[INFO] Starting main program"
	pm2 start ./main.js --name 'LPG Leak Detector'
	echo "[INFO] Adding to startup"
	pm2 startup ubuntu
	echo "[INFO] Saved"
	pm2 save
fi

echo "[INFO] Success"
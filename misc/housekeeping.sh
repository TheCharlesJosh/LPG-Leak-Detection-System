#!/bin/sh

echo "nameserver 8.8.4.4" >> /etc/resolv.conf
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
ntpdate -b time.upd.edu.ph
#!/bin/bash
echo "=================> STARTING TEST"
echo "=================> SETUP TEST ENVIRONMENT"
set -ev
mkdir /tmp/sxapi-core;
cd /tmp/sxapi-core;
git clone https://github.com/startxfr/sxapi-core.git .
echo "========> BUILDING Service Container (v0.0.8)"
sudo docker-compose build
echo "========> TESTING OS Container (v0.0.8)"
sudo docker-compose up -d
echo "========> RESULT"
sudo docker-compose ps
echo "=================> TEST ENDED SUCCESSFULLY"
exit 0;






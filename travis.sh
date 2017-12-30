#!/bin/bash
echo "INFO: Updating docker configuration (experimental)"
echo '{ "experimental": true, "storage-driver": "overlay2", "max-concurrent-downloads": 50, "max-concurrent-uploads": 50 }' | sudo tee /etc/docker/daemon.json
sudo service docker restart
docker-compose -f travis-compose.yml build
docker-compose -f travis-compose.yml up -d
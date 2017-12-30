#!/bin/bash
docker-compose -f travis-compose.yml build
docker-compose -f travis-compose.yml up -d 
#!/bin/bash

set -o errexit

cd /opt/bot-directory || { echo "No directory found"; exit 1; }

git pull

npm install

npm run build

pm2 reload all

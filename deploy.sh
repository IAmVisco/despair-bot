#!/bin/bash

set -o errexit

cd /opt/despair-bot || { echo "No directory found"; exit 1; }

git pull

npm install

npm run build

mv dist/src/* dist/

rm -rf dist/src dist/package.json

pm2 reload d-bot

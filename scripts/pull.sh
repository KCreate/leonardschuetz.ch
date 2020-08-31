#!/bin/bash

git stash
git checkout master
git pull origin master
npm run build
sudo pm2 restart process.json
git stash pop
git clone https://github.com/KCreate/bagbags-website server/resources/documents/bagbags

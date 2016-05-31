#!/bin/bash

git pull origin master
npm run build
pm2 restart server

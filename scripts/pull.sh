#!/bin/bash

# Pull the newest branch from the repo
git pull origin master

# Build the server
npm run Build

# Update the process in pm2
pm2 restart server
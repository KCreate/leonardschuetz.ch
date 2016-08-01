#!/bin/bash

# Ask for the sudo password upfront
sudo -k
sudo -v

# Set the node environment to production
export NODE_ENV=app_production

# rebuild the front-end files
npm run build

# start the http server
npm start &

# start the https & wss proxy
sudo node server/proxy.js production

# Once terminated, kill the http server too
kill $!

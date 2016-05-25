#!/bin/bash

# Create a new folder for the server files to reside in
mkdir serverBuild

# Copy files to the server build
cp -r dist serverBuild/
cp -r server serverBuild/
touch serverBuild/webpack.config.js
echo 'module.exports={"production":true,"output":{"publicPath":"/"}}' > serverBuild/webpack.config.js
cp package.json serverBuild/
cp -r utils serverBuild/

# Download all production modules directly into the folder
cd serverBuild/
npm install --production
cd ../

# Log
echo "Successfully built server at $(pwd)/serverBuild/";

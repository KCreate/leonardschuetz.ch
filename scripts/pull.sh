#!/bin/bash

git stash
git pull origin master
npm run build
pm2 restart server
git stash pop

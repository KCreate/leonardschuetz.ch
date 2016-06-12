#!/bin/bash

# Backup the dist folder, since admins can upload data directly to it
cp -r ../dist ./.tmpBackup

git stash
git pull origin master
npm run build
pm2 restart server
git stash pop

# Merge the backup with the new dist folder, ignoring existing files
rsync -a --ignore-existing ./.tmpBackup ../dist

# Delete the backups
rm -rf ./.tmpBackup

# if there is nothing to pop, git stash returns 1 as a status code
# manually return 0 so npm won't complain
exit 0

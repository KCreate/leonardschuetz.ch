#!/bin/bash

git stash
git pull origin master
npm run build
pm2 restart server
git stash pop

# if there is nothing to pop, git stash returns 1 as a status code
# manually return 0 so npm won't complain
exit 0

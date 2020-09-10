#!/bin/sh
while inotifywait -e close_write server/*.scss server/blog/*/*.md; do ./build.sh; done

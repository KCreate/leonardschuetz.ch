#!/bin/sh
while inotifywait -e close_write server/*.scss; do ./build.sh; done

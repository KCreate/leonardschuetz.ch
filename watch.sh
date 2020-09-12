#!/bin/sh
while inotifywait --quiet --event close_write server/resources/css/*.scss server/blog/*/*.md; do ./build.sh; done

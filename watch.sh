#!/bin/sh

while sleep 1; do ./build.sh; done

# while inotifywait --quiet --event close_write \
#   server/resources/css/*.scss                 \
#   server/blog/*/*.md                          \
#   server/blog/*/*/*.md                        \
#   ; do ./build.sh; done

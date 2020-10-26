#!/bin/sh
CSS_PATHS=
while inotifywait --quiet --event close_write \
  server/resources/css/*.scss                 \
  server/blog/*/*.md                          \
  server/blog/*/*/*.md                        \
  ; do ./build.sh; done

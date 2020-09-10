#!/bin/sh
sass server/style.scss server/style.css

pandoc \
  -f markdown \
  -t html \
  -i server/blog/template/article.md \
  -o server/blog/template/index.html \
  --template resources/blog-template.html \
  --highlight-style tango

pandoc \
  -f markdown \
  -t html \
  -i server/blog/nan-boxing/article.md \
  -o server/blog/nan-boxing/index.html \
  --template resources/blog-template.html \
  --highlight-style tango

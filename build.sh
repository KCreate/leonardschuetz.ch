#!/bin/sh
if sass server/resources/css/style.scss server/resources/css/style.css; then
  echo "Built css"
else
  echo "Failed to build css"
fi

find server/blog -name "*.md" | while read -r file; do
  if pandoc \
    -f markdown \
    -t html \
    -i $file \
    -o ${file%/*}/index.html \
    --template resources/blog-template.html \
    --syntax-highlighting tango; then
    echo "Built ${file%/*}"
  else
    echo "Failed to build ${file%/*}"
  fi
done

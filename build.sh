#!/bin/sh
RED=1
GREEN=2
colorecho() {
  tput setaf $2
  echo $1
  tput sgr0
}

if sass server/resources/css/style.scss server/resources/css/style.css; then
  colorecho "Built css" $GREEN
else
  colorecho "Failed to build css" $RED
fi

find server/blog -name "*.md" | while read -r file; do
  if pandoc \
    -f markdown \
    -t html \
    -i $file \
    -o ${file%/*}/index.html \
    --template resources/blog-template.html \
    --highlight-style tango; then
    colorecho "Built ${file%/*}" $GREEN
  else
    colorecho "Failed to build ${file%/*}" $RED
  fi
done

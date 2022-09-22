#!/bin/sh

find build/prerendered -name "*.html" -exec sed -i 's/rel="stylesheet"/rel="preload" as="style"/g' {} \;
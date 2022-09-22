#!/bin/sh

find build/prerendered -type f -name "*.html" -exec sed -i 's/rel="stylesheet"/rel="preload" as="style" onload="this.rel='"'stylesheet'"'"/g' {} \;
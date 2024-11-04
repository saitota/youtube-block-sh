#!/bin/bash

cat curl.txt | gsed "s/'/\"/g" | gsed "s/\\\//g" | grep -e 'cookie' -e 'authorization' > conf_secret.txt
echo "conf_secret.txt"
cat conf_secret.txt

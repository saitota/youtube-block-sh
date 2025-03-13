#!/bin/bash

# conf_secret.txtからcookieとauthorizationヘッダーを抽出してexport形式で出力
cat conf_secret.txt | gsed "s/'/\"/g" | gsed "s/\\\//g" | grep -e '"cookie": "' -e '"authorization": "' | sed 's/.*": "\(.*\)",\?/\1/' | awk '
NR==1 { print "export YOUTUBE_COOKIE=\"" $0 "\"" }
NR==2 { print "export YOUTUBE_AUTH=\"" $0 "\"" }
'

#!/bin/bash

# authorization値の抽出
auth=$(cat curl.txt | grep "authorization: " | cut -d':' -f2 | cut -d"'" -f1 | tr -d ' ')
echo "export YOUTUBE_AUTH=\"$auth\""

# cookie値の抽出
cookie=$(cat curl.txt | grep "^.*-b '" | cut -d"'" -f2)
echo "export YOUTUBE_COOKIE=\"$cookie\""

#!/bin/bash

echo "unset YOUTUBE_AUTH"
echo "unset YOUTUBE_COOKIE"

# authorization値の抽出
auth=$(cat curl.txt | grep "authorization: " | cut -d':' -f2 | cut -d' ' -f2- | cut -d"'" -f1)
echo "export YOUTUBE_AUTH=\"$auth\""

# cookie値の抽出
cookie=$(cat curl.txt | grep "^.*-b '" | cut -d"'" -f2)
echo "export YOUTUBE_COOKIE=\"$cookie\""

#!/bin/bash

# Read kidsIds from file
kidsIds=$(cat kids_ids.txt)
channelName=$1

# get channelId from channelName
curl -o channel.txt --silent --show-error "https://www.youtube.com/@$channelName/about"
channelId=$(ggrep -m 1 -o 'channel_id=[^"]*' channel.txt | cut -d '=' -f 2 | uniq)

echo "channelName $channelName"
echo "channelId $channelId"
if [ -z "$channelId" ]; then
  echo "no such channel"
  exit 0
fi

# loop through kidsIds because I have some children
for kidsId in ${kidsIds}; do
  echo "kidsId $kidsId"
  data_raw=$(cat ./data_raw.txt | sed -e "s/__CHANNEL_ID__/$channelId/g" | sed -e "s/__KIDS_ID__/$kidsId/g")
  #echo "data_raw $data_raw"
  curl 'https://www.youtube.com/youtubei/v1/kids/update_blacklist?prettyPrint=false' \
    --show-error \
    --config ./conf_secret.txt \
    --config ./conf_static.txt \
    --data-raw "${data_raw}"
    echo ""
    echo "done"
done

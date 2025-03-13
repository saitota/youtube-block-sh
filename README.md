# YouTube Kids Channel Blocker

A command-line tool for parents to efficiently manage channel blockinG YouTube Kids using [supervised account](https://support.google.com/youtubekids/answer/13887963?hl=ja).

## Setup

### 1. Authentication Configuration

You'll need to obtain authentication credentials from YouTube. Here's how:

1. Open Chrome DevTools (F12), Navigate to the Network tab
2. Go to YouTube Kids and block any channel, Look for the request to `www.youtube.com/youtubei/v1/kids/update_blacklist`
3. Select "Copy as cURL" and Paste the content into `curl.txt`
4. Find `kidGaiaId`, and run the helper script to generated environment variables

```bash
./gen_export.sh
# or
source <(./gen_export.sh)
```

## Usage

Block a single channel with kidGaiaId and Channel to Block:
```bash
go run cmd/main.go -kid-id KID_GAIA_ID -channel-name SOME_CHANNEL_NAME

channelName SOME_CHANNEL_NAME
channelId xxxxxxxxxxx
done, blocked channel @SOME_CHANNEL_NAME for kid KID_GAIA_ID
```

## Troubleshooting

If you receive a `request failed with status: 401` error, YOUTUBE_COOKIE and YOUTUBE_AUTH might be wrong.

## Note

The authentication tokens are temporary and will need to be refreshed periodically. Always ensure you're using current credentials when running the tool.

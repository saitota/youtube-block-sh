# About

This script allows parents to block their children's Youtube channels using [supervised account](https://support.google.com/youtubekids/answer/13887963?hl=ja) .
I created this script because I'm tired to manually blocking multiple Youtube channels for several kids accounts.

# setup

1) You need to grab the authorization token and cookie value from Chrome Devtools.
Make sure to add these to `conf_secret.txt` like this:

```bash
-H "authorization: XXX"
-H "cookie: XXX"
```

or paste `Copy as cURL` from Chrome Devtools to curl.txt and run `./gen_conf_secret.sh`  to generate `conf_secret.txt` .

2) you need to find the `kidGaiaId` within the payload of the block response at `www.youtube.com/youtubei/v1/kids/update_blacklist` .
Take that ID(s) and replace the value to `kids_ids.txt` .

# executon

To run the script, execute:

```bash
./main.sh hoppy7978
```

If you're using an expired cookie, you'll get a `"status": "UNAUTHENTICATED"` error.
If that happens, just refresh your cookie at `conf_secret.txt` and try again.
A successful response will return a long JSON object.

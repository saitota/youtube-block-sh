# setup

1) You need to grab the authorization token and cookie value from Chrome Devtools.
Make sure to add these to your request headers like this:

```conf_secret.txt
-H "authorization: XXX"
-H "cookie: XXX"
```

2) you need to find the `kidGaiaId` within the payload of the block response.
Take that ID and replace the value to `kids_ids.txt` .

# executon

To run the script, execute:

```bash
./main.sh hoppy7978
```

If you're using an expired cookie, you'll get a `"status": "UNAUTHENTICATED"` error.
If that happens, just refresh your cookie at `conf_secret.txt` and try again.
A successful response will return a long JSON object.

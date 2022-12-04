# Tweet Spammers Finder

Small script which loads all tweets up to limits and finds out who tweeted the most in your feed.

## Set Up

### Install Dependencies

```bash
yarn
```

### Config

```bash
cp sample.env .env
```

Edit `.env`:

- USER_ID - your numerical user id, easiest to get using https://tweeterid.com
- AUTH_TOKEN - Twitter API token, can request access or log in and extract from options at [Glitch Playground](https://oauth-playground.glitch.me/?id=usersIdTimeline) (easier)
- TWEET_NUMBER_THRESHOLD - Ignore users with too little tweets, 10 works fine for me

## Run

```bash
yarn start
```

# Wattpad Downloader
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d96cbab4794140b8af375d85fcf5d524)](https://www.codacy.com/gh/Feuerhamster/wattpad-downloader/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Feuerhamster/wattpad-downloader&amp;utm_campaign=Badge_Grade)
[![Website Badge](https://img.shields.io/badge/website-https%3A%2F%2Fwattpad.ml-blue)](https://wattpad.ml)

Download Wattpad stories for e-book readers, smartphones, desktop and more for free!

This software based on Node.js and Express.js can fetch stories from Wattpad and convert it into an EPUB file or a full functional HTML reader for offline availability.

## Installation
1. Clone / download the repository
2. Go to the root directory of the project
3. Make sure to set up the environment variables properly
4. Run `npm install`
5. Then run `npm start`

### Environment variables
For the node app, to work properly, an .env file with the following values should be created in the project root, or they should be included in the environment variables.
The app will start and work without, but it's recommended to set those variables.

TLDR: All env variables are optional, but for full functionality, we recommend setting them.

```dotenv
# Default port is 2200
PORT = 2200

# Required if the app is running behind a reverse proxy like NGINX
PROXY = true

# Ackee configuration
ACKEE_TRACKER = your_ackee_tracker_script_url
ACKEE_SERVER = your_ackee_url
ACKEE_DOMAIN_ID = your_ackee_domain_id
ACKEE_DETAILED = true

# Rate limiter configuration (duration in seconds)
RATE_LIMIT_POINTS = 5
RATE_LIMIT_DURATION = 86400

# Caching ttl in seconds for the wattpad api
CACHE_TTL = 86400

# Redis connection string (uses NodeCache if not set)
REDIS_URI = redis://192.168.144.128:6379

# Google ReCaptcha configuration
RECAPTCHA_SITEKEY = your_site_key
RECAPTCHA_SECRET = your_captcha_secret
```

## Redis
The Wattpad Downloader works completely without Redis, but it is recommended to have a central redis server running if you are clustering and scaling the software.

## Docker
You can deploy the Wattpad Downloader with docker:
```bash
docker run -d --name wattpad-dl -p 2200:2200 repo.bluemedia.dev/bluemedia/wattpad-downloader
```

## Project structure
- `/lang` Contains JSON files with language translations. The file name corresponds to the 2-3 letters language tag from the *Accept-Language* http header.
- `/routes` Contains js files with express routers.
- `/services` Contains js files with static classes that provides some functionalities.
- `/static` Contains multiple files that will be hostet as static assets by express.
- `/templates` Contains the templates to convert the wattpad stories to the specific formats.
- `/views` Contains Pug template files that will be rendered by express.

## API Endpoints
**Important:** Do not use this automated! The endpoint have a high response time because the backend have to fetch all data and texts from the wattpad books.

### `/api/:id/download/:format`
**Params:**
- `id` The id of a wattpad story
- `format` The format for a download *epub|html*

**Querystring:**
- `token` A user response from ReCaptcha

**Returns:**
- `.epub` file download (Content-disposition: attachment)
- `.html` file download (Content-disposition: attachment)
- `{ "error": "book_not_found" }`

## File formats for story conversion

### EPUB
EPUB is an e-book file format that uses the ". epub" file extension.
The term is short for electronic publication and is sometimes styled ePub.
EPUB is supported by many e-readers, and compatible software is available for most smartphones, tablets, and computers.

### HTML
The HTML file features an entire reader including the story (so people can read it offline).

## Main developers
- [Feuerhamster](https://guthub.com/Feuerhamster)
- [BluemediaGER](https://github.com/BluemediaGER)

*We are not associated with Wattpad Corp. in any way.*
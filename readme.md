# Wattpad Downloader
Download Wattpad stories for e-book readers, smartphones, desktop and more for free!

This software based on nodejs, express and ejs can fetch stories from Wattpad and convert it into an EPUB file or a full functional HTML reader.

**https://wattpad.ml**

## Installation
1. Clone / download the repository
2. Go to the root directory of the project
3. Run `npm install`
4. Then run `npm start`

The port can be changed with the environment variable `PORT`.
Default port is `2200`.

## Project structure
- `lang` Contains JSON files with language translations. The file name corresponds to the 2-3 letters language tag from the *Accept-Language* http header.
- `routes` Contains js files with express routers.
- `services` Contains js files with static classes that provides some functionalities.
- `static` Contains multiple files that will be hostet as static assets by express.
- `templates` Contains the templates to convert the wattpad stories to the specific formats.
- `views` Contains EJS views that will be rendered by express

## API Endpoints
**Important:** Do not use this automated! The endpoint have a high response time because the backend have to fetch all data and texts from the wattpad books.

### `/api/:id/download/:format`
**Params:**
- `id` The id of a wattpad story
- `format` The format for a download *epub|html*

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

# Wattpad Downloader

## Installation
1. Download the repository
2. Go to the root directory of the project
3. Run `npm install`
4. Then run `npm start`

The port can be changed with the enviroment variable `PORT`.

## Endpoints
**Important:** Do not use this automated! The endpoints have a high response time because the backend have to fetch all data and texts.

### `/api/:id`
**Params:**
- `id` The id of a wattpad story or a part of a story

**Returns:**
- An object with all book data

### `/api/:id/parts`
**Params:**
- `id` The id of a wattpad story or a part of a story

**Returns:**
- An array of objects with all parts and texts

### `/api/:id/download/:format`
**Params:**
- `id` The id of a wattpad story or a part of a story
- `format` The format for download *epub|html*
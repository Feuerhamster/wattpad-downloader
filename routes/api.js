// Import modules
const express = require("express");
const router = express.Router();
const stream = require("stream");

const Wattpad = require("../services/wattpad");
const Generator = require("../services/generator");
const Translation = require("../services/translation");
const CaptchaService = require("../services/captcha");
const RateLimiter = require("../services/rateLimiter");

/*
* Get downloadable book
* */
router.get("/:id/download/:format", CaptchaService.middleware, async (req, res) => {

	// Check if format is available
	if(!Generator.availableFormats.includes(req.params.format)) {
		res.status(400).send({ error: "unknown_format", formats: Generator.availableFormats });

		console.log(`[${new Date().toISOString()}] Converter: user tried to convert story into "${req.params.format}"`);

		return;
	}

	let allowed = await RateLimiter.consume(req.ip);

	// Exceeded rate limit
	if(!allowed) {
		res.status(429).end();
		return;
	}

	// Get book data
	let bookData = await Wattpad.getBookById(req.params.id);

	// Can't get book
	if(!bookData) {
		res.status(404).end();
		return;
	}

	// Get parts
	let parts = await Wattpad.getParts(bookData.parts);

	// Get language
	let { lang, langName } = Translation.getTranslation(req.acceptsLanguages(Translation.langs));

	if(req.params.format === "epub") {

		let epub;

		try {
			epub = await Generator.epub(bookData, parts);
		} catch (e) {
			console.error(e);
			return res.status(500).end();
		}

		let fileContents = Buffer.from(epub, "base64");

		let readStream = new stream.PassThrough();
		readStream.end(fileContents);

		res.set("Content-disposition", "attachment; filename=" + `${Wattpad.formatBookTitle(bookData.title)}-${bookData.id}.epub`);
		res.set("Content-Type", "application/epub+zip");

		readStream.pipe(res);

	} else if(req.params.format === "html") {

		let html;

		try {
			html = await Generator.html(bookData, parts, langName, lang);
		} catch (e) {
			console.error(e);
			return res.status(500).end();
		}

		res.set("Content-disposition", "attachment; filename=" + `${Wattpad.formatBookTitle(bookData.title)}-${bookData.id}.html`);
		res.set("Content-Type", "text/html");

		res.send(html);

	}

	console.log(`[${new Date().toISOString()}] Converted: "${bookData.title}" (${req.params.id}) to ${req.params.format} (${parts.length}/${bookData.parts.length} parts)`);
});

module.exports = router;
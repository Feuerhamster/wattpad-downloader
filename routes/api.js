// import modules
const express = require('express');
const router = express.Router();
const stream = require('stream');

const Wattpad = require('../services/wattpad');
const Generator = require('../services/generator');
const Translation = require('../services/translation');

/*
* Get book meta data by part id
* */
router.get('/:id', async (req, res) => {

	let book = await Wattpad.tryGetBook(req.params.id);

	// Cancel if book can not be fetched
	if(book){
		res.send(book);
	}else{
		res.status(404).send({ error: 'book_not_found' });
	}

});

/*
* Get all parts
* */
router.get('/:id/parts', async (req, res) => {

	let bookData = await Wattpad.tryGetBook(req.params.id);

	// Get parts
	let parts = await Wattpad.getParts(bookData.parts);

	if(bookData.parts.length === parts.length){
		res.send(parts);
	}else{
		res.status(409).end();
	}

})

/*
* Get downloadable book
* */
router.get('/:id/download/:format', async (req, res) => {

	// Get book data
	let bookData = await Wattpad.tryGetBook(req.params.id);

	// Get parts
	let parts = await Wattpad.getParts(bookData.parts);

	// Get language
	let { lang, langName } = Translation.getTranslation(req.acceptsLanguages(Translation.langs));


	if(req.params.format === 'epub'){

		let epub = await Generator.epub(bookData, parts);

		let fileContents = Buffer.from(epub, 'base64');

		let readStream = new stream.PassThrough();
		readStream.end(fileContents);

		res.set('Content-disposition', 'attachment; filename=' + `${Wattpad.formatBookTitle(bookData.title)}-${bookData.id}.epub`);
		res.set('Content-Type', 'application/epub+zip');

		readStream.pipe(res);

	}else if(req.params.format === 'html'){

		let html = await Generator.html(bookData, parts, langName, lang);

		res.set('Content-disposition', 'attachment; filename=' + `${Wattpad.formatBookTitle(bookData.title)}-${bookData.id}.html`);
		res.set('Content-Type', 'text/html');

		res.send(html);

	}else{
		res.status(400).send({ error: 'unknown_format', formats: ['epub', 'html'] });
	}

})

module.exports = router;
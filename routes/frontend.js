// import modules
const express = require('express');
const router = express.Router();

const Wattpad = require('../services/wattpad');
const Translation = require('../services/translation');

/*
* Homepage
* */
router.get('/', async (req, res) => {

	let { lang, langName } = Translation.getTranslation(req.acceptsLanguages(Translation.langs));

	res.render('index', { book: null, error: null, lang, langName });

});

/*
* Book view
* */
router.get(/^\/(\d+)$/, async (req, res) => {

	let { lang, langName } = Translation.getTranslation(req.acceptsLanguages(Translation.langs));

	let book = await Wattpad.tryGetBook(req.params[0]);

	if(book){
		res.render('index', { book, lang, langName });
	}else{
		res.render('index', { book: null, error: 'book_not_found', lang, langName });
	}


});

/*
* Redirect if url is directly from wattpad
* */
router.get(/(story\/)?(\d+)-(.+)/, async (req, res) => {

	res.redirect('/' + req.params[1]);

});

module.exports = router;
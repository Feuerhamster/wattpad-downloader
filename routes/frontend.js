// import modules
const express = require("express");
const router = express.Router();

const Wattpad = require("../services/wattpad");
const Translation = require("../services/translation");

/*
* Homepage
* */
router.get(["/", "/help", "/privacy"], async (req, res) => {

	let { lang, langName } = Translation.getTranslation(req.acceptsLanguages(Translation.langs));

	res.render("index", { book: null, error: null, lang, langName, page: req.url.substr(1) });

});

/*
* Book view
* */
router.get(/^\/((b)-)?(\d+)$/, async (req, res) => {

	let { lang, langName } = Translation.getTranslation(req.acceptsLanguages(Translation.langs));

	let book = null;

	if(req.params[1] === 'b'){
		book = await Wattpad.getBookById(req.params[2]);
	}else{
		book = await Wattpad.getBookByPartId(req.params[2]);
		book = book ? book.group : null;
	}

	if(book){
		res.render("index", { book, error: null, lang, langName, page: "book" });
	}else{
		res.render("index", { book: null, error: "book_not_found", lang, langName, page: "error" });
	}


});

/*
* Redirect if url is directly from wattpad
* */
router.get(/((story)\/)?(\d+)-?(.+)?/, async (req, res) => {

	// If id is from book (indicated by /story in the url) then redirect with "b-" before the id.
	// This has to be done because the book view endpoint must know if its a book or a part to get the data from
	// Without this, it could happen that a book has the same id as a part and a different book would result
	res.redirect(`/${req.params[1] ? 'b-' : ''}${req.params[2]}`);

});

module.exports = router;
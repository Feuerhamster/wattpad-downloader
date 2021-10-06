// import modules
const express = require("express");
const router = express.Router();

const Wattpad = require("../services/wattpad");
const Translation = require("../services/translation");
const RateLimiter = require("../services/rateLimiter");

/*
* Language middleware to load translation
* */
router.use((req, res, next) => {
	// Get the first accepted language of the specified languages from the accept-language header based on the available languages.
	req.trans = Translation.getTranslation(req.acceptsLanguages(Translation.langs));
	next();
});

/*
* Homepage
* */
router.get("/", async (req, res) => res.render("home", req.trans));

/*
 * Help page
 */
router.get("/help", (req, res) => res.render("help", req.trans));

/*
 * Privacy page
 */
router.get("/privacy", (req, res) => res.render("privacy", req.trans));

/*
 * Error view
 */
router.get("/error/:err", (req, res) => {
	res.render("error", { error: req.params.err, lang: req.trans.lang, langName: req.trans.langName });
});

/*
* Book view
* */
router.get(/^\/((b)-)?(\d+)$/, async (req, res) => {

	let book;

	if(req.params[1] === "b") {
		book = await Wattpad.getBookById(req.params[2]);
	} else {
		book = await Wattpad.getBookByPartId(req.params[2]);
		book = book ? book.group : null;
	}

	if(book.isPaywalled) {
		return res.render("error", { error: "paywall", lang: req.trans.lang, langName: req.trans.langName });
	}

	let limits = await RateLimiter.get(req.ip);

	if(book){
		res.render("book", { book, lang: req.trans.lang, langName: req.trans.langName, limits });
	}else{
		res.render("error", { error: "book_not_found", lang: req.trans.lang, langName: req.trans.langName });
	}

});

/*
* Redirect if url is directly from wattpad
* */
router.get(/((story)\/)?(\d+)-?(.+)?/, async (req, res) => {

	// If id is from book (indicated by /story in the url) then redirect with "b-" before the id.
	// This has to be done because the book view endpoint must know if its a book or a part to get the data from
	// Without this, it could happen that a book has the same id as a part and a different book would result
	res.redirect(`/${req.params[1] ? "b-" : ""}${req.params[2]}`);

});

module.exports = router;
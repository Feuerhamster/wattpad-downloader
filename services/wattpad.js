// Import modules and services
const axios = require("axios");
const sanitizeHtml = require("sanitize-html");
const Cache = require("./cache.js");

// Cache time to live
let ttl = process.env["CACHE_TTL"];
ttl = ttl && ttl.match(/\d+/) ? parseInt(ttl, 10) : 86400;

let allowedTags = sanitizeHtml.defaults.allowedTags.filter((e) => e !== "u");

class Wattpad {

	static cache = new Cache(ttl);

	/**
	 * Get a base64 image fron an url
	 * @param url
	 * @returns {Promise<string|null>}
	 */
	static async getImage(url){
		try{
			let res = await axios.get(url, { responseType: "arraybuffer" });

			return Buffer.from(res.data, "binary").toString("base64");

		}catch (e) {
			return null;
		}

	}

	/**
	 * Get book data by id of a part
	 * @param id
	 * @returns {Promise<boolean|any>}
	 */
	static async getBookByPartId(id) {

		let key = "bookbypart." + id;

		if(await Wattpad.cache.has(key)) {
			return await Wattpad.cache.get(key);
		}

		try {

			let res = await axios.get(`https://www.wattpad.com/v4/parts/${id}?fields=text_url,group(id,title,description,isPaywalled,url,cover,user(name,username,avatar),lastPublishedPart,parts(id,title,text_url),tags)`,
				{ headers: { accept: "application/json" }});

			await Wattpad.cache.set(key, res.data);

			return res.data;

		} catch (e) {
			return false;
		}

	}

	/**
	 * Get book data by id
	 * @param id
	 * @returns {Promise<boolean|any>}
	 */
	static async getBookById(id) {

		let key = "book." + id;

		if(await Wattpad.cache.has(key)) {
			return await Wattpad.cache.get(key);
		}

		try {

			let res = await axios.get(`https://www.wattpad.com/api/v3/stories/${id}?fields=id,title,description,url,cover,isPaywalled,user(name,username,avatar),lastPublishedPart,parts(id,title,text_url),tags`,
				{ headers: { accept: "application/json" }});

			await Wattpad.cache.set(key, res.data);

			return res.data;

		} catch (e) {
			return false;
		}

	}

	/**
	 * Try to get a book by book id or part id
	 * @param id
	 * @returns {Promise<void>}
	 */
	static async tryGetBook(id){

		// Try to get book by id
		let book = await Wattpad.getBookById(id);
		// If book by id not working, try get book by partId
		if(!book){
			book = await Wattpad.getBookByPartId(id);
			book = book.group;
		}

		return book;

	}

	/**
	 * Convert the book title to a file name friendly slug
	 * @param title
	 * @returns {string}
	 */
	static formatBookTitle(title){

		return Array.from(title.matchAll(/[a-zA-Z0-9äöüß]+/ig), (el) => el[0].toLowerCase()).join("-");

	}

	/**
	 * Get an array with all parts (title and data)
	 * @param parts
	 * @returns {Promise<[]>}
	 */
	static async getParts(parts) {

		let texts = [];

		for(let part of parts) {

			try {

				let key = "part." + part.id;
				let text = null;

				if(await Wattpad.cache.has(key)) {
					text = await Wattpad.cache.get(key);
				} else {
					text = await axios.get(part.text_url.text);

					text = sanitizeHtml(text.data, {
						allowedTags
					});

					await Wattpad.cache.set(key, text);
				}

				texts.push({
					title: part.title,
					data: text
				});

			} catch (e) {
				continue;
			}

		}

		return texts;

	}

}
module.exports = Wattpad;
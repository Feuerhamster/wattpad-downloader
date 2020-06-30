// Import modules and services
const axios = require("axios");
const jsdom = require("jsdom");

class Wattpad {

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

		try {

			let res = await axios.get(`https://www.wattpad.com/v4/parts/${id}?fields=text_url,group(id,title,description,url,cover,user(name,username,avatar),lastPublishedPart,parts(id,title,text_url),tags)`,
				{ headers: { accept: "application/json" }});

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

		try {

			let res = await axios.get(`https://www.wattpad.com/api/v3/stories/${id}?fields=id,title,description,url,cover,user(name,username,avatar),lastPublishedPart,parts(id,title,text_url),tags`,
				{ headers: { accept: "application/json" }});

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
	 * Remove watpad attributes from html elements
	 * @param text
	 * @returns {string}
	 */
	static formatText(text){

		const document = new jsdom.JSDOM(text).window.document;

		let pElements = document.querySelectorAll("p");

		text = Array.from(pElements).map((el) => `<p>${el.innerHTML}</p>`).join("");
		text = text.replace(/<br ?\/?>/g, "");
		text = text.replace(/&nbsp;/g, " ");

		return text;
	}

	static formatBookTitle(title){

		return Array.from(title.matchAll(/[a-zA-Z0-9äöüß]+/ig), (el) => el[0].toLowerCase()).join("-");

	}

	/**
	 * Get an array with all parts (title and data)
	 * @param parts
	 * @returns {Promise<[]>}
	 */
	static async getParts(parts){

		let texts = [];

		for(let part of parts){

			try{

				let text = await axios.get(part.text_url.text);

				text = Wattpad.formatText(text.data);

				texts.push({
					title: part.title,
					data: text
				});

			}catch (e) {
				continue;
			}

		}

		return texts;

	}

}
module.exports = Wattpad;
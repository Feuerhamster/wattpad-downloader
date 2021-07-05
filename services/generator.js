const ejs = require("ejs");
const pug = require("pug");
const fs = require("fs");
const JSZip = require("jszip");
const axios = require("axios");

const Wattpad = require("./wattpad");

class Generator {

	static availableFormats = ["epub", "html"];

	static templates = {
		mimetype: fs.readFileSync("./templates/epub/mimetype").toString(),
		container: fs.readFileSync("./templates/epub/META-INF/container.xml").toString(),
		metadata: fs.readFileSync("./templates/epub/META-INF/metadata.xml.ejs").toString(),
		mainCSS: fs.readFileSync("./templates/epub/OPS/css/main.css").toString(),
		titleCSS: fs.readFileSync("./templates/epub/OPS/css/title.css").toString(),
		cover: fs.readFileSync("./templates/epub/OPS/cover.xhtml").toString(),
		contentOPF: fs.readFileSync("./templates/epub/OPS/content.opf.ejs").toString(),
		titleFile: fs.readFileSync("./templates/epub/OPS/title.xhtml.ejs").toString(),
		toc: fs.readFileSync("./templates/epub/OPS/toc.ncx.ejs").toString(),
		chapter: fs.readFileSync("./templates/epub/OPS/chapter.xhtml.ejs").toString(),
		htmlv2: fs.readFileSync("./templates/htmlv2.pug").toString()
	}

	/**
	 * Generate an epub (zip) file
	 * @param book
	 * @param parts
	 */
	static async epub(book, parts){

		let zip = new JSZip();

		// Mime type
		zip.file("mimetype", Generator.templates.mimetype);

		// META-INF directory
		let metaInf = zip.folder("META-INF");

		// Container file
		metaInf.file("container.xml", Generator.templates.container);
		// Metadata
		let metadata = ejs.render(Generator.templates.metadata, book);
		metaInf.file("metadata.xml", metadata);

		// OPS directory
		let ops = zip.folder("OPS");

		// CSS
		let css = ops.folder("css");
		css.file("main.css", Generator.templates.mainCSS);
		css.file("title.css", Generator.templates.titleCSS);

		// Images
		let images = ops.folder("images");

		try{
			let res = await axios.get(book.cover, { responseType: "arraybuffer" });
			images.file("cover.jpg", Buffer.from(res.data));
		}catch (e) {
			return null;
		}

		// Cover xhtml file
		ops.file("cover.xhtml", Generator.templates.cover);

		// Content.opf
		let contentOPF = ejs.render(Generator.templates.contentOPF, book);
		ops.file("content.opf", contentOPF);

		// title.xhtml
		let titleFile = ejs.render(Generator.templates.titleFile, book);
		ops.file("title.xhtml", titleFile);

		// table of contents
		let toc = ejs.render(Generator.templates.toc, book);
		ops.file("toc.ncx", toc);

		// Chapters
		for(let i = 0; i < parts.length; i++){
			let chapter = ejs.render(Generator.templates.chapter, parts[i]);
			ops.file(`chapter${i}.xhtml`, chapter);
		}

		try {
			return await zip.generateAsync({ type: "arraybuffer" });
		} catch (e) {
			console.log("Generator error:", e);
			return null;
		}

	}

	/**
	 * Get book as html
	 * @param book
	 * @param parts
	 * @param langName
	 * @param lang
	 * @returns {Promise<*>}
	 */
	static async html(book, parts, langName, lang){

		let image = await Wattpad.getImage(book.cover);
		let avatar = await Wattpad.getImage(book.user.avatar);

		let template = Generator.templates.htmlv2;

		return pug.render(template, { book, parts, image, avatar, langName, lang });

	}

	/*static async pdf(book, parts){

		let image = Wattpad.getImage(book.cover);

		let template = fs.readFileSync("./templates/pdf.ejs").toString();

		let html = ejs.render(template, { book, parts, image });

		return new Promise((resolve, reject) => {

			htmlpdf.create(html, { timeout: 10000 }).toBuffer(function(err, buffer){

				if(!err){
					resolve(buffer);
				}else{
					reject(err);
				}

			});

		});

	}*/

}

module.exports = Generator;
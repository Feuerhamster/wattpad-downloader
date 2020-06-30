const ejs = require("ejs");
const fs = require("fs");
const JSZip = require("jszip");
const axios = require("axios");

const Wattpad = require("./wattpad");
const Translations = require("./translation");

class Generator{

	/**
	 * Generate an epub (zip) file
	 * @param book
	 * @param parts
	 */
	static async epub(book, parts){

		let zip = new JSZip();

		// Mime type
		zip.file("mimetype", fs.readFileSync("./templates/epub/mimetype").toString());

		// META-INF directory
		let metaInf = zip.folder("META-INF");

		// Container file
		metaInf.file("container.xml", fs.readFileSync("./templates/epub/META-INF/container.xml").toString());
		// Metadata
		let metadata = ejs.render(fs.readFileSync("./templates/epub/META-INF/metadata.xml.ejs").toString(), book);
		metaInf.file("metadata.xml", metadata);

		// OPS directory
		let ops = zip.folder("OPS");

		// CSS
		let css = ops.folder("css");
		css.file("main.css", fs.readFileSync("./templates/epub/OPS/css/main.css").toString());
		css.file("title.css", fs.readFileSync("./templates/epub/OPS/css/title.css").toString());

		// Images
		let images = ops.folder("images");

		try{
			let res = await axios.get(book.cover, { responseType: "arraybuffer" });
			images.file("cover.jpg", Buffer.from(res.data));
		}catch (e) {
			return null;
		}

		// Cover xhtml file
		ops.file("cover.xhtml", fs.readFileSync("./templates/epub/OPS/cover.xhtml").toString());

		// Content.opf
		let contentOPF = ejs.render(fs.readFileSync("./templates/epub/OPS/content.opf.ejs").toString(), book);
		ops.file("content.opf", contentOPF);

		// title.xhtml
		let titleFile = ejs.render(fs.readFileSync("./templates/epub/OPS/title.xhtml.ejs").toString(), book);
		ops.file("title.xhtml", titleFile);

		// table of contents
		let toc = ejs.render(fs.readFileSync("./templates/epub/OPS/toc.ncx.ejs").toString(), book);
		ops.file("toc.ncx", toc);

		// Chapters
		for(let i = 0; i < parts.length; i++){
			let chapter = ejs.render(fs.readFileSync("./templates/epub/OPS/chapter.xhtml.ejs").toString(), parts[i]);
			ops.file(`chapter${i}.xhtml`, chapter);
		}

		return new Promise((resolve, reject) => {

			zip.generateAsync({ type: "arraybuffer" }).then((content) => {
				//fs.writeFileSync(`./books_temp/${book.title}.zip`, content);
				resolve(content);
			});

		});


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

		let template = fs.readFileSync("./templates/htmlv2.ejs").toString();

		return ejs.render(template, { book, parts, image, avatar, langName, lang });

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
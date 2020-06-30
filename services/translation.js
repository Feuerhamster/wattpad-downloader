const fs = require("fs");

class Translation{

	static langData = {}
	static langs = [];

	/**
	 * Load all languages from lang directory
	 */
	static loadLanguages(){

		let langs = fs.readdirSync("./lang");

		for(let lang of langs){

			let langName = lang.split(".")[0];

			Translation.langData[langName] = JSON.parse(fs.readFileSync("./lang/" + lang).toString());

			Translation.langs.push(langName);

		}

	}

	/**
	 * Get lang object for translation by lang name
	 * @param lang
	 * @returns {*}
	 */
	static getLangData(lang){
		return Translation.langData[lang];
	}

	/**
	 * Get translation by lang name
	 * @param availableLangs
	 * @returns {{langName: *, lang: *}}
	 */
	static getTranslation(availableLangs){

		let langName = Array.isArray(availableLangs) ? availableLangs[0] : availableLangs;
		let lang;

		if(availableLangs){
			lang = Translation.getLangData(langName);
		}else{
			lang = Translation.getLangData("en");
		}

		return { lang, langName };
	}

}

module.exports = Translation;
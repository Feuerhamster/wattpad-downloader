const axios = require("axios");
const querystring = require("querystring");

class CaptchaService {

    /**
     * Method to validate captcha
     * @param token
     * @return {Promise<boolean|Event>}
     */
    static async validateCaptcha(token) {
        let res;

        try {
            res = await axios.post("https://www.google.com/recaptcha/api/siteverify",
                querystring.stringify({
                    secret: process.env["RECAPTCHA_SECRET"],
                    response: token
                })
            );
        } catch (e) {
            return false;
        }

        return res.data.success;
    }

    /**
     * Express middleware to validate captcha
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    static async middleware(req, res, next) {
        if (!process.env["RECAPTCHA_SECRET"]) return next();

        if(!req.query.token) return res.status(403).send({ error: "invalid_token" });

        let captchaResult = await CaptchaService.validateCaptcha(req.query.token);

        if(captchaResult) {
            return next();
        } else {
            res.status(403).send({ error: "invalid_token" });
            console.log(`[${new Date().toISOString()}] API Request with invalid captcha token`);
        }
    }
}

module.exports = CaptchaService;
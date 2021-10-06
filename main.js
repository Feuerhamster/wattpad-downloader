// Import modules
let express = require("express");
let dotenv = require("dotenv");
const app = express();

const Translation = require("./services/translation");
const RateLimiter = require("./services/rateLimiter");

Translation.loadLanguages();
dotenv.config();
RateLimiter.init();

app.locals.ackee = {
	tracker: process.env["ACKEE_TRACKER"],
	server: process.env["ACKEE_SERVER"],
	domain: process.env["ACKEE_DOMAIN_ID"],
	detailed: process.env["ACKEE_DETAILED"] === "true"
};

app.locals.captcha = {
	sitekey: process.env["RECAPTCHA_SITEKEY"]
}

// Static assets
app.use(express.static("static"));

// Views
app.set("view engine", "pug");
app.set("views", "views");
app.set("trust proxy", process.env.PROXY === "true");
app.set("x-powered-by", false);

// Routes
const api = require("./routes/api");
const frontend = require("./routes/frontend");

app.use("/api", api);
app.use(frontend);

app.listen(process.env.PORT || 2200, () => {
	console.info("App started on 2200");
});
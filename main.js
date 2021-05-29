// Import modules
let express = require("express");
let dotenv = require("dotenv");
const app = express();

const Translation = require("./services/translation");
Translation.loadLanguages();

dotenv.config();

app.locals.ackee = {
	tracker: process.env["ACKEE_TRACKER"],
	server: process.env["ACKEE_SERVER"],
	domain: process.env["ACKEE_DOMAIN_ID"],
	detailed: process.env["ACKEE_DETAILED"] === "true"
};

// Static assets
app.use(express.static("static"));

// Views
app.set("view engine", "pug");
app.set("views", "views");

// Routes
const api = require("./routes/api");
const frontend = require("./routes/frontend");

app.use("/api", api);
app.use(frontend);

app.listen(process.env.PORT || 2200, () => {
	console.info("App started on 2200");
});
// Import modules
let express = require("express");
const app = express();

const Translation = require("./services/translation");
Translation.loadLanguages();

// Static assets
app.use(express.static("static"));

// Views
app.set("view engine", "ejs");
app.set("views", "views");

// Routes
const api = require("./routes/api");
const frontend = require("./routes/frontend");

app.use("/api", api);
app.use(frontend);

app.listen(process.env.PORT || 2200, () => {
	console.info("App started on 2200");
});
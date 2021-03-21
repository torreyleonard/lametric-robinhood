require("dotenv").config();
import * as express from "express";
import Logger from "./utils/Logger";
import Poll from "./routes/Poll";

(async () => {
	const app = express();
	app.use(express.json());
	// set routes
	app.get("/", Poll);
	app.all("*", (req, res) => {
		res.redirect(process.env.REDIRECT_URL);
	});
	app.listen(process.env.PORT || 8085, () =>
		Logger.info(`Server started on port: ${process.env.PORT || 8085}`)
	);
})();

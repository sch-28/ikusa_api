import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import Logger from "./util/logger";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
	cors({
		origin: "https://ikusa.site",
	})
);

const port = process.env.PORT;
// Starts HTTP Server
const server = app.listen(port, () => {
	Logger.info(`Server started listening on: http://localhost:${port}`);
});

// Initializes the Routes
app.use("/api", router);

/**
 * Shuts the server down
 */
export async function stopServer() {
	server.close();
}

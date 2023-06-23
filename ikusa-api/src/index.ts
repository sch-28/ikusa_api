import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import Logger from "./util/logger";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
if (process.env.NODE_ENV === "production") {
	app.use(
		cors({
			origin: "https://ikusa.site",
		})
	);
} else {
	app.use(
		cors({
			origin: "*",
		})
	);
}

// Apply the rate limiting middleware to all requests
app.use(
	rateLimit({
		windowMs: 60 * 1000, // 1000 requests per minute
		max: 1000,
		standardHeaders: true,
		legacyHeaders: false,
	})
);

// Apply the speed limiter to all requests
app.use(
	slowDown({
		windowMs: 60 * 1000, // 1000 requests per minute
		delayAfter: 60,
		delayMs: 1000,
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

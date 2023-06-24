import express from "express";
import { create_thumbnail } from "./api/create-thumbnail";
import { get_player } from "./api/get-player";
import { get_characters } from "./api/get-characters";

export class ResponseObject {
	status: number;
	body: Object | string | null;

	constructor(body: Object | string | null, status: number) {
		this.body = body;
		this.status = status;
	}
}

const router = express.Router();

router.post("/thumbnail", async (req, res) => {
	const { id } = req.body;
	if (!id) {
		return res.status(400).json({ error: "Missing required parameters" });
	}
	//check if input is valid
	if (typeof id !== "string") {
		return res.status(400).json({ error: "Invalid id" });
	}

	const response = await create_thumbnail(id);
	return res.status(response.status).json(response.body);
});

router.get("/player", async (req, res) => {
	res.set("Cache-Control", "public, max-age=3600");
	const { name, region } = req.query;
	if (!name || !region) {
		return res.status(400).json({ error: "Missing required parameters" });
	}

	//check if input is valid
	if (typeof name !== "string" || typeof region !== "string") {
		return res.status(400).json({ error: "Invalid parameters" });
	}

	const response = await get_player(name, region as "EU" | "NA" | "SA");
	return res.status(response.status).json(response.body);
});

router.post("/characters", async (req, res) => {
	const { names, region } = req.body;
	if (!names || !region) {
		return res.status(400).json({ error: "Missing required parameters" });
	}

	//check if input is valid
	if (!Array.isArray(names) || typeof region !== "string") {
		return res.status(400).json({ error: "Invalid parameters" });
	}

	const response = await get_characters(names, region as "EU" | "NA" | "SA", res);
	if (!response) return;
	return res.status(response.status).json(response.body);
});

export default router;

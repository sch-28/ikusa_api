import express from "express";
import { create_thumbnail } from "./api/create-thumbnail";
import { get_player } from "./api/get-players";

export class ResponseObject  {
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

router.post("/player", async (req, res) => {
	const { name, region } = req.body;
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

export default router;

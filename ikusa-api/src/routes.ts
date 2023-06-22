import express from "express";
import { create_thumbnail } from "./api/create-thumbnail";

export type Response = {
	status: number;
	body?: any;
};

const router = express.Router();

router.post("/thumbnail", async (req, res) => {
	const { url, id } = req.body;
	if (!url || !id) {
		return res.status(400).json({ error: "Missing required parameters" });
	}
	const response = await create_thumbnail(url, id);
	return res.status(response.status).json(response.body);
});

/* router.get("/test", async (req, res) => {
	const result = await fetch(
		"http://bdo-api:8001/v1/adventurer/search?query=Basmann&region=EU&searchType=familyName&page=1"
	);
	const json = await result.json();
	return res.json(json);
}); */

export default router;

import { supabase } from "../util/db";
import puppeteer, { Browser } from "puppeteer";
import Logger from "../util/logger";
import { ResponseObject } from "../routes";

export async function create_thumbnail(id: string) {
	let browser: Browser | null = null;
	try {
		Logger.info("Creating thumbnail for war " + id);
		browser = await puppeteer.launch({
			headless: "new",
			executablePath: "/usr/bin/google-chrome",
			args: ["--no-sandbox"],
		});

		const page = await browser.newPage();
		await page.setViewport({
			width: 1200,
			height: 628,
		});
		await page.goto("https://ikusa.site/wars/" + id + "?puppeteer", { waitUntil: "networkidle0" });
		const war_container = await page.$(".mt-16");
		if (!war_container) return new ResponseObject("Unable to load webpage", 500);
		const buffer = await war_container.screenshot({ type: "png" });
		await browser.close();
		browser = null;

		const { data, error } = await supabase.storage.from("war-thumbnails").upload(`${id}.png`, buffer as Buffer, {
			cacheControl: "3600",
			upsert: true,
		});
		if (error) {
			Logger.error(error);
			return new ResponseObject(JSON.stringify(error), 500);
		}
	} catch (e) {
		Logger.error(e);
		return new ResponseObject(JSON.stringify(e), 500);
	} finally {
		if (browser) {
			browser.close();
		}
	}

	return new ResponseObject(null, 200);
}

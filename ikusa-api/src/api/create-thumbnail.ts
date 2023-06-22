import puppeteer from "puppeteer";
import { supabase } from "../util/db";

const getBrowser = () =>
	process.env.NODE_ENV === "development"
		? // Run the browser locally while in development
		  puppeteer.launch()
		: // Connect to browserless so we don't run Chrome on the same hardware in production
		  puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.CHROME_KEY}` });

export async function create_thumbnail(url: string, id: string) {
	let browser: puppeteer.Browser | null = null;
	try {
		browser = await getBrowser();

		const page = await browser.newPage();
		await page.setViewport({
			width: 1200,
			height: 628,
		});
		await page.goto(url + "?puppeteer", { waitUntil: "networkidle0" });
		const war_container = await page.$(".mt-16");
		if (!war_container) return new Response("Unable to load webpage", { status: 500 });
		const buffer = await war_container.screenshot({ type: "png" });
		await browser.close();
		browser = null;

		const { data, error } = await supabase.storage.from("war-thumbnails").upload(`${id}.png`, buffer as Buffer, {
			cacheControl: "3600",
			upsert: true,
		});
		if (error) {
			console.error(error);
			return new Response(JSON.stringify(error), { status: 500 });
		}
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify(e), { status: 500 });
	} finally {
		if (browser) {
			browser.close();
		}
	}

	return new Response(null, { status: 200 });
}
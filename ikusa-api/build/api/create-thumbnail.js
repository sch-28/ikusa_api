"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_thumbnail = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const db_1 = require("../util/db");
const getBrowser = () => process.env.NODE_ENV === "development"
    ? // Run the browser locally while in development
        puppeteer_1.default.launch()
    : // Connect to browserless so we don't run Chrome on the same hardware in production
        puppeteer_1.default.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.CHROME_KEY}` });
function create_thumbnail(url, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let browser = null;
        try {
            browser = yield getBrowser();
            const page = yield browser.newPage();
            yield page.setViewport({
                width: 1200,
                height: 628,
            });
            yield page.goto(url + "?puppeteer", { waitUntil: "networkidle0" });
            const war_container = yield page.$(".mt-16");
            if (!war_container)
                return new Response("Unable to load webpage", { status: 500 });
            const buffer = yield war_container.screenshot({ type: "png" });
            yield browser.close();
            browser = null;
            const { data, error } = yield db_1.supabase.storage.from("war-thumbnails").upload(`${id}.png`, buffer, {
                cacheControl: "3600",
                upsert: true,
            });
            if (error) {
                console.error(error);
                return new Response(JSON.stringify(error), { status: 500 });
            }
        }
        catch (e) {
            console.error(e);
            return new Response(JSON.stringify(e), { status: 500 });
        }
        finally {
            if (browser) {
                browser.close();
            }
        }
        return new Response(null, { status: 200 });
    });
}
exports.create_thumbnail = create_thumbnail;

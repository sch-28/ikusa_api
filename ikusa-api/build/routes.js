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
const express_1 = __importDefault(require("express"));
const create_thumbnail_1 = require("./api/create-thumbnail");
const router = express_1.default.Router();
router.post("/thumbnail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, id } = req.body;
    if (!url || !id) {
        return res.status(400).json({ error: "Missing required parameters" });
    }
    const response = yield (0, create_thumbnail_1.create_thumbnail)(url, id);
    return res.status(response.status).json(response.body);
}));
exports.default = router;

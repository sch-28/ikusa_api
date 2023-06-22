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
exports.stopServer = exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./util/logger"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
const port = process.env.PORT;
console.log(port);
// Starts HTTP Server
const server = exports.app.listen(port, () => {
    logger_1.default.info(`Server started listening on: http://localhost:${port}`);
});
// Initializes the Routes
exports.app.use("/api", routes_1.default);
/**
 * Shuts the server down
 */
function stopServer() {
    return __awaiter(this, void 0, void 0, function* () {
        server.close();
    });
}
exports.stopServer = stopServer;

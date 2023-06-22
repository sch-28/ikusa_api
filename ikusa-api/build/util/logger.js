"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const { combine, colorize, printf, timestamp } = winston_1.format;
// Taken from https://levelup.gitconnected.com/better-logs-for-expressjs-using-winston-and-morgan-with-typescript-1c31c1ab9342
// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
};
// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};
// Tell winston that you want to link the colors
// defined above to the severity levels.
winston_1.default.addColors(colors);
// Chose the aspect of your log customizing the log format.
const myFormat = winston_1.default.format.combine(
// Add the message timestamp with the preferred format
winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), 
// Tell Winston that the logs must be colored
/* winston.format.colorize({ all: true }), */
// Define the format of the message showing the timestamp, the level and the message
winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
    // Allow the use the console to print the messages
    new winston_1.default.transports.Console({
        format: combine(colorize(), myFormat),
    }),
    // Allow to print all the error level messages inside the error.log file
    new winston_1.default.transports.File({
        filename: "logs/error.log",
        level: "error",
    }),
    // Allow to print all the error message inside the all.log file
    // (also the error log that are also printed inside the error.log(
    new winston_1.default.transports.File({ filename: "logs/all.log" }),
];
// Create the logger instance that has to be exported
// and used to log messages.
const Logger = winston_1.default.createLogger({
    //level: level(),
    level: "debug",
    levels,
    format: myFormat,
    transports,
});
exports.default = Logger;

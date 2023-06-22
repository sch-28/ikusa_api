"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const supabase_js_1 = require("@supabase/supabase-js");
exports.prisma = new client_1.PrismaClient();
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

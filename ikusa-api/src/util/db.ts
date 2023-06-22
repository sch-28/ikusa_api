import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
export const prisma = new PrismaClient();
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {auth:{persistSession:false}});

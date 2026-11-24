import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
export const runtime="nodejs";
const schema=z.object({title:z.string().min(1).max(240),details:z.string().max(2000).optional(),remindAt:z.string().datetime(),channel:z.enum(["push","voice","both"]).default("push"),source:z.enum(["user","lms","agent"]).default("user")});
function authorized(req:NextRequest){const secret=process.env.INTERNAL_API_SECRET;return Boolean(secret&&req.headers.get("authorization")===`Bearer ${secret}`);}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 const owner=process.env.AI_OWNER_ID||"primary";
 const {data,error}=await db.from("agent_reminders").select("*").eq("owner_id",owner).order("remind_at",{ascending:true}).limit(100);
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({reminders:data});
}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 const owner=process.env.AI_OWNER_ID||"primary";const v=parsed.data;
 const {data,error}=await db.from("agent_reminders").insert({owner_id:owner,title:v.title,details:v.details||null,remind_at:v.remindAt,channel:v.channel,source:v.source,timezone:"Asia/Tashkent"}).select("*").single();
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({reminder:data},{status:201});
}

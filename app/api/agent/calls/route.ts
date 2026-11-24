import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
export const runtime="nodejs";
const schema=z.object({providerCallId:z.string().max(200).optional(),callerName:z.string().max(200).optional(),callerNumber:z.string().max(40).optional(),intent:z.string().max(1000).optional(),summary:z.string().min(1).max(8000),requestedAction:z.string().max(2000).optional(),urgency:z.enum(["low","normal","high","urgent"]).default("normal"),callbackRequested:z.boolean().default(false),callbackAfter:z.string().datetime().optional(),transcriptConsent:z.boolean().default(false)});
function authorized(req:NextRequest){const secret=process.env.INTERNAL_API_SECRET;return Boolean(secret&&req.headers.get("authorization")===`Bearer ${secret}`);}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 const {data,error}=await db.from("call_summaries").select("id,caller_name,caller_number,intent,summary,requested_action,urgency,callback_requested,callback_after,created_at").eq("owner_id",process.env.AI_OWNER_ID||"primary").order("created_at",{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({calls:data});
}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 const v=parsed.data;const {data,error}=await db.from("call_summaries").insert({owner_id:process.env.AI_OWNER_ID||"primary",provider_call_id:v.providerCallId||null,caller_name:v.callerName||null,caller_number:v.callerNumber||null,intent:v.intent||null,summary:v.summary,requested_action:v.requestedAction||null,urgency:v.urgency,callback_requested:v.callbackRequested,callback_after:v.callbackAfter||null,transcript_consent:v.transcriptConsent}).select("id,created_at").single();
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({saved:data},{status:201});
}

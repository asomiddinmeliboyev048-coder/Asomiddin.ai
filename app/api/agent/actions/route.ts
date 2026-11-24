import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
export const runtime="nodejs";
const schema=z.object({
 actionType:z.enum(["create_reminder","call_contact","send_message","daily_report","update_schedule"]),
 payload:z.record(z.string(),z.unknown()),
 requiresApproval:z.boolean().default(true)
});
function authorized(req:NextRequest){const secret=process.env.INTERNAL_API_SECRET;return Boolean(secret&&req.headers.get("authorization")===`Bearer ${secret}`);}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 const {data,error}=await db.from("agent_actions").select("*").eq("owner_id",process.env.AI_OWNER_ID||"primary").order("created_at",{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({actions:data});
}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
 const v=parsed.data;const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 // External calls and messages always wait for explicit user approval.
 const forceApproval=["call_contact","send_message","update_schedule"].includes(v.actionType);
 const {data,error}=await db.from("agent_actions").insert({owner_id:process.env.AI_OWNER_ID||"primary",action_type:v.actionType,payload:v.payload,requires_approval:forceApproval||v.requiresApproval,status:"awaiting_approval"}).select("*").single();
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({action:data},{status:201});
}

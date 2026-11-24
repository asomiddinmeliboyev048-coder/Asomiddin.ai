import { NextRequest,NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
export const runtime="nodejs";
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const session=req.cookies.get("asomiddin_session")?.value;
 if(!process.env.APP_SESSION_TOKEN||session!==process.env.APP_SESSION_TOKEN)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Database not configured"},{status:503});
 const {data,error}=await db.from("agent_actions").update({status:"approved",approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id).eq("owner_id",process.env.AI_OWNER_ID||"primary").eq("status","awaiting_approval").select("id,status,action_type").maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500});if(!data)return NextResponse.json({error:"Action topilmadi yoki allaqachon ko‘rib chiqilgan."},{status:404});
 return NextResponse.json({action:data});
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {\n  const session = request.headers.get("cookie")?.split(";").map(v=>v.trim()).find(v=>v.startsWith("asomiddin_session="))?.slice("asomiddin_session=".length);\n  if (!process.env.APP_SESSION_TOKEN || session !== process.env.APP_SESSION_TOKEN) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ configured:false, lastSync:null, tasks:[], events:[], error:"Supabase server env sozlanmagan." }, { status:200 });
  const owner = process.env.AI_OWNER_ID || "primary";
  const [status, tasks, events] = await Promise.all([
    db.from("lms_sync_status").select("*").eq("owner_id",owner).maybeSingle(),
    db.from("lms_tasks").select("external_id,course,title,url,due_at,grade,passing_grade,status,updated_at").eq("owner_id",owner).order("due_at",{ascending:true,nullsFirst:false}).limit(100),
    db.from("lms_events").select("event_type,payload,created_at").eq("owner_id",owner).order("created_at",{ascending:false}).limit(30)
  ]);
  const error = status.error || tasks.error || events.error;
  if (error) return NextResponse.json({ configured:true, error:error.message, tasks:[], events:[] }, { status:500 });
  return NextResponse.json({ configured:true, lastSync:status.data?.last_sync_at || null, courseCount:status.data?.course_count ?? 0, taskCount:status.data?.task_count ?? 0, tasks:tasks.data || [], events:events.data || [] });
}

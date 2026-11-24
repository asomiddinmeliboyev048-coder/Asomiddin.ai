import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ ok: true, service: "asomiddin-ai-web", timestamp: new Date().toISOString(), integrations: { supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY), voice: Boolean(process.env.VOICE_API_KEY), telephony: Boolean(process.env.TELEPHONY_AUTH_TOKEN) } });
}

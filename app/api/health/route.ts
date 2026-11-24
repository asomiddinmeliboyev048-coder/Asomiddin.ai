import { NextResponse } from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 const env={
  supabase:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),
  privateLogin:Boolean(process.env.APP_ACCESS_PASSWORD&&process.env.APP_SESSION_TOKEN),
  assistant:Boolean(process.env.OPENAI_API_KEY),
  lmsWorker:Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),
  voiceOutput:"browser-speech-api",
  telephony:Boolean(process.env.TELEPHONY_AUTH_TOKEN&&process.env.TELEPHONY_ACCOUNT_ID)
 };
 return NextResponse.json({ok:true,service:"asomiddin-ai-web",timestamp:new Date().toISOString(),integrations:env});
}

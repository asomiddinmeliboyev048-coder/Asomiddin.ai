import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
export const runtime="nodejs";
const schema=z.object({message:z.string().min(1).max(5000),history:z.array(z.object({role:z.enum(["user","assistant"]),content:z.string().max(5000)})).max(12).default([])});
export async function POST(req:NextRequest){
 const session=req.cookies.get("asomiddin_session")?.value;
 if(process.env.APP_AUTH_DISABLED!=="true"&&(!process.env.APP_SESSION_TOKEN||session!==process.env.APP_SESSION_TOKEN))return NextResponse.json({error:"Avval tizimga kiring."},{status:401});
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Xabar formati noto‘g‘ri."},{status:400});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY sozlanmagan. Vercel Environment Variables bo‘limiga kiriting."},{status:503});
 const db=getSupabaseAdmin();let context="LMS ma’lumotlari hozircha ulanmagan.";
 if(db){
  const {data}=await db.from("lms_tasks").select("course,title,due_at,status,grade,passing_grade").eq("owner_id",process.env.AI_OWNER_ID||"primary").order("due_at",{ascending:true,nullsFirst:false}).limit(40);
  if(data?.length)context="TATU LMS topshiriqlari (Asia/Tashkent):\n"+data.map(t=>"- "+t.course+": "+t.title+"; deadline: "+(t.due_at||"ko‘rsatilmagan")+"; status: "+t.status+"; grade: "+(t.grade??"yo‘q")+"; passing grade: "+(t.passing_grade??"noma’lum")).join("\n");
 }
 const input=[...parsed.data.history,{role:"user" as const,content:parsed.data.message}].map(m=>({role:m.role,content:[{type:"input_text",text:m.content}]}));
 const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",instructions:"Sen ASOMIDDIN AI shaxsiy yordamchisisan. Foydalanuvchiga o‘zbek tilida, aniq va tabiiy javob ber. Joriy sana-vaqtni taxmin qilma. Tashqi qo‘ng‘iroq, xabar yuborish yoki jadvalni o‘zgartirishni bajarilgan deb aytma; bunday amallar uchun tasdiq va ulangan provayder kerak. LMS ma’lumotlari quyida berilgan, faqat shu ma’lumotga tayangan holda faktlarni ayt.\n\n"+context,input,max_output_tokens:700})});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)return NextResponse.json({error:body.error?.message||"AI provayderidan javob olinmadi."},{status:502});
 const answer=(body.output||[]).flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==="output_text").map((c:any)=>c.text).join("\n").trim();
 return NextResponse.json({answer:answer||"Hozir javob tayyorlay olmadim."});
}

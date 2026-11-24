import { NextRequest,NextResponse } from "next/server";
import { timingSafeEqual,randomBytes } from "node:crypto";
export const runtime="nodejs";
function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export async function POST(req:NextRequest){
 const {password}=await req.json().catch(()=>({password:""}));
 const expected=process.env.APP_ACCESS_PASSWORD,session=process.env.APP_SESSION_TOKEN;
 if(!expected||!session)return NextResponse.json({error:"APP_ACCESS_PASSWORD va APP_SESSION_TOKEN sozlanmagan."},{status:503});
 if(typeof password!=="string"||!equal(password,expected))return NextResponse.json({error:"Parol noto‘g‘ri."},{status:401});
 const response=NextResponse.json({ok:true});
 response.cookies.set("asomiddin_session",session,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*14});
 return response;
}
export async function DELETE(){
 const response=NextResponse.json({ok:true});response.cookies.set("asomiddin_session","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});return response;
}

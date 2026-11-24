import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
const base=process.env.LMS_DATA_DIR||process.cwd();
const authPath=path.join(base,".auth","lms-storage-state.json");
const outDir=path.join(base,".local","lms");
await fs.mkdir(outDir,{recursive:true}); await fs.access(authPath);
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({storageState:authPath,timezoneId:"Asia/Tashkent"});
const page=await context.newPage();
const origin=process.env.LMS_URL||"https://lms.tuit.uz";
const maxPages=Number(process.env.LMS_MAX_COURSES||50);
const courses=[]; const tasks=[]; const visited=new Set();
const clean=s=>(s||"").replace(/\s+/g," ").trim();
const dateFromText=(s)=>{
 const m=(s||"").match(/(?:due|deadline|muddat|topshirish|until|to)\D{0,25}(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?:\s+\d{1,2}:\d{2})?)/i);
 if(!m)return null;
 const parts=m[1].match(/\d+/g).map(Number);let [a,b,c,h=23,min=59]=parts;
 if(c<100)c+=2000;
 const d=new Date(c,b-1,a,h,min,0);return Number.isNaN(d.getTime())?null:d.toISOString();
};
try{
 await page.goto(origin,{waitUntil:"domcontentloaded",timeout:60000});
 if(/login|oneid/i.test(page.url())||await page.locator('input[type="password"]').count())throw new Error("LMS sessiyasi yaroqsiz yoki tugagan. npm run lms:login orqali qo‘lda qayta kiring.");
 const courseLinks=await page.locator('a[href]').evaluateAll(as=>as.map(a=>({text:(a.innerText||"").replace(/\s+/g," ").trim(),href:a.href})).filter(x=>x.text&&/\/course\/view\.php|courseid=|course_id=/i.test(x.href)));
 for(const link of courseLinks.slice(0,maxPages)){
  if(visited.has(link.href))continue;visited.add(link.href);
  try{
   await page.goto(link.href,{waitUntil:"domcontentloaded",timeout:45000});
   const title=clean(await page.locator("h1").first().textContent().catch(()=>""))||link.text;
   courses.push({title,url:link.href});
   const found=await page.locator('a[href]').evaluateAll(as=>as.map(a=>{
    const href=a.href;const text=(a.innerText||"").replace(/\s+/g," ").trim();
    const box=a.closest("li, tr, .activity, .activity-item, .modtype_assign, .course-section")||a.parentElement;
    const context=(box?.innerText||text).replace(/\s+/g," ").trim();
    const time=box?.querySelector("time[datetime], [data-due-date], [data-time]");
    return {href,text,context:context.slice(0,700),time:time?.getAttribute("datetime")||time?.getAttribute("data-due-date")||time?.getAttribute("data-time")||null};
   }).filter(x=>x.text&&(/\/mod\/assign\/view\.php|assignment|topshiriq|vazifa/i.test(x.href+" "+x.text+" "+x.context))));
   for(const item of found){
    const id=item.href||title+":"+item.text;
    if(tasks.some(t=>t.id===id))continue;
    let dueAt=item.time?new Date(item.time).toISOString():dateFromText(item.context);
    const submitted=/submitted|отправлено|topshirildi|yuborildi/i.test(item.context);
    const graded=/graded|оценено|baholandi|baholangan/i.test(item.context);
    const status=graded?"graded":submitted?"submitted":dueAt&&new Date(dueAt).getTime()<Date.now()?"overdue":dueAt?"upcoming":"unknown";
    tasks.push({id,course:title,title:item.text,url:item.href,dueAt,grade:null,passingGrade:null,status,source:"lms-dom",rawContext:item.context});
   }
  }catch(error){console.warn("Kurs o‘qilmadi:",link.href,error.message);}
 }
 const payload={capturedAt:new Date().toISOString(),source:origin,courses,tasks,warnings:courseLinks.length?[]:["Moodle course view havolalari topilmadi. LMS sahifa tuzilmasini tekshirish kerak."]};
 await fs.writeFile(path.join(outDir,"all-course-tasks.json"),JSON.stringify(payload,null,2));
 console.log(`LMS: ${courses.length} kurs, ${tasks.length} topshiriq`);
 if(!courses.length)console.warn("Kurslar topilmadi; parserni LMS HTML tuzilmasiga moslash zarur.");
}finally{await browser.close();}

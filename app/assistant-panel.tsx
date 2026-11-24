"use client";
import {useRef,useState} from "react";
import {Bot,Mic,MicOff,Send,Volume2,VolumeX} from "lucide-react";
type Message={role:"user"|"assistant";content:string};
type Recognition={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:any)=>void)|null;onerror:((event:any)=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};
declare global{interface Window{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition}}
export default function AssistantPanel(){
 const [messages,setMessages]=useState<Message[]>([{role:"assistant",content:"Salom! Men ASOMIDDIN AI yordamchingizman. TATU topshiriqlari, deadline’lar va kunlik rejangiz haqida so‘rashingiz mumkin."}]);
 const [text,setText]=useState(""),[busy,setBusy]=useState(false),[listening,setListening]=useState(false),[speak,setSpeak]=useState(true),[error,setError]=useState("");
 const recognition=useRef<Recognition|null>(null);
 async function send(value=text){
  const message=value.trim();if(!message||busy)return;
  const history=messages.slice(-10);setMessages(v=>[...v,{role:"user",content:message}]);setText("");setBusy(true);setError("");
  try{const r=await fetch("/api/assistant/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,history})});const d=await r.json();if(!r.ok)throw new Error(d.error||"AI bilan aloqa xatosi");const answer=String(d.answer||"");setMessages(v=>[...v,{role:"assistant",content:answer}]);if(speak&&"speechSynthesis"in window){window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(answer);utterance.lang="uz-UZ";utterance.rate=1;window.speechSynthesis.speak(utterance);}}
  catch(e){setError(e instanceof Error?e.message:"Xatolik");}finally{setBusy(false);}
 }
 function toggleMic(){
  if(listening){recognition.current?.stop();setListening(false);return;}
  const Constructor=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Constructor){setError("Bu brauzer ovozli kiritishni qo‘llamaydi. Chrome brauzerida sinab ko‘ring.");return;}
  const r=new Constructor();recognition.current=r;r.lang="uz-UZ";r.continuous=false;r.interimResults=false;
  r.onresult=e=>{const spoken=e.results?.[0]?.[0]?.transcript||"";setText(spoken);if(spoken.trim())void send(spoken);};
  r.onerror=()=>{setError("Mikrofon ishlamadi. Brauzer ruxsatlarini tekshiring.");setListening(false);};
  r.onend=()=>setListening(false);setError("");setListening(true);r.start();
 }
 return <section className="section panel assistant-panel"><div className="assistant-heading"><div><h2><Bot size={19}/> Ovozli AI yordamchi</h2><p className="muted">Tabiiy tilda gaplashing yoki yozing. Javob ovoz chiqarib o‘qilishi mumkin.</p></div><button className="sound-toggle" onClick={()=>{setSpeak(v=>!v);window.speechSynthesis?.cancel();}} title="Ovoz"><>{speak?<Volume2 size={17}/>:<VolumeX size={17}/>}</></button></div>
 <div className="chat-messages" aria-live="polite">{messages.slice(-8).map((m,i)=><div className={m.role==="user"?"chat-bubble user-bubble":"chat-bubble ai-bubble"} key={i}>{m.content}</div>)}{busy&&<div className="chat-bubble ai-bubble">Javob tayyorlayapman…</div>}</div>
 {error&&<p className="login-error">{error}</p>}
 <form className="chat-form" onSubmit={e=>{e.preventDefault();void send();}}><button type="button" className={listening?"mic-button active":"mic-button"} onClick={toggleMic} aria-label="Mikrofon">{listening?<MicOff size={18}/>:<Mic size={18}/>}</button><input value={text} onChange={e=>setText(e.target.value)} placeholder="Masalan: yaqin deadline’larim qaysilar?" aria-label="Xabar"/><button className="send-button" disabled={busy||!text.trim()} aria-label="Yuborish"><Send size={17}/></button></form>
 <div className="chat-footnote">Mikrofon faqat tugmani bosganingizda ishlaydi. Ovozli javob brauzer imkoniyatlariga bog‘liq.</div>
 </section>;
}

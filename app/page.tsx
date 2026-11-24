import Link from "next/link";

const cards = [
  { label: "Bugungi darslar", value: "—", note: "LMS jadvali ulanganda ko‘rinadi" },
  { label: "Yaqin topshiriqlar", value: "—", note: "Sinxronizatsiya kutilmoqda" },
  { label: "Muddati o‘tgan", value: "—", note: "Haqiqiy ma’lumot hali ulanmagan" },
  { label: "AI yordamchi", value: "Tayyorlanmoqda", note: "Ovozli modul integratsiya bosqichida" },
];

export default function Home() {
  return <main className="shell">
    <header className="topbar"><Link href="/" className="brand">ASOMIDDIN<span style={{color:"#9eb6d4"}}>.AI</span></Link><span className="status"><i className="dot"/> Platforma ishga tushdi</span></header>
    <section className="hero"><div><div className="eyebrow">PERSONAL AI COMMAND CENTER</div><h1>Assalomu alaykum!</h1><p className="muted">O‘qish, vaqt va kundalik vazifalaringiz — bitta aqlli yordamchida.</p></div><span className="pill">Asia / Tashkent · UTC+5</span></section>
    <section className="grid">{cards.map((c)=><article className="panel" key={c.label}><div className="muted">{c.label}</div><div className="metric">{c.value}</div><p className="muted" style={{fontSize:12,lineHeight:1.5}}>{c.note}</p></article>)}</section>
    <section className="section grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
      <article className="panel"><h2>LMS monitoring</h2><p className="muted">Kurslar, topshiriqlar, muddatlar va dars jadvalini kuzatish.</p><div className="list"><div className="listrow"><span>Worker holati</span><span className="pill">Ulanish kutilmoqda</span></div><div className="listrow"><span>Tekshirish oralig‘i</span><span>6 soat</span></div><div className="listrow"><span>Eslatmalar</span><span>5 va 4 kun oldin</span></div></div></article>
      <article className="panel"><h2>Ovozli AI</h2><p className="muted">Tabiiy ovozli suhbat, savollarga javob va LMS ma’lumotlari bilan yordam.</p><div className="status">Voice provider sozlanishi kerak</div></article>
      <article className="panel"><h2>Aqlli qo‘ng‘iroqlar</h2><p className="muted">Dars jadvaliga asoslangan bandlik, AI kotib, suhbat xulosasi va qayta qo‘ng‘iroq.</p><div className="pill">Telephony provayder talab qilinadi</div></article>
    </section>
    <footer className="section muted" style={{fontSize:12}}>ASOMIDDIN AI · Xavfsiz integratsiya · Maxfiy kalitlar faqat server muhitida saqlanadi</footer>
  </main>;
}

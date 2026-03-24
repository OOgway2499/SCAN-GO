import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const T = {
  bg:"#1E1E1E", panel:"#2C2C2C", float:"#383838",
  border:"rgba(255,255,255,0.09)", borderHi:"rgba(255,255,255,0.18)",
  violet:"#7B61FF", violetLt:"#A78BFA", violetDk:"#5B41DF",
  pink:"#F472B6", teal:"#2DD4BF", amber:"#FBBF24",
  red:"#F87171", green:"#34D399",
  t1:"#F0F0F0", t2:"#A0A0A0", t3:"#606060",
};

const PRODUCTS = [
  {id:"P01",name:"Aashirvaad Atta 5kg",   brand:"ITC",         price:280,mrp:310,cat:"Staples",      icon:"🌾",offer:null},
  {id:"P02",name:"Amul Butter 500g",      brand:"Amul",        price:275,mrp:280,cat:"Dairy",        icon:"🧈",offer:null},
  {id:"P03",name:"Tata Salt 1kg",         brand:"Tata",        price:24, mrp:26, cat:"Staples",      icon:"🧂",offer:null},
  {id:"P04",name:"Cadbury Silk 160g",     brand:"Cadbury",     price:180,mrp:195,cat:"Snacks",       icon:"🍫",offer:"8% OFF"},
  {id:"P05",name:"Maggi Noodles 70g",     brand:"Nestlé",      price:14, mrp:14, cat:"Instant",      icon:"🍜",offer:"Buy 4 ₹50"},
  {id:"P06",name:"Fortune Oil 1L",        brand:"Adani Wilmar",price:135,mrp:145,cat:"Cooking",      icon:"🫙",offer:null},
  {id:"P07",name:"Lay's Classic 26g",     brand:"PepsiCo",     price:20, mrp:20, cat:"Snacks",       icon:"🥔",offer:null},
  {id:"P08",name:"Red Label Tea 500g",    brand:"Brooke Bond", price:240,mrp:255,cat:"Beverages",    icon:"🍵",offer:null},
  {id:"P09",name:"Colgate MaxFresh 150g", brand:"Colgate",     price:99, mrp:109,cat:"Personal Care",icon:"🪥",offer:"9% OFF"},
  {id:"P10",name:"Tomato (Loose) 500g",  brand:"Fresh",       price:35, mrp:35, cat:"Vegetables",   icon:"🍅",offer:null},
  {id:"P11",name:"Banana 1kg",           brand:"Fresh",       price:55, mrp:55, cat:"Fruits",       icon:"🍌",offer:null},
  {id:"P12",name:"Britannia Good Day",   brand:"Britannia",   price:45, mrp:48, cat:"Snacks",       icon:"🍪",offer:null},
  {id:"P13",name:"Nescafé Classic 100g", brand:"Nestlé",      price:240,mrp:260,cat:"Beverages",    icon:"☕",offer:null},
  {id:"P14",name:"Parle-G 800g",         brand:"Parle",       price:90, mrp:95, cat:"Snacks",       icon:"🟡",offer:null},
];

const CATS = ["All","Staples","Dairy","Snacks","Beverages","Cooking","Vegetables","Fruits","Personal Care","Instant"];
const GST  = 0.05;
const STORE = {name:"FreshMart",branch:"Kondapur, Hyderabad",code:"HYD-042"};
const fmt  = n => "₹" + Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const genId= () => "SG-" + Math.random().toString(36).substr(2,6).toUpperCase();
const vibe = () => { try { navigator.vibrate?.(28); } catch{} };

function useCart() {
  const [items,setItems] = useState([]);
  const add = useCallback(p => {
    vibe();
    setItems(prev => {
      const ex = prev.find(i=>i.id===p.id);
      return ex ? prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i) : [...prev,{...p,qty:1}];
    });
  },[]);
  const del  = useCallback(id => setItems(p=>p.filter(i=>i.id!==id)),[]);
  const upd  = useCallback((id,d)=>setItems(p=>p.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i)),[]);
  const sub  = useMemo(()=>items.reduce((s,i)=>s+i.price*i.qty,0),[items]);
  const gst  = sub*GST;
  const total= sub+gst;
  const count= items.reduce((s,i)=>s+i.qty,0);
  const saved= items.reduce((s,i)=>s+(i.mrp-i.price)*i.qty,0);
  return {items,add,del,upd,sub,gst,total,count,saved};
}

function useToast() {
  const [list,setList]=useState([]);
  const push=useCallback((msg,type="ok")=>{
    const id=Date.now();
    setList(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setList(p=>p.filter(t=>t.id!==id)),2400);
  },[]);
  return {list,push};
}

/* ── ATOMS ── */
const Chip=({children,active,onClick})=>(
  <button onClick={onClick} style={{
    background:active?T.violet:"transparent",
    color:active?"#fff":T.t2,
    border:`1px solid ${active?T.violet:T.border}`,
    borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:600,
    cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
    transition:"all .15s",fontFamily:"inherit",
  }}>{children}</button>
);

const Tag=({children,color=T.violet})=>(
  <span style={{
    background:color+"22",color,border:`1px solid ${color}44`,
    borderRadius:4,padding:"1px 7px",fontSize:11,fontWeight:700,
    fontFamily:"inherit",letterSpacing:".2px",
  }}>{children}</span>
);

function Toasts({list}) {
  return (
    <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",width:290}}>
      {list.map(t=>(
        <div key={t.id} style={{
          background:t.type==="err"?T.red:t.type==="warn"?T.amber:T.green,
          color:"#111",padding:"10px 16px",borderRadius:8,fontWeight:700,
          fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.5)",
          animation:"toastIn .25s ease",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:8,
        }}>
          <span>{t.type==="err"?"✕":t.type==="warn"?"!":"✓"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── QR CANVAS ── */
function QR({data,size=148}) {
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d");
    const N=21,cell=size/N;
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,size,size);
    let seed=[...data].reduce((a,b)=>a+b.charCodeAt(0),0);
    const rng=()=>{ seed=(seed*1664525+1013904223)&0xffffffff; return (seed>>>0)/0xffffffff; };
    const m=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c2)=>{
      if((r<7&&c2<7)||(r<7&&c2>=N-7)||(r>=N-7&&c2<7)) return true;
      return rng()>.44;
    }));
    ctx.fillStyle="#1E1E1E";
    m.forEach((row,r)=>row.forEach((v,c2)=>{ if(v) ctx.fillRect(c2*cell,r*cell,cell-.5,cell-.5); }));
    [[0,0],[0,N-7],[N-7,0]].forEach(([r,c2])=>{
      ctx.fillStyle="#1E1E1E"; ctx.fillRect(c2*cell,r*cell,7*cell,7*cell);
      ctx.fillStyle="#fff";    ctx.fillRect((c2+1)*cell,(r+1)*cell,5*cell,5*cell);
      ctx.fillStyle="#1E1E1E"; ctx.fillRect((c2+2)*cell,(r+2)*cell,3*cell,3*cell);
    });
  },[data,size]);
  return <canvas ref={ref} width={size} height={size} style={{borderRadius:6,display:"block"}} />;
}

/* ── ENTRY ── */
function Entry({onCustomer,onGuard}) {
  const [phone,setPhone]=useState("");
  const [focus,setFocus]=useState(false);
  const [rdy,setRdy]=useState(false);
  useEffect(()=>{ setTimeout(()=>setRdy(true),80); },[]);
  const valid=phone.length===10&&/^[6-9]/.test(phone);

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"inherit",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 20% 10%,rgba(123,97,255,.18) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(45,212,191,.12) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 60% 30%,rgba(244,114,182,.09) 0%,transparent 50%)",pointerEvents:"none"}} />
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,.05) 1px,transparent 1px)",backgroundSize:"28px 28px",pointerEvents:"none"}} />

      <div style={{width:"100%",maxWidth:360,position:"relative",zIndex:2,opacity:rdy?1:0,transform:rdy?"translateY(0)":"translateY(20px)",transition:"all .5s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{textAlign:"center",marginBottom:38}}>
          <div style={{width:68,height:68,background:`linear-gradient(135deg,${T.violet},${T.pink})`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:30,boxShadow:`0 0 40px ${T.violet}55`}}>🛒</div>
          <div style={{color:T.t1,fontSize:30,fontWeight:800,letterSpacing:"-1px"}}>ScanGo<span style={{color:T.violet}}>.</span></div>
          <div style={{color:T.t2,fontSize:13,marginTop:6}}>Skip the queue. Shop smarter.</div>
        </div>

        <div style={{background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,background:T.float,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏪</div>
          <div style={{flex:1}}>
            <div style={{color:T.t1,fontWeight:700,fontSize:14}}>{STORE.name}</div>
            <div style={{color:T.t3,fontSize:12}}>{STORE.branch} · #{STORE.code}</div>
          </div>
          <span style={{background:T.green+"22",color:T.green,border:`1px solid ${T.green}44`,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:700}}>● Open</span>
        </div>

        <div style={{background:"rgba(44,44,44,.85)",border:`1px solid ${T.border}`,borderRadius:16,padding:22,marginBottom:10}}>
          <div style={{color:T.t2,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Mobile number</div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:T.float,borderRadius:8,padding:"12px 14px",border:`1.5px solid ${focus?T.violet:T.border}`,transition:"border-color .2s",marginBottom:14}}>
            <span style={{color:T.t2,fontSize:14,fontWeight:700}}>+91</span>
            <div style={{width:1,height:18,background:T.border}} />
            <input type="tel" maxLength={10} placeholder="9876543210"
              value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
              onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
              style={{border:"none",background:"transparent",color:T.t1,fontSize:18,fontWeight:700,outline:"none",letterSpacing:"2px",width:"100%",caretColor:T.violet,fontFamily:"inherit"}}
            />
            {valid&&<span style={{color:T.green,fontSize:16}}>✓</span>}
          </div>
          <p style={{color:T.t3,fontSize:12,margin:"0 0 16px",lineHeight:"1.6"}}>Cart and receipt linked to this number. No OTP needed.</p>
          <button onClick={()=>valid&&onCustomer(phone)} disabled={!valid} style={{
            width:"100%",padding:15,
            background:valid?`linear-gradient(135deg,${T.violet},${T.violetDk})`:T.float,
            color:valid?"#fff":T.t3,border:"none",borderRadius:10,
            fontSize:15,fontWeight:800,cursor:valid?"pointer":"not-allowed",
            fontFamily:"inherit",boxShadow:valid?`0 0 30px ${T.violet}44`:"none",transition:"all .3s",
          }}>Start Shopping →</button>
        </div>

        <button onClick={onGuard} style={{width:"100%",padding:11,background:"transparent",border:`1px solid ${T.border}`,borderRadius:10,color:T.t3,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          🔐 Staff / Guard Login
        </button>
      </div>
    </div>
  );
}

/* ── SCANNER MODAL ── */
function Scanner({onScan,onClose}) {
  const [q,setQ]=useState("");
  const [line,setLine]=useState(10);
  useEffect(()=>{ let af; const tick=()=>{ setLine(p=>p>=90?10:p+.8); af=requestAnimationFrame(tick); }; af=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(af); },[]);
  const list=PRODUCTS.filter(p=>!q||p.name.toLowerCase().includes(q.toLowerCase())||p.brand.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.93)",zIndex:600,display:"flex",flexDirection:"column",fontFamily:"inherit"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 20px 0",flexShrink:0}}>
        <div>
          <div style={{color:T.t1,fontWeight:700,fontSize:17}}>Scan Barcode</div>
          <div style={{color:T.t2,fontSize:12,marginTop:2}}>Tap any product to simulate scan</div>
        </div>
        <button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:T.float,border:`1px solid ${T.border}`,color:T.t2,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>

      {/* Viewfinder */}
      <div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:16,background:"rgba(0,0,0,.3)",position:"relative"}}>
        <div style={{position:"relative",width:200,height:130}}>
          {/* Corners */}
          <div style={{position:"absolute",top:0,left:0,width:22,height:22,borderTop:`3px solid ${T.violet}`,borderLeft:`3px solid ${T.violet}`,borderRadius:"6px 0 0 0"}} />
          <div style={{position:"absolute",top:0,right:0,width:22,height:22,borderTop:`3px solid ${T.violet}`,borderRight:`3px solid ${T.violet}`,borderRadius:"0 6px 0 0"}} />
          <div style={{position:"absolute",bottom:0,left:0,width:22,height:22,borderBottom:`3px solid ${T.violet}`,borderLeft:`3px solid ${T.violet}`,borderRadius:"0 0 0 6px"}} />
          <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,borderBottom:`3px solid ${T.violet}`,borderRight:`3px solid ${T.violet}`,borderRadius:"0 0 6px 0"}} />
          {/* Scan line */}
          <div style={{position:"absolute",left:8,right:8,top:`${line}%`,height:2,background:`linear-gradient(90deg,transparent,${T.violet},transparent)`,boxShadow:`0 0 6px ${T.violet}`,transition:"top .02s linear"}} />
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:6,height:6,borderRadius:"50%",background:T.violet}} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{flex:1,background:T.panel,borderRadius:"20px 20px 0 0",padding:16,display:"flex",flexDirection:"column",overflow:"hidden",marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,background:T.float,borderRadius:8,padding:"10px 14px",marginBottom:12,border:`1px solid ${T.border}`}}>
          <span style={{color:T.t3,fontSize:14}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search product…"
            style={{border:"none",background:"transparent",color:T.t1,fontSize:13,outline:"none",fontFamily:"inherit",flex:1}} />
          {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:13}}>✕</button>}
        </div>
        <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:6}}>
          {list.map(p=>(
            <button key={p.id} onClick={()=>{vibe();onScan(p);}} style={{background:T.float,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"}}>
              <span style={{fontSize:22,minWidth:32,textAlign:"center"}}>{p.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:T.t1,fontWeight:600,fontSize:13}}>{p.name}</div>
                <div style={{color:T.t3,fontSize:11,marginTop:1}}>{p.brand}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:T.violetLt,fontWeight:700,fontSize:14}}>{fmt(p.price)}</div>
                {p.mrp>p.price&&<div style={{color:T.t3,fontSize:11,textDecoration:"line-through"}}>{fmt(p.mrp)}</div>}
              </div>
              {p.offer&&<Tag color={T.amber}>{p.offer}</Tag>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SHOPPING ── */
function Shopping({phone,cart,toast,onCheckout}) {
  const [tab,setTab]=useState("scan");
  const [scanOpen,setScanOpen]=useState(false);
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("All");
  const [flash,setFlash]=useState(null);

  const handleScan=useCallback(p=>{
    cart.add(p); toast.push(`${p.name} added`);
    setFlash(p); setScanOpen(false);
    setTimeout(()=>setFlash(null),1800);
  },[cart,toast]);

  const filtered=useMemo(()=>PRODUCTS.filter(p=>{
    const okCat=cat==="All"||p.cat===cat;
    const okQ=!q||p.name.toLowerCase().includes(q.toLowerCase())||p.brand.toLowerCase().includes(q.toLowerCase());
    return okCat&&okQ;
  }),[q,cat]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"inherit",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:200,background:"radial-gradient(ellipse 70% 60% at 10% 80%,rgba(123,97,255,.15) 0%,transparent 55%),radial-gradient(ellipse 50% 50% at 85% 20%,rgba(251,191,36,.10) 0%,transparent 50%)",pointerEvents:"none",zIndex:0}} />

      {/* Topbar */}
      <div style={{background:"rgba(30,30,30,.94)",borderBottom:`1px solid ${T.border}`,padding:"13px 18px",flexShrink:0,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{color:T.t3,fontSize:11,fontWeight:600,letterSpacing:".6px"}}>SESSION</div>
            <div style={{color:T.t2,fontSize:13,fontWeight:600}}>+91 {phone}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:T.t3,fontSize:11,fontWeight:600,letterSpacing:".6px"}}>TOTAL</div>
            <div style={{color:T.violetLt,fontSize:24,fontWeight:800,letterSpacing:"-.5px",lineHeight:1}}>{fmt(cart.total)}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["scan","🔍  Browse & Scan"],["cart",`🛒  Cart${cart.count>0?" ("+cart.count+")":""}`]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"9px 10px",
              background:tab===t?T.violet:T.float,
              color:tab===t?"#fff":T.t2,
              border:"none",borderRadius:8,fontWeight:700,fontSize:13,
              cursor:"pointer",fontFamily:"inherit",transition:"all .2s",position:"relative",
            }}>
              {l}
              {t==="cart"&&cart.count>0&&tab!=="cart"&&<span style={{position:"absolute",top:-4,right:-4,width:18,height:18,background:T.red,borderRadius:"50%",color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cart.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {flash&&(
        <div style={{background:T.green+"18",borderBottom:`1px solid ${T.green}33`,padding:"9px 18px",display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:50,animation:"fadeUp .25s ease"}}>
          <span style={{fontSize:18}}>{flash.icon}</span>
          <span style={{color:T.green,fontWeight:700,fontSize:13,flex:1}}>{flash.name} added</span>
          <span style={{color:T.green,fontWeight:800,fontSize:14}}>{fmt(flash.price)}</span>
        </div>
      )}

      {/* SCAN TAB */}
      {tab==="scan"&&(
        <div style={{flex:1,overflowY:"auto",padding:16,position:"relative",zIndex:1}}>
          <button onClick={()=>setScanOpen(true)} style={{
            width:"100%",background:`linear-gradient(135deg,${T.violetDk}cc,${T.panel}cc)`,
            border:`1px solid ${T.violet}55`,borderRadius:14,padding:"17px 20px",
            display:"flex",alignItems:"center",gap:14,marginBottom:16,cursor:"pointer",
            position:"relative",overflow:"hidden",fontFamily:"inherit",
          }}>
            <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(255,255,255,.02) 12px,rgba(255,255,255,.02) 24px)"}} />
            <div style={{width:50,height:50,background:"rgba(255,255,255,.08)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1px solid ${T.border}`}}>📷</div>
            <div style={{textAlign:"left"}}>
              <div style={{color:T.t1,fontWeight:800,fontSize:16}}>Open Camera Scanner</div>
              <div style={{color:T.t3,fontSize:12,marginTop:2}}>Scan product barcode to add</div>
            </div>
            <span style={{marginLeft:"auto",color:T.violetLt,fontSize:20}}>→</span>
          </button>

          <div style={{display:"flex",alignItems:"center",gap:10,background:T.panel,borderRadius:8,padding:"11px 14px",marginBottom:12,border:`1px solid ${T.border}`}}>
            <span style={{color:T.t3,fontSize:14}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, brands…"
              style={{border:"none",background:"transparent",color:T.t1,fontSize:14,outline:"none",fontFamily:"inherit",flex:1}} />
            {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:13}}>✕</button>}
          </div>

          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,marginBottom:12,scrollbarWidth:"none"}}>
            {CATS.map(c=><Chip key={c} active={cat===c} onClick={()=>setCat(c)}>{c}</Chip>)}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {filtered.map((p,i)=>{
              const inCart=cart.items.find(ci=>ci.id===p.id);
              return (
                <div key={p.id} onClick={()=>handleScan(p)} style={{
                  background:T.panel,border:`1px solid ${T.border}`,borderRadius:10,
                  padding:"12px 14px",display:"flex",alignItems:"center",gap:12,
                  cursor:"pointer",transition:"border-color .15s",
                  animation:`fadeUp ${.05+i*.02}s ease both`,
                }}>
                  <div style={{width:46,height:46,background:T.float,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,position:"relative",border:`1px solid ${T.border}`}}>
                    {p.icon}
                    {inCart&&<div style={{position:"absolute",top:-5,right:-5,width:17,height:17,background:T.violet,borderRadius:"50%",color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{inCart.qty}</div>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:T.t1,fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{color:T.t3,fontSize:11,marginTop:2}}>{p.brand} · {p.cat}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{color:T.violetLt,fontWeight:800,fontSize:14}}>{fmt(p.price)}</div>
                    {p.mrp>p.price&&<div style={{color:T.t3,fontSize:11,textDecoration:"line-through"}}>{fmt(p.mrp)}</div>}
                    {p.offer&&<div style={{marginTop:2}}><Tag color={T.amber}>{p.offer}</Tag></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CART TAB */}
      {tab==="cart"&&(
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10,position:"relative",zIndex:1}}>
          {cart.items.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:48,marginBottom:12,opacity:.2}}>🛒</div>
              <div style={{color:T.t2,fontWeight:600}}>Cart is empty</div>
              <div style={{color:T.t3,fontSize:13,marginTop:4}}>Switch to Scan to add items</div>
            </div>
          ):(
            <>
              {cart.saved>0&&(
                <div style={{background:T.green+"15",border:`1px solid ${T.green}30`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <span>🎉</span>
                  <span style={{color:T.green,fontWeight:700,fontSize:13}}>Saving {fmt(cart.saved)} on this order!</span>
                </div>
              )}
              {cart.items.map(item=>(
                <div key={item.id} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:26,minWidth:36,textAlign:"center"}}>{item.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:T.t1,fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                    <div style={{color:T.t3,fontSize:11,marginTop:2}}>{fmt(item.price)} each</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>cart.upd(item.id,-1)} style={{width:28,height:28,borderRadius:6,background:T.float,border:`1px solid ${T.border}`,color:T.t1,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                    <span style={{color:T.t1,fontWeight:800,minWidth:22,textAlign:"center"}}>{item.qty}</span>
                    <button onClick={()=>cart.upd(item.id,1)} style={{width:28,height:28,borderRadius:6,background:T.violet,border:"none",color:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>+</button>
                  </div>
                  <div style={{textAlign:"right",minWidth:58}}>
                    <div style={{color:T.violetLt,fontWeight:800,fontSize:14}}>{fmt(item.price*item.qty)}</div>
                    <button onClick={()=>cart.del(item.id)} style={{background:"none",border:"none",color:T.red,fontSize:11,cursor:"pointer",fontWeight:700,padding:0}}>Remove</button>
                  </div>
                </div>
              ))}
              <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
                <div style={{color:T.t1,fontWeight:800,fontSize:15,marginBottom:14}}>Bill Summary</div>
                {[["Subtotal",fmt(cart.sub),false],["GST (5%)",fmt(cart.gst),false],cart.saved>0?["You Saved","− "+fmt(cart.saved),"saved"]:null,["Total Payable",fmt(cart.total),"total"]].filter(Boolean).map(([k,v,b])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:7,paddingTop:b==="total"?10:0,borderTop:b==="total"?`1px dashed ${T.border}`:"none"}}>
                    <span style={{color:b==="total"?T.t1:T.t2,fontWeight:b==="total"?700:400,fontSize:b==="total"?14:13}}>{k}</span>
                    <span style={{color:b==="total"?T.violetLt:b==="saved"?T.green:T.t1,fontWeight:b==="total"?900:b==="saved"?700:500,fontSize:b==="total"?17:13}}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={onCheckout} style={{width:"100%",padding:17,background:`linear-gradient(135deg,${T.violet},${T.violetDk})`,color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 0 40px ${T.violet}55`}}>
                Pay {fmt(cart.total)} →
              </button>
            </>
          )}
        </div>
      )}
      {scanOpen&&<Scanner onScan={handleScan} onClose={()=>setScanOpen(false)} />}
    </div>
  );
}

/* ── PAYMENT ── */
function Payment({cart,onPaid,onBack}) {
  const [method,setMethod]=useState(null);
  const [phase,setPhase]=useState("pick");
  const pay=()=>{ vibe(); setPhase("processing"); setTimeout(()=>{ setPhase("done"); setTimeout(onPaid,700); },2000); };
  const methods=[
    {id:"gpay",   label:"Google Pay",  sub:"UPI · Instant",         icon:"🟦",badge:"Recommended"},
    {id:"phonepe",label:"PhonePe",     sub:"UPI · Instant",         icon:"🟪",badge:null},
    {id:"upi",    label:"Other UPI",   sub:"Any UPI ID",            icon:"📱",badge:null},
    {id:"card",   label:"Card",        sub:"Debit / Credit / RuPay",icon:"💳",badge:null},
    {id:"cash",   label:"Cash at Exit",sub:"Pay guard at gate",     icon:"💵",badge:null},
  ];

  if(phase==="processing") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:"inherit",position:"relative"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(123,97,255,.2) 0%,transparent 60%)",pointerEvents:"none"}} />
      <div style={{width:60,height:60,borderRadius:"50%",border:`3px solid ${T.violet}`,borderTopColor:"transparent",animation:"spin .8s linear infinite",zIndex:2}} />
      <div style={{color:T.t1,fontWeight:700,fontSize:18,zIndex:2}}>Processing…</div>
      <div style={{color:T.t2,fontSize:13,zIndex:2}}>Please wait</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"inherit",maxWidth:430,margin:"0 auto",padding:"20px 18px 40px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 10% 80%,rgba(123,97,255,.15) 0%,transparent 55%),radial-gradient(ellipse 50% 50% at 85% 20%,rgba(251,191,36,.10) 0%,transparent 50%)",pointerEvents:"none"}} />
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <button onClick={onBack} style={{width:36,height:36,background:T.float,border:`1px solid ${T.border}`,borderRadius:8,cursor:"pointer",color:T.t2,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
          <div>
            <div style={{color:T.t1,fontWeight:800,fontSize:20}}>Checkout</div>
            <div style={{color:T.t3,fontSize:12}}>{cart.count} items</div>
          </div>
        </div>

        <div style={{background:`linear-gradient(135deg,${T.violetDk}bb,${T.panel})`,border:`1px solid ${T.violet}44`,borderRadius:18,padding:"24px 22px",marginBottom:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:T.violet+"20"}} />
          <div style={{color:"rgba(255,255,255,.55)",fontSize:13,fontWeight:600,marginBottom:6}}>Total Payable</div>
          <div style={{color:"#fff",fontSize:40,fontWeight:800,letterSpacing:"-1.5px",marginBottom:10}}>{fmt(cart.total)}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>Subtotal {fmt(cart.sub)}</span>
            <span style={{color:"rgba(255,255,255,.2)"}}>·</span>
            <span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>GST {fmt(cart.gst)}</span>
            {cart.saved>0&&<><span style={{color:"rgba(255,255,255,.2)"}}>·</span><span style={{color:T.green,fontSize:12,fontWeight:700}}>Saving {fmt(cart.saved)}</span></>}
          </div>
        </div>

        <div style={{color:T.t3,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Payment Method</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:22}}>
          {methods.map(m=>(
            <div key={m.id} onClick={()=>{setMethod(m.id);vibe();}} style={{
              background:T.panel,borderRadius:10,padding:"13px 15px",
              display:"flex",alignItems:"center",gap:13,cursor:"pointer",
              border:`1.5px solid ${method===m.id?T.violet:T.border}`,
              boxShadow:method===m.id?`0 0 20px ${T.violet}33`:"none",
              transition:"all .2s",
            }}>
              <span style={{fontSize:22,minWidth:32,textAlign:"center"}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:T.t1,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8}}>
                  {m.label}
                  {m.badge&&<Tag color={T.violet}>{m.badge}</Tag>}
                </div>
                <div style={{color:T.t3,fontSize:12}}>{m.sub}</div>
              </div>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${method===m.id?T.violet:T.border}`,background:method===m.id?T.violet:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
                {method===m.id&&<span style={{color:"#fff",fontSize:11,fontWeight:800}}>✓</span>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={pay} disabled={!method} style={{
          width:"100%",padding:17,
          background:method?`linear-gradient(135deg,${T.violet},${T.violetDk})`:T.float,
          color:method?"#fff":T.t3,border:"none",borderRadius:12,fontSize:16,
          fontWeight:800,cursor:method?"pointer":"not-allowed",fontFamily:"inherit",
          boxShadow:method?`0 0 40px ${T.violet}55`:"none",transition:"all .3s",
        }}>
          {method==="cash"?"Generate Exit Pass →":method?`Pay ${fmt(cart.total)} →`:"Select a payment method"}
        </button>
      </div>
    </div>
  );
}

/* ── RECEIPT ── */
function Receipt({cart,phone,rid}) {
  const [confetti]=useState(()=>Array.from({length:26},(_,i)=>({
    id:i,x:Math.random()*100,
    color:[T.violet,T.pink,T.teal,T.amber,"#fff"][i%5],
    delay:Math.random()*.8,dur:.8+Math.random()*.5,
  })));

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"inherit",maxWidth:430,margin:"0 auto",padding:"0 0 48px",position:"relative",overflow:"hidden"}}>
      {confetti.map(c=>(
        <div key={c.id} style={{position:"fixed",left:`${c.x}%`,top:"8%",width:8,height:8,background:c.color,borderRadius:2,animation:`confetti ${c.dur}s ${c.delay}s ease-out forwards`,zIndex:999,pointerEvents:"none"}} />
      ))}

      <div style={{background:"radial-gradient(ellipse 90% 70% at 50% 0%,rgba(123,97,255,.20) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 90% 90%,rgba(45,212,191,.12) 0%,transparent 50%)",padding:"42px 22px 30px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)",backgroundSize:"28px 28px"}} />
        <div style={{width:70,height:70,background:`linear-gradient(135deg,${T.violet},${T.teal})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:30,boxShadow:`0 0 40px ${T.violet}66`,animation:"popIn .4s ease",position:"relative",zIndex:2}}>✓</div>
        <div style={{color:T.t1,fontWeight:800,fontSize:26,position:"relative",zIndex:2}}>Payment Successful!</div>
        <div style={{color:T.t2,fontSize:14,marginTop:4,position:"relative",zIndex:2}}>Show QR at exit gate</div>
      </div>

      <div style={{padding:"0 18px"}}>
        <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:22,textAlign:"center",marginBottom:14,marginTop:-12,position:"relative",zIndex:1}}>
          <div style={{color:T.t3,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>Exit Pass — Scan at Gate</div>
          <div style={{display:"inline-block",background:"#fff",padding:10,borderRadius:10,marginBottom:12}}>
            <QR data={rid} size={148} />
          </div>
          <div style={{color:T.violetLt,fontSize:20,fontWeight:700,letterSpacing:"3px",marginBottom:4}}>{rid}</div>
          <div style={{color:T.t3,fontSize:12}}>{cart.count} items · {new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
        </div>

        <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{color:T.t1,fontWeight:800,fontSize:15}}>Receipt · {cart.count} items</div>
            <div style={{color:T.t3,fontSize:12}}>{STORE.name} #{STORE.code}</div>
          </div>
          {cart.items.map(item=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:T.t1,fontSize:13,fontWeight:500}}>{item.name}</div>
                <div style={{color:T.t3,fontSize:11}}>×{item.qty} @ {fmt(item.price)}</div>
              </div>
              <div style={{color:T.t1,fontWeight:700,fontSize:13}}>{fmt(item.price*item.qty)}</div>
            </div>
          ))}
          <div style={{paddingTop:12}}>
            {[["Subtotal",fmt(cart.sub),false],["GST (5%)",fmt(cart.gst),false],["TOTAL PAID",fmt(cart.total),true]].map(([k,v,b])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6,paddingTop:b?10:0,borderTop:b?`1px dashed ${T.border}`:"none"}}>
                <span style={{color:b?T.t1:T.t2,fontWeight:b?700:400,fontSize:b?14:13}}>{k}</span>
                <span style={{color:b?T.violetLt:T.t1,fontWeight:b?900:500,fontSize:b?17:13}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:T.amber+"15",border:`1px solid ${T.amber}33`,borderRadius:10,padding:"13px 15px",display:"flex",gap:12}}>
          <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
          <div style={{color:T.amber,fontSize:13,lineHeight:"1.6"}}>
            <strong>At Exit Gate:</strong> Guard counts your items vs this receipt. Any unscanned item gets billed on the spot.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── GUARD ── */
const DEMO_SESSIONS={
  "SG-DEMO1":{phone:"98765XXXXX",items:[{...PRODUCTS[0],qty:1},{...PRODUCTS[3],qty:2},{...PRODUCTS[6],qty:1}]},
  "SG-DEMO2":{phone:"91234XXXXX",items:[{...PRODUCTS[1],qty:2},{...PRODUCTS[4],qty:3},{...PRODUCTS[7],qty:1}]},
};

function Guard() {
  const [code,setCode]=useState("");
  const [sess,setSess]=useState(null);
  const [step,setStep]=useState("scan");
  const [phys,setPhys]=useState(0);
  const [extras,setExtras]=useState([]);

  const billed=sess?sess.items.reduce((s,i)=>s+i.qty,0):0;
  const billedTotal=sess?sess.items.reduce((s,i)=>s+i.price*i.qty,0):0;
  const diff=phys-billed;
  const extraTotal=extras.reduce((s,i)=>s+i.price,0)*(1+GST);

  const load=()=>{ const s=DEMO_SESSIONS[code.toUpperCase()]; if(s){setSess(s);setStep("verify");vibe();}else alert("Try: SG-DEMO1 or SG-DEMO2"); };
  const verify=()=>{ vibe(); diff===0?setStep("done"):setStep("mismatch"); };
  const reset=()=>{ setSess(null);setCode("");setStep("scan");setPhys(0);setExtras([]); };

  return (
    <div style={{minHeight:"100vh",background:"#111418",fontFamily:"inherit",maxWidth:430,margin:"0 auto",padding:"0 0 48px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(123,97,255,.12) 0%,transparent 60%)",pointerEvents:"none"}} />

      <div style={{background:"rgba(22,26,32,.95)",borderBottom:`1px solid ${T.border}`,padding:"18px 18px 16px",position:"relative",zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:42,height:42,background:T.amber+"22",border:`1px solid ${T.amber}44`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🔐</div>
          <div>
            <div style={{color:T.t1,fontWeight:800,fontSize:18}}>Guard Console</div>
            <div style={{color:T.t3,fontSize:12}}>{STORE.name} · Exit Gate</div>
          </div>
          <div style={{marginLeft:"auto",background:T.green+"22",color:T.green,border:`1px solid ${T.green}44`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700}}>● On Duty</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[["Checked Today",47,"#388BFD"],["Mismatches",3,T.amber],["Recovered","₹840",T.green]].map(([k,v,c])=>(
            <div key={k} style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:8,padding:"9px 10px",border:`1px solid ${T.border}`}}>
              <div style={{color:T.t3,fontSize:10,fontWeight:600}}>{k}</div>
              <div style={{color:c,fontWeight:800,fontSize:16,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"18px",position:"relative",zIndex:1}}>
        {step==="scan"&&(
          <div>
            <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:20,marginBottom:14}}>
              <div style={{color:T.amber,fontWeight:700,fontSize:13,textTransform:"uppercase",letterSpacing:".5px",marginBottom:12}}>Scan Customer Receipt QR</div>
              <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Enter receipt ID…"
                style={{width:"100%",background:T.float,border:`1px solid ${T.border}`,borderRadius:8,padding:"13px 14px",color:T.t1,fontSize:16,fontFamily:"inherit",outline:"none",letterSpacing:"2px",marginBottom:12,boxSizing:"border-box"}} />
              <button onClick={load} style={{width:"100%",padding:14,background:T.amber,border:"none",borderRadius:8,fontWeight:800,fontSize:15,cursor:"pointer",color:"#111",fontFamily:"inherit"}}>Load Receipt ▶</button>
            </div>
            <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
              <div style={{color:T.t3,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Demo Receipts</div>
              {["SG-DEMO1","SG-DEMO2"].map(d=>(
                <button key={d} onClick={()=>{setCode(d);setTimeout(()=>{setSess(DEMO_SESSIONS[d]);setStep("verify");},80);}} style={{display:"block",width:"100%",textAlign:"left",background:T.float,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",color:T.t2,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:6,fontWeight:600}}>
                  ▶ {d} — {DEMO_SESSIONS[d].items.reduce((s,i)=>s+i.qty,0)} items
                </button>
              ))}
            </div>
          </div>
        )}

        {step==="verify"&&sess&&(
          <div>
            <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:18,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <div><div style={{color:T.t3,fontSize:11}}>Customer</div><div style={{color:T.t1,fontWeight:700}}>📱 {sess.phone}</div></div>
                <div style={{textAlign:"right"}}><div style={{color:T.t3,fontSize:11}}>Billed</div><div style={{color:T.green,fontWeight:800,fontSize:18}}>{fmt(billedTotal)}</div></div>
              </div>
              <div style={{background:T.float,borderRadius:8,padding:12}}>
                <div style={{color:T.t3,fontSize:11,fontWeight:700,marginBottom:8}}>BILLED ITEMS — {billed} TOTAL</div>
                {sess.items.map(item=>(
                  <div key={item.id} style={{display:"flex",justifyContent:"space-between",color:T.t1,fontSize:13,marginBottom:6}}>
                    <span>{item.icon} {item.name} ×{item.qty}</span>
                    <span style={{color:T.green,fontWeight:700}}>{fmt(item.price*item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:18,marginBottom:14}}>
              <div style={{color:T.amber,fontWeight:700,fontSize:13,marginBottom:14}}>COUNT ITEMS IN BAG</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,marginBottom:16}}>
                <button onClick={()=>setPhys(p=>Math.max(0,p-1))} style={{width:52,height:52,background:T.float,border:`1px solid ${T.border}`,borderRadius:10,color:T.t1,fontSize:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <div style={{textAlign:"center"}}>
                  <div style={{color:T.t1,fontSize:52,fontWeight:800,lineHeight:1}}>{phys}</div>
                  <div style={{color:T.t3,fontSize:12,marginTop:4}}>physical items</div>
                </div>
                <button onClick={()=>setPhys(p=>p+1)} style={{width:52,height:52,background:T.green,border:"none",borderRadius:10,color:"#111",fontSize:28,cursor:"pointer",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[["BILLED",billed,"#388BFD"],["PHYSICAL",phys,phys>billed?T.red:T.t1],["DIFF",diff>0?`+${diff}`:diff<0?diff:"✓",diff>0?T.red:diff<0?T.amber:T.green]].map(([k,v,c])=>(
                  <div key={k} style={{flex:1,background:T.float,borderRadius:8,padding:"11px 8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{color:T.t3,fontSize:10,fontWeight:700}}>{k}</div>
                    <div style={{color:c,fontWeight:900,fontSize:22,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              <button onClick={verify} disabled={phys===0} style={{width:"100%",padding:14,background:phys>0?T.amber:T.float,border:"none",borderRadius:8,fontWeight:800,fontSize:15,cursor:phys>0?"pointer":"not-allowed",color:phys>0?"#111":T.t3,fontFamily:"inherit"}}>
                Verify Count ▶
              </button>
            </div>
          </div>
        )}

        {step==="mismatch"&&(
          <div>
            <div style={{background:T.red+"18",border:`1px solid ${T.red}44`,borderRadius:14,padding:18,textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:30,marginBottom:8}}>⚠️</div>
              <div style={{color:T.red,fontWeight:800,fontSize:20}}>{diff} Unbilled Item{diff>1?"s":""} Found</div>
              <div style={{color:T.t2,fontSize:13,marginTop:4}}>Scan unbilled items to add to bill</div>
            </div>
            {extras.length>0&&(
              <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{color:T.amber,fontWeight:700,fontSize:12,marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>Unbilled Items Found:</div>
                {extras.map((item,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",color:T.t1,fontSize:13,marginBottom:6}}>
                    <span>{item.icon} {item.name}</span>
                    <span style={{color:T.red,fontWeight:700}}>{fmt(item.price)}</span>
                  </div>
                ))}
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:8,display:"flex",justifyContent:"space-between",color:T.amber,fontWeight:800}}>
                  <span>Extra (incl. GST)</span><span>{fmt(extraTotal)}</span>
                </div>
              </div>
            )}
            {extras.length<diff&&(
              <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{color:T.t2,fontSize:11,fontWeight:700,marginBottom:10}}>TAP TO SCAN UNBILLED ITEM ({extras.length+1} of {diff}):</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
                  {PRODUCTS.slice(3,10).map(p=>(
                    <button key={p.id} onClick={()=>{setExtras(prev=>[...prev,p]);vibe();}} style={{background:T.float,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",width:"100%",fontFamily:"inherit"}}>
                      <span style={{color:T.t1,fontSize:13}}>{p.icon} {p.name}</span>
                      <span style={{color:T.green,fontWeight:800,fontSize:14}}>{fmt(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {extras.length===diff&&(
              <div>
                <div style={{background:T.green+"12",border:`1px solid ${T.green}33`,borderRadius:10,padding:16,textAlign:"center",marginBottom:12}}>
                  <div style={{color:T.t2,fontSize:13,marginBottom:6}}>Sending payment request to customer</div>
                  <div style={{color:T.green,fontWeight:800,fontSize:22}}>📱 Pay {fmt(extraTotal)}</div>
                </div>
                <button onClick={()=>setStep("done")} style={{width:"100%",padding:16,background:T.green,border:"none",borderRadius:10,fontWeight:800,fontSize:15,cursor:"pointer",color:"#111",fontFamily:"inherit"}}>
                  ✓ Payment Received — Open Gate
                </button>
              </div>
            )}
          </div>
        )}

        {step==="done"&&(
          <div style={{textAlign:"center",padding:"50px 20px"}}>
            <div style={{width:80,height:80,background:`linear-gradient(135deg,${T.green},${T.teal})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36,animation:"popIn .4s ease"}}>✓</div>
            <div style={{color:T.t1,fontWeight:800,fontSize:24,marginBottom:6}}>All Clear!</div>
            <div style={{color:T.t3,fontSize:14,marginBottom:32}}>Customer may exit. Gate unlocked.</div>
            <button onClick={reset} style={{padding:"13px 32px",background:T.float,border:`1px solid ${T.border}`,borderRadius:10,color:T.t2,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              Next Customer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ROOT ── */
export default function App() {
  const [screen,setScreen]=useState("entry");
  const [phone,setPhone]=useState("");
  const [rid]=useState(genId);
  const cart=useCart();
  const toast=useToast();
  const go=useCallback(s=>{vibe();setScreen(s);},[]);

  return (
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input::placeholder{color:#606060;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#383838;border-radius:4px;}
        @keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110px) rotate(720deg);opacity:0}}
      `}</style>
      <Toasts list={toast.list} />
      {screen==="entry"    && <Entry    onCustomer={p=>{setPhone(p);go("shopping");}} onGuard={()=>go("guard")} />}
      {screen==="shopping" && <Shopping phone={phone} cart={cart} toast={toast} onCheckout={()=>go("payment")} />}
      {screen==="payment"  && <Payment  cart={cart} onPaid={()=>go("receipt")} onBack={()=>go("shopping")} />}
      {screen==="receipt"  && <Receipt  cart={cart} phone={phone} rid={rid} />}
      {screen==="guard"    && <Guard />}
    </div>
  );
}

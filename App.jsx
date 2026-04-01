import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:8000";

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return t;
}

function useTick(ms = 2000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setN(p => p + 1), ms);
    return () => clearInterval(i);
  }, [ms]);
  return n;
}

function useCountdown(seconds = 600) {
  const [rem, setRem] = useState(seconds);
  useEffect(() => {
    const start = Date.now();
    const i = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000) % seconds;
      setRem(seconds - elapsed);
    }, 1000);
    return () => clearInterval(i);
  }, [seconds]);
  return rem;
}

async function fetchJSON(path) {
  try {
    const r = await fetch(${API}${path});
    if (!r.ok) throw new Error(HTTP ${r.status});
    return await r.json();
  } catch (e) {
    console.error([LAMCE API] ${path}:, e.message);
    return null;
  }
}

function Dot({ color = "#4ade80", size = 7 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      borderRadius: "50%", background: color,
      boxShadow: 0 0 ${size + 4}px ${color}88,
      animation: "pulse 2s ease-in-out infinite", flexShrink: 0,
    }} />
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center",
      justifyContent: "center", width: "100%", height: "100%",
      flexDirection: "column", gap: 12 }}>
      <div style={{
        width: 32, height: 32,
        border: "3px solid rgba(30,64,128,.15)",
        borderTop: "3px solid #1e4080", borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <span style={{ fontFamily: "monospace", fontSize: 10,
        color: "#94a3b8", letterSpacing: 2 }}>CARREGANDO...</span>
    </div>
  );
}

function LamceLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 28,
            letterSpacing: 5, color: "#1e4080", lineHeight: 1 }}>LAMCE</div>
          <div style={{ fontSize: 8, color: "#8fa8c8",
            letterSpacing: 2.5, marginTop: 1 }}>COPPE.UFRJ.BR</div>
        </div>
        <svg viewBox="0 0 52 52" width="42" height="42"
          style={{ marginLeft: -4, marginBottom: -2 }}>
          <polygon points="26,3 50,49 2,49" fill="none"
            stroke="#8fa8c8" strokeWidth="3.5" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ borderLeft: "2px solid rgba(30,64,128,.2)",
        paddingLeft: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 11,
          letterSpacing: 2, color: "#1e4080", lineHeight: 1.6,
          textTransform: "uppercase" }}>
          Laboratório de<br/>Métodos Computacionais<br/>em Engenharia
        </div>
      </div>
    </div>
  );
}

function CountdownBar({ seconds = 600 }) {
  const rem = useCountdown(seconds);
  const pct = ((seconds - rem) / seconds) * 100;
  const mm = String(Math.floor(rem / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4,
        background: "rgba(255,255,255,.12)",
        borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: ${pct}%,
          background: "linear-gradient(90deg,#38bdf8,#fbbf24)",
          borderRadius: 2, transition: "width .9s linear" }} />
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 9,
        color: "rgba(255,255,255,.5)", minWidth: 36 }}>
        {mm}:{ss}
      </span>
    </div>
  );
}

function LightningMap({ flashes, clusters, showClusters }) {
  const ref = useRef(null);
  const tick = useTick(1800);

  const toXY = useCallback((lat, lon, W, H) => {
    const lonMin = -75, lonMax = -28, latMin = -35, latMax = 6;
    return [
      ((lon - lonMin) / (lonMax - lonMin)) * W,
      ((latMax - lat) / (latMax - latMin)) * H,
    ];
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.5,W*.65);
    bg.addColorStop(0, "#0d1f38");
    bg.addColorStop(1, "#060e1c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(56,189,248,0.07)";
    ctx.lineWidth = 0.7;
    for (let lon = -70; lon <= -30; lon += 10) {
      const [x] = toXY(0, lon, W, H);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(255,255,255,.2)";
      ctx.fillText(${lon}°, x + 2, H - 4);
    }
    for (let lat = -30; lat <= 5; lat += 10) {
      const [, y] = toXY(lat, 0, W, H);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillText(${lat}°, 2, y - 2);
    }

    const BR = [
      [-34.8,-6],[-35.2,-5.5],[-35,-4.8],[-36.5,-4.5],[-38.5,-3.7],
      [-39,-2.8],[-40.5,-2.5],[-44.3,-2.5],[-46,-1.5],[-48.5,-1],
      [-50,-0.5],[-51.5,0],[-52,1],[-51,4],[-50,5],
      [-59,5.2],[-60,4.5],[-61,1.5],[-62,1],[-64,1.2],
      [-67,-0.5],[-70,-4.2],[-72,-9.5],[-73,-12],[-70,-18],
      [-69.5,-21],[-57.5,-22],[-53,-33.7],[-51.2,-33.5],
      [-48.6,-28.5],[-44.5,-23],[-43,-22.5],[-40.5,-20.5],
      [-39,-17.5],[-37.5,-12.5],[-35,-8.5],[-34.8,-6],
    ];
    ctx.beginPath();
    BR.forEach(([lon, lat], i) => {
      const [x, y] = toXY(lat, lon, W, H);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(20,50,90,.8)";
    ctx.fill();
    ctx.strokeStyle = "rgba(100,160,220,.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    (flashes || []).forEach(f => {
      const [x, y] = toXY(f.lat, f.lon, W, H);
      if (x < 0 || x > W || y < 0 || y > H) return;
      const a = Math.min(0.95, 0.4 + ((f.energy ?? 5e-13) / 1e-12) * 0.4);
      const r = 1.5 + ((f.area ?? 100) / 150);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(250,204,21,${a}); ctx.fill();
    });

    if (showClusters) {
      const now = Date.now() / 1000;
      (clusters || []).forEach(c => {
        const [x, y] = toXY(c.lat, c.lon, W, H);
        const col = c.level==="ALTO"?"#f87171":c.level==="MÉDIO"?"#fbbf24":"#86efac";
        const pulse = 0.5 + Math.sin(now * 1.8) * 0.5;
        ctx.beginPath(); ctx.arc(x, y, 14 + pulse*6, 0, Math.PI*2);
        ctx.strokeStyle = col + "66"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.fillText(c.id, x + 10, y + 3);
      });
    }
  }, [tick, flashes, clusters, showClusters, toXY]);

  return (
    <canvas ref={ref} width={560} height={440}
      style={{ width: "100%", height: "100%", display: "block" }} />
  );
}

function TimeSeries({ series }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !series?.length) return;
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const pad = { l:40, r:12, t:8, b:28 };
    const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
    const max = Math.max(...series.map(s => s.count), 1) * 1.12;
    ctx.fillStyle = "rgba(6,14,28,.6)"; ctx.fillRect(0,0,W,H);
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + iH - (i/4)*iH;
      ctx.strokeStyle = "rgba(56,189,248,0.1)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
      ctx.font = "8px monospace"; ctx.fillStyle = "rgba(255,255,255,.28)";
      ctx.textAlign = "right";
      ctx.fillText(Math.round((i/4)*max), pad.l-4, y+3);
    }
    ctx.textAlign = "left";
    const xStep = iW / Math.max(series.length-1, 1);
    const grad = ctx.createLinearGradient(0,pad.t,0,pad.t+iH);
    grad.addColorStop(0,"rgba(250,204,21,0.35)");
    grad.addColorStop(1,"rgba(250,204,21,0)");
    ctx.beginPath();
    series.forEach((s,i) => {
      const x=pad.l+i*xStep, y=pad.t+iH-(s.count/max)*iH;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.lineTo(pad.l+iW,pad.t+iH); ctx.lineTo(pad.l,pad.t+iH);
    ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath();
    series.forEach((s,i) => {
      const x=pad.l+i*xStep, y=pad.t+iH-(s.count/max)*iH;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle="#fbbf24"; ctx.lineWidth=1.8; ctx.stroke();
    ctx.font="7.5px monospace"; ctx.fillStyle="rgba(255,255,255,.3)";
    ctx.textAlign="center";
    series.forEach((s,i) => {
      if(i%6!==0) return;
      ctx.fillText(s.time, pad.l+i*xStep, H-6);
    });
  }, [series]);
  return (
    <canvas ref={ref} width={560} height={130}
      style={{ width:"100%", height:130, display:"block" }} />
  );
}

export default function LAMCEDashboard() {
  const clock   = useClock();
  const refresh = useTick(600000);
  const [status,    setStatus]    = useState(null);
  const [flashes,   setFlashes]   = useState([]);
  const [clusters,  setClusters]  = useState([]);
  const [series,    setSeries]    = useState([]);
  const [diskFiles, setDiskFiles] = useState([]);
  const [densInfo,  setDensInfo]  = useState(null);
  const [activeTab,    setActiveTab]    = useState("glm");
  const [activeBand,   setActiveBand]   = useState("B03");
  const [showClusters, setShowClusters] = useState(true);
  const [showDens,     setShowDens]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true); setApiError(null);
      const st = await fetchJSON("/api/status");
      if (!st) {
        setApiError("Backend offline. Inicie o FastAPI na porta 8000.");
        setLoading(false); return;
      }
      setStatus(st);
      const lcfa = await fetchJSON("/api/lcfa/latest?max_points=3000");
      if (lcfa?.flashes) setFlashes(lcfa.flashes);
      const cl = await fetchJSON("/api/lcfa/clusters");
      if (cl?.clusters) setClusters(cl.clusters);
      const ts = await fetchJSON("/api/lcfa/timeseries?hours=6");
      if (ts?.series) setSeries(ts.series);
      const disk = await fetchJSON("/api/disk/recent?limit=8");
      if (disk?.files) setDiskFiles(disk.files);
      const dens = await fetchJSON("/api/dens/info");
      setDensInfo(dens);
      setLoading(false);
    }
    load();
  }, [refresh]);

  const fmt  = d => d.toLocaleTimeString("pt-BR", { hour12: false });
  const fmtD = d => d.toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
  const lastFlash = series[series.length-1]?.count ?? 0;
  const BANDS = ["B01","B02","B03","B07","B09","B13","B14","B16"];

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8",
      display:"flex", flexDirection:"column", overflow:"hidden",
      fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(30,64,128,.2);border-radius:2px}
      `}</style>

      {/* HEADER */}
      <header style={{ height:64, background:"#fff",
        borderBottom:"2px solid #1e4080",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 24px",
        flexShrink:0, boxShadow:"0 2px 12px rgba(30,64,128,.08)" }}>
        <LamceLogo />
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {[
            {label:"GOES-19",  ok: status?.ok},
            {label:"GLM LCFA", ok: status?.lcfa?.exists},
            {label:"GLM DENS", ok: densInfo?.available},
          ].map(s => (
            <div key={s.label} style={{
              display:"flex", alignItems:"center", gap:5,
              background: s.ok?"rgba(74,222,128,.08)":"rgba(251,191,36,.08)",
              border:1px solid ${s.ok?"rgba(74,222,128,.35)":"rgba(251,191,36,.35)"},
              borderRadius:20, padding:"3px 10px" }}>
              <Dot color={s.ok?"#16a34a":"#f59e0b"} size={6}/>
              <span style={{ fontSize:9, color:"#334155",
                fontFamily:"monospace", letterSpacing:.8 }}>{s.label}</span>
            </div>
          ))}
          <div style={{ marginLeft:8, background:"rgba(30,64,128,.05)",
            border:"1px solid rgba(30,64,128,.18)",
            borderRadius:8, padding:"4px 12px", textAlign:"right" }}>
            <div style={{ fontFamily:"monospace", fontSize:18,
              color:"#1e4080", letterSpacing:2, lineHeight:1 }}>
              {fmt(clock)}
            </div>
            <div style={{ fontSize:8, color:"#64748b",
              letterSpacing:1, marginTop:1 }}>
              {fmtD(clock)} · BRT
            </div>
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div style={{ background:"#1e4080", padding:"4px 24px",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:1 }}>
          <span style={{ fontFamily:"monospace", fontSize:9,
            color:"rgba(255,255,255,.5)", letterSpacing:2, whiteSpace:"nowrap" }}>
            PRÓX. ATUALIZAÇÃO (10 MIN)
          </span>
          <div style={{ flex:1, maxWidth:200 }}>
            <CountdownBar seconds={600}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {[
            {label:"ÚLTIMO ARQUIVO", val: status?.lcfa?.file?.split("/").pop() ?? "—"},
            {label:"LATÊNCIA",       val: status?.lcfa?.age_s ? ${status.lcfa.age_s}s : "—"},
            {label:"FLASHES CICLO",  val: lastFlash.toLocaleString("pt-BR")},
          ].map(m => (
            <div key={m.label} style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"monospace", fontSize:7.5,
                color:"rgba(255,255,255,.4)", letterSpacing:1 }}>{m.label}</div>
              <div style={{ fontFamily:"monospace", fontSize:10,
                color:"rgba(255,255,255,.85)" }}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px",
        flex:1, overflow:"hidden" }}>

        {/* CENTRO */}
        <div style={{ display:"flex", flexDirection:"column",
          overflow:"hidden", background:"#e8eef5" }}>

          {/* TABS */}
          <div style={{ background:"#fff", borderBottom:"1px solid #dce4ef",
            padding:"0 20px", display:"flex", alignItems:"center", flexShrink:0 }}>
            {[
              {id:"glm", label:"⚡ Mapa de Raios (GLM)"},
              {id:"abi", label:"🛰 Imagens ABI"},
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding:"10px 18px", border:"none", background:"transparent",
                cursor:"pointer", marginBottom:-1,
                borderBottom:2px solid ${activeTab===t.id?"#1e4080":"transparent"},
                fontWeight:700, fontSize:13, color:activeTab===t.id?"#1e4080":"#64748b" }}>
                {t.label}
              </button>
            ))}
            <div style={{ flex:1 }}/>
            {activeTab==="glm" && (
              <label style={{ display:"flex", alignItems:"center", gap:6,
                fontSize:10, color:"#475569", cursor:"pointer",
                marginRight:14, fontFamily:"monospace" }}>
                <input type="checkbox" checked={showClusters}
                  onChange={e => setShowClusters(e.target.checked)}
                  style={{ accentColor:"#1e4080" }}/>
                clusters LCFA
              </label>
            )}
            {activeTab==="abi" && (
              <div style={{ display:"flex", gap:5 }}>
                {BANDS.map(b => (
                  <button key={b} onClick={() => setActiveBand(b)} style={{
                    padding:"3px 8px", borderRadius:4, border:"none",
                    cursor:"pointer",
                    background: activeBand===b?"rgba(30,64,128,.12)":"transparent",
                    outline: activeBand===b?"1.5px solid #1e4080":"1px solid #dce4ef",
                    fontFamily:"monospace", fontSize:9,
                    color: activeBand===b?"#1e4080":"#64748b" }}>{b}</button>
                ))}
              </div>
            )}
          </div>

          {/* TAB GLM */}
          {activeTab==="glm" && (
            <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
              <div style={{ flex:1, position:"relative",
                overflow:"hidden", background:"#060e1c" }}>
                {loading ? <Spinner /> : apiError ? (
                  <div style={{ display:"flex", alignItems:"center",
                    justifyContent:"center", height:"100%", flexDirection:"column", gap:8 }}>
                    <div style={{ fontSize:28 }}>⚠️</div>
                    <span style={{ fontFamily:"monospace", fontSize:10,
                      color:"#f87171", textAlign:"center", maxWidth:280 }}>{apiError}</span>
                  </div>
                ) : (
                  <LightningMap flashes={flashes} clusters={clusters}
                    showClusters={showClusters}/>
                )}
                <div style={{ position:"absolute", top:10, right:10,
                  background:"rgba(6,14,28,.88)", backdropFilter:"blur(6px)",
                  border:"1px solid rgba(56,189,248,.2)",
                  borderRadius:7, padding:"8px 12px" }}>
                  <div style={{ fontFamily:"monospace", fontSize:8,
                    color:"rgba(255,255,255,.4)", marginBottom:6 }}>LEGENDA</div>
                  {[
                    {c:"#fbbf24", l:Flash (n=${flashes.length.toLocaleString("pt-BR")})},
                    {c:"#f87171", l:"Cluster ALTO"},
                    {c:"#fbbf24", l:"Cluster MÉDIO"},
                    {c:"#86efac", l:"Cluster BAIXO"},
                  ].map(x => (
                    <div key={x.l} style={{ display:"flex", alignItems:"center",
                      gap:6, fontSize:8.5, color:"rgba(255,255,255,.5)", marginBottom:3 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%",
                        background:x.c, display:"inline-block" }}/>
                      {x.l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:"#0a1525", borderTop:"2px solid #1e4080",
                flexShrink:0, padding:"10px 14px 6px" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontWeight:700, fontSize:11,
                    letterSpacing:3, color:"#fbbf24" }}>
                    ⚡ SÉRIE TEMPORAL — FLASHES GLM (6h)
                  </span>
                  <div style={{ display:"flex", gap:16 }}>
                    {[
                      {l:"atual", v:lastFlash.toLocaleString("pt-BR")},
                      {l:"pontos", v:series.length},
                    ].map(m => (
                      <div key={m.l} style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:"monospace", fontSize:14,
                          color:"#fbbf24", lineHeight:1 }}>{m.v}</div>
                        <div style={{ fontSize:8, color:"rgba(255,255,255,.3)",
                          marginTop:1 }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {series.length > 0 ? <TimeSeries series={series}/> : <Spinner/>}
              </div>
            </div>
          )}

          {/* TAB ABI */}
          {activeTab==="abi" && (
            <div style={{ flex:1, position:"relative",
              overflow:"hidden", background:"#060e1c",
              display:"flex", flexDirection:"column" }}>
              <div style={{ flex:1, position:"relative",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <img key={activeBand}
                  src={${API}/api/images/latest?band=${activeBand}}
                  alt={GOES-19 ${activeBand}}
                  onError={e => { e.target.style.display="none"; }}
                  style={{ width:"100%", height:"100%",
                    objectFit:"contain", display:"block" }}/>
                <div style={{ position:"absolute", top:0, left:0, right:0,
                  background:"linear-gradient(180deg,rgba(0,0,0,.8) 0%,transparent 100%)",
                  padding:"10px 16px 24px", textAlign:"center" }}>
                  <div style={{ fontFamily:"monospace", fontSize:11,
                    color:"rgba(255,255,255,.65)" }}>G19 · {activeBand}</div>
                </div>
              </div>
              <div style={{ padding:"8px 16px 6px",
                background:"rgba(0,0,0,.7)", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"monospace", fontSize:8,
                    color:"rgba(255,255,255,.3)", width:12 }}>0</span>
                  <div style={{ flex:1, height:10, borderRadius:2,
                    background:"linear-gradient(90deg,#000 0%,#444 30%,#888 55%,#ccc 80%,#fff 100%)",
                    border:"1px solid rgba(255,255,255,.1)" }}/>
                  <span style={{ fontFamily:"monospace", fontSize:8,
                    color:"rgba(255,255,255,.3)", width:28 }}>100</span>
                </div>
                <div style={{ textAlign:"center", fontSize:7.5,
                  color:"rgba(255,255,255,.25)", fontFamily:"monospace",
                  letterSpacing:1, marginTop:3 }}>Reflectance (%)</div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ background:"#fff", borderLeft:"1px solid #dce4ef",
          display:"flex", flexDirection:"column", overflowY:"auto" }}>

          <section style={{ padding:"14px 16px", borderBottom:"1px solid #e8eef5" }}>
            <div style={{ fontWeight:700, fontSize:11, letterSpacing:3,
              color:"#1e4080", marginBottom:10 }}>⚡ GLM — CICLO ATUAL</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
              gap:8, marginBottom:12 }}>
              {[
                {l:"Flashes",  v:flashes.length.toLocaleString("pt-BR"), c:"#1e4080"},
                {l:"Clusters", v:clusters.length, c:"#f59e0b"},
                {l:"Série",    v:${series.length}pts, c:"#1e4080"},
                {l:"DENS",     v:densInfo?.available?"✓":"—",
                  c:densInfo?.available?"#16a34a":"#94a3b8"},
              ].map(m => (
                <div key={m.l} style={{ background:"#f8fafc",
                  border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontFamily:"monospace", fontSize:16,
                    color:m.c, lineHeight:1 }}>{m.v}</div>
                  <div style={{ fontSize:8.5, color:"#64748b", marginTop:3 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding:"14px 16px", borderBottom:"1px solid #e8eef5" }}>
            <div style={{ fontWeight:700, fontSize:11, letterSpacing:3,
              color:"#1e4080", marginBottom:10 }}>🌩 LCFA — CLUSTERS</div>
            {clusters.length === 0 ? (
              <div style={{ fontSize:10, color:"#94a3b8",
                fontFamily:"monospace", textAlign:"center", padding:"12px 0" }}>
                sem clusters no ciclo atual
              </div>
            ) : clusters.map(c => {
              const col = c.level==="ALTO"?"#dc2626":c.level==="MÉDIO"?"#d97706":"#16a34a";
              const bg  = c.level==="ALTO"?"#f87171":c.level==="MÉDIO"?"#fbbf24":"#86efac";
              return (
                <div key={c.id} style={{ marginBottom:7, padding:"9px 11px",
                  background:"#f8fafc", borderLeft:3px solid ${bg},
                  borderRadius:"0 7px 7px 0", border:"1px solid #e2e8f0",
                  borderLeftColor:bg }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"monospace", fontSize:11,
                      color:"#1e2d40", fontWeight:"bold" }}>{c.id}</span>
                    <span style={{ fontSize:8, padding:"2px 7px", borderRadius:3,
                      background:${bg}22, color:col, fontWeight:"bold",
                      fontFamily:"monospace" }}>{c.level}</span>
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:8.5,
                    color:"#475569", marginTop:4 }}>
                    {c.lat}°S · {c.lon}°W
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:8,
                    color:"#94a3b8", marginTop:1 }}>{c.count} flashes</div>
                </div>
              );
            })}
          </section>

          <section style={{ padding:"14px 16px" }}>
            <div style={{ fontWeight:700, fontSize:11, letterSpacing:3,
              color:"#1e4080", marginBottom:8 }}>💾 DISCO /shared</div>
            {diskFiles.length === 0 ? (
              <div style={{ fontSize:10, color:"#94a3b8",
                fontFamily:"monospace", textAlign:"center", padding:"12px 0" }}>—</div>
            ) : diskFiles.map((f,i) => (
              <div key={i} style={{ marginBottom:5, padding:"7px 9px",
                background: f.fresh?"rgba(30,64,128,.04)":"#f8fafc",
                border:1px solid ${f.fresh?"rgba(30,64,128,.2)":"#e2e8f0"},
                borderRadius:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:2 }}>
                  <span style={{ fontFamily:"monospace", fontSize:8,
                    color:"#1e4080", background:"rgba(30,64,128,.08)",
                    padding:"1px 6px", borderRadius:3 }}>{f.type}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {f.fresh && <Dot color="#16a34a" size={5}/>}
                    <span style={{ fontFamily:"monospace", fontSize:8,
                      color:"#94a3b8" }}>{f.age}</span>
                  </div>
                </div>
                <div style={{ fontFamily:"monospace", fontSize:8,
                  color:"#475569", wordBreak:"break-all",
                  lineHeight:1.4 }}>{f.name}</div>
                <div style={{ fontSize:7.5, color:"#94a3b8",
                  marginTop:1 }}>{f.size_mb} MB</div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ height:26, background:"#1e4080", flexShrink:0,
        display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 20px" }}>
        <div style={{ display:"flex", gap:20 }}>
          {["GOES-19 · 75.2°W","FAZZT ONLINE","FREQ: 10 MIN",
            FLASHES: ${flashes.length.toLocaleString("pt-BR")}].map(s => (
            <span key={s} style={{ fontFamily:"monospace", fontSize:8,
              color:"rgba(255,255,255,.4)", letterSpacing:.8 }}>{s}</span>
          ))}
        </div>
        <span style={{ fontFamily:"monospace", fontSize:8,
          color:"rgba(255,255,255,.25)" }}>
          LAMCE · COPPE/UFRJ · ACESSO RESTRITO · REDE INTERNA
        </span>
      </div>
    </div>
  );
}
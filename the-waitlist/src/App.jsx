import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import ThreeBackground from "./ThreeBackground";

// ── API helpers ──────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "https://waitlist-api.aidan-oday.workers.dev";

let _token = localStorage.getItem("waitlist:token");

function setToken(t) {
  _token = t;
  if (t) localStorage.setItem("waitlist:token", t);
  else localStorage.removeItem("waitlist:token");
}

async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Polite phrases ──────────────────────────────────────────────────────
const POLITE_PHRASES = [
  "Pardon me, might I scoot ahead?",
  "So sorry, just need to slip by!",
  "Excuse me, would you mind terribly?",
  "After you — oh wait, before you. Sorry!",
  "Terribly sorry, may I squeeze past?",
  "I hate to be a bother, but...",
  "Would it be alright if I just...",
  "My sincerest apologies for the intrusion!",
  "I promise I'll be quick about it!",
  "A thousand pardons, dear friend.",
  "Forgive me, but may I?",
  "If it's not too much trouble...",
  "I do beg your pardon!",
  "So sorry to impose!",
  "With your kind permission...",
  "Please don't think me rude!",
  "I wouldn't ask if it weren't urgent!",
  "Just this once, I promise!",
  "My grandmother is saving me a spot!",
  "I left something up there, honest!",
  "Oh! I think I see my friend up ahead...",
  "Passing through, pardon the disruption!",
  "Excuse me, coming through!",
  "Sorry! Urgent business ahead!",
  "Mind if I just shimmy past?",
  "Beep beep! Just kidding. May I?",
  "I'll make it up to you, I swear!",
  "You're too kind — thank you!",
  "I owe you one!",
  "Would you be so gracious?",
  "Pretty please with sugar on top?",
  "If you'd be so kind...",
  "I'll remember this generosity forever!",
  "Bless your heart, may I pass?",
  "What a lovely day to let someone by!",
  "You look like someone who'd let me through!",
  "I have a coupon that expires soon!",
  "Quick question — can I also cut in line?",
  "My horoscope said to move forward today.",
  "Mercury is in retrograde, I must advance!",
  "The universe is calling me forward!",
  "Destiny awaits one spot ahead!",
  "I was told there'd be no waiting!",
  "Running late, so sorry!",
  "My watch must be fast — or I'm slow!",
  "I promise to pay it forward!",
  "You'll barely notice I was here!",
  "Scooting by like a gentle breeze!",
  "Just a tiny little cut, barely counts!",
  "This is a micro-cut, practically invisible!",
  "Moving at the speed of politeness!",
  "Shuffling forward with great respect!",
  "Advancing with the utmost courtesy!",
  "One small step for me, sorry about that!",
  "Permission to come aboard... one spot up?",
  "Houston, requesting clearance to advance!",
  "Captain's log: attempting to cut in line.",
  "Engaging warp drive — one spot forward!",
  "Teleporting would be rude, so I'm asking!",
  "If only I could teleport, but alas!",
  "Science hasn't solved lines yet, so excuse me!",
  "They really should invent a skip button — oh wait!",
  "I've been standing here in spirit all along!",
  "Technically I was here first, spiritually.",
  "My astral projection was in this spot earlier!",
  "I reserved this spot telepathically!",
  "Pardon my eagerness!",
  "Couldn't help myself — sorry!",
  "The line looked shorter from back there!",
  "I thought this was the express line!",
  "Is this the fast lane? No? Sorry!",
  "I'm in a bit of a pickle, you see...",
  "Don't mind me, just passing through!",
  "Like a polite little salmon, swimming upstream!",
  "Upstream I go! Excuse me!",
  "Navigating forward with care and respect!",
  "Charting a course one spot north!",
  "Headed north by northwest — one spot!",
  "Just a gentle nudge forward, pardon!",
  "Tiptoeing ahead ever so slightly!",
  "Inching forward with great humility!",
  "Creeping ahead, but in a nice way!",
  "A respectful leap forward, if you will!",
  "Gracefully gliding one spot up!",
  "Excuse the shuffle!",
  "Apologies for the queue disruption!",
  "Terribly sorry for the line turbulence!",
  "Please excuse this minor rearrangement!",
  "Forgive the positional adjustment!",
  "A minor logistical maneuver, pardon!",
  "Strategic repositioning, please excuse me!",
  "Optimizing my queue position — sorry!",
  "Recalibrating my place in line!",
  "Executing a polite overtake!",
  "Performing a courtesy pass!",
  "Initiating a gentle bypass!",
  "Requesting a one-spot variance!",
  "Filing a motion to advance!",
  "Submitting a formal request to scoot!",
  "Per my earlier request to move forward...",
  "As discussed, I'll be moving up now!",
  "Pursuant to section 4: excuse me!",
  "In accordance with line protocol, may I?",
  "Under article 7 of queue etiquette...",
  "The committee has approved my advancement!",
  "My therapist said I should be more forward!",
  "I'm working on my assertiveness — excuse me!",
  "Being brave today — pardon the cut!",
  "Growth mindset: moving forward!",
  "Manifesting a better position!",
  "Visualizing myself one spot ahead!",
  "The self-help book said to go for it!",
  "Carpe diem! Also, excuse me!",
  "YOLO — but politely!",
  "Living my best life, one spot forward!",
  "Making moves, with your permission!",
  "Leveling up! Sorry about that!",
  "Achievement unlocked: asking politely!",
  "Pressing the skip button IRL — sorry!",
  "Loading... one position forward!",
  "Buffering complete — moving ahead!",
];

// ── Helpers ──────────────────────────────────────────────────────────────
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Palette ──────────────────────────────────────────────────────────────
const T = {
  bg: "#F7F6F4",
  surface: "#FFFFFF",
  border: "#E8E7E5",
  borderLight: "#EFEEED",
  charcoal: "#2C2C2C",
  textPrimary: "#37372F",
  textSecondary: "#87857E",
  textTertiary: "#B3B1A9",
  accent: "#C26240",
  accentSoft: "rgba(194,98,64,0.07)",
  accentBorder: "rgba(194,98,64,0.18)",
  serif: "'Newsreader', 'Georgia', serif",
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
  r: 8,
};

// ── Constants ────────────────────────────────────────────────────────────
const TIMER_DURATION = 2 * 60; // 2 minutes in seconds (active time only)

// ── ZzzIcon ──────────────────────────────────────────────────────────────
function ZzzIcon() {
  return (
    <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "flex-end", gap: 1, lineHeight: 1 }}>
      {["z", "z", "z"].map((z, i) => (
        <span key={i} style={{
          fontFamily: T.mono,
          fontSize: 7 + i * 2,
          color: T.textTertiary,
          animation: `pulse 2s ease ${i * 0.4}s infinite`,
          display: "inline-block",
        }}>{z}</span>
      ))}
    </span>
  );
}

// ── PixelHourglass ───────────────────────────────────────────────────────
function PixelHourglass() {
  const px = 2;
  const c = T.accent;
  const sand = "rgba(194,98,64,0.45)";
  // 5-col × 7-row pixel hourglass (10×14px total)
  const frame = [
    [0,0],[0,1],[0,2],[0,3],[0,4],
    [1,0],[1,4],
    [2,1],[2,3],
    [3,2],
    [4,1],[4,3],
    [5,0],[5,4],
    [6,0],[6,1],[6,2],[6,3],[6,4],
  ];
  const topSand  = [[1,1],[1,2],[1,3],[2,2]];
  const botSand  = [[4,2],[5,1],[5,2],[5,3]];
  return (
    <div style={{ flexShrink: 0, animation: "hourglassFlip 8s linear infinite", transformOrigin: "center", display: "inline-flex" }}>
      <svg width={5*px} height={7*px} viewBox={`0 0 ${5*px} ${7*px}`} style={{ display: "block" }}>
        {frame.map(([r,col],i)   => <rect key={`f${i}`}  x={col*px} y={r*px} width={px} height={px} fill={c} />)}
        {topSand.map(([r,col],i) => <rect key={`ts${i}`} x={col*px} y={r*px} width={px} height={px} fill={sand} />)}
        {botSand.map(([r,col],i) => <rect key={`bs${i}`} x={col*px} y={r*px} width={px} height={px} fill={sand} />)}
        {/* dripping grain — downward when upright */}
        <g style={{ animation: "showUpright 8s linear infinite" }}>
          <rect x={2*px} y={3*px} width={px} height={px} fill={c}
            style={{ animation: "sandDripDown 1s linear infinite" }} />
        </g>
        {/* dripping grain — upward in SVG space (= downward on screen) when flipped */}
        <g style={{ animation: "showFlipped 8s linear infinite" }}>
          <rect x={2*px} y={3*px} width={px} height={px} fill={c}
            style={{ animation: "sandDripUp 1s linear infinite" }} />
        </g>
      </svg>
    </div>
  );
}

// ── CountdownTimer ───────────────────────────────────────────────────────
// For the self/position-1 user: counts down locally each second (active time).
// For everyone else: shows the server's last-known remaining time as a static value.
function CountdownTimer({ accumulatedWaitSeconds, isPosition1, isSelf }) {
  const secs = Math.max(0, TIMER_DURATION - (accumulatedWaitSeconds || 0));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <span style={{
      fontFamily: T.mono,
      fontSize: 11,
      color: isPosition1 ? (isSelf ? T.accent : T.textSecondary) : T.textTertiary,
      opacity: isPosition1 ? 1 : 0.45,
      flexShrink: 0,
      minWidth: 52,
      letterSpacing: 0,
    }}>
      {h}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ── HighFiveButton ───────────────────────────────────────────────────────
function HighFiveButton({ name, isSelf, highFiveCount, hasFivedToday, onFive }) {
  const [count, setCount] = useState(highFiveCount);
  const [fived, setFived] = useState(hasFivedToday || false);
  const [bursting, setBursting] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [tooltipMsg, setTooltipMsg] = useState("Spread some love!");
  const tooltipToggle = useRef(false);

  useEffect(() => { setCount(highFiveCount); }, [highFiveCount]);

  // Sync fived state when the queue refreshes (covers page reload + rejoin reset)
  useEffect(() => { setFived(hasFivedToday || false); }, [hasFivedToday]);

  // Auto-reset at UTC midnight so the button re-enables without a page reload
  useEffect(() => {
    if (!fived) return;
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const id = setTimeout(() => setFived(false), midnight - now);
    return () => clearTimeout(id);
  }, [fived]);


  const handleClick = async (e) => {
    e.stopPropagation();
    if (isSelf) return;
    if (fived) {
      setTooltip(true);
      setTimeout(() => setTooltip(false), 2500);
      return;
    }
    setBursting(true);
    setTimeout(() => setBursting(false), 600);
    try {
      const { highFiveCount: newCount } = await api("/high-five", { method: "POST", body: JSON.stringify({ displayName: name }) });
      setCount(newCount);
      setFived(true);
      onFive?.();
    } catch (err) {
      if (err.message?.includes("already")) {
        setFived(true);
        setTooltip(true);
        setTimeout(() => setTooltip(false), 2500);
      }
    }
  };

  if (isSelf) {
    return count > 0 ? (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textTertiary }}>{count} high five{count !== 1 ? "s" : ""}</span>
      </div>
    ) : null;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, position: "relative" }}>
      {count > 0 && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textTertiary }}>{count}</span>}
      <button onClick={handleClick}
        onMouseEnter={() => {
          if (!fived) {
            tooltipToggle.current = !tooltipToggle.current;
            setTooltipMsg(tooltipToggle.current ? "Celebrate the wait!" : "Spread some love!");
          }
          setTooltip(true);
        }}
        onMouseLeave={() => setTooltip(false)}
        style={{
          border: "none", background: "transparent",
          cursor: fived ? "default" : "pointer",
          fontFamily: T.sans, fontSize: 12,
          padding: 0,
          color: fived ? T.textTertiary : T.accent,
          textDecoration: "underline",
          opacity: fived ? 0.5 : 1,
          transition: "opacity 0.2s ease",
          position: "relative", overflow: "visible",
        }}>
        + high five
        {bursting && (
          <div style={{ position: "absolute", inset: -4, pointerEvents: "none" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: "50%", top: "50%", width: 2, height: 8,
                background: T.accent, borderRadius: 1,
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: "center center",
                animation: `hfBurst 0.5s ease-out ${i * 25}ms both`,
              }} />
            ))}
          </div>
        )}
      </button>
      {tooltip && (
        <div style={{
          position: "absolute", right: 0, top: -32, whiteSpace: "nowrap",
          background: T.charcoal, color: "#fff", fontFamily: T.sans, fontSize: 11,
          padding: "5px 10px", borderRadius: 6, pointerEvents: "none",
          animation: "fadeIn 0.15s ease both", zIndex: 40,
        }}>
          {fived ? "High five-ability resets at midnight and whenever you start a new run." : tooltipMsg}
        </div>
      )}
    </div>
  );
}

// ── UserCard ─────────────────────────────────────────────────────────────
function UserCard({ name, waitingFor, position, onClose, anchorRef }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 6, left: r.left });
    }
  }, [anchorRef]);

  useEffect(() => {
    const close = (e) => { if (cardRef.current && !cardRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onClose]);

  return createPortal(
    <div ref={cardRef} style={{
      position: "fixed", top: coords.top, left: coords.left, zIndex: 9999,
      ...CARD_STYLE, background: "#ffffff", borderRadius: 12, padding: "16px 20px", minWidth: 220,
      animation: "fadeIn 0.15s ease both",
    }}>
      <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.charcoal, marginBottom: 4 }}>{name}</div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textTertiary, marginBottom: 10 }}>#{position} in line</div>
      {waitingFor && (
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, fontWeight: 500, letterSpacing: 0.3, marginBottom: 4 }}>Waiting for</div>
          <div style={{ fontFamily: T.serif, fontSize: 14, color: T.textSecondary, fontStyle: "italic", lineHeight: 1.4 }}>&ldquo;{waitingFor}&rdquo;</div>
        </div>
      )}
    </div>,
    document.body
  );
}

// ── QueuePerson ──────────────────────────────────────────────────────────
function QueuePerson({ name, position, blur, isSelf, delay, highFiveCount, hasFivedToday, waitingFor, accumulatedWaitSeconds, lastHeartbeat, assumedActive, onFive }) {
  const [showCard, setShowCard] = useState(false);
  const nameRef = useRef(null);

  // For position-1 non-self: active if they heartbeated within 30s, or if they
  // just took position 1 (assumedActive covers the gap before their first heartbeat).
  const isActive = isSelf || assumedActive || (lastHeartbeat && (Date.now() - new Date(lastHeartbeat).getTime()) < 30000);

  // Tick the displayed seconds locally for an active position-1 non-self user,
  // so their timer moves between queue refreshes. Resets when server value changes.
  const [displayedAccumulated, setDisplayedAccumulated] = useState(accumulatedWaitSeconds);
  useEffect(() => {
    setDisplayedAccumulated(accumulatedWaitSeconds);
  }, [accumulatedWaitSeconds]);
  useEffect(() => {
    if (isSelf || position !== 1 || !isActive) return;
    const id = setInterval(() => {
      setDisplayedAccumulated(prev => Math.min(prev + 1, TIMER_DURATION));
    }, 1000);
    return () => clearInterval(id);
  }, [isSelf, position, isActive, accumulatedWaitSeconds]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 20px",
      borderBottom: `1px solid ${T.borderLight}`,
      filter: blur > 0 ? `blur(${blur}px)` : "none",
      transition: "filter 0.5s cubic-bezier(.25,.1,.25,1), opacity 0.5s ease",
      opacity: blur > 6 ? 0.25 : blur > 3 ? 0.5 : blur > 0 ? 0.7 : 1,
      background: isSelf ? T.accentSoft : "transparent",
      animation: `fadeIn 0.4s ease ${delay}ms both`,
      userSelect: blur > 0 ? "none" : "auto",
      position: "relative",
    }}>
      <div style={{
        width: 30, textAlign: "right", flexShrink: 0,
        fontFamily: T.mono, fontSize: 12, color: isSelf ? T.accent : T.textTertiary,
        fontWeight: isSelf ? 600 : 400,
      }}>
        {position}
      </div>
      {position === 1
        ? (isSelf || isActive) ? <PixelHourglass /> : <ZzzIcon />
        : <div style={{ width: 4, height: 4, borderRadius: "50%", flexShrink: 0, background: isSelf ? T.accent : T.border }} />
      }
      <CountdownTimer
        accumulatedWaitSeconds={isSelf ? accumulatedWaitSeconds : displayedAccumulated}
        isPosition1={position === 1}
        isSelf={isSelf}
      />
      <div style={{
        flex: 1, fontFamily: T.sans, fontSize: 15,
        color: isSelf ? T.charcoal : T.textPrimary,
        fontWeight: isSelf ? 600 : 400, letterSpacing: -0.1,
        minWidth: 0,
      }}>
        <span
          ref={nameRef}
          onClick={(e) => { if (!isSelf && blur === 0) { e.stopPropagation(); setShowCard(c => !c); } }}
          style={{ cursor: (!isSelf && blur === 0) ? "pointer" : "default", transition: "color 0.15s ease" }}
          onMouseEnter={e => { if (!isSelf && blur === 0) e.target.style.color = T.accent; }}
          onMouseLeave={e => { if (!isSelf) e.target.style.color = isSelf ? T.charcoal : T.textPrimary; }}>
          {name}
        </span>
        <span style={{
          marginLeft: 8, fontFamily: T.mono, fontSize: 10,
          color: T.accent, fontWeight: 500,
          background: T.accentSoft, padding: "2px 7px",
          borderRadius: 4, verticalAlign: "middle",
          visibility: isSelf ? "visible" : "hidden",
        }}>YOU</span>
      </div>
      <div style={{ visibility: blur === 0 ? "visible" : "hidden", minWidth: 80, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
        <HighFiveButton name={name} isSelf={isSelf} highFiveCount={highFiveCount} hasFivedToday={hasFivedToday} onFive={onFive} />
      </div>
      {showCard && <UserCard name={name} waitingFor={waitingFor} position={position} onClose={() => setShowCard(false)} anchorRef={nameRef} />}
    </div>
  );
}

// ── SpeechBubble ─────────────────────────────────────────────────────────
function SpeechBubble({ text, listRef, myIndex }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!listRef.current || myIndex < 0) return;
    const row = listRef.current.children[myIndex];
    if (!row) return;
    const listRect = listRef.current.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    setPos({ top: rowRect.top - listRect.top - 10, width: listRect.width });
  }, [listRef, myIndex]);

  if (!pos) return null;

  return (
    <div style={{
      position: "absolute", left: 0, top: pos.top,
      translate: "0 70px",
      width: pos.width,
      background: "#FDFCFB", color: T.textPrimary,
      fontFamily: T.serif, fontSize: 26,
      padding: "12px 22px", borderRadius: 12,
      lineHeight: 1.3,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      border: `1px solid ${T.borderLight}`,
      animation: "bubblePop 0.35s cubic-bezier(.34,1.56,.64,1) both",
      zIndex: 30, whiteSpace: "normal", wordBreak: "break-word", pointerEvents: "none",
      boxSizing: "border-box",
    }}>
      &ldquo;{text}&rdquo;
      <div style={{
        position: "absolute", bottom: -7, left: "50%", marginLeft: -7,
        width: 0, height: 0,
        borderLeft: "7px solid transparent",
        borderRight: "7px solid transparent",
        borderTop: "7px solid #FDFCFB",
      }} />
      <div style={{
        position: "absolute", bottom: -9, left: "50%", marginLeft: -8,
        width: 0, height: 0,
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderTop: `8px solid ${T.borderLight}`,
        zIndex: -1,
      }} />
    </div>
  );
}

// ── AuthScreen ───────────────────────────────────────────────────────────
function AuthScreen({ onAuth, bgRef, referrer }) {
  const [mode, setMode] = useState(referrer ? "signup" : "login");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrerState, setReferrerState] = useState(referrer ? "loading" : null); // null | "loading" | "found" | "invalid"
  const [referrerName, setReferrerName] = useState(null);

  useEffect(() => {
    if (!referrer) return;
    fetch(`${API_URL}/referrer?token=${encodeURIComponent(referrer)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.displayName) {
          setReferrerName(data.displayName);
          setReferrerState("found");
        } else {
          setReferrerState("invalid");
        }
      })
      .catch(() => setReferrerState("invalid"));
  }, [referrer]);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (!displayName.trim() || !password.trim()) { setError("All fields are required."); setLoading(false); return; }
      if (!/^[a-zA-Z0-9]+$/.test(password)) { setError("Password must contain only letters and numbers."); setLoading(false); return; }
      if (!/[a-zA-Z]/.test(password)) { setError("Password must contain at least 1 letter."); setLoading(false); return; }
      if (mode === "signup") {
        if (password.length < 4) { setError("Password must be at least 4 characters."); setLoading(false); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }
        const { user, token } = await api("/signup", { method: "POST", body: JSON.stringify({ displayName: displayName.trim(), password, referrer: referrer || undefined }) });
        setToken(token);
        const queue = await api("/queue");
        onAuth(user, queue);
      } else {
        const { user, token } = await api("/login", { method: "POST", body: JSON.stringify({ displayName: displayName.trim(), password }) });
        setToken(token);
        const queue = await api("/queue");
        onAuth(user, queue);
      }
    } catch (err) { setError(err.message || "Something went wrong."); }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: T.r,
    border: `1px solid ${T.border}`, background: T.bg,
    color: T.charcoal, fontFamily: T.sans, fontSize: 15,
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1, pointerEvents: "none" }}>
      <div
        onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
        onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
        style={{
          width: "100%", maxWidth: 380, animation: "fadeIn 0.5s ease both",
          pointerEvents: "auto",
          ...CARD_STYLE,
          padding: "40px 32px",
        }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: T.serif, fontSize: 12, fontStyle: "italic", color: T.textTertiary, letterSpacing: 0.5, marginBottom: 10 }}>est. 2026</div>
          <div style={{ fontFamily: T.serif, fontSize: 44, color: T.charcoal, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1 }}>The Waitlist</div>
          <div style={{ width: 40, height: 1, background: T.charcoal, margin: "16px auto 16px", opacity: 0.15 }} />
          {referrerState === "found" && mode === "signup" ? (
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSecondary, letterSpacing: 0.2, lineHeight: 1.4 }}>
              <span style={{ color: T.textTertiary }}>Back-cutting </span>
              <span style={{ fontWeight: 600, color: T.charcoal }}>{referrerName}</span>
            </div>
          ) : referrerState === "invalid" ? (
            <div style={{ fontFamily: T.serif, fontSize: 13, fontStyle: "italic", color: T.textTertiary, lineHeight: 1.5 }}>
              The user who referred you may have deleted their account, or you may have an invalid referral link.
            </div>
          ) : (
            <div style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", color: T.charcoal, letterSpacing: 0.5, lineHeight: 1 }}>Good things come to those who wait.</div>
          )}
        </div>

        <div style={{ display: "flex", marginBottom: 28, borderBottom: `1px solid ${T.border}` }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "12px 0 10px", border: "none", cursor: "pointer",
              background: "transparent", marginBottom: -1,
              borderBottom: mode === m ? `2px solid ${T.charcoal}` : "2px solid transparent",
              color: mode === m ? T.charcoal : T.textTertiary,
              fontFamily: T.sans, fontSize: 13, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase",
              transition: "all 0.2s ease",
            }}>{m === "login" ? "Log In" : "Sign Up"}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 5, display: "block", letterSpacing: 0.3 }}>Display name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
          </div>
          <div>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 5, display: "block", letterSpacing: 0.3 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
              onKeyDown={e => e.key === "Enter" && mode === "login" && handleSubmit()}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, marginTop: 6, lineHeight: 1.4 }}>
              At least 4 characters. Letters and numbers only — no spaces or special characters.
            </div>
          </div>
          {mode === "signup" && (
            <div>
              <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 5, display: "block", letterSpacing: 0.3 }}>Confirm password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: T.r, background: "rgba(194,98,64,0.06)", border: `1px solid ${T.accentBorder}`, color: T.accent, fontFamily: T.sans, fontSize: 13 }}>{error}</div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: 22, padding: "14px 0", borderRadius: T.r,
          border: "none", cursor: loading ? "wait" : "pointer",
          background: T.charcoal, color: "#FFFFFF",
          fontFamily: T.sans, fontSize: 15, fontWeight: 500, letterSpacing: 0.2,
          transition: "opacity 0.15s ease, transform 0.1s ease",
          opacity: loading ? 0.5 : 1,
        }}
          onMouseDown={e => !loading && (e.target.style.transform = "scale(0.985)")}
          onMouseUp={e => e.target.style.transform = "scale(1)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}>
          {loading ? "..." : mode === "login" ? "Log in" : "Join the waitlist"}
        </button>

        {mode === "signup" && (
          <p style={{ textAlign: "center", marginTop: 18, fontFamily: T.sans, fontSize: 12, color: T.textTertiary, lineHeight: 1.6 }}>
            Your place is reserved in the order you sign up.
          </p>
        )}
      </div>
    </div>
  );
}

// ── CARD_STYLE ────────────────────────────────────────────────────────────
const CARD_STYLE = {
  background: "rgba(255, 255, 255, 0.97)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 16,
  border: "1px solid rgba(255, 255, 255, 0.6)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
};

// ── OnboardingScreen ──────────────────────────────────────────────────────
function OnboardingScreen({ onComplete, bgRef }) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await api("/profile", { method: "PATCH", body: JSON.stringify({ waitingFor: answer.trim() || "nothing" }) });
      onComplete(updated);
    } catch (err) {
      if (err.message?.includes("inappropriate")) {
        setError(err.message);
      } else {
        onComplete(null);
      }
    }
    setSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: T.r,
    border: `1px solid ${T.border}`, background: "rgba(247,246,244,0.6)",
    color: T.charcoal, fontFamily: T.sans, fontSize: 15,
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1, pointerEvents: "none" }}>
      <div
        onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
        onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
        style={{ ...CARD_STYLE, width: "100%", maxWidth: 420, padding: "48px 32px 40px", animation: "fadeIn 0.5s ease both", pointerEvents: "auto", textAlign: "center" }}>
        <div style={{ fontFamily: T.serif, fontSize: 28, color: T.charcoal, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 8 }}>
          One more thing...
        </div>
        <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSecondary, marginBottom: 32, lineHeight: 1.5 }}>
          You're in line now. But what for?
        </div>

        <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 6, display: "block", letterSpacing: 0.3, textAlign: "left" }}>
          What are you waiting for?
        </label>
        <input value={answer} onChange={e => { setAnswer(e.target.value); setError(null); }} style={{
          ...inputStyle,
          borderColor: error ? "#C0392B" : T.border,
          boxShadow: error ? "0 0 0 3px rgba(192,57,43,0.1)" : "none",
        }}
          placeholder="'nothing' is a perfectly fine answer"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          onFocus={e => { if (!error) { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; } }}
          onBlur={e => { if (!error) { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; } }} />
        {error && (
          <div style={{ fontFamily: T.sans, fontSize: 12, color: "#C0392B", marginTop: 6, textAlign: "left", animation: "fadeIn 0.2s ease both" }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving} style={{
          width: "100%", marginTop: 20, padding: "14px 0", borderRadius: T.r,
          border: "none", cursor: saving ? "wait" : "pointer",
          background: T.charcoal, color: "#FFFFFF",
          fontFamily: T.sans, fontSize: 15, fontWeight: 500, letterSpacing: 0.2,
          transition: "opacity 0.15s ease, transform 0.1s ease",
          opacity: saving ? 0.5 : 1,
        }}
          onMouseDown={e => !saving && (e.target.style.transform = "scale(0.985)")}
          onMouseUp={e => e.target.style.transform = "scale(1)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}>
          {saving ? "..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

// ── ProfileScreen ─────────────────────────────────────────────────────────
function ProfileScreen({ user, onBack, onUserUpdate, onDelete, bgRef }) {
  const [answer, setAnswer] = useState(user.waitingFor || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [waitHistory, setWaitHistory] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [showAllWaits, setShowAllWaits] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteUrl = user.inviteToken
    ? `${API_URL}/referral/${user.inviteToken}`
    : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  useEffect(() => {
    api("/wait-history")
      .then(setWaitHistory)
      .catch(() => setWaitHistory([]));
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api("/account", { method: "DELETE" });
      onDelete();
    } catch {}
    setDeleting(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await api("/profile", { method: "PATCH", body: JSON.stringify({ waitingFor: answer.trim() }) });
      onUserUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err.message?.includes("inappropriate")) setSaveError(err.message);
    }
    setSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: T.r,
    border: `1px solid ${T.border}`, background: "rgba(247,246,244,0.6)",
    color: T.charcoal, fontFamily: T.sans, fontSize: 15,
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  if (selectedRun) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
        <div
          onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
          onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
          style={{ width: "100%", maxWidth: 420, animation: "fadeIn 0.35s ease both", pointerEvents: "auto" }}>
          <div style={{ ...CARD_STYLE, padding: "28px 28px 32px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: T.serif, fontSize: 22, color: T.charcoal, letterSpacing: -0.4, fontWeight: 400 }}>
                  {ordinal(selectedRun.waitNumber)} wait
                </div>
                {selectedRun.waitingFor && (
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textTertiary, marginTop: 4 }}>
                    Waiting for: <span style={{ color: T.textSecondary, fontWeight: 500 }}>{selectedRun.waitingFor}</span>
                  </div>
                )}
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textTertiary, marginTop: 6 }}>
                  {new Date(selectedRun.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <button onClick={() => setSelectedRun(null)} style={{
                padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
                background: "transparent", color: T.textSecondary,
                fontFamily: T.sans, fontSize: 12, cursor: "pointer", flexShrink: 0,
              }}>← Back</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "High fives given",    value: selectedRun.highFivesGiven },
                { label: "High fives received", value: selectedRun.highFivesReceived },
                { label: "Total time",          value: formatDuration(selectedRun.totalTimeSeconds) },
                { label: "Cuts made",           value: selectedRun.cutsMade },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "14px 16px", borderRadius: T.r, border: `1px solid ${T.borderLight}`, background: T.bg }}>
                  <div style={{ fontFamily: T.mono, fontSize: 22, color: T.charcoal, fontWeight: 600, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, fontWeight: 500, letterSpacing: 0.2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
        <div
          onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
          onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
          style={{ ...CARD_STYLE, width: "100%", maxWidth: 420, padding: "32px 32px 36px", animation: "fadeIn 0.5s ease both", pointerEvents: "auto" }}>

          <div style={{ position: "relative", textAlign: "center", marginBottom: 4 }}>
            <button onClick={onBack} style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "transparent",
              color: T.textSecondary, fontFamily: T.sans, fontSize: 12, cursor: "pointer", fontWeight: 500,
              transition: "all 0.15s ease",
            }}
              onMouseEnter={e => { e.target.style.color = T.charcoal; }}
              onMouseLeave={e => { e.target.style.color = T.textSecondary; }}>
              &larr; Back
            </button>
            <div style={{ fontFamily: T.serif, fontSize: 24, color: T.charcoal, fontWeight: 400, letterSpacing: -0.5 }}>Profile</div>
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textTertiary, marginBottom: 28, textAlign: "center" }}>
            Joined {new Date(user.signupTime).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 6, display: "block", letterSpacing: 0.3 }}>Display name</label>
            <div style={{ ...inputStyle, background: "rgba(0,0,0,0.03)", color: T.textTertiary }}>{user.displayName}</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 6, display: "block", letterSpacing: 0.3 }}>What are you waiting for?</label>
            <input value={answer} onChange={e => { setAnswer(e.target.value); setSaveError(null); }} style={{
              ...inputStyle,
              borderColor: saveError ? "#C0392B" : T.border,
              boxShadow: saveError ? "0 0 0 3px rgba(192,57,43,0.1)" : "none",
            }}
              placeholder="'nothing' is a perfectly fine answer"
              onKeyDown={e => e.key === "Enter" && handleSave()}
              onFocus={e => { if (!saveError) { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; } }}
              onBlur={e => { if (!saveError) { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; } }} />
            {saveError && (
              <div style={{ fontFamily: T.sans, fontSize: 12, color: "#C0392B", marginTop: 6, animation: "fadeIn 0.2s ease both" }}>
                {saveError}
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", padding: "14px 0", borderRadius: T.r,
            border: "none", cursor: saving ? "wait" : "pointer",
            background: T.charcoal, color: "#FFFFFF",
            fontFamily: T.sans, fontSize: 15, fontWeight: 500, letterSpacing: 0.2,
            transition: "opacity 0.15s ease, transform 0.1s ease",
            opacity: saving ? 0.5 : 1,
          }}
            onMouseDown={e => !saving && (e.target.style.transform = "scale(0.985)")}
            onMouseUp={e => e.target.style.transform = "scale(1)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}>
            {saved ? "Saved!" : saving ? "..." : "Save"}
          </button>

          {/* Stats section */}
          <div style={{ marginTop: 28, borderTop: `1px solid ${T.borderLight}`, paddingTop: 24 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textSecondary, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>
              Stats
            </div>
            {waitHistory === null ? (
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textTertiary }}>Loading...</div>
            ) : waitHistory.length === 0 ? (
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textTertiary }}>No waits completed yet.</div>
            ) : (
              <>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSecondary, marginBottom: 12 }}>
                  <span style={{ fontFamily: T.mono, fontWeight: 600, color: T.charcoal, fontSize: 15 }}>{waitHistory.length}</span>
                  {" "}wait{waitHistory.length !== 1 ? "s" : ""} completed
                </div>
                {(() => {
                  const reversed = [...waitHistory].reverse();
                  const visible = showAllWaits ? reversed : reversed.slice(0, 3);
                  return (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {visible.map(w => (
                          <div key={w.waitNumber} style={{
                            padding: "10px 14px",
                            borderRadius: T.r,
                            border: `1px solid ${T.borderLight}`,
                            background: T.bg,
                            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                          }}>
                            <div style={{ minWidth: 0, textAlign: "left" }}>
                              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>
                                {ordinal(w.waitNumber)} wait
                              </div>
                              {w.waitingFor && (
                                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {w.waitingFor}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textTertiary }}>
                                {new Date(w.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <button onClick={() => setSelectedRun(w)} style={{
                                padding: "4px 10px", borderRadius: 5,
                                border: `1px solid ${T.border}`, background: "transparent",
                                color: T.textSecondary, fontFamily: T.sans, fontSize: 11,
                                cursor: "pointer", transition: "all 0.15s ease",
                              }}
                                onMouseEnter={e => { e.target.style.color = T.charcoal; e.target.style.borderColor = T.textSecondary; }}
                                onMouseLeave={e => { e.target.style.color = T.textSecondary; e.target.style.borderColor = T.border; }}>
                                Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {waitHistory.length > 3 && (
                        <button onClick={() => setShowAllWaits(v => !v)} style={{
                          marginTop: 8, padding: 0, border: "none", background: "transparent",
                          fontFamily: T.sans, fontSize: 12, color: T.textTertiary,
                          cursor: "pointer", transition: "color 0.15s ease",
                        }}
                          onMouseEnter={e => e.target.style.color = T.charcoal}
                          onMouseLeave={e => e.target.style.color = T.textTertiary}>
                          {showAllWaits ? "See less" : `See all ${waitHistory.length}`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>

          {/* Invite link */}
          <div style={{ marginTop: 20, borderTop: `1px solid ${T.borderLight}`, paddingTop: 20 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textSecondary, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
              Invite a friend
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textTertiary, marginBottom: 10, lineHeight: 1.5 }}>
              Share this link — your friend joins directly behind you in the queue.
            </div>
            {inviteUrl ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  flex: 1, padding: "9px 12px", borderRadius: T.r,
                  border: `1px solid ${T.borderLight}`, background: T.bg,
                  fontFamily: T.mono, fontSize: 11, color: T.textTertiary,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {inviteUrl}
                </div>
                <button onClick={handleCopyLink} style={{
                  padding: "9px 14px", borderRadius: T.r,
                  border: `1px solid ${T.border}`, background: linkCopied ? T.accent : "transparent",
                  color: linkCopied ? "#fff" : T.textSecondary,
                  fontFamily: T.sans, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s ease", flexShrink: 0,
                }}>
                  {linkCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            ) : (
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textTertiary }}>Loading...</div>
            )}
          </div>

          <div style={{ marginTop: 20, borderTop: `1px solid ${T.borderLight}`, paddingTop: 16 }}>
            <button onClick={() => setConfirmDelete(true)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: "none", cursor: "pointer", padding: 0,
              fontFamily: T.sans, fontSize: 13, color: T.textTertiary, fontWeight: 500,
              transition: "color 0.15s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#C0392B"}
              onMouseLeave={e => e.currentTarget.style.color = T.textTertiary}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4h10M5 4V2.5A.5.5 0 0 1 5.5 2h3a.5.5 0 0 1 .5.5V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5A.5.5 0 0 0 4.2 12h5.6a.5.5 0 0 0 .5-.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Delete account
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, animation: "fadeIn 0.15s ease both",
        }} onClick={() => setConfirmDelete(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            ...CARD_STYLE, background: "#ffffff", borderRadius: 16,
            padding: "32px 28px", maxWidth: 400, width: "100%",
          }}>
            <div style={{ fontFamily: T.serif, fontSize: 22, color: T.charcoal, fontWeight: 400, letterSpacing: -0.5, marginBottom: 14 }}>Delete account?</div>
            <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSecondary, lineHeight: 1.6, marginBottom: 28 }}>
              If you delete your account, you will lose your place in line, your wait history, your high five totals, and your username will become available for others to claim. You can create a new account at any time.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(false)} style={{
                flex: 1, padding: "12px 0", borderRadius: T.r,
                border: `1px solid ${T.border}`, background: "transparent",
                color: T.textSecondary, fontFamily: T.sans, fontSize: 14, fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={e => { e.target.style.borderColor = T.charcoal; e.target.style.color = T.charcoal; }}
                onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.textSecondary; }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: "12px 0", borderRadius: T.r,
                border: "none", background: "#C0392B",
                color: "#fff", fontFamily: T.sans, fontSize: 14, fontWeight: 500,
                cursor: deleting ? "wait" : "pointer",
                transition: "opacity 0.15s ease",
                opacity: deleting ? 0.6 : 1,
              }}>
                {deleting ? "..." : "Delete my account"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── AppBar ────────────────────────────────────────────────────────────────
function AppBar({ user, onLogout, onProfile, onLeaderboard, onHome, bgRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const menuItems = [
    onProfile && { label: "See profile", action: () => { onProfile(); setMenuOpen(false); } },
    onLeaderboard && { label: "Leaderboards", action: () => { onLeaderboard(); setMenuOpen(false); } },
    { label: "Log out", action: () => { onLogout(); setMenuOpen(false); } },
  ].filter(Boolean);

  return (
    <div
      onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
      onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
      style={{
        ...CARD_STYLE, borderRadius: 0,
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "auto", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderTop: "none", borderLeft: "none", borderRight: "none",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div onClick={onHome} style={{ fontFamily: T.serif, fontSize: 18, color: T.charcoal, fontWeight: 400, letterSpacing: -0.5, cursor: onHome ? "pointer" : "default" }}>The Waitlist</div>
        <div style={{ width: 1, height: 16, background: T.border }} />
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textTertiary }}>Welcome back</div>
      </div>
      <div ref={menuRef} style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6,
          border: "1px solid rgba(0,0,0,0.08)", background: menuOpen ? "rgba(0,0,0,0.03)" : "transparent",
          color: T.charcoal, fontFamily: T.sans, fontSize: 13, fontWeight: 500,
          cursor: "pointer", transition: "all 0.15s ease",
        }}>
          {user.displayName}
          <span style={{ fontSize: 10, color: T.textTertiary, transition: "transform 0.2s ease", transform: menuOpen ? "rotate(180deg)" : "rotate(0)" }}>&#9660;</span>
        </button>
        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)", minWidth: 160,
            ...CARD_STYLE, borderRadius: 10, padding: "4px",
            animation: "fadeIn 0.15s ease both", zIndex: 50,
          }}>
            {menuItems.map((item, i) => (
              <button key={i} onClick={item.action} style={{
                display: "block", width: "100%", padding: "10px 14px", border: "none", borderRadius: 7,
                background: "transparent", color: item.label === "Log out" ? T.accent : T.textPrimary,
                fontFamily: T.sans, fontSize: 13, fontWeight: 400, cursor: "pointer",
                textAlign: "left", transition: "background 0.1s ease",
              }}
                onMouseEnter={e => e.target.style.background = "rgba(0,0,0,0.04)"}
                onMouseLeave={e => e.target.style.background = "transparent"}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CongratulationsScreen ─────────────────────────────────────────────────
function CongratulationsScreen({ data, user, onRejoin, onLogout, onUserUpdate, bgRef }) {
  const [screen, setScreen] = useState("main");
  const [rejoining, setRejoining] = useState(false);
  const [spectatorUsers, setSpectatorUsers] = useState([]);

  useEffect(() => {
    if (screen !== "queue") return;
    const load = () => api("/queue").then(setSpectatorUsers).catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [screen]);

  const handleRejoin = async () => {
    setRejoining(true);
    try { await onRejoin(); } catch {}
    setRejoining(false);
  };

  if (screen === "profile") {
    return (
      <>
        <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onHome={() => setScreen("main")} bgRef={bgRef} />
        <ProfileScreen user={user} onBack={() => setScreen("main")} onUserUpdate={onUserUpdate} onDelete={onLogout} bgRef={bgRef} />
      </>
    );
  }

  if (screen === "queue") {
    return (
      <>
        <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onHome={() => setScreen("main")} bgRef={bgRef} />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
          <div style={{ width: "100%", maxWidth: 520, animation: "fadeIn 0.5s ease both" }}>
            <div
              onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
              onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
              style={{ ...CARD_STYLE, padding: 0, overflow: "visible", position: "relative", pointerEvents: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px" }}>
                <div style={{ fontFamily: T.serif, fontSize: 20, color: T.charcoal, fontWeight: 400, letterSpacing: -0.3 }}>The queue</div>
                <button onClick={handleRejoin} disabled={rejoining} style={{
                  padding: "8px 16px", borderRadius: 6, border: `1px solid ${T.accentBorder}`,
                  background: T.accentSoft, color: T.accent,
                  fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                  cursor: rejoining ? "wait" : "pointer", opacity: rejoining ? 0.6 : 1,
                }}>
                  {rejoining ? "..." : "Join the list"}
                </button>
              </div>
              <div style={{ maxHeight: 380, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: `${T.border} transparent` }}>
                {spectatorUsers.length === 0 ? (
                  <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: T.sans, fontSize: 13, color: T.textTertiary }}>Nobody in line.</div>
                ) : spectatorUsers.map((u, idx) => (
                  <QueuePerson
                    key={u.displayName}
                    name={u.displayName}
                    position={idx + 1}
                    blur={0}
                    isSelf={false}
                    delay={Math.min(idx * 25, 500)}
                    highFiveCount={u.highFiveCount || 0}
                    hasFivedToday={u.hasFivedToday || false}
                    waitingFor={u.waitingFor}
                    accumulatedWaitSeconds={u.accumulatedWaitSeconds || 0}
                  />
                ))}
              </div>
              <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.borderLight}`, borderRadius: "0 0 16px 16px" }}>
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textTertiary }}>
                  {spectatorUsers.length} {spectatorUsers.length === 1 ? "person" : "people"} in line
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onHome={null} bgRef={bgRef} />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
        <div
          onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
          onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
          style={{ width: "100%", maxWidth: 420, animation: "fadeIn 0.5s ease both", pointerEvents: "auto" }}>

          {/* Floating token */}
          {data && (
            <div style={{
              width: 180, height: 180, borderRadius: "50%",
              background: `linear-gradient(145deg, ${T.accent} 0%, #2e3238 100%)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              margin: "0 auto 36px",
              animation: "float 3s ease-in-out infinite",
              boxShadow: "0 20px 60px rgba(194,98,64,0.28), 0 6px 20px rgba(194,98,64,0.15)",
              color: "#fff",
              textAlign: "center",
              padding: 24,
              willChange: "transform",
            }}>
              <div style={{ fontFamily: T.serif, fontSize: 14, opacity: 0.8, marginBottom: 2 }}>Your</div>
              <div style={{ fontFamily: T.serif, fontSize: 40, fontStyle: "italic",fontWeight: 400, lineHeight: 1 }}>{ordinal(data.waitNumber)}</div>
              <div style={{ fontFamily: T.serif, fontSize: 14, opacity: 0.8, marginTop: 4 }}>wait is over</div>
            </div>
          )}

          {/* Stats + button card */}
          <div style={{ ...CARD_STYLE, padding: "28px 28px 32px" }}>
            {data ? (
              <>
                <div style={{ fontFamily: T.serif, fontSize: 20, color: T.charcoal, letterSpacing: -0.3, marginBottom: 20, textAlign: "center" }}>
                  How did you do?
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
                  {[
                    { label: "High fives given", value: data.highFivesGiven },
                    { label: "High fives received", value: data.highFivesReceived },
                    { label: "Total time", value: formatDuration(data.totalTimeSeconds) },
                    { label: "Cuts made", value: data.cutsMade },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: "14px 16px",
                      borderRadius: T.r,
                      border: `1px solid ${T.borderLight}`,
                      background: T.bg,
                    }}>
                      <div style={{ fontFamily: T.mono, fontSize: 22, color: T.charcoal, fontWeight: 600, marginBottom: 4 }}>
                        {value}
                      </div>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, fontWeight: 500, letterSpacing: 0.2 }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: T.serif, fontSize: 20, color: T.charcoal, letterSpacing: -0.3, marginBottom: 28, textAlign: "center" }}>
                Your wait is complete.
              </div>
            )}

            <button onClick={handleRejoin} disabled={rejoining} style={{
              width: "100%", padding: "14px 0", borderRadius: T.r,
              border: "none", cursor: rejoining ? "wait" : "pointer",
              background: T.charcoal, color: "#FFFFFF",
              fontFamily: T.sans, fontSize: 15, fontWeight: 500, letterSpacing: 0.2,
              transition: "opacity 0.15s ease, transform 0.1s ease",
              opacity: rejoining ? 0.5 : 1,
            }}
              onMouseDown={e => !rejoining && (e.target.style.transform = "scale(0.985)")}
              onMouseUp={e => e.target.style.transform = "scale(1)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}>
              {rejoining ? "..." : "Rejoin the list"}
            </button>
            <button onClick={() => setScreen("queue")} style={{
              width: "100%", padding: "12px 0", marginTop: 10, borderRadius: T.r,
              border: `1px solid ${T.border}`, cursor: "pointer",
              background: "transparent", color: T.textSecondary,
              fontFamily: T.sans, fontSize: 14, fontWeight: 400,
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
              onMouseEnter={e => { e.target.style.color = T.charcoal; e.target.style.borderColor = T.textSecondary; }}
              onMouseLeave={e => { e.target.style.color = T.textSecondary; e.target.style.borderColor = T.border; }}>
              Watch the queue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── LeaderboardsScreen ───────────────────────────────────────────────────
const LEADERBOARD_CONFIGS = [
  { key: "runsCompleted",     title: "Most runs completed",                 hasToggle: false, sub: "all time", unit: "runs" },
  { key: "highFivesGiven",    cumulativeKey: "highFivesGivenCumulative",    title: "Most high-fives given",    hasToggle: true,  unit: "given" },
  { key: "highFivesReceived", cumulativeKey: "highFivesReceivedCumulative", title: "Most high-fives received", hasToggle: true,  unit: "received" },
];

function LeaderboardsScreen({ user, onBack, bgRef }) {
  const [boards, setBoards] = useState(null);
  const [hfMode, setHfMode] = useState("cumulative");

  useEffect(() => {
    api("/leaderboards")
      .then(setBoards)
      .catch(() => setBoards({ highFivesGiven: [], highFivesReceived: [], runsCompleted: [], highFivesGivenCumulative: [], highFivesReceivedCumulative: [] }));
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
      <div
        onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
        onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
        style={{ width: "100%", maxWidth: 480, animation: "fadeIn 0.5s ease both", pointerEvents: "auto" }}>

        {/* Header */}
        <div style={{ ...CARD_STYLE, display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "14px 20px" }}>
          <button onClick={onBack} style={{
            padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "transparent",
            color: T.textSecondary, fontFamily: T.sans, fontSize: 12, cursor: "pointer", fontWeight: 500,
            transition: "all 0.15s ease",
          }}
            onMouseEnter={e => e.target.style.color = T.charcoal}
            onMouseLeave={e => e.target.style.color = T.textSecondary}>
            &larr; Back
          </button>
          <div style={{ fontFamily: T.serif, fontSize: 22, color: T.charcoal, fontWeight: 400, letterSpacing: -0.5 }}>Leaderboards</div>
        </div>

        {/* Three boards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {LEADERBOARD_CONFIGS.map(({ key, cumulativeKey, title, sub, hasToggle }) => {
            const activeKey = hasToggle ? (hfMode === "cumulative" ? cumulativeKey : key) : key;
            const activeSub = hasToggle ? (hfMode === "cumulative" ? "all time total" : "best single run") : sub;
            const entries = boards?.[activeKey] ?? null;
            return (
              <div key={key} style={{ ...CARD_STYLE, padding: 0, overflow: "hidden" }}>
                {/* Board header */}
                <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: T.serif, fontSize: 17, color: T.charcoal, fontWeight: 400, letterSpacing: -0.3 }}>{title}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, marginTop: 2 }}>{activeSub}</div>
                  </div>
                  {hasToggle && (
                    <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: 7, padding: 2, flexShrink: 0 }}>
                      {[{ label: "Cumulative", value: "cumulative" }, { label: "Single run", value: "single" }].map(opt => (
                        <button key={opt.value} onClick={() => setHfMode(opt.value)} style={{
                          padding: "5px 10px", borderRadius: 5, border: "none",
                          background: hfMode === opt.value ? "#fff" : "transparent",
                          color: hfMode === opt.value ? T.charcoal : T.textTertiary,
                          fontFamily: T.sans, fontSize: 11, fontWeight: hfMode === opt.value ? 500 : 400,
                          cursor: "pointer", transition: "all 0.15s ease",
                          boxShadow: hfMode === opt.value ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Entries */}
                {entries === null ? (
                  <div style={{ padding: "14px 20px", fontFamily: T.sans, fontSize: 13, color: T.textTertiary }}>Loading...</div>
                ) : entries.length === 0 ? (
                  <div style={{ padding: "14px 20px", fontFamily: T.sans, fontSize: 13, color: T.textTertiary }}>No entries yet.</div>
                ) : entries.map((entry, idx) => {
                  const isMe = entry.displayName === user.displayName;
                  return (
                    <div key={idx} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "11px 20px",
                      borderBottom: idx < entries.length - 1 ? `1px solid ${T.borderLight}` : "none",
                      background: isMe ? T.accentSoft : "transparent",
                    }}>
                      <div style={{ width: 22, textAlign: "right", flexShrink: 0, fontFamily: T.mono, fontSize: 11, color: T.textTertiary }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14, color: isMe ? T.charcoal : T.textPrimary, fontWeight: isMe ? 600 : 400, minWidth: 0 }}>
                        {entry.displayName}
                        {isMe && (
                          <span style={{ marginLeft: 8, fontFamily: T.mono, fontSize: 10, color: T.accent, background: T.accentSoft, padding: "2px 7px", borderRadius: 4, verticalAlign: "middle" }}>YOU</span>
                        )}
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 14, color: isMe ? T.accent : T.textSecondary, fontWeight: 600, flexShrink: 0 }}>
                        {entry.value}
                        {entry.waitNumber && (
                          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, fontWeight: 400, marginLeft: 4 }}>
                            ({ordinal(entry.waitNumber)} run)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ user, users, onLogout, onUsersUpdate, onUserUpdate, onWaitComplete, bgRef }) {
  const [tiptoe, setTiptoe] = useState(false);
  const [tiptoeAnim, setTiptoeAnim] = useState(false);
  const [cutCooldown, setCutCooldown] = useState(0);
  const [cutting, setCutting] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [screen, setScreen] = useState("queue");
  const listRef = useRef(null);
  const timerRef = useRef(null);

  const myIndex = users.findIndex(u => u.displayName === user.displayName);
  const myPosition = myIndex + 1;
  const peopleBehind = users.length - myPosition;

  // When the position-1 user changes (e.g. someone cuts to front), optimistically
  // assume they're active for 30s so the hourglass and ticking timer show immediately
  // without waiting for their first heartbeat.
  const pos1Name = users[0]?.displayName || null;
  const prevPos1NameRef = useRef(pos1Name);
  const [assumedActiveUntil, setAssumedActiveUntil] = useState(0);
  useEffect(() => {
    if (pos1Name && pos1Name !== prevPos1NameRef.current) {
      setAssumedActiveUntil(Date.now() + 30000);
    }
    prevPos1NameRef.current = pos1Name;
  }, [pos1Name]);

  // Track accumulated time locally so it survives screen changes (profile/leaderboard)
  // and isn't subject to heartbeat lag when getting cut from position 1.
  const myEntry = users.find(u => u.displayName === user.displayName);
  const SESSION_KEY = `waitlist:accumulated:${user.displayName}`;
  const [localAccumulated, _setLocalAccumulated] = useState(() => {
    const serverVal = myEntry?.accumulatedWaitSeconds || 0;
    // Only restore from sessionStorage when currently at position 1 — if we're
    // not at position 1 the server may have reset the counter and sessionStorage
    // would carry a stale inflated value into the next position-1 stint.
    if (myEntry?.position === 1) {
      const persisted = parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
      return Math.max(persisted, serverVal);
    }
    return serverVal;
  });
  const setLocalAccumulated = useCallback((valOrFn) => {
    _setLocalAccumulated(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      sessionStorage.setItem(SESSION_KEY, String(next));
      return next;
    });
  }, [SESSION_KEY]);

  // Tick locally every second while at position 1. Uses wall-clock anchoring so
  // background tab throttling doesn't cause the timer to fall behind.
  // The anchor always uses the latest confirmed server value as its base so that
  // a page refresh or new build never starts the timer from 0.
  const tickAnchorRef = useRef(null);

  // Re-anchor whenever the server gives us a value (queue refresh or heartbeat response).
  // Uses a functional update so we always see the latest local value, never a stale closure.
  const myPositionRef = useRef(myPosition);
  myPositionRef.current = myPosition;
  useEffect(() => {
    const serverVal = myEntry?.accumulatedWaitSeconds || 0;
    setLocalAccumulated(prev => {
      let next;
      if (myPositionRef.current === 1) {
        // At position 1: take max — local tick may be slightly ahead of server.
        next = Math.max(prev, serverVal);
        tickAnchorRef.current = { time: Date.now(), accumulated: next };
      } else {
        // Not at position 1: always trust the server. The server may have reset
        // accumulated_wait_seconds to 0 (e.g. after being cut), and we must not
        // carry a stale local value into the next stint at position 1.
        next = serverVal;
        if (serverVal < prev) {
          // Server reset — clear sessionStorage so a page refresh doesn't reload
          // the old inflated value.
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
      return next;
    });
  }, [myEntry?.accumulatedWaitSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start/stop the interval when position changes.
  useEffect(() => {
    if (myPosition !== 1) { tickAnchorRef.current = null; return; }
    // Seed anchor from the current server value if not already set.
    if (!tickAnchorRef.current) {
      const seed = myEntry?.accumulatedWaitSeconds || localAccumulated;
      tickAnchorRef.current = { time: Date.now(), accumulated: seed };
    }
    const id = setInterval(() => {
      if (!tickAnchorRef.current) return;
      const elapsed = Math.floor((Date.now() - tickAnchorRef.current.time) / 1000);
      setLocalAccumulated(prev => {
        const next = Math.min(tickAnchorRef.current.accumulated + elapsed, TIMER_DURATION);
        return Math.max(prev, next);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [myPosition]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the tab regains focus, check expiry immediately then fetch the queue.
  const checkExpiryRef = useRef(null);
  useEffect(() => {
    if (myPosition !== 1) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkExpiryRef.current?.();
        api("/queue").then(onUsersUpdate).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [myPosition, onUsersUpdate]);

  const getBlur = useCallback((idx) => {
    if (idx <= 2) return 0;
    const dist = Math.abs(idx - myIndex);
    if (dist === 0) return 0;
    if (tiptoe) {
      if (dist <= 2) return 0;
      if (dist <= 4) return 3;
      if (dist <= 5) return 5;
      return 9;
    } else {
      if (dist <= 1) return 0;
      if (dist <= 2) return 4;
      if (dist <= 4) return 7;
      return 10;
    }
  }, [myIndex, tiptoe]);

  const startCooldown = useCallback((seconds) => {
    setCutCooldown(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCutCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Heartbeat: advance the server-side active-time counter while logged in at position 1.
  // Gated on myPosition (not users) so the 5s queue poll doesn't reset the interval
  // before it has a chance to fire.
  useEffect(() => {
    if (myPosition !== 1) return;
    const id = setInterval(() => {
      api("/heartbeat", { method: "POST", body: JSON.stringify({ seconds: 10 }) })
        .then(({ accumulatedWaitSeconds }) => {
          if (typeof accumulatedWaitSeconds === "number") {
            setLocalAccumulated(prev => {
              const next = Math.max(prev, accumulatedWaitSeconds);
              if (myPositionRef.current === 1) {
                tickAnchorRef.current = { time: Date.now(), accumulated: next };
              }
              return next;
            });
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, [myPosition]);

  // Poll every 5s at position 1 (cut detection) or position 2 (completion detection).
  useEffect(() => {
    if (myPosition !== 1 && myPosition !== 2) return;
    const id = setInterval(() => {
      api("/queue").then(onUsersUpdate).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [myPosition, onUsersUpdate]);

  const handleWaitExpire = useCallback(async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const data = await api("/complete-wait", { method: "POST" });
        onWaitComplete(data);
        return;
      } catch (err) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000));
        } else {
          console.warn("complete-wait failed after retries:", err.message);
        }
      }
    }
  }, [onWaitComplete]);

  // At 5s remaining, do one early queue poll to confirm position before completion.
  const earlyPollFiredRef = useRef(false);
  useEffect(() => {
    if (myPosition !== 1) { earlyPollFiredRef.current = false; return; }
    if (localAccumulated >= TIMER_DURATION - 5 && !earlyPollFiredRef.current) {
      earlyPollFiredRef.current = true;
      api("/queue").then(onUsersUpdate).catch(() => {});
    }
  }, [localAccumulated, myPosition, onUsersUpdate]);

  // Central expiry check — called from multiple places. Uses refs so it's always
  // current without needing to be in effect dependency arrays.
  const waitExpiredRef = useRef(false);
  const handleWaitExpireRef = useRef(null);
  handleWaitExpireRef.current = handleWaitExpire;
  const localAccumulatedRef = useRef(localAccumulated);
  localAccumulatedRef.current = localAccumulated;
  const checkExpiry = useCallback(() => {
    if (myPositionRef.current !== 1) return;
    if (localAccumulatedRef.current >= TIMER_DURATION && !waitExpiredRef.current) {
      waitExpiredRef.current = true;
      handleWaitExpireRef.current();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  checkExpiryRef.current = checkExpiry;

  // Fire whenever localAccumulated ticks up or position changes.
  useEffect(() => {
    if (myPosition !== 1) { waitExpiredRef.current = false; return; }
    checkExpiry();
  }, [localAccumulated, myPosition, checkExpiry]);

  // Also fire on mount (covers page refresh with timer already at 0 in sessionStorage).
  useEffect(() => {
    checkExpiry();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCut = async () => {
    if (cutCooldown > 0 || cutting || myPosition <= 1) return;
    setCutting(true);

    const phrase = POLITE_PHRASES[Math.floor(Math.random() * POLITE_PHRASES.length)];
    setBubble(phrase);

    const apiPromise = api("/cut", { method: "POST" })
      .then(async ({ user: updatedUser }) => {
        const queue = await api("/queue");
        return { updatedUser, queue };
      });

    const [result] = await Promise.allSettled([
      apiPromise,
      new Promise(r => setTimeout(r, 1000)),
    ]);

    setBubble(null);

    if (result.status === "fulfilled") {
      onUserUpdate(result.value.updatedUser);
      onUsersUpdate(result.value.queue);
      startCooldown(3);
    } else {
      const match = result.reason?.message?.match(/Wait (\d+)s/);
      if (match) startCooldown(parseInt(match[1]));
    }
    setCutting(false);
  };

  const handleTiptoe = () => {
    setTiptoe(t => !t);
    setTiptoeAnim(true);
    setTimeout(() => setTiptoeAnim(false), 500);
  };

  useEffect(() => {
    if (listRef.current) {
      const target = listRef.current.children[myIndex];
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
    }
  }, [myIndex]);

  if (screen === "profile") {
    return (
      <>
        <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onLeaderboard={() => setScreen("leaderboard")} onHome={() => setScreen("queue")} bgRef={bgRef} />
        <ProfileScreen user={user} onBack={() => setScreen("queue")} onUserUpdate={onUserUpdate} onDelete={onLogout} bgRef={bgRef} />
      </>
    );
  }

  if (screen === "leaderboard") {
    return (
      <>
        <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onLeaderboard={() => setScreen("leaderboard")} onHome={() => setScreen("queue")} bgRef={bgRef} />
        <LeaderboardsScreen user={user} onBack={() => setScreen("queue")} bgRef={bgRef} />
      </>
    );
  }

  return (
    <>
      <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onLeaderboard={() => setScreen("leaderboard")} onHome={() => setScreen("queue")} bgRef={bgRef} />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 520, animation: "fadeIn 0.5s ease both" }}>

          <div
            onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
            onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
            style={{ ...CARD_STYLE, padding: 0, overflow: "visible", position: "relative", pointerEvents: "auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px" }}>
              <div style={{ fontFamily: T.serif, fontSize: 20, color: T.charcoal, fontWeight: 400, letterSpacing: -0.3 }}>You are {ordinal(myPosition)} in line</div>
              <div style={{ display: "flex", gap: 8 }}>
                {myPosition > 1 && (
                  <button onClick={handleCut} disabled={cutCooldown > 0 || cutting} style={{
                    padding: "8px 16px", borderRadius: 6, position: "relative", overflow: "hidden",
                    border: `1px solid ${cutCooldown > 0 ? "rgba(0,0,0,0.06)" : T.accentBorder}`,
                    background: cutCooldown > 0 ? "rgba(0,0,0,0.03)" : T.accentSoft,
                    color: cutCooldown > 0 ? T.textTertiary : T.accent,
                    fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                    cursor: cutCooldown > 0 || cutting ? "default" : "pointer",
                    transition: "all 0.25s ease", minWidth: 80,
                  }}>
                    {cutCooldown > 0 && (
                      <div style={{
                        position: "absolute", left: 0, bottom: 0, height: 2,
                        background: T.accent, opacity: 0.3,
                        width: `${(cutCooldown / 3) * 100}%`,
                        transition: "width 1s linear",
                      }} />
                    )}
                    {cutting ? "..." : cutCooldown > 0 ? `${cutCooldown}s` : "Cut"}
                  </button>
                )}
                <button onClick={handleTiptoe} style={{
                  padding: "8px 16px", borderRadius: 6,
                  border: `1px solid ${tiptoe ? T.accentBorder : "rgba(0,0,0,0.08)"}`,
                  background: tiptoe ? T.accentSoft : "transparent",
                  color: tiptoe ? T.accent : T.textSecondary,
                  fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.25s ease",
                  transform: tiptoeAnim ? "translateY(-2px)" : "translateY(0)",
                }}
                  onMouseEnter={e => { if (!tiptoe) e.target.style.color = T.charcoal; }}
                  onMouseLeave={e => { if (!tiptoe) e.target.style.color = T.textSecondary; }}>
                  {tiptoe ? "On tiptoes ↑" : "Stand on tiptoes"}
                </button>
              </div>
            </div>

            {/* Queue list */}
            <div ref={listRef} style={{ maxHeight: 380, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: `${T.border} transparent` }}>
              {users.map((u, idx) => (
                <QueuePerson
                  key={u.displayName}
                  name={u.displayName}
                  position={idx + 1}
                  blur={getBlur(idx)}
                  isSelf={u.displayName === user.displayName}
                  delay={Math.min(idx * 25, 500)}
                  highFiveCount={u.highFiveCount || 0}
                  hasFivedToday={u.hasFivedToday || false}
                  waitingFor={u.waitingFor}
                  accumulatedWaitSeconds={u.displayName === user.displayName ? localAccumulated : (u.accumulatedWaitSeconds || 0)}
                  lastHeartbeat={u.lastHeartbeat || null}
                  assumedActive={idx === 0 && Date.now() < assumedActiveUntil}
                  onFive={() => api("/queue").then(onUsersUpdate).catch(() => {})}
                />
              ))}
            </div>
            {bubble && <SpeechBubble text={bubble} listRef={listRef} myIndex={myIndex} />}

            {/* Footer stats */}
            <div style={{
              padding: "12px 24px", borderTop: `1px solid ${T.borderLight}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderRadius: "0 0 16px 16px",
            }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textTertiary }}>
                {users.length} {users.length === 1 ? "person" : "people"} in line
              </span>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textTertiary }}>
                {peopleBehind} behind you
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onboarding, setOnboarding] = useState(false);
  const [congratulationsData, setCongratulationsData] = useState(null);
  const bgRef = useRef(null);
  const [referrer] = useState(() => new URLSearchParams(window.location.search).get("ref") || null);

  useEffect(() => {
    if (_token) {
      Promise.all([api("/me"), api("/queue")])
        .then(([user, queue]) => {
          setCurrentUser(user);
          setAllUsers(queue);
          // Restore congratulations screen if user completed a wait and hasn't rejoined
          if (user.inQueue === false && user.lastCompletion) {
            setCongratulationsData(user.lastCompletion);
          }
        })
        .catch(() => setToken(null))
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textTertiary, animation: "pulse 1.5s ease infinite" }}>Loading...</div>
    </div>
  );

  const handleAuth = (u, all) => {
    if (window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setCurrentUser(u);
    setAllUsers(all);
    if (!u.waitingFor) setOnboarding(true);
  };

  const handleOnboardingComplete = (updatedUser) => {
    if (updatedUser) setCurrentUser(updatedUser);
    setOnboarding(false);
  };

  const clearAccumulatedSession = (name) => {
    sessionStorage.removeItem(`waitlist:accumulated:${name}`);
  };

  const handleWaitComplete = (data) => {
    setCongratulationsData(data);
    setCurrentUser(u => { clearAccumulatedSession(u.displayName); return { ...u, inQueue: false, position: null }; });
  };

  const handleRejoin = async () => {
    const { user: updated } = await api("/rejoin", { method: "POST" });
    const queue = await api("/queue");
    clearAccumulatedSession(updated.displayName);
    setCurrentUser(updated);
    setAllUsers(queue);
    setCongratulationsData(null);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setAllUsers([]);
    setOnboarding(false);
    setCongratulationsData(null);
  };

  let content;
  if (!currentUser) {
    content = <AuthScreen bgRef={bgRef} onAuth={handleAuth} referrer={referrer} />;
  } else if (onboarding) {
    content = <OnboardingScreen bgRef={bgRef} onComplete={handleOnboardingComplete} />;
  } else if (congratulationsData || currentUser.inQueue === false) {
    content = (
      <CongratulationsScreen
        data={congratulationsData}
        user={currentUser}
        onRejoin={handleRejoin}
        onLogout={handleLogout}
        onUserUpdate={setCurrentUser}
        bgRef={bgRef}
      />
    );
  } else {
    content = (
      <Dashboard
        user={currentUser}
        users={allUsers}
        onLogout={handleLogout}
        onUserUpdate={setCurrentUser}
        onUsersUpdate={setAllUsers}
        onWaitComplete={handleWaitComplete}
        bgRef={bgRef}
      />
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: rgba(194,98,64,0.12); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bubblePop { from { opacity: 0; transform: translateY(-100%) scale(0.6); } to { opacity: 1; transform: translateY(-100%) scale(1); } }
        @keyframes bubbleFade { from { opacity: 1; transform: translateY(-100%) scale(1); } to { opacity: 0; transform: translateY(-100%) scale(0.8) translateY(4px); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes hfBurst {
          0% { opacity: 1; height: 6px; translate: 0 0; }
          100% { opacity: 0; height: 2px; translate: 0 -14px; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes hourglassFlip {
          0%    { transform: rotate(0deg);   }
          37.5% { transform: rotate(0deg);   }
          50%   { transform: rotate(180deg); }
          87.5% { transform: rotate(180deg); }
          100%  { transform: rotate(360deg); }
        }
        @keyframes sandDripDown {
          0%   { transform: translateY(0px); opacity: 1; }
          70%  { transform: translateY(6px); opacity: 1; }
          85%  { transform: translateY(6px); opacity: 0; }
          100% { transform: translateY(0px); opacity: 0; }
        }
        @keyframes sandDripUp {
          0%   { transform: translateY(0px);  opacity: 1; }
          70%  { transform: translateY(-6px); opacity: 1; }
          85%  { transform: translateY(-6px); opacity: 0; }
          100% { transform: translateY(0px);  opacity: 0; }
        }
        @keyframes showUpright {
          0%,  35%  { opacity: 1; }
          38%, 100% { opacity: 0; }
        }
        @keyframes showFlipped {
          0%,  52%  { opacity: 0; }
          55%, 85%  { opacity: 1; }
          88%, 100% { opacity: 0; }
        }
        input::placeholder { color: #B3B1A9; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDDBD7; border-radius: 3px; }
      `}</style>
      <ThreeBackground ref={bgRef} />
      {content}
    </>
  );
}

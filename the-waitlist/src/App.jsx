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

function HighFiveButton({ name, isSelf, highFiveCount }) {
  const [count, setCount] = useState(highFiveCount);
  const [fived, setFived] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => { setCount(highFiveCount); }, [highFiveCount]);

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
        onMouseEnter={() => setTooltip(true)}
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
          You can give a person a high five once a day
        </div>
      )}
    </div>
  );
}

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

function QueuePerson({ name, position, blur, isSelf, delay, highFiveCount, waitingFor }) {
  const [showCard, setShowCard] = useState(false);
  const nameRef = useRef(null);

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
      <div style={{ width: 4, height: 4, borderRadius: "50%", flexShrink: 0, background: isSelf ? T.accent : T.border }} />
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
      <div style={{ visibility: blur === 0 ? "visible" : "hidden" }}>
        <HighFiveButton name={name} isSelf={isSelf} highFiveCount={highFiveCount} />
      </div>
      {showCard && <UserCard name={name} waitingFor={waitingFor} position={position} onClose={() => setShowCard(false)} anchorRef={nameRef} />}
    </div>
  );
}

function SpeechBubble({ text, listRef, myIndex }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!listRef.current || myIndex < 0) return;
    const row = listRef.current.children[myIndex];
    if (!row) return;
    const listRect = listRef.current.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    setPos({
      top: rowRect.top - listRect.top - 10,
    });
  }, [listRef, myIndex]);

  if (!pos) return null;

  return (
    <div style={{
      position: "absolute",left: "50%", top: pos.top,
      translate: "-50%",
      //transform: "translateX(-100%) translateY(-100%)",
      background: "#FDFCFB", color: T.textPrimary,
      fontFamily: T.serif, fontSize: 26,
      padding: "12px 22px", borderRadius: 12,
      lineHeight: 1.3,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      border: `1px solid ${T.borderLight}`,
      animation: "bubblePop 0.35s cubic-bezier(.34,1.56,.64,1) both",
      zIndex: 30, whiteSpace: "nowrap", pointerEvents: "none",
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

function AuthScreen({ onAuth, bgRef }) {
  const [mode, setMode] = useState("login");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (!displayName.trim() || !password.trim()) { setError("All fields are required."); setLoading(false); return; }
      if (!/^[a-zA-Z0-9]+$/.test(password)) { setError("Password must contain only letters and numbers."); setLoading(false); return; }
      if (!/[a-zA-Z]/.test(password)) { setError("Password must contain at least 1 letter."); setLoading(false); return; }
      if (mode === "signup") {
        if (password.length < 4) { setError("Password must be at least 4 characters."); setLoading(false); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }
        const { user, token } = await api("/signup", { method: "POST", body: JSON.stringify({ displayName: displayName.trim(), password }) });
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
        {/* Masthead */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: T.serif, fontSize: 12, fontStyle: "italic", color: T.textTertiary, letterSpacing: 0.5, marginBottom: 10 }}>est. 2026</div>
          <div style={{ fontFamily: T.serif, fontSize: 44, color: T.charcoal, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1 }}>The Waitlist</div>
          <div style={{ width: 40, height: 1, background: T.charcoal, margin: "16px auto 16px", opacity: 0.15 }} />
          <div style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", color: T.charcoal, letterSpacing: 0.5, lineHeight: 1 }}>Good things come to those who wait.</div>
        </div>

        {/* Tabs */}
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

        {/* Fields */}
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

const CARD_STYLE = {
  background: "rgba(255, 255, 255, 0.97)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 16,
  border: "1px solid rgba(255, 255, 255, 0.6)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
};

function OnboardingScreen({ onComplete, bgRef }) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const updated = await api("/profile", { method: "PATCH", body: JSON.stringify({ waitingFor: answer.trim() || "nothing" }) });
      onComplete(updated);
    } catch { onComplete(null); }
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
        <input value={answer} onChange={e => setAnswer(e.target.value)} style={inputStyle}
          placeholder="'nothing' is a perfectly fine answer"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />

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

function ProfileScreen({ user, onBack, onUserUpdate, onDelete, bgRef }) {
  const [answer, setAnswer] = useState(user.waitingFor || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api("/account", { method: "DELETE" });
      onDelete();
    } catch {}
    setDeleting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api("/profile", { method: "PATCH", body: JSON.stringify({ waitingFor: answer.trim() }) });
      onUserUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
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
          <input value={answer} onChange={e => setAnswer(e.target.value)} style={inputStyle}
            placeholder="'nothing' is a perfectly fine answer"
            onKeyDown={e => e.key === "Enter" && handleSave()}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
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

        <div style={{ marginTop: 16, borderTop: `1px solid ${T.borderLight}`, paddingTop: 16 }}>
          <button onClick={() => setConfirmDelete(true)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
            fontFamily: T.sans, fontSize: 13, color: T.textTertiary, fontWeight: 500,
            transition: "color 0.15s ease",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#C0392B"}
            onMouseLeave={e => e.currentTarget.style.color = T.textTertiary}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h10M5 4V2.5A.5.5 0 0 1 5.5 2h3a.5.5 0 0 1 .5.5V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5A.5.5 0 0 0 4.2 12h5.6a.5.5 0 0 0 .5-.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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
            If you delete your account, you will lose your place in line, your high five total, and your username will become available for others to claim. You can create a new account at any time.
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

function AppBar({ user, onLogout, onProfile, onHome, bgRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

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
            {[
              { label: "See profile", action: () => { onProfile(); setMenuOpen(false); } },
              { label: "Log out", action: () => { onLogout(); setMenuOpen(false); } },
            ].map((item, i) => (
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

function Dashboard({ user, users, onLogout, onUsersUpdate, onUserUpdate, bgRef }) {
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

  const getBlur = useCallback((idx) => {
    // Always show the first 3 spots clearly
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
      startCooldown(10);
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
        <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onHome={() => setScreen("queue")} bgRef={bgRef} />
        <ProfileScreen user={user} onBack={() => setScreen("queue")} onUserUpdate={onUserUpdate} onDelete={onLogout} bgRef={bgRef} />
      </>
    );
  }

  return (
    <>
    <AppBar user={user} onLogout={onLogout} onProfile={() => setScreen("profile")} onHome={() => setScreen("queue")} bgRef={bgRef} />
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 88, position: "relative", zIndex: 1, pointerEvents: "none" }}>
      <div style={{ width: "100%", maxWidth: 520, animation: "fadeIn 0.5s ease both" }}>

        {/* Queue card */}
        <div
          onMouseOver={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = false; }}
          onMouseLeave={() => { if (bgRef?.current?.controls) bgRef.current.controls.enabled = true; }}
          style={{ ...CARD_STYLE, padding: 0, overflow: "visible", position: "relative", pointerEvents: "auto" }}>
          {/* Line header */}
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
                      width: `${(cutCooldown / 10) * 100}%`,
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
              <QueuePerson key={u.displayName} name={u.displayName} position={idx + 1}
                blur={getBlur(idx)} isSelf={u.displayName === user.displayName} delay={Math.min(idx * 25, 500)}
                highFiveCount={u.highFiveCount || 0} waitingFor={u.waitingFor} />
            ))}
          </div>
          {bubble && <SpeechBubble text={bubble} listRef={listRef} myIndex={myIndex} />}

          {/* Bottom stats bar */}
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

export default function App() {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onboarding, setOnboarding] = useState(false);
  const bgRef = useRef(null);

  useEffect(() => {
    if (_token) {
      Promise.all([api("/me"), api("/queue")])
        .then(([user, queue]) => { setCurrentUser(user); setAllUsers(queue); })
        .catch(() => { setToken(null); })
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
    setCurrentUser(u);
    setAllUsers(all);
    if (!u.waitingFor) setOnboarding(true);
  };

  const handleOnboardingComplete = (updatedUser) => {
    if (updatedUser) setCurrentUser(updatedUser);
    setOnboarding(false);
  };

  let content;
  if (!currentUser) {
    content = <AuthScreen bgRef={bgRef} onAuth={handleAuth} />;
  } else if (onboarding) {
    content = <OnboardingScreen bgRef={bgRef} onComplete={handleOnboardingComplete} />;
  } else {
    content = <Dashboard user={currentUser} users={allUsers}
      onLogout={() => { setToken(null); setCurrentUser(null); setAllUsers([]); setOnboarding(false); }}
      onUserUpdate={setCurrentUser}
      onUsersUpdate={setAllUsers}
      bgRef={bgRef} />;
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

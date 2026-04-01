import { useState, useEffect, useCallback, useRef } from "react";
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
  "Forgive the impertinence, but may I?",
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

function QueuePerson({ name, position, blur, isSelf, delay }) {
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
      }}>
        {name}
        {isSelf && (
          <span style={{
            marginLeft: 8, fontFamily: T.mono, fontSize: 10,
            color: T.accent, fontWeight: 500,
            background: T.accentSoft, padding: "2px 7px",
            borderRadius: 4, verticalAlign: "middle",
          }}>YOU</span>
        )}
      </div>
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
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
        padding: "40px 32px",
      }}>
        {/* Masthead */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: T.serif, fontSize: 13, fontStyle: "italic", color: T.textTertiary, letterSpacing: 0.5, marginBottom: 10 }}>est. 2026</div>
          <div style={{ fontFamily: T.serif, fontSize: 44, color: T.charcoal, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1 }}>The Waitlist</div>
          <div style={{ width: 40, height: 1, background: T.charcoal, margin: "16px auto 0", opacity: 0.15 }} />
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

function Dashboard({ user, users, onLogout, onUsersUpdate, onUserUpdate }) {
  const [tiptoe, setTiptoe] = useState(false);
  const [tiptoeAnim, setTiptoeAnim] = useState(false);
  const [cutCooldown, setCutCooldown] = useState(0);
  const [cutting, setCutting] = useState(false);
  const [bubble, setBubble] = useState(null);
  const listRef = useRef(null);
  const timerRef = useRef(null);

  const myIndex = users.findIndex(u => u.displayName === user.displayName);
  const myPosition = myIndex + 1;
  const peopleBehind = users.length - myPosition;

  const getBlur = useCallback((idx) => {
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

    // Pick a random phrase and show the speech bubble
    const phrase = POLITE_PHRASES[Math.floor(Math.random() * POLITE_PHRASES.length)];
    setBubble(phrase);

    // Fire the API call in parallel with the bubble display
    const apiPromise = api("/cut", { method: "POST" })
      .then(async ({ user: updatedUser }) => {
        const queue = await api("/queue");
        return { updatedUser, queue };
      });

    // Wait at least 1s for the bubble to display, then animate the reorder
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

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Nav */}
      <div style={{
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10, background: T.bg,
      }}>
        <div style={{ fontFamily: T.serif, fontSize: 20, color: T.charcoal, fontWeight: 400, letterSpacing: -0.5 }}>The Waitlist</div>
        <button onClick={onLogout} style={{
          padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent",
          color: T.textSecondary, fontFamily: T.sans, fontSize: 12, cursor: "pointer", fontWeight: 500, transition: "all 0.15s ease",
        }}
          onMouseEnter={e => { e.target.style.borderColor = T.textTertiary; e.target.style.color = T.charcoal; }}
          onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.textSecondary; }}>Log out</button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 28px 0", animation: "fadeIn 0.5s ease both" }}>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textTertiary, fontWeight: 500, letterSpacing: 0.5, marginBottom: 4 }}>Welcome back,</div>
        <div style={{ fontFamily: T.serif, fontSize: 36, color: T.charcoal, fontWeight: 400, letterSpacing: -1, marginBottom: 32 }}>{user.displayName}</div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 1, borderRadius: T.r, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 20 }}>
          {[
            { label: "Your position", value: myPosition },
            { label: "In line", value: users.length },
            { label: "Behind you", value: peopleBehind },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "20px 16px", background: T.surface,
              borderRight: i < 2 ? `1px solid ${T.borderLight}` : "none", textAlign: "center",
              animation: `fadeIn 0.4s ease ${150 + i * 80}ms both`,
            }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: T.serif, fontSize: 32, color: T.charcoal, fontWeight: 400, letterSpacing: -1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Message */}
        <div style={{
          padding: "14px 18px", borderRadius: T.r, background: T.surface, border: `1px solid ${T.border}`,
          fontFamily: T.sans, fontSize: 14, color: T.textSecondary, lineHeight: 1.5, marginBottom: 36,
          animation: "fadeIn 0.4s ease 500ms both",
        }}>
          {peopleBehind > 0
            ? <>There {peopleBehind === 1 ? "is" : "are"} <strong style={{ color: T.charcoal, fontWeight: 600 }}>{peopleBehind}</strong> {peopleBehind === 1 ? "person" : "people"} in line behind you.</>
            : <>You're the last one in line — no one behind you yet.</>
          }
        </div>

        {/* Line header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: T.serif, fontSize: 20, color: T.charcoal, fontWeight: 400, letterSpacing: -0.3 }}>The line</div>
          <div style={{ display: "flex", gap: 8 }}>
            {myPosition > 1 && (
              <button onClick={handleCut} disabled={cutCooldown > 0 || cutting} style={{
                padding: "8px 16px", borderRadius: 6, position: "relative", overflow: "hidden",
                border: `1px solid ${cutCooldown > 0 ? T.borderLight : T.accentBorder}`,
                background: cutCooldown > 0 ? T.bg : T.accentSoft,
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
              border: `1px solid ${tiptoe ? T.accentBorder : T.border}`,
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

        {/* Queue */}
        <div style={{ borderRadius: T.r, border: `1px solid ${T.border}`, background: T.surface, overflow: "visible", marginBottom: 40, position: "relative" }}>
          <div ref={listRef} style={{ maxHeight: 440, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: `${T.border} transparent`, borderRadius: T.r }}>
            {users.map((u, idx) => (
              <QueuePerson key={u.displayName} name={u.displayName} position={idx + 1}
                blur={getBlur(idx)} isSelf={u.displayName === user.displayName} delay={Math.min(idx * 25, 500)} />
            ))}
          </div>
          {bubble && <SpeechBubble text={bubble} listRef={listRef} myIndex={myIndex} />}
        </div>

        <div style={{ textAlign: "center", paddingBottom: 32 }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.textTertiary, letterSpacing: 0.5 }}>
            Joined {new Date(user.signupTime).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
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
        input::placeholder { color: #B3B1A9; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDDBD7; border-radius: 3px; }
      `}</style>
      {currentUser
        ? <Dashboard user={currentUser} users={allUsers}
            onLogout={() => { setToken(null); setCurrentUser(null); setAllUsers([]); }}
            onUserUpdate={setCurrentUser}
            onUsersUpdate={setAllUsers} />
        : <>
            <ThreeBackground ref={bgRef} />
            <AuthScreen bgRef={bgRef} onAuth={(u, all) => { setCurrentUser(u); setAllUsers(all); }} />
          </>
      }
    </>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";

// ── Storage helpers (simulates MongoDB persistence) ──────────────────────
const DB = {
  async getUsers() {
    try {
      const r = localStorage.getItem("waitlist:users");
      return r ? JSON.parse(r) : [];
    } catch { return []; }
  },
  async saveUsers(users) {
    localStorage.setItem("waitlist:users", JSON.stringify(users));
  },
  async addUser(user) {
    const users = await this.getUsers();
    users.push({ ...user, position: users.length + 1, signupTime: new Date().toISOString() });
    await this.saveUsers(users);
    return users;
  },
  async authenticate(email, password) {
    const users = await this.getUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  }
};

const SEED_NAMES = [
  "ghostpixel", "neondrift", "quietstorm", "velvetbyte", "cosmicdust",
  "ironpetal", "glitchfawn", "mosscircuit", "lunarthread", "deepcoral",
  "ashenvault", "prismwalker", "frostloom", "coppervine", "duskecho",
  "solarflint", "mistweaver", "emberknot", "tidelock", "sparkgrain",
  "hollowpine", "riftsong", "cloudanvil", "petalwire", "nightbloom"
];

async function ensureSeeded() {
  const users = await DB.getUsers();
  if (users.length >= 10) return;
  const seeded = SEED_NAMES.map((name, i) => ({
    displayName: name,
    email: `${name}@demo.io`,
    password: "demo",
    position: i + 1,
    signupTime: new Date(Date.now() - (SEED_NAMES.length - i) * 3600000).toISOString()
  }));
  await DB.saveUsers(seeded);
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

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!displayName.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); setLoading(false); return; }
        if (password.length < 4) { setError("Password must be at least 4 characters."); setLoading(false); return; }
        const users = await DB.getUsers();
        if (users.find(u => u.email === email)) { setError("This email is already registered."); setLoading(false); return; }
        if (users.find(u => u.displayName.toLowerCase() === displayName.trim().toLowerCase())) { setError("This display name is taken."); setLoading(false); return; }
        const updated = await DB.addUser({ displayName: displayName.trim(), email, password });
        onAuth(updated[updated.length - 1], updated);
      } else {
        if (!email.trim() || !password.trim()) { setError("Email and password are required."); setLoading(false); return; }
        const user = await DB.authenticate(email, password);
        if (!user) { setError("Invalid email or password."); setLoading(false); return; }
        onAuth(user, await DB.getUsers());
      }
    } catch { setError("Something went wrong."); }
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, animation: "fadeIn 0.5s ease both" }}>
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
          {mode === "signup" && (
            <div>
              <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 5, display: "block", letterSpacing: 0.3 }}>Display name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
            </div>
          )}
          <div>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 5, display: "block", letterSpacing: 0.3 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
          </div>
          <div>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 5, display: "block", letterSpacing: 0.3 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
          </div>
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

function Dashboard({ user, users, onLogout }) {
  const [tiptoe, setTiptoe] = useState(false);
  const [tiptoeAnim, setTiptoeAnim] = useState(false);
  const listRef = useRef(null);

  const myIndex = users.findIndex(u => u.email === user.email);
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

        {/* Queue */}
        <div style={{ borderRadius: T.r, border: `1px solid ${T.border}`, background: T.surface, overflow: "hidden", marginBottom: 40 }}>
          <div ref={listRef} style={{ maxHeight: 440, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${T.border} transparent` }}>
            {users.map((u, idx) => (
              <QueuePerson key={u.email} name={u.displayName} position={idx + 1}
                blur={getBlur(idx)} isSelf={u.email === user.email} delay={Math.min(idx * 25, 500)} />
            ))}
          </div>
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

  useEffect(() => { ensureSeeded().then(() => setReady(true)); }, []);

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
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        input::placeholder { color: #B3B1A9; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDDBD7; border-radius: 3px; }
      `}</style>
      {currentUser
        ? <Dashboard user={currentUser} users={allUsers} onLogout={() => { setCurrentUser(null); setAllUsers([]); }} />
        : <AuthScreen onAuth={(u, all) => { setCurrentUser(u); setAllUsers(all); }} />
      }
    </>
  );
}

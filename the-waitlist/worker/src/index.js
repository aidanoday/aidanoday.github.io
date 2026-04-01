// ── Crypto helpers (Web Crypto API) ──────────────────────────────────────

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  salt = salt || crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const hashArr = Array.from(new Uint8Array(bits));
  const saltArr = Array.from(salt instanceof Uint8Array ? salt : new Uint8Array(salt));
  return saltArr.map(b => b.toString(16).padStart(2, "0")).join("") + ":" + hashArr.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password, stored) {
  const [saltHex, _hashHex] = stored.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const result = await hashPassword(password, salt);
  return result === stored;
}

async function createToken(userId, env) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`));
  const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.${sigStr}`;
}

async function verifyToken(token, env) {
  try {
    const [header, payload, sig] = token.split(".");
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    // Restore base64 padding
    const sigRestored = sig.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - sig.length % 4) % 4);
    const sigBuf = Uint8Array.from(atob(sigRestored), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(`${header}.${payload}`));
    if (!valid) return null;
    const data = JSON.parse(atob(payload));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Response helpers ─────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function cors(response, origin) {
  const allowed = ["https://aidanoday.me", "https://aidanoday.github.io", "http://localhost:5173", "http://localhost:4173"];
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// ── Auth middleware ──────────────────────────────────────────────────────

async function getAuthUser(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const payload = await verifyToken(auth.slice(7), env);
  if (!payload) return null;
  return await env.DB.prepare("SELECT id, display_name, position, signup_time FROM users WHERE id = ?").bind(payload.sub).first();
}

// ── Routes ───────────────────────────────────────────────────────────────

async function handleSignup(request, env) {
  const { displayName, password } = await request.json();

  if (!displayName?.trim() || !password) {
    return json({ error: "All fields are required." }, 400);
  }
  if (password.length < 4) {
    return json({ error: "Password must be at least 4 characters." }, 400);
  }

  const existingName = await env.DB.prepare("SELECT id FROM users WHERE lower(display_name) = lower(?)").bind(displayName.trim()).first();
  if (existingName) return json({ error: "This display name is taken." }, 409);

  // Get next position
  const { max_pos } = await env.DB.prepare("SELECT COALESCE(MAX(position), 0) as max_pos FROM users").first();
  const position = max_pos + 1;

  const passwordHash = await hashPassword(password);
  const signupTime = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO users (display_name, password_hash, position, signup_time) VALUES (?, ?, ?, ?)"
  ).bind(displayName.trim(), passwordHash, position, signupTime).run();

  const user = await env.DB.prepare("SELECT id, display_name, position, signup_time FROM users WHERE lower(display_name) = lower(?)").bind(displayName.trim()).first();
  const token = await createToken(user.id, env);

  return json({ user: formatUser(user), token });
}

async function handleLogin(request, env) {
  const { displayName, password } = await request.json();

  if (!displayName?.trim() || !password) {
    return json({ error: "Display name and password are required." }, 400);
  }

  const user = await env.DB.prepare("SELECT * FROM users WHERE lower(display_name) = lower(?)").bind(displayName.trim()).first();
  if (!user) return json({ error: "Invalid display name or password." }, 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return json({ error: "Invalid display name or password." }, 401);

  const token = await createToken(user.id, env);
  return json({
    user: formatUser(user),
    token,
  });
}

async function handleQueue(env) {
  const { results } = await env.DB.prepare("SELECT display_name, position FROM users ORDER BY position ASC").all();
  return json(results.map(r => ({ displayName: r.display_name, position: r.position })));
}

async function handleCut(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  if (user.position <= 1) return json({ error: "You're already first in line." }, 400);

  // Check cooldown (1 minute)
  const lastCut = await env.DB.prepare("SELECT last_cut FROM users WHERE id = ?").bind(user.id).first();
  if (lastCut?.last_cut) {
    const elapsed = Date.now() - new Date(lastCut.last_cut).getTime();
    if (elapsed < 10000) {
      const remaining = Math.ceil((10000 - elapsed) / 1000);
      return json({ error: `Wait ${remaining}s before cutting again.`, cooldown: remaining }, 429);
    }
  }

  // Swap with the person ahead
  const ahead = await env.DB.prepare("SELECT id, position FROM users WHERE position = ?").bind(user.position - 1).first();
  if (!ahead) return json({ error: "No one ahead to cut." }, 400);

  await env.DB.batch([
    env.DB.prepare("UPDATE users SET position = ?, last_cut = ? WHERE id = ?").bind(user.position - 1, new Date().toISOString(), user.id),
    env.DB.prepare("UPDATE users SET position = ? WHERE id = ?").bind(user.position, ahead.id),
  ]);

  const updated = await env.DB.prepare("SELECT id, display_name, position, signup_time FROM users WHERE id = ?").bind(user.id).first();
  return json({ user: formatUser(updated) });
}

async function handleMe(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  return json(formatUser(user));
}

function formatUser(row) {
  return {
    displayName: row.display_name,
    position: row.position,
    signupTime: row.signup_time,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), origin);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    let response;
    try {
      if (path === "/signup" && request.method === "POST") {
        response = await handleSignup(request, env);
      } else if (path === "/login" && request.method === "POST") {
        response = await handleLogin(request, env);
      } else if (path === "/queue" && request.method === "GET") {
        response = await handleQueue(env);
      } else if (path === "/me" && request.method === "GET") {
        response = await handleMe(request, env);
      } else if (path === "/cut" && request.method === "POST") {
        response = await handleCut(request, env);
      } else {
        response = json({ error: "Not found" }, 404);
      }
    } catch (err) {
      response = json({ error: "Internal server error" }, 500);
    }

    return cors(response, origin);
  },
};

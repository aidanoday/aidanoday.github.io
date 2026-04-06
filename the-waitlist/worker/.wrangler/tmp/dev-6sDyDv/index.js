var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  salt = salt || crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  const hashArr = Array.from(new Uint8Array(bits));
  const saltArr = Array.from(salt instanceof Uint8Array ? salt : new Uint8Array(salt));
  return saltArr.map((b) => b.toString(16).padStart(2, "0")).join("") + ":" + hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, stored) {
  const [saltHex] = stored.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((b) => parseInt(b, 16)));
  const result = await hashPassword(password, salt);
  return result === stored;
}
__name(verifyPassword, "verifyPassword");
async function createToken(userId, env) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1e3), exp: Math.floor(Date.now() / 1e3) + 86400 * 7 }));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`));
  const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.${sigStr}`;
}
__name(createToken, "createToken");
async function verifyToken(token, env) {
  try {
    const [header, payload, sig] = token.split(".");
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigRestored = sig.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - sig.length % 4) % 4);
    const sigBuf = Uint8Array.from(atob(sigRestored), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(`${header}.${payload}`));
    if (!valid) return null;
    const data = JSON.parse(atob(payload));
    if (data.exp < Math.floor(Date.now() / 1e3)) return null;
    return data;
  } catch {
    return null;
  }
}
__name(verifyToken, "verifyToken");
var WAIT_DURATION_SECONDS = 2 * 60;
function _normalizeLeet(text) {
  return text.toLowerCase().replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t").replace(/8/g, "b").replace(/@/g, "a").replace(/\$/g, "s").replace(/!/g, "i").replace(/\|/g, "i").replace(/\+/g, "t");
}
__name(_normalizeLeet, "_normalizeLeet");
var BANNED_WORDS = [
  // Profanity
  "fuck",
  "fucker",
  "fucked",
  "fucking",
  "fucks",
  "shit",
  "shits",
  "shitting",
  "bullshit",
  "cunt",
  "cunts",
  "cock",
  "cocks",
  "dick",
  "dicks",
  "pussy",
  "pussies",
  "bitch",
  "bitches",
  "bitching",
  "whore",
  "whores",
  "slut",
  "sluts",
  "ass",
  "asses",
  "asshole",
  "assholes",
  "arse",
  "arsehole",
  "bastard",
  "bastards",
  "wanker",
  "wankers",
  "wank",
  "prick",
  "pricks",
  "twat",
  "twats",
  "douchebag",
  "douche",
  "dipshit",
  "jackass",
  "shitstain",
  "bollocks",
  "bellend",
  "motherfucker",
  "motherfucking",
  // Sexual
  "porn",
  "porno",
  "dildo",
  "dildos",
  "blowjob",
  "handjob",
  "rimjob",
  "masturbate",
  "masturbating",
  "masturbation",
  "ejaculate",
  "ejaculation",
  "jizz",
  "cum",
  "cumshot",
  "erection",
  "pawg",
  "csam",
  // Discriminatory / slurs
  "nigger",
  "niggers",
  "nigga",
  "niggas",
  "nig",
  "nigglet",
  "chink",
  "chinks",
  "spic",
  "spics",
  "wetback",
  "wetbacks",
  "kike",
  "kikes",
  "gook",
  "gooks",
  "faggot",
  "faggots",
  "fag",
  "fags",
  "retard",
  "retards",
  "retarded",
  "tranny",
  "trannies",
  "dyke",
  "dykes",
  "cracker",
  "crackers",
  "beaner",
  "beaners",
  "towelhead",
  "raghead",
  "honky",
  "honkies",
  // Severe
  "pedophile",
  "pedophiles",
  "paedophile",
  "pedo",
  "molest",
  "molester"
];
var BANNED_SUBSTRINGS = [
  "fuck",
  "cunt",
  "nigger",
  "nigga",
  "twat",
  "wanker",
  "jizz",
  "blowjob",
  "handjob",
  "rimjob",
  "faggot",
  "pedophil",
  "paedophil",
  "molest",
  "wetback",
  "kike",
  "chink",
  "spic"
];
var GRAWLIX_RE = /[@#$%!&*]{3,}/;
function checkContent(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (GRAWLIX_RE.test(trimmed)) return true;
  const normed = _normalizeLeet(trimmed);
  for (const word of BANNED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, "i").test(normed)) return true;
  }
  const collapsed = normed.replace(/[^a-z]/g, "");
  for (const sub of BANNED_SUBSTRINGS) {
    if (collapsed.includes(sub)) return true;
  }
  return false;
}
__name(checkContent, "checkContent");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
function cors(response, origin) {
  const allowed = ["https://www.aidanoday.me", "https://aidanoday.me", "https://aidanoday.github.io", "http://localhost:5173", "http://localhost:4173"];
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
__name(cors, "cors");
async function getAuthUser(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const payload = await verifyToken(auth.slice(7), env);
  if (!payload) return null;
  return await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue, accumulated_wait_seconds, cuts_in_current_wait, current_wait_join_time FROM users WHERE id = ?"
  ).bind(payload.sub).first();
}
__name(getAuthUser, "getAuthUser");
function formatUser(row) {
  const inQueue = row.in_queue === 1 || row.in_queue === true;
  return {
    displayName: row.display_name,
    position: inQueue ? row.position : null,
    signupTime: row.signup_time,
    waitingFor: row.waiting_for || null,
    inQueue
  };
}
__name(formatUser, "formatUser");
async function handleSignup(request, env) {
  const { displayName, password } = await request.json();
  if (!displayName?.trim() || !password) {
    return json({ error: "All fields are required." }, 400);
  }
  if (password.length < 4) {
    return json({ error: "Password must be at least 4 characters." }, 400);
  }
  if (checkContent(displayName.trim())) {
    return json({ error: "That username isn't allowed. Please choose another." }, 422);
  }
  const existingName = await env.DB.prepare(
    "SELECT id FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName.trim()).first();
  if (existingName) return json({ error: "This display name is taken." }, 409);
  const { max_pos } = await env.DB.prepare(
    "SELECT COALESCE(MAX(position), 0) as max_pos FROM users WHERE in_queue = 1"
  ).first();
  const position = max_pos + 1;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const positionOneStartTime = position === 1 ? now : null;
  const passwordHash = await hashPassword(password);
  await env.DB.prepare(
    "INSERT INTO users (display_name, password_hash, position, signup_time, in_queue, current_wait_join_time, position_one_start_time) VALUES (?, ?, ?, ?, 1, ?, ?)"
  ).bind(displayName.trim(), passwordHash, position, now, now, positionOneStartTime).run();
  const user = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName.trim()).first();
  const token = await createToken(user.id, env);
  return json({ user: formatUser(user), token });
}
__name(handleSignup, "handleSignup");
async function handleLogin(request, env) {
  const { displayName, password } = await request.json();
  if (!displayName?.trim() || !password) {
    return json({ error: "Display name and password are required." }, 400);
  }
  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName.trim()).first();
  if (!user) return json({ error: "Invalid display name or password." }, 401);
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return json({ error: "Invalid display name or password." }, 401);
  const token = await createToken(user.id, env);
  return json({ user: formatUser(user), token });
}
__name(handleLogin, "handleLogin");
async function handleQueue(request, env) {
  let myId = null;
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const payload = await verifyToken(auth.slice(7), env);
    if (payload) myId = payload.sub;
  }
  let fivedTodayIds = /* @__PURE__ */ new Set();
  if (myId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const { results: fiveRows } = await env.DB.prepare(
      "SELECT to_user_id FROM high_fives WHERE from_user_id = ? AND created_at LIKE ?"
    ).bind(myId, `${today}%`).all();
    fivedTodayIds = new Set(fiveRows.map((r) => r.to_user_id));
  }
  const { results } = await env.DB.prepare(`
    SELECT u.id, u.display_name, u.position, u.waiting_for, u.accumulated_wait_seconds,
      (SELECT COUNT(*) FROM high_fives hf WHERE hf.to_user_id = u.id) as high_five_count
    FROM users u WHERE u.in_queue = 1 ORDER BY u.position ASC
  `).all();
  return json(results.map((r) => ({
    displayName: r.display_name,
    position: r.position,
    waitingFor: r.waiting_for || null,
    highFiveCount: r.high_five_count || 0,
    accumulatedWaitSeconds: r.accumulated_wait_seconds || 0,
    hasFivedToday: fivedTodayIds.has(r.id)
  })));
}
__name(handleQueue, "handleQueue");
async function handleMe(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const result = formatUser(user);
  if (!result.inQueue) {
    const lastComp = await env.DB.prepare(
      "SELECT * FROM wait_completions WHERE user_id = ? ORDER BY wait_number DESC LIMIT 1"
    ).bind(user.id).first();
    if (lastComp) {
      result.lastCompletion = {
        waitNumber: lastComp.wait_number,
        highFivesGiven: lastComp.high_fives_given,
        highFivesReceived: lastComp.high_fives_received,
        cutsMade: lastComp.cuts_made,
        totalTimeSeconds: Math.round(
          (new Date(lastComp.completed_at) - new Date(lastComp.joined_at)) / 1e3
        )
      };
    }
  }
  return json(result);
}
__name(handleMe, "handleMe");
async function handleHighFive(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const { displayName } = await request.json();
  if (!displayName) return json({ error: "displayName required" }, 400);
  const target = await env.DB.prepare(
    "SELECT id FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName).first();
  if (!target) return json({ error: "User not found" }, 404);
  if (target.id === user.id) return json({ error: "You can't high-five yourself!" }, 400);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const existing = await env.DB.prepare(
    "SELECT id FROM high_fives WHERE from_user_id = ? AND to_user_id = ? AND created_at LIKE ?"
  ).bind(user.id, target.id, `${today}%`).first();
  if (existing) return json({ error: "You already high-fived this person today!" }, 429);
  await env.DB.prepare(
    "INSERT INTO high_fives (from_user_id, to_user_id, created_at) VALUES (?, ?, ?)"
  ).bind(user.id, target.id, (/* @__PURE__ */ new Date()).toISOString()).run();
  const { count } = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM high_fives WHERE to_user_id = ?"
  ).bind(target.id).first();
  return json({ highFiveCount: count });
}
__name(handleHighFive, "handleHighFive");
async function handleUserProfile(env, displayName) {
  const user = await env.DB.prepare(
    "SELECT display_name, position, signup_time, waiting_for, in_queue FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName).first();
  if (!user) return json({ error: "User not found" }, 404);
  const { count } = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM high_fives WHERE to_user_id = (SELECT id FROM users WHERE lower(display_name) = lower(?))"
  ).bind(displayName).first();
  return json({
    displayName: user.display_name,
    position: user.in_queue === 1 ? user.position : null,
    signupTime: user.signup_time,
    waitingFor: user.waiting_for || null,
    highFiveCount: count || 0,
    inQueue: user.in_queue === 1
  });
}
__name(handleUserProfile, "handleUserProfile");
async function handleCut(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!user.in_queue) return json({ error: "You're not in the queue." }, 400);
  if (user.position <= 1) return json({ error: "You're already first in line." }, 400);
  const lastCutRow = await env.DB.prepare(
    "SELECT last_cut FROM users WHERE id = ?"
  ).bind(user.id).first();
  if (lastCutRow?.last_cut) {
    const elapsed = Date.now() - new Date(lastCutRow.last_cut).getTime();
    if (elapsed < 3e3) {
      const remaining = Math.ceil((3e3 - elapsed) / 1e3);
      return json({ error: `Wait ${remaining}s before cutting again.`, cooldown: remaining }, 429);
    }
  }
  const ahead = await env.DB.prepare(
    "SELECT id FROM users WHERE in_queue = 1 AND position = ?"
  ).bind(user.position - 1).first();
  if (!ahead) return json({ error: "No one ahead to cut." }, 400);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const willBePosition1 = user.position - 1 === 1;
  const batch = [
    env.DB.prepare(
      "UPDATE users SET position = ?, last_cut = ?, cuts_in_current_wait = cuts_in_current_wait + 1 WHERE id = ?"
    ).bind(user.position - 1, now, user.id),
    env.DB.prepare(
      "UPDATE users SET position = ? WHERE id = ?"
    ).bind(user.position, ahead.id)
  ];
  if (willBePosition1) {
    batch.push(
      env.DB.prepare(
        "UPDATE users SET accumulated_wait_seconds = 0 WHERE id = ?"
      ).bind(user.id)
    );
  }
  await env.DB.batch(batch);
  const updated = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE id = ?"
  ).bind(user.id).first();
  return json({ user: formatUser(updated) });
}
__name(handleCut, "handleCut");
async function handleProfileUpdate(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const { waitingFor } = await request.json();
  const value = typeof waitingFor === "string" ? waitingFor.trim().slice(0, 200) : null;
  if (value && checkContent(value)) {
    return json({ error: "Your response contains inappropriate language." }, 422);
  }
  await env.DB.prepare(
    "UPDATE users SET waiting_for = ? WHERE id = ?"
  ).bind(value, user.id).run();
  const updated = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE id = ?"
  ).bind(user.id).first();
  return json(formatUser(updated));
}
__name(handleProfileUpdate, "handleProfileUpdate");
async function handleDeleteAccount(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const isInQueue = user.in_queue === 1;
  const wasPosition1 = isInQueue && user.position === 1;
  const nextInLine = wasPosition1 ? await env.DB.prepare(
    "SELECT id FROM users WHERE in_queue = 1 AND position = 2"
  ).first() : null;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const batch = [
    env.DB.prepare("DELETE FROM wait_completions WHERE user_id = ?").bind(user.id),
    env.DB.prepare("DELETE FROM high_fives WHERE from_user_id = ? OR to_user_id = ?").bind(user.id, user.id)
  ];
  if (isInQueue) {
    batch.push(
      env.DB.prepare(
        "UPDATE users SET position = position - 1 WHERE in_queue = 1 AND position > ?"
      ).bind(user.position)
    );
  }
  batch.push(env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id));
  await env.DB.batch(batch);
  if (nextInLine?.id) {
    await env.DB.prepare(
      "UPDATE users SET position_one_start_time = ? WHERE id = ?"
    ).bind(now, nextInLine.id).run();
  }
  return json({ ok: true });
}
__name(handleDeleteAccount, "handleDeleteAccount");
async function handleCompleteWait(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.in_queue !== 1 || user.position !== 1) {
    return json({ error: "You're not first in line." }, 400);
  }
  const accumulated = user.accumulated_wait_seconds || 0;
  if (accumulated < WAIT_DURATION_SECONDS - 15) {
    const remaining = WAIT_DURATION_SECONDS - accumulated;
    return json({ error: `Timer not complete. ${remaining}s of active time remaining.` }, 400);
  }
  const completedAt = (/* @__PURE__ */ new Date()).toISOString();
  const joinedAt = user.current_wait_join_time || user.signup_time;
  const givenRes = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM high_fives WHERE from_user_id = ? AND created_at >= ?"
  ).bind(user.id, joinedAt).first();
  const receivedRes = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM high_fives WHERE to_user_id = ? AND created_at >= ?"
  ).bind(user.id, joinedAt).first();
  const cntRes = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM wait_completions WHERE user_id = ?"
  ).bind(user.id).first();
  const given = givenRes?.cnt || 0;
  const received = receivedRes?.cnt || 0;
  const waitNumber = (cntRes?.cnt || 0) + 1;
  const totalTimeSeconds = Math.round((Date.now() - new Date(joinedAt).getTime()) / 1e3);
  const cuts = user.cuts_in_current_wait || 0;
  await env.DB.prepare(
    "INSERT INTO wait_completions (user_id, wait_number, joined_at, completed_at, high_fives_given, high_fives_received, cuts_made, waiting_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(user.id, waitNumber, joinedAt, completedAt, given, received, cuts, user.waiting_for || null).run();
  const nextPerson = await env.DB.prepare(
    "SELECT id FROM users WHERE in_queue = 1 AND position = 2"
  ).first();
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE users SET in_queue = 0, cuts_in_current_wait = 0, accumulated_wait_seconds = 0 WHERE id = ?"
    ).bind(user.id),
    env.DB.prepare(
      "UPDATE users SET position = position - 1 WHERE in_queue = 1 AND position > 1"
    )
  ]);
  if (nextPerson?.id) {
    await env.DB.prepare(
      "UPDATE users SET accumulated_wait_seconds = 0 WHERE id = ?"
    ).bind(nextPerson.id).run();
  }
  return json({ waitNumber, highFivesGiven: given, highFivesReceived: received, totalTimeSeconds, cutsMade: cuts, waitingFor: user.waiting_for || null });
}
__name(handleCompleteWait, "handleCompleteWait");
async function handleRejoin(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.in_queue === 1) return json({ error: "You're already in the queue." }, 400);
  const { max_pos } = await env.DB.prepare(
    "SELECT COALESCE(MAX(position), 0) as max_pos FROM users WHERE in_queue = 1"
  ).first();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newPos = max_pos + 1;
  await env.DB.prepare(
    "UPDATE users SET in_queue = 1, position = ?, cuts_in_current_wait = 0, accumulated_wait_seconds = 0, current_wait_join_time = ? WHERE id = ?"
  ).bind(newPos, now, user.id).run();
  const updated = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE id = ?"
  ).bind(user.id).first();
  return json({ user: formatUser(updated) });
}
__name(handleRejoin, "handleRejoin");
async function handleLeaderboards(env) {
  const [givenRes, receivedRes, runsRes, givenCumRes, receivedCumRes] = await env.DB.batch([
    env.DB.prepare(`
      SELECT u.display_name, wc.high_fives_given as value, wc.wait_number
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      ORDER BY wc.high_fives_given DESC, wc.id ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, wc.high_fives_received as value, wc.wait_number
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      ORDER BY wc.high_fives_received DESC, wc.id ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, COUNT(*) as value
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      GROUP BY wc.user_id ORDER BY value DESC, u.display_name ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, SUM(wc.high_fives_given) as value
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      GROUP BY wc.user_id ORDER BY value DESC, u.display_name ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, SUM(wc.high_fives_received) as value
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      GROUP BY wc.user_id ORDER BY value DESC, u.display_name ASC LIMIT 10
    `)
  ]);
  const fmt = /* @__PURE__ */ __name((r, withWait) => ({
    displayName: r.display_name,
    value: r.value,
    ...withWait && { waitNumber: r.wait_number }
  }), "fmt");
  return json({
    highFivesGiven: givenRes.results.map((r) => fmt(r, true)),
    highFivesReceived: receivedRes.results.map((r) => fmt(r, true)),
    runsCompleted: runsRes.results.map((r) => fmt(r, false)),
    highFivesGivenCumulative: givenCumRes.results.map((r) => fmt(r, false)),
    highFivesReceivedCumulative: receivedCumRes.results.map((r) => fmt(r, false))
  });
}
__name(handleLeaderboards, "handleLeaderboards");
async function handleHeartbeat(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.in_queue !== 1 || user.position !== 1) return json({ ok: true });
  const { seconds } = await request.json();
  const delta = Math.min(Math.max(1, seconds || 10), 30);
  await env.DB.prepare(
    "UPDATE users SET accumulated_wait_seconds = MIN(accumulated_wait_seconds + ?, ?) WHERE id = ?"
  ).bind(delta, WAIT_DURATION_SECONDS, user.id).run();
  return json({ ok: true });
}
__name(handleHeartbeat, "handleHeartbeat");
async function handleWaitHistory(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const { results } = await env.DB.prepare(
    "SELECT wait_number, joined_at, completed_at, high_fives_given, high_fives_received, cuts_made, waiting_for FROM wait_completions WHERE user_id = ? ORDER BY wait_number ASC"
  ).bind(user.id).all();
  return json(results.map((r) => ({
    waitNumber: r.wait_number,
    joinedAt: r.joined_at,
    completedAt: r.completed_at,
    highFivesGiven: r.high_fives_given,
    highFivesReceived: r.high_fives_received,
    cutsMade: r.cuts_made,
    waitingFor: r.waiting_for || null,
    totalTimeSeconds: Math.round((new Date(r.completed_at) - new Date(r.joined_at)) / 1e3)
  })));
}
__name(handleWaitHistory, "handleWaitHistory");
var src_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
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
        response = await handleQueue(request, env);
      } else if (path === "/me" && request.method === "GET") {
        response = await handleMe(request, env);
      } else if (path === "/cut" && request.method === "POST") {
        response = await handleCut(request, env);
      } else if (path === "/profile" && request.method === "PATCH") {
        response = await handleProfileUpdate(request, env);
      } else if (path === "/high-five" && request.method === "POST") {
        response = await handleHighFive(request, env);
      } else if (path === "/account" && request.method === "DELETE") {
        response = await handleDeleteAccount(request, env);
      } else if (path === "/leaderboards" && request.method === "GET") {
        response = await handleLeaderboards(env);
      } else if (path === "/heartbeat" && request.method === "POST") {
        response = await handleHeartbeat(request, env);
      } else if (path === "/complete-wait" && request.method === "POST") {
        response = await handleCompleteWait(request, env);
      } else if (path === "/rejoin" && request.method === "POST") {
        response = await handleRejoin(request, env);
      } else if (path === "/wait-history" && request.method === "GET") {
        response = await handleWaitHistory(request, env);
      } else if (path.startsWith("/user/") && request.method === "GET") {
        response = await handleUserProfile(env, decodeURIComponent(path.slice(6)));
      } else {
        response = json({ error: "Not found" }, 404);
      }
    } catch (err) {
      response = json({ error: "Internal server error" }, 500);
    }
    return cors(response, origin);
  }
};

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-RdN6FP/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-RdN6FP/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

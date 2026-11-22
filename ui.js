/* ===== UI ===== */
const KEY = "satmath.v1";
const $ = (id) => document.getElementById(id);
const LETTERS = ["A", "B", "C", "D"];
const PACE = 95; // seconds per question on the real test (35 min / 22)
const READY = DOMAINS.filter((d) => d.ready);
const SHARE = { alg: 0.35, adv: 0.35, psda: 0.15, geo: 0.15 };

/* ---------- storage ---------- */
function blankProgress() {
  const p = { skills: {}, level: {}, run: {}, recent: [], streak: 0, best: 0, history: [], rating: {}, settings: { topic: "mix", diff: "auto" } };
  for (const s of SKILLS) { p.skills[s.id] = { a: 0, c: 0, t: 0 }; p.level[s.id] = 0; p.run[s.id] = 0; }
  for (const d of DOMAINS) p.rating[d.id] = { r: 500, n: 0 };
  return p;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw), b = blankProgress();
      const m = { ...b, ...p };
      for (const k of ["skills", "level", "run", "rating", "settings"]) m[k] = { ...b[k], ...(p[k] || {}) };
      if (!Array.isArray(m.history)) m.history = [];
      m.best = Math.max(m.best || 0, m.streak || 0);
      return m;
    }
  } catch (e) { /* storage unavailable */ }
  return blankProgress();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ignore */ } }

let P = load();
let Q = null, selected = null, answered = false, started = 0, tick = null, view = "practice";

/* ---------- score estimate ----------
   Each domain keeps an Elo-style rating on the 200–800 scale. Question difficulty is placed
   at the centre of its Skills Insight score range; the chance of a correct answer follows a
   logistic curve. Rough by design: it only sees the topics the app covers. */
const QD = { easy: 430, medium: 540, hard: 660 }, SCALE = 70;
const BANDS = [[200, 360, "1", "200–360"], [370, 410, "2", "370–410"], [420, 460, "3", "420–460"], [470, 540, "4", "470–540"], [550, 600, "5", "550–600"], [610, 670, "6", "610–670"], [680, 800, "7", "680–800"]];
const round10 = (x) => Math.round(x / 10) * 10;
const clampS = (x) => Math.max(200, Math.min(800, x));
function updateRating(domain, diff, ok) {
  const g = P.rating[domain];
  const p = 1 / (1 + Math.exp(-(g.r - QD[diff]) / SCALE));
  const K = Math.max(16, 80 / Math.sqrt(1 + g.n / 5));
  g.r = clampS(g.r + K * ((ok ? 1 : 0) - p)); g.n++;
}
function estimate() {
  const doms = READY.filter((d) => P.rating[d.id].n > 0);
  const N = doms.reduce((x, d) => x + P.rating[d.id].n, 0);
  if (N < 10) return { ready: false, need: 10 - N };
  let w = 0, sum = 0;
  for (const d of doms) { const g = P.rating[d.id], wt = SHARE[d.id] * (g.n / (g.n + 5)); w += wt; sum += wt * g.r; }
  const score = clampS(round10(sum / w)), half = round10(Math.max(30, 180 / Math.sqrt(N)));
  const band = BANDS.find((b) => score >= b[0] && score <= b[1]) || BANDS[0];
  const covered = doms.map((d) => d.name);
  return { ready: true, score, lo: clampS(score - half), hi: clampS(score + half), band, N, covered };
}

/* ---------- choose next question ---------- */
function pool() {
  const t = P.settings.topic;
  if (t === "mix") return SKILLS;
  if (t.startsWith("dom:")) return SKILLS.filter((s) => s.domain === t.slice(4));
  return SKILLS.filter((s) => s.id === t);
}
function chooseSkill() {
  const list = pool();
  if (list.length === 1) return list[0].id;
  // Weight toward weaker skills; unseen skills count as 50%.
  const w = list.map((s) => { const k = P.skills[s.id]; return 1 + 3 * (1 - (k.c + 1) / (k.a + 2)); });
  let r = Math.random() * w.reduce((x, y) => x + y, 0);
  for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i].id; }
  return list[0].id;
}
const chooseDiff = (skill) => (P.settings.diff === "auto" ? DIFFS[P.level[skill]] : P.settings.diff);

function nextQuestion() {
  const skill = chooseSkill();
  Q = generate(skill, chooseDiff(skill));
  selected = null; answered = false;
  renderQuestion();
  started = Date.now();
  clearInterval(tick); tick = setInterval(updateTimer, 1000); updateTimer();
}

/* ---------- controls ---------- */
function chip(attr, val, label, on) { return `<button class="chip" type="button" data-${attr}="${val}" aria-pressed="${on}">${label}</button>`; }
function renderControls() {
  const t = P.settings.topic;
  let h = `<div class="group"><span class="row-label">Topic</span><div class="row">${chip("topic", "mix", "Mixed (focus on weak spots)", t === "mix")}${READY.map((d) => chip("topic", "dom:" + d.id, { alg: "All Algebra", adv: "All Advanced Math", psda: "All Data Analysis", geo: "All Geometry" }[d.id], t === "dom:" + d.id)).join("")}</div></div>`;
  const SHORT = { alg: "Algebra", adv: "Advanced", psda: "Data", geo: "Geometry" };
  for (const d of READY) h += `<div class="group"><span class="row-label">${SHORT[d.id]}</span><div class="row">${d.skills.map((s) => chip("topic", s.id, s.short, t === s.id)).join("")}</div></div>`;
  $("topics").innerHTML = h;
  $("diffs").innerHTML = ["auto", ...DIFFS].map((d) => chip("diff", d, d === "auto" ? "Auto (adapts to you)" : d[0].toUpperCase() + d.slice(1), P.settings.diff === d)).join("");
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-topic]"), d = e.target.closest("[data-diff]");
  if (t) { P.settings.topic = t.dataset.topic; save(); renderControls(); nextQuestion(); }
  if (d) { P.settings.diff = d.dataset.diff; save(); renderControls(); nextQuestion(); }
});

/* ---------- question card ---------- */
const skillOf = (id) => SKILLS.find((s) => s.id === id);
function renderQuestion() {
  const body = Q.type === "mcq"
    ? `<div class="choices" role="group" aria-label="Answer choices">${Q.choices.map((c, i) => `<button class="choice" type="button" data-choice="${i}" aria-pressed="false"><span class="letter">${LETTERS[i]}</span><span>${c}</span></button>`).join("")}</div>`
    : `<div class="spr"><label for="spr-input">Type your answer (fraction or decimal)</label><input id="spr-input" autocomplete="off" inputmode="text" spellcheck="false" placeholder="e.g. 3/2 or 1.5"><div class="hint" id="spr-hint">Up to 5 characters, or 6 if negative.</div></div>`;
  $("qcard").innerHTML = `
    <div class="qmeta"><span class="tag">${skillOf(Q.skill).name}</span><span class="dot-sep">/</span><span>${Q.type === "mcq" ? "Multiple choice" : "Student-produced response"}</span><span class="pill ${Q.diff}">${Q.diff}</span><span class="timer" id="timer">0:00</span></div>
    <div class="stem">${Q.stem}</div>
    ${body}
    <div class="actions"><button class="btn primary" id="check-btn" type="button" ${Q.type === "mcq" ? "disabled" : ""}>Check answer</button><button class="btn ghost" id="skip-btn" type="button">Skip</button><span class="kbd">${Q.type === "mcq" ? "<kbd>A</kbd>–<kbd>D</kbd> pick · <kbd>Enter</kbd> check" : "<kbd>Enter</kbd> check"}</span></div>
    <div id="fb"></div>`;
  if (Q.type === "spr") {
    const inp = $("spr-input");
    inp.addEventListener("input", () => { const h = $("spr-hint"); const v = inp.value.trim(); if (!v) { h.className = "hint"; h.textContent = "Up to 5 characters, or 6 if negative."; return; } const r = checkSPR(v, Q.value); h.className = r.valid ? "hint" : "hint err"; h.textContent = r.valid ? "Looks like a valid entry." : r.msg; });
    if (view === "practice") setTimeout(() => inp.focus({ preventScroll: true }), 0);
  }
  $("check-btn").addEventListener("click", check);
  $("skip-btn").addEventListener("click", nextQuestion);
  $("qcard").querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => pickChoice(+b.dataset.choice)));
}
function pickChoice(i) {
  if (answered || Q.type !== "mcq") return;
  selected = i;
  $("qcard").querySelectorAll("[data-choice]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.choice === i)));
  $("check-btn").disabled = false;
}
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
function updateTimer() {
  const el = $("timer"); if (!el) return;
  const s = Math.floor((Date.now() - started) / 1000);
  el.textContent = mmss(s);
  el.classList.toggle("slow", s > PACE);
  el.title = s > PACE ? "Slower than real-test pace (about 1:35 per question)" : "Real-test pace is about 1:35 per question";
}

function check() {
  if (answered) return;
  let ok;
  if (Q.type === "mcq") { if (selected === null) return; ok = selected === Q.answer; }
  else {
    const r = checkSPR($("spr-input").value, Q.value);
    if (!r.valid) { const h = $("spr-hint"); h.className = "hint err"; h.textContent = r.msg; return; }
    ok = r.ok;
  }
  answered = true; clearInterval(tick);
  const secs = Math.round((Date.now() - started) / 1000);
  record(ok, secs);

  if (Q.type === "mcq") {
    $("qcard").querySelectorAll("[data-choice]").forEach((b) => { const i = +b.dataset.choice; b.disabled = true; if (i === Q.answer) b.classList.add("right"); else if (i === selected) b.classList.add("wrong"); });
  } else { $("spr-input").disabled = true; }
  const acc = Q.type === "spr" ? `<div class="accepted">Accepted answers: ${acceptedForms(Q.value).join("  ·  ")}</div>` : "";
  const head = ok ? "Correct" : Q.type === "mcq" ? `Not quite. The answer is ${LETTERS[Q.answer]}.` : "Not quite.";
  $("fb").innerHTML = `<div class="feedback ${ok ? "ok" : "no"}"><strong>${head}</strong>${acc}<div class="explain">${Q.explain}</div><div class="kbd">Time: ${mmss(secs)}</div></div>`;
  const btn = $("check-btn"); btn.textContent = "Next question →";
  const kb = $("qcard").querySelector(".kbd"); if (kb) kb.innerHTML = "<kbd>Enter</kbd> next";
  btn.disabled = false; btn.removeEventListener("click", check); btn.addEventListener("click", nextQuestion);
  $("skip-btn").remove();
  btn.focus({ preventScroll: true });
  renderProgress();
}

function record(ok, secs) {
  const sk = skillOf(Q.skill), k = P.skills[Q.skill];
  k.a++; k.t += secs; if (ok) k.c++;
  P.streak = ok ? P.streak + 1 : 0; P.best = Math.max(P.best, P.streak);
  P.recent = [...P.recent, ok ? 1 : 0].slice(-20);
  // Auto difficulty: 2 right in a row at a level moves up; a miss moves down.
  if (ok) { P.run[Q.skill]++; if (P.run[Q.skill] >= 2 && P.level[Q.skill] < 2) { P.level[Q.skill]++; P.run[Q.skill] = 0; } }
  else { P.run[Q.skill] = 0; if (P.level[Q.skill] > 0) P.level[Q.skill]--; }
  updateRating(sk.domain, Q.diff, ok);
  const e = estimate();
  P.history.push({ s: Q.skill, d: Q.diff, ok: ok ? 1 : 0, t: secs, ts: Date.now(), e: e.ready ? e.score : null });
  if (P.history.length > 3000) P.history = P.history.slice(-3000);
  save();
}

/* ---------- progress rail ---------- */
function estBlock(e, big) {
  if (!e.ready) return `<div class="est est-empty"><span class="est-label">Estimated SAT Math</span><div class="est-num">–</div><div class="est-note">Answer ${e.need} more question${e.need === 1 ? "" : "s"} to see your estimate.</div></div>`;
  const pos = (v) => ((v - 200) / 600) * 100;
  return `<div class="est"${big ? ' style="border:none;padding:0;margin:0"' : ""}><span class="est-label">Estimated SAT Math</span>
    <div class="est-num">${e.score}<small>${e.lo}–${e.hi}</small></div>
    <div class="meter" role="img" aria-label="Estimated score ${e.score} on a 200 to 800 scale"><div class="rng" style="left:${pos(e.lo)}%;width:${pos(e.hi) - pos(e.lo)}%"></div><div class="pt" style="left:calc(${pos(e.score)}% - 1px)"></div></div>
    <div class="meter-scale"><span>200</span><span>500</span><span>800</span></div>
    <div class="est-note">Skills Insight band ${e.band[2]} (${e.band[3]}). ${e.covered.length === DOMAINS.length ? "Covers all four test areas." : `Based on ${e.covered.join(", ").replace(/, ([^,]*)$/, " and $1")} only.`}</div></div>`;
}
function renderProgress() {
  const all = Object.values(P.skills), a = all.reduce((x, k) => x + k.a, 0), c = all.reduce((x, k) => x + k.c, 0);
  $("est-side").innerHTML = estBlock(estimate(), false);
  $("st-total").textContent = a; $("st-acc").textContent = a ? Math.round((100 * c) / a) + "%" : "–"; $("st-streak").textContent = P.streak;
  $("recent").innerHTML = P.recent.map((r) => `<span class="${r ? "ok" : ""}" title="${r ? "Correct" : "Missed"}"></span>`).join("");
  $("skills").innerHTML = SKILLS.map((s) => {
    const k = P.skills[s.id], pct = k.a ? Math.round((100 * k.c) / k.a) : 0;
    const cls = !k.a ? "" : pct < 50 ? "low" : pct < 80 ? "mid" : "high";
    return `<div><div class="sk-top"><span>${s.name}</span><span>${k.a ? `${k.c}/${k.a} · ${pct}%` : "not started"}</span></div><div class="bar ${cls}"><div style="width:${pct}%"></div></div><div class="lvl">Auto level: ${DIFFS[P.level[s.id]]}${k.a ? ` · avg ${Math.round(k.t / k.a)}s` : ""}</div></div>`;
  }).join("");
  const tried = SKILLS.filter((s) => P.skills[s.id].a >= 3);
  if (!a) $("focus").textContent = "Answer a few questions and this will point out your weakest topic.";
  else if (!tried.length) $("focus").textContent = "Keep going. After 3 questions in a topic you'll see where to focus.";
  else { const w = tried.reduce((m, s) => (P.skills[s.id].c / P.skills[s.id].a < P.skills[m.id].c / P.skills[m.id].a ? s : m)); $("focus").innerHTML = `<b>Focus next:</b> ${w.name} (${Math.round((100 * P.skills[w.id].c) / P.skills[w.id].a)}% so far).`; }
  if (view === "stats") renderStats();
}
$("reset-btn").addEventListener("click", () => $("reset-confirm").classList.add("show"));
$("reset-no").addEventListener("click", () => $("reset-confirm").classList.remove("show"));
$("reset-yes").addEventListener("click", () => { const s = P.settings; P = blankProgress(); P.settings = s; save(); $("reset-confirm").classList.remove("show"); renderProgress(); });

/* ---------- stats view ---------- */
function trendChart(pts) {
  // pts: [{i, e}] estimate after question i. Fixed 200–800 axis so progress isn't exaggerated.
  const W = 640, H = 180, L = 34, Rr = 8, T = 10, B = 22;
  const n = pts.length, x0 = pts[0].i, x1 = pts[n - 1].i;
  const X = (i) => L + (x1 === x0 ? (W - L - Rr) / 2 : ((i - x0) / (x1 - x0)) * (W - L - Rr));
  const Y = (v) => T + (1 - (v - 200) / 600) * (H - T - B);
  const line = pts.map((p, k) => `${k ? "L" : "M"}${X(p.i).toFixed(1)},${Y(p.e).toFixed(1)}`).join("");
  const area = `${line}L${X(x1).toFixed(1)},${Y(200)}L${X(x0).toFixed(1)},${Y(200)}Z`;
  const grid = [200, 400, 600, 800].map((v) => `<line class="grid" x1="${L}" x2="${W - Rr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L - 6}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`).join("");
  const last = pts[n - 1];
  return `<div class="chart-wrap" id="trend"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Estimated score after each question, latest ${last.e}">
    ${grid}<path class="area" d="${area}"/><path class="ln" d="${line}" vector-effect="non-scaling-stroke"/>
    <text class="ax" x="${L}" y="${H - 6}">Q${x0}</text><text class="ax" x="${W - Rr}" y="${H - 6}" text-anchor="end">Q${x1}</text>
    <line class="cross" id="tr-x" y1="${T}" y2="${H - B}" visibility="hidden" vector-effect="non-scaling-stroke"/>
    <circle class="dot" id="tr-d" r="4" cx="${X(last.i)}" cy="${Y(last.e)}"/>
    <rect id="tr-hit" x="${L}" y="0" width="${W - L - Rr}" height="${H}" fill="transparent"/></svg>
    <div class="tip" id="tr-tip" hidden></div></div>`;
}
function wireTrend(pts) {
  const wrap = $("trend"); if (!wrap) return;
  const svg = wrap.querySelector("svg"), hit = $("tr-hit"), tip = $("tr-tip"), xl = $("tr-x"), dot = $("tr-d");
  const W = 640, H = 180, L = 34, Rr = 8, T = 10, B = 22, x0 = pts[0].i, x1 = pts[pts.length - 1].i;
  const X = (i) => L + (x1 === x0 ? (W - L - Rr) / 2 : ((i - x0) / (x1 - x0)) * (W - L - Rr));
  const Y = (v) => T + (1 - (v - 200) / 600) * (H - T - B);
  const show = (p) => {
    xl.setAttribute("x1", X(p.i)); xl.setAttribute("x2", X(p.i)); xl.setAttribute("visibility", "visible");
    dot.setAttribute("cx", X(p.i)); dot.setAttribute("cy", Y(p.e));
    const r = svg.getBoundingClientRect(); tip.hidden = false;
    tip.style.left = (X(p.i) / W) * r.width + "px"; tip.style.top = (Y(p.e) / H) * r.height + "px";
    tip.textContent = `Question ${p.i} · est. ${p.e}`;
  };
  const reset = () => { const p = pts[pts.length - 1]; xl.setAttribute("visibility", "hidden"); tip.hidden = true; dot.setAttribute("cx", X(p.i)); dot.setAttribute("cy", Y(p.e)); };
  hit.addEventListener("pointermove", (ev) => {
    const r = svg.getBoundingClientRect(), vx = ((ev.clientX - r.left) / r.width) * W;
    let best = pts[0]; for (const p of pts) if (Math.abs(X(p.i) - vx) < Math.abs(X(best.i) - vx)) best = p;
    show(best);
  });
  hit.addEventListener("pointerleave", reset);
}
function bar(pct) { const cls = pct < 50 ? "low" : pct < 80 ? "mid" : "high"; return `<div class="bar ${cls}" style="margin:0"><div style="width:${pct}%"></div></div>`; }
function renderStats() {
  const H = P.history, e = estimate();
  const all = Object.values(P.skills), a = all.reduce((x, k) => x + k.a, 0), c = all.reduce((x, k) => x + k.c, 0), t = all.reduce((x, k) => x + k.t, 0);
  const avg = a ? t / a : 0;
  const pts = H.map((h, k) => ({ i: k + 1, e: h.e })).filter((p) => p.e !== null);
  const byD = DIFFS.map((d) => { const r = H.filter((h) => h.d === d); return { d, n: r.length, c: r.filter((h) => h.ok).length }; });
  const rows = READY.map((d) => {
    const g = P.rating[d.id], ks = d.skills.map((s) => ({ s, k: P.skills[s.id] }));
    const da = ks.reduce((x, o) => x + o.k.a, 0), dc = ks.reduce((x, o) => x + o.k.c, 0);
    const head = `<tr class="domrow"><td>${d.name}</td><td class="num">${da}</td><td class="num">${da ? Math.round((100 * dc) / da) + "%" : "–"}</td><td class="barcell">${da ? bar(Math.round((100 * dc) / da)) : ""}</td><td class="num">${g.n >= 5 ? "~" + round10(g.r) : "–"}</td><td class="num"></td></tr>`;
    return head + ks.map(({ s, k }) => { const pct = k.a ? Math.round((100 * k.c) / k.a) : 0; return `<tr><td>${s.name}</td><td class="num">${k.a}</td><td class="num">${k.a ? pct + "%" : "–"}</td><td class="barcell">${k.a ? bar(pct) : ""}</td><td class="num">${k.a ? mmss(k.t / k.a) : "–"}</td><td class="num">${DIFFS[P.level[s.id]]}</td></tr>`; }).join("");
  }).join("");
  $("view-stats").innerHTML = `
    <div class="tiles">
      <div><span>Questions answered</span><b>${a}</b><em>${H.length < a ? `${H.length} with full detail` : "all time"}</em></div>
      <div><span>Accuracy</span><b>${a ? Math.round((100 * c) / a) + "%" : "–"}</b><em>${c} correct</em></div>
      <div><span>Avg time per question</span><b>${a ? mmss(avg) : "–"}</b><em>${a ? (avg <= PACE ? "within" : "slower than") + " real-test pace (1:35)" : "real-test pace is 1:35"}</em></div>
      <div><span>Best streak</span><b>${P.best}</b><em>current ${P.streak}</em></div>
    </div>
    <section class="panel card">
      <h2>Score estimate</h2>
      <p class="cap">A rough guess at the SAT Math score you're practising at, worked out from which questions you get right and how hard they are. Each test area is weighted by its share of the real test (Algebra and Advanced Math about 35% each, Data Analysis and Geometry about 15% each). Practice questions aren't the real test, so check it against an official Bluebook practice test.</p>
      <div class="hero-est"><div>${estBlock(e, true)}</div>${pts.length >= 2 ? trendChart(pts) : `<div class="empty">Your estimate over time will show here after a few more questions.</div>`}</div>
    </section>
    <div class="grid2">
      <section class="panel card"><h2>By difficulty</h2><p class="cap">How you do as questions get harder.</p>
        ${byD.map((o) => `<div class="drow"><span class="pill ${o.d}" style="justify-self:start">${o.d}</span>${o.n ? bar(Math.round((100 * o.c) / o.n)) : '<div class="bar" style="margin:0"></div>'}<span class="num">${o.n ? `${o.c}/${o.n} · ${Math.round((100 * o.c) / o.n)}%` : "none yet"}</span></div>`).join("")}
      </section>
      <section class="panel card"><h2>Recent pace</h2><p class="cap">Seconds spent on your last ${Math.min(20, H.length)} questions.</p>
        ${H.length ? `<div class="drow" style="grid-template-columns:1fr"><div style="display:flex;align-items:flex-end;gap:3px;height:80px">${H.slice(-20).map((h) => `<div title="${mmss(h.t)} · ${h.ok ? "correct" : "missed"}" style="flex:1;border-radius:2px 2px 0 0;background:${h.ok ? "var(--good)" : "var(--bad)"};opacity:.85;height:${Math.max(4, Math.min(100, (h.t / (PACE * 2)) * 100))}%"></div>`).join("")}</div><div class="meter-scale"><span>older</span><span>taller = slower · top = 3:10</span><span>latest</span></div></div>` : `<div class="empty">No answers yet.</div>`}
      </section>
    </div>
    <section class="panel card"><h2>By topic</h2><p class="cap">Domain rows show a rough score estimate for that area once you have answered 5 or more questions in it.</p>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Topic</th><th class="num">Answered</th><th class="num">Accuracy</th><th></th><th class="num">Avg time / Est.</th><th class="num">Auto level</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
  if (pts.length >= 2) wireTrend(pts);
}

/* ---------- views (hash routing) ---------- */
function setView(v) {
  view = v === "stats" ? "stats" : "practice";
  $("view-practice").hidden = view !== "practice"; $("view-stats").hidden = view !== "stats";
  $("tab-practice").setAttribute("aria-current", view === "practice" ? "page" : "false");
  $("tab-stats").setAttribute("aria-current", view === "stats" ? "page" : "false");
  $("page-title").textContent = view === "stats" ? "Your stats" : "SAT Math Practice";
  $("page-sub").textContent = view === "stats" ? "Accuracy, pace and a rough score estimate, saved in this browser." : "Endless practice questions, checked by the same rules as the real test.";
  if (view === "stats") renderStats();
  else if (Q && Q.type === "spr" && !answered) $("spr-input").focus({ preventScroll: true });
}
const fromHash = () => setView(location.hash === "#stats" ? "stats" : "practice");
window.addEventListener("hashchange", fromHash);
const go = (v) => { if (location.hash !== "#" + v) location.hash = v; else setView(v); };

/* ---------- reference sheet ---------- */
let lastFocus = null;
function openSheet() { lastFocus = document.activeElement; $("sheet").hidden = false; $("ref-close").focus(); }
function closeSheet() { $("sheet").hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
const sheetOpen = () => !$("sheet").hidden;
$("ref-btn").addEventListener("click", () => (sheetOpen() ? closeSheet() : openSheet()));
$("ref-close").addEventListener("click", closeSheet);
$("sheet").addEventListener("click", (e) => { if (e.target === $("sheet")) closeSheet(); });

/* ---------- keyboard ---------- */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const inInput = e.target.tagName === "INPUT";
  if (sheetOpen()) { if (e.key === "Escape" || e.key === "r" || e.key === "R") { e.preventDefault(); closeSheet(); } return; }
  // Letters are never valid in a grid-in answer, so S, P and R work as shortcuts even while typing.
  {
    if (e.key === "r" || e.key === "R") { e.preventDefault(); openSheet(); return; }
    if (e.key === "s" || e.key === "S") { e.preventDefault(); go("stats"); return; }
    if (e.key === "p" || e.key === "P" || (e.key === "Escape" && view === "stats")) { e.preventDefault(); go("practice"); return; }
  }
  if (view !== "practice") return;
  if (e.key === "Enter") { if (e.target.tagName === "BUTTON" && e.target.dataset.choice === undefined) return; e.preventDefault(); answered ? nextQuestion() : check(); return; }
  if (!inInput && Q && Q.type === "mcq") { const i = LETTERS.indexOf(e.key.toUpperCase()); if (i >= 0) pickChoice(i); }
});

/* ---------- ASCII donut (a spinning torus, z-buffered and shaded per character) ---------- */
(function donut() {
  const el = $("donut"); if (!el) return;
  const W = 40, H = 20, CH = ".,-~:;=!*#$@";
  const frame = (A, B) => {
    const out = new Array(W * H).fill(" "), zb = new Float32Array(W * H);
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    for (let j = 0; j < 6.283; j += 0.07) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < 6.283; i += 0.02) {
        const sp = Math.sin(i), cp = Math.cos(i), h = ct + 2;
        const D = 1 / (sp * h * sA + st * cA + 5), t = sp * h * cA - st * sA;
        const x = Math.floor(W / 2 + W * 0.6 * D * (cp * h * cB - t * sB));
        const y = Math.floor(H / 2 + H * 0.6 * D * (cp * h * sB + t * cB));
        const o = x + W * y;
        if (y < 0 || y >= H || x < 0 || x >= W || D <= zb[o]) continue;
        zb[o] = D;
        const L = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
        out[o] = CH[L > 0 ? L : 0];
      }
    }
    let s = ""; for (let r = 0; r < H; r++) s += out.slice(r * W, r * W + W).join("") + "\n";
    return s;
  };
  let A = 1, B = 1;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = frame(A, B); return; }
  let last = 0;
  const step = (ts) => { if (ts - last > 45) { last = ts; A += 0.07; B += 0.03; el.textContent = frame(A, B); } requestAnimationFrame(step); };
  requestAnimationFrame(step);
})();

renderControls(); renderProgress(); nextQuestion(); fromHash();

/* ===== Core: math helpers, question generators, answer checker (no DOM) ===== */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const RNZ = (a, b) => { let v; do { v = R(a, b); } while (v === 0); return v; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
function F(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; }
const fEq = (a, b) => a.n * b.d === b.n * a.d;
const fVal = (f) => f.n / f.d;
const fStr = (f) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
const MINUS = "−";
const num = (v) => (v < 0 ? MINUS + Math.abs(v) : String(v));
const paren = (v) => (v < 0 ? `(${num(v)})` : String(v));
function fHtml(f) {
  if (f.d === 1) return num(f.n);
  return `${f.n < 0 ? MINUS : ""}<span class="frac"><span>${Math.abs(f.n)}</span><span>${f.d}</span></span>`;
}
const V = (v) => `<i>${v}</i>`;
/* linear expression from [[coef, var], ...] */
function expr(terms) {
  let out = "";
  for (const [c, v] of terms) {
    if (c === 0) continue;
    const a = Math.abs(c);
    const body = v ? (a === 1 ? "" : a) + V(v) : String(a);
    if (out === "") out = (c < 0 ? MINUS : "") + body;
    else out += (c < 0 ? ` ${MINUS} ` : " + ") + body;
  }
  return out || "0";
}
const ineqSym = { "<": "&lt;", ">": "&gt;", "<=": "&le;", ">=": "&ge;" };
const flip = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };

/* Build a numeric multiple-choice question: 4 distinct options sorted ascending (SAT style). */
function numericMCQ(correct, distractors) {
  const seen = new Set([fStr(correct)]);
  const opts = [correct];
  for (const d of distractors) {
    if (opts.length >= 4) break;
    if (!d || !Number.isInteger(d.n) || !Number.isInteger(d.d)) continue;
    const k = fStr(d);
    if (!seen.has(k)) { seen.add(k); opts.push(d); }
  }
  let guard = 0;
  while (opts.length < 4 && guard++ < 200) {
    const o = F(correct.n + RNZ(-6, 6) * correct.d, correct.d);
    const k = fStr(o);
    if (!seen.has(k)) { seen.add(k); opts.push(o); }
  }
  opts.sort((a, b) => fVal(a) - fVal(b));
  return { choices: opts.map(fHtml), answer: opts.findIndex((o) => fEq(o, correct)) };
}
function textMCQ(correct, distractors) {
  const uniq = [...new Set(distractors.filter((d) => d !== correct))].slice(0, 3);
  if (uniq.length < 3) throw new Error("retry");
  const opts = shuffle([correct, ...uniq]);
  return { choices: opts, answer: opts.indexOf(correct) };
}
/* Wrap a numeric answer as either MCQ or SPR */
function numQ(base, value, distractors, sprChance = 0.3) {
  if (Math.random() < sprChance) return { ...base, type: "spr", value };
  return { ...base, type: "mcq", ...numericMCQ(value, distractors) };
}

/* ---------- Skill catalogue (matches sat_math_skills.json) ---------- */
const DOMAINS = [
  { id: "alg", name: "Algebra", ready: true, skills: [
    { id: "alg.lin1", name: "Linear equations in one variable", short: "Linear eq. (1 var)" },
    { id: "alg.lin2", name: "Linear equations in two variables", short: "Linear eq. (2 var)" },
    { id: "alg.linfn", name: "Linear functions", short: "Linear functions" },
    { id: "alg.sys", name: "Systems of linear equations", short: "Systems" },
    { id: "alg.ineq", name: "Linear inequalities", short: "Inequalities" },
  ] },
  { id: "adv", name: "Advanced Math", ready: true, skills: [
    { id: "adv.equiv", name: "Equivalent expressions", short: "Equivalent expressions" },
    { id: "adv.nonlin", name: "Nonlinear equations and systems", short: "Nonlinear equations" },
    { id: "adv.nlfn", name: "Nonlinear functions", short: "Nonlinear functions" },
  ] },
  { id: "psda", name: "Problem-Solving & Data Analysis", ready: true, skills: [
    { id: "psda.ratio", name: "Ratios, rates, proportions, and units", short: "Ratios & rates" },
    { id: "psda.pct", name: "Percentages", short: "Percentages" },
    { id: "psda.data1", name: "One-variable data", short: "One-variable data" },
    { id: "psda.data2", name: "Two-variable data and scatterplots", short: "Scatterplots & models" },
    { id: "psda.prob", name: "Probability and conditional probability", short: "Probability" },
    { id: "psda.infer", name: "Inference and margin of error", short: "Margin of error" },
    { id: "psda.claims", name: "Evaluating statistical claims", short: "Statistical claims" },
  ] },
  { id: "geo", name: "Geometry & Trigonometry", ready: true, skills: [
    { id: "geo.area", name: "Area and volume", short: "Area & volume" },
    { id: "geo.lines", name: "Lines, angles, and triangles", short: "Lines & angles" },
    { id: "geo.trig", name: "Right triangles and trigonometry", short: "Right triangles & trig" },
    { id: "geo.circ", name: "Circles", short: "Circles" },
  ] },
];
const SKILLS = DOMAINS.flatMap((d) => d.skills.map((k) => ({ ...k, domain: d.id })));
const DIFFS = ["easy", "medium", "hard"];

/* ---------- Generators ---------- */
function moveConst(b) {
  return b >= 0 ? `Subtract ${b} from both sides` : `Add ${Math.abs(b)} to both sides`;
}

const GEN = {
  "alg.lin1": {
    easy() {
      const x = RNZ(-9, 12), a = R(2, 9), b = RNZ(-15, 15), c = a * x + b;
      return numQ({
        stem: `If ${expr([[a, "x"], [b, ""]])} = ${num(c)}, what is the value of ${V("x")}?`,
        explain: `${moveConst(b)}: ${a}${V("x")} = ${num(c - b)}. Then divide both sides by ${a}: ${V("x")} = ${num(x)}.`,
      }, F(x), [F(c + b, a), F(c - b), F(-x), F(c, a)]);
    },
    medium() {
      if (Math.random() < 0.5) {
        const x = RNZ(-8, 10), a = R(2, 7), b = RNZ(-6, 6);
        let c; do { c = RNZ(-5, 9); } while (c === a);
        const d = a * (x + b) - c * x;
        return numQ({
          stem: `What value of ${V("x")} satisfies the equation ${a}(${expr([[1, "x"], [b, ""]])}) = ${expr([[c, "x"], [d, ""]])}?`,
          explain: `Distribute the ${a}: ${expr([[a, "x"], [a * b, ""]])} = ${expr([[c, "x"], [d, ""]])}. Collect ${V("x")} terms on the left and constants on the right: ${a - c === 1 ? "" : a - c === -1 ? MINUS : num(a - c)}${V("x")} = ${num(d - a * b)}. Divide by ${paren(a - c)}: ${V("x")} = ${num(x)}.`,
        }, F(x), [F(d + a * b, a - c), F(d - b, a - c), F(-x), F(d - a * b, a + c)]);
      }
      const f = R(2, 8) * 5, r = R(15, 45), m = R(3, 12), T = f + r * m;
      const name = pick(["Maya", "Jonas", "Priya", "Eli", "Sofia"]);
      return numQ({
        stem: `A gym charges a one-time sign-up fee of $${f} plus $${r} per month. ${name} has paid the gym a total of $${T}. For how many months has ${name} been a member?`,
        explain: `If ${V("m")} is the number of months, ${f} + ${r}${V("m")} = ${T}. Subtract ${f}: ${r}${V("m")} = ${T - f}. Divide by ${r}: ${V("m")} = ${m}.`,
      }, F(m), [F(T, r), F(T + f, r), F(m + 1), F(m - 1)]);
    },
    hard() {
      if (Math.random() < 0.5) {
        const p = R(2, 9), q = RNZ(-6, 6), s = RNZ(-12, 12);
        const lhsConst = s - p * q;
        let t; do { t = RNZ(-15, 15); } while (t === lhsConst);
        return numQ({
          stem: `${p}(${expr([[1, "x"], [-q, ""]])}) ${s < 0 ? MINUS : "+"} ${Math.abs(s)} = ${V("k")}${V("x")} ${t < 0 ? MINUS : "+"} ${Math.abs(t)}<br>In the equation above, ${V("k")} is a constant. If the equation has no solution, what is the value of ${V("k")}?`,
          explain: `The left side simplifies to ${expr([[p, "x"], [lhsConst, ""]])}. A linear equation has no solution when both sides have the same ${V("x")}-coefficient but different constants. The constants ${num(lhsConst)} and ${num(t)} are already different, so the ${V("x")}-coefficients must match: ${V("k")} = ${p}.`,
        }, F(p), [F(-p), F(q), F(p * q), F(s)]);
      }
      let p, q; do { p = R(2, 6); q = R(2, 6); } while (p === q);
      const r = R(1, 9);
      const x = F(r * p * q, p + q);
      return {
        type: "spr", value: x,
        stem: `What is the solution to the equation <span class="nowrap"><span class="frac"><span>${V("x")}</span><span>${p}</span></span> + <span class="frac"><span>${V("x")}</span><span>${q}</span></span> = ${r}</span>?`,
        explain: `Multiply both sides by ${p * q} to clear the fractions: ${q}${V("x")} + ${p}${V("x")} = ${r * p * q}, so ${p + q}${V("x")} = ${r * p * q} and ${V("x")} = ${fHtml(x)}.`,
      };
    },
  },

  "alg.lin2": {
    easy() {
      const x0 = RNZ(-6, 6), y0 = RNZ(-8, 8), a = RNZ(-7, 7), b = RNZ(-6, 6), c = a * x0 + b * y0;
      return numQ({
        stem: `The equation ${expr([[a, "x"], [b, "y"]])} = ${num(c)} relates ${V("x")} and ${V("y")}. What is the value of ${V("y")} when ${V("x")} = ${num(x0)}?`,
        explain: `Substitute ${V("x")} = ${num(x0)}: ${expr([[a * x0, ""], [b, "y"]])} = ${num(c)}. So ${expr([[b, "y"]])} = ${num(c - a * x0)}${b === 1 ? "" : `, and dividing by ${paren(b)} gives ${V("y")} = ${num(y0)}`}.`,
      }, F(y0), [F(c + a * x0, b), F(-y0), F(c - a * x0), F(c, b)]);
    },
    medium() {
      const ctx = pick([
        () => { const F0 = R(4, 12) * 10, r = R(6, 14) * 5;
          return { eq: `${V("C")} = ${F0} + ${r}${V("h")}`, setup: `A plumber uses the equation ${V("C")} = ${F0} + ${r}${V("h")} to find the total charge ${V("C")}, in dollars, for a job that takes ${V("h")} hours.`,
            slope: `The plumber charges $${r} for each hour of work.`, inter: `The plumber charges a fixed $${F0} for every job, before any hours are counted.`,
            wrongs: [`A job that takes 1 hour costs a total of $${r}.`, `The plumber works ${r} hours on a typical job.`, `A job costs $${F0 + r} for each hour of work.`], sym: [`${r}`, `${F0}`] }; },
        () => { const S = R(80, 100), D = R(6, 15);
          return { eq: `${V("B")} = ${S} ${MINUS} ${D}${V("t")}`, setup: `The equation ${V("B")} = ${S} ${MINUS} ${D}${V("t")} estimates the percent of battery ${V("B")} left on a phone ${V("t")} hours after it was unplugged.`,
            slope: `The battery level drops by ${D} percentage points each hour.`, inter: `The battery level was ${S}% when the phone was unplugged.`,
            wrongs: [`The battery will be empty after ${D} hours.`, `The battery level is ${D}% after 1 hour.`, `The phone was unplugged for ${S} hours.`], sym: [`${D}`, `${S}`] }; },
        () => { const S = R(3, 20) * 10, W = R(3, 9) * 5; const n = pick(["Jae", "Amara", "Luca", "Noor"]);
          return { eq: `${V("A")} = ${S} + ${W}${V("w")}`, setup: `${n} is saving money. The equation ${V("A")} = ${S} + ${W}${V("w")} gives the amount ${V("A")}, in dollars, in ${n}'s savings account ${V("w")} weeks after starting a new plan.`,
            slope: `${n} adds $${W} to the account each week.`, inter: `${n} had $${S} in the account when the plan started.`,
            wrongs: [`${n} will have $${W} after 1 week.`, `${n} has been saving for ${W} weeks.`, `${n} adds $${S} to the account each week.`], sym: [`${W}`, `${S}`] }; },
      ])();
      if (ctx.sym[0] === ctx.sym[1]) return GEN["alg.lin2"].medium();
      const askSlope = Math.random() < 0.5;
      const correct = askSlope ? ctx.slope : ctx.inter;
      const other = askSlope ? ctx.inter : ctx.slope;
      return { type: "mcq",
        stem: `${ctx.setup} What is the best interpretation of ${ctx.sym[askSlope ? 0 : 1]} in this context?`,
        explain: askSlope
          ? `${ctx.sym[0]} multiplies the variable, so it is the rate of change: how much the output changes each time the input goes up by 1. ${correct}`
          : `${ctx.sym[1]} is the constant term, so it is the value when the input is 0 (the starting value). ${correct}`,
        ...textMCQ(correct, [other, ...shuffle(ctx.wrongs).slice(0, 2)]) };
    },
    hard() {
      const m = F(RNZ(-6, 6), R(1, 4));
      const x1 = m.d * R(-3, 3), y1 = R(-9, 9);
      const x2 = x1 + m.d * R(1, 3), y2 = y1 + (m.n * (x2 - x1)) / m.d;
      const b = y1 - (m.n * x1) / m.d; // integer by construction
      if (b === 0) return GEN["alg.lin2"].hard();
      const xi = F(-b * m.d, m.n);
      return { type: "spr", value: xi,
        stem: `A line in the ${V("xy")}-plane passes through the points (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}). The line crosses the ${V("x")}-axis at the point (${V("a")}, 0). What is the value of ${V("a")}?`,
        explain: `Slope = (${num(y2)} ${MINUS} ${paren(y1)}) / (${num(x2)} ${MINUS} ${paren(x1)}) = ${fHtml(m)}. Using ${V("y")} = ${V("m")}${V("x")} + ${V("b")} with (${num(x1)}, ${num(y1)}) gives ${V("b")} = ${num(b)}. Set ${V("y")} = 0: 0 = ${fHtml(m)}${V("x")} + ${paren(b)}, so ${V("x")} = ${fHtml(xi)}.`,
      };
    },
  },

  "alg.linfn": {
    easy() {
      const m = RNZ(-7, 9), b = RNZ(-12, 12), k = RNZ(-6, 8), v = m * k + b;
      return numQ({
        stem: `The function ${V("f")} is defined by ${V("f")}(${V("x")}) = ${expr([[m, "x"], [b, ""]])}. What is the value of ${V("f")}(${num(k)})?`,
        explain: `Replace ${V("x")} with ${num(k)}: ${V("f")}(${num(k)}) = ${num(m)}(${num(k)}) + ${paren(b)} = ${num(m * k)} + ${paren(b)} = ${num(v)}.`,
      }, F(v), [F(m * k - b), F(m + k + b), F(m * k), F(-v)]);
    },
    medium() {
      const m = RNZ(-6, 6), b = RNZ(-10, 10);
      let p, r; do { p = R(-4, 6); r = R(-4, 6); } while (p === r);
      const q1 = m * p + b, q2 = m * r + b;
      const askZero = Math.random() < 0.5;
      let s; do { s = R(-5, 9); } while (s === p || s === r);
      const target = askZero ? 0 : s, v = m * target + b;
      return numQ({
        stem: `For the linear function ${V("f")}, ${V("f")}(${num(p)}) = ${num(q1)} and ${V("f")}(${num(r)}) = ${num(q2)}. What is the value of ${V("f")}(${num(target)})?`,
        explain: `Slope = (${num(q2)} ${MINUS} ${paren(q1)}) / (${num(r)} ${MINUS} ${paren(p)}) = ${num(m)}. Then ${V("f")}(${V("x")}) = ${num(m)}${V("x")} + ${V("b")}; using ${V("f")}(${num(p)}) = ${num(q1)} gives ${V("b")} = ${num(b)}. So ${V("f")}(${num(target)}) = ${num(m)}(${num(target)}) + ${paren(b)} = ${num(v)}.`,
      }, F(v), [F(m * target), F(-m * target + b), F(q1 + q2), F(v + m)]);
    },
    hard() {
      const m = RNZ(-5, 5), b = RNZ(-9, 9), k = RNZ(-8, 8);
      let p, r; do { p = R(-3, 5); r = R(-3, 5); } while (p === r);
      const q1 = m * p + b, q2 = m * r + b, t = RNZ(-4, 4);
      const v = m * 2 * t + b + k;
      return numQ({
        stem: `For the linear function ${V("f")}, ${V("f")}(${num(p)}) = ${num(q1)} and ${V("f")}(${num(r)}) = ${num(q2)}. The function ${V("g")} is defined by ${V("g")}(${V("x")}) = ${V("f")}(2${V("x")}) ${k < 0 ? MINUS : "+"} ${Math.abs(k)}. What is the value of ${V("g")}(${num(t)})?`,
        explain: `First find ${V("f")}: slope = (${num(q2)} ${MINUS} ${paren(q1)}) / (${num(r)} ${MINUS} ${paren(p)}) = ${num(m)}, and ${V("f")}(${V("x")}) = ${expr([[m, "x"], [b, ""]])}. Then ${V("g")}(${num(t)}) = ${V("f")}(${num(2 * t)}) ${k < 0 ? MINUS : "+"} ${Math.abs(k)} = (${num(m * 2 * t + b)}) ${k < 0 ? MINUS : "+"} ${Math.abs(k)} = ${num(v)}.`,
      }, F(v), [F(m * t + b + k), F(2 * (m * t + b) + k), F(m * 2 * t + b - k), F(m * 2 * t + k)]);
    },
  },

  "alg.sys": {
    easy() {
      const x0 = RNZ(-6, 8), y0 = RNZ(-8, 10), m = RNZ(-4, 5), c = y0 - m * x0, s = x0 + y0;
      const askX = Math.random() < 0.5;
      return numQ({
        stem: `<div class="sys"><div>${V("y")} = ${expr([[m, "x"], [c, ""]])}</div><div>${V("x")} + ${V("y")} = ${num(s)}</div></div>The solution to the system of equations above is (${V("x")}, ${V("y")}). What is the value of ${askX ? V("x") : V("y")}?`,
        explain: `Substitute the first equation into the second: ${V("x")} + (${expr([[m, "x"], [c, ""]])}) = ${num(s)}, so ${expr([[m + 1, "x"]])} = ${num(s - c)} and ${V("x")} = ${num(x0)}. Then ${V("y")} = ${num(s)} ${MINUS} ${paren(x0)} = ${num(y0)}.`,
      }, F(askX ? x0 : y0), [F(askX ? y0 : x0), F(s), F(askX ? -x0 : -y0), F(c)]);
    },
    medium() {
      if (Math.random() < 0.5) {
        const pa = R(9, 16), pc = R(4, pa - 3), A = R(6, 40), C = R(6, 40), n = A + C, rev = pa * A + pc * C;
        return numQ({
          stem: `A school play sold ${n} tickets for a total of $${rev}. Adult tickets cost $${pa} each and student tickets cost $${pc} each. How many adult tickets were sold?`,
          explain: `Let ${V("a")} = adult tickets and ${V("s")} = student tickets. Then ${V("a")} + ${V("s")} = ${n} and ${pa}${V("a")} + ${pc}${V("s")} = ${rev}. Multiply the first equation by ${pc} and subtract it: ${pa - pc}${V("a")} = ${rev - pc * n}, so ${V("a")} = ${A}.`,
        }, F(A), [F(C), F(Math.round(rev / pa)), F(n - Math.round(rev / pa)), F(A + 1)]);
      }
      let a1, b1, a2, b2;
      do { a1 = RNZ(-5, 6); b1 = RNZ(-5, 6); a2 = RNZ(-5, 6); b2 = RNZ(-5, 6); } while (a1 * b2 - a2 * b1 === 0);
      const x0 = RNZ(-6, 6), y0 = RNZ(-6, 6), c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
      const ask = pick(["x+y", "x-y", "x", "y"]);
      const val = { "x+y": x0 + y0, "x-y": x0 - y0, x: x0, y: y0 }[ask];
      const label = { "x+y": `${V("x")} + ${V("y")}`, "x-y": `${V("x")} ${MINUS} ${V("y")}`, x: V("x"), y: V("y") }[ask];
      return numQ({
        stem: `<div class="sys"><div>${expr([[a1, "x"], [b1, "y"]])} = ${num(c1)}</div><div>${expr([[a2, "x"], [b2, "y"]])} = ${num(c2)}</div></div>If (${V("x")}, ${V("y")}) is the solution to the system above, what is the value of ${label}?`,
        explain: `Eliminate one variable: multiply the equations so one variable's coefficients match, then subtract. Solving gives ${V("x")} = ${num(x0)} and ${V("y")} = ${num(y0)}, so ${label} = ${num(val)}. (Tip: in Desmos, type both equations and click the intersection point.)`,
      }, F(val), [F(x0 + y0), F(x0 - y0), F(y0 - x0), F(-(x0 + y0)), F(x0 * y0)]);
    },
    hard() {
      let a, b; do { a = RNZ(-6, 7); b = RNZ(-6, 7); } while (gcd(a, b) !== 1);
      const c = RNZ(-12, 12), t = pick([-3, -2, 2, 3, 4]), q = t * b;
      if (Math.random() < 0.5) {
        let d; do { d = RNZ(-30, 30); } while (d === t * c);
        return numQ({
          stem: `<div class="sys"><div>${expr([[a, "x"], [b, "y"]])} = ${num(c)}</div><div>${V("k")}${V("x")} + ${q < 0 ? MINUS : ""}${Math.abs(q) === 1 ? "" : Math.abs(q)}${V("y")} = ${num(d)}</div></div>In the system of equations above, ${V("k")} is a constant. If the system has no solution, what is the value of ${V("k")}?`,
          explain: `A system of two linear equations has no solution when the lines are parallel: the coefficients are proportional but the constants are not. The ${V("y")}-coefficient ${num(q)} is ${num(t)} times ${num(b)}, so ${V("k")} must be ${num(t)} × ${paren(a)} = ${num(t * a)}. (Check: ${num(t)} × ${paren(c)} = ${num(t * c)} ≠ ${num(d)}, so the lines are parallel, not the same line.)`,
        }, F(t * a), [F(a), F(-t * a), F(t * b), F(q - a)]);
      }
      const k = t * a;
      return numQ({
        stem: `<div class="sys"><div>${expr([[a, "x"], [b, "y"]])} = ${num(c)}</div><div>${expr([[k, "x"], [q, "y"]])} = ${V("d")}</div></div>In the system of equations above, ${V("d")} is a constant. If the system has infinitely many solutions, what is the value of ${V("d")}?`,
        explain: `Infinitely many solutions means both equations describe the same line, so the second equation must be the first multiplied by one number. ${num(k)} = ${num(t)} × ${paren(a)} and ${num(q)} = ${num(t)} × ${paren(b)}, so ${V("d")} = ${num(t)} × ${paren(c)} = ${num(t * c)}.`,
      }, F(t * c), [F(c), F(-t * c), F(t + c), F(c * k)]);
    },
  },

  "alg.ineq": {
    easy() { return ineqSolve(R(2, 9)); },
    medium() {
      if (Math.random() < 0.5) return ineqSolve(-R(2, 8));
      const w = R(18, 65), d = R(150, 260), M = R(15, 40) * 100;
      const maxB = Math.floor((M - d) / w);
      return { type: "spr", value: F(maxB),
        stem: `A delivery van can safely carry at most ${M.toLocaleString("en-US")} pounds. The driver and equipment weigh ${d} pounds. Each box weighs ${w} pounds. What is the maximum number of boxes the van can safely carry?`,
        explain: `If ${V("b")} is the number of boxes, ${d} + ${w}${V("b")} ≤ ${M}. So ${w}${V("b")} ≤ ${M - d} and ${V("b")} ≤ ${(M - d) / w % 1 === 0 ? (M - d) / w : ((M - d) / w).toFixed(2) + "…"}. Boxes come in whole numbers, so the maximum is ${maxB}.`,
      };
    },
    hard() {
      const m1 = RNZ(-3, 3), b1 = R(-4, 3);
      let m2; do { m2 = RNZ(-3, 3); } while (m2 === m1);
      const b2 = R(b1 + 1, b1 + 6);
      const s1 = pick([">", ">="]), s2 = pick(["<", "<="]);
      const test = (op, l, r) => ({ "<": l < r, ">": l > r, "<=": l <= r, ">=": l >= r }[op]);
      const ok1 = ([x, y]) => test(s1, y, m1 * x + b1), ok2 = ([x, y]) => test(s2, y, m2 * x + b2);
      const pts = []; for (let x = -5; x <= 5; x++) for (let y = -8; y <= 10; y++) pts.push([x, y]);
      const good = pts.filter((p) => ok1(p) && ok2(p));
      const near = pts.filter((p) => ok1(p) !== ok2(p));
      if (!good.length || near.length < 3) return GEN["alg.ineq"].hard();
      const g = pick(good), bad = shuffle(near).slice(0, 3);
      const fmt = ([x, y]) => `(${num(x)}, ${num(y)})`;
      const why = ([x, y]) => `${fmt([x, y])}: ${ok1([x, y]) ? "passes" : "fails"} the first, ${ok2([x, y]) ? "passes" : "fails"} the second`;
      return { type: "mcq",
        stem: `<div class="sys"><div>${V("y")} ${ineqSym[s1]} ${expr([[m1, "x"], [b1, ""]])}</div><div>${V("y")} ${ineqSym[s2]} ${expr([[m2, "x"], [b2, ""]])}</div></div>Which point (${V("x")}, ${V("y")}) is a solution to the system of inequalities above?`,
        explain: `A solution must make both inequalities true. Plug each point in: ${[g, ...bad].map(why).join("; ")}. Only ${fmt(g)} passes both. (In Desmos you can graph both inequalities and see which point is in the overlap.)`,
        ...textMCQ(fmt(g), bad.map(fmt)) };
    },
  },
};

function ineqSolve(a) {
  const v = RNZ(-8, 9), b = RNZ(-12, 12), op = pick(["<", ">", "<=", ">="]), c = a * v + b;
  const res = a < 0 ? flip[op] : op;
  const opt = (o, val) => `${V("x")} ${ineqSym[o]} ${num(val)}`;
  const correct = opt(res, v);
  const wrongV = v + (a < 0 ? 0 : 0) + pick([-2, -1, 1, 2]);
  const alt = (c + b) / a;
  const altV = Number.isInteger(alt) && alt !== v ? alt : wrongV;
  return { type: "mcq",
    stem: `Which of the following describes all solutions to the inequality ${expr([[a, "x"], [b, ""]])} ${ineqSym[op]} ${num(c)}?`,
    explain: `${moveConst(b)}: ${a}${V("x")} ${ineqSym[op]} ${num(c - b)}. Divide both sides by ${paren(a)}${a < 0 ? `. Because you divided by a negative number, the inequality sign flips: ` : ": "}${correct}.`,
    ...textMCQ(correct, [opt(flip[res], v), opt(res, altV === v ? v + 3 : altV), opt(flip[res], altV === v ? v + 3 : altV)]) };
}

function generate(skill, diff) {
  let q, tries = 0;
  for (;;) { try { q = GEN[skill][diff](); break; } catch (e) { if (e.message !== "retry" || ++tries > 50) throw e; } }
  return { ...q, skill, diff, id: `${skill}-${diff}-${Date.now().toString(36)}${R(100, 999)}` };
}

/* ---------- SPR (grid-in) answer checker, following digital SAT entry rules ---------- */
function checkSPR(raw, ans) {
  const s = String(raw).trim().replace(/−/g, "-");
  if (!s) return { valid: false, msg: "Type an answer first." };
  if (/\s/.test(s)) return { valid: false, msg: "No spaces. Mixed numbers like 1 1/2 aren't allowed; enter 3/2 or 1.5 instead." };
  if (!/^-?(\d+\.?\d*|\.\d+|\d+\/\d+)$/.test(s)) return { valid: false, msg: "Use only digits, one decimal point or one fraction bar (/), and a minus sign in front if negative." };
  const neg = s.startsWith("-"), max = neg ? 6 : 5;
  if (s.length > max) return { valid: false, msg: `Too long. The SAT allows ${max} characters for a ${neg ? "negative" : "positive"} answer, counting ${neg ? "the minus sign, " : ""}any decimal point or fraction bar.` };
  const body = neg ? s.slice(1) : s;
  if (body.includes("/")) {
    const [a, b] = body.split("/").map(Number);
    if (b === 0) return { valid: false, msg: "The denominator can't be 0." };
    return { valid: true, ok: fEq(F(neg ? -a : a, b), ans) };
  }
  const [ip, fp = ""] = body.split(".");
  const k = fp.length, scaled = Number((ip || "0") + fp);
  if (fEq(F(neg ? -scaled : scaled, 10 ** k), ans)) return { valid: true, ok: true };
  // Answers that don't fit as decimals: accept truncated or rounded if every character slot is used.
  const ansNeg = ans.n < 0;
  if (s.length === max && k > 0 && ansNeg === neg) {
    const exact = (Math.abs(ans.n) * 10 ** k) / ans.d;
    if (scaled === Math.floor(exact + 1e-9) || scaled === Math.round(exact)) return { valid: true, ok: true };
  }
  return { valid: true, ok: false };
}

/* Forms the SAT would accept, for showing after a question */
function acceptedForms(ans) {
  const forms = [fStr(ans)];
  if (ans.d === 1) return forms;
  const neg = ans.n < 0, max = neg ? 6 : 5;
  let d = ans.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
  if (d === 1) { const dec = String(fVal(ans)).replace(/^(-?)0\./, "$1."); if (dec.length <= max) { forms.push(dec); return forms.filter((f) => checkSPR(f, ans).ok); } }
  const intPart = String(Math.trunc(Math.abs(fVal(ans))));
  const lead = intPart === "0" ? "" : intPart;
  const k = max - (neg ? 1 : 0) - lead.length - 1;
  if (k >= 1) {
    const exact = (Math.abs(ans.n) * 10 ** k) / ans.d;
    const mk = (v) => { const str = String(v).padStart(k + lead.length, "0"); return (neg ? "-" : "") + str.slice(0, str.length - k) + "." + str.slice(-k); };
    const t = mk(Math.floor(exact + 1e-9)), r = mk(Math.round(exact));
    forms.push(t); if (r !== t) forms.push(r);
  }
  return forms.filter((f) => checkSPR(f, ans).ok);
}

if (typeof module !== "undefined") module.exports = { GEN, SKILLS, DOMAINS, DIFFS, generate, checkSPR, acceptedForms, F, fStr, fVal };

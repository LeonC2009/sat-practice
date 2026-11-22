/* ===== Advanced Math generators (extends GEN from core.js) ===== */
/* polynomial from coefficients, highest power first */
function poly(cs, v = "x") {
  const n = cs.length - 1;
  let out = "";
  cs.forEach((c, i) => {
    if (c === 0) return;
    const p = n - i, a = Math.abs(c);
    const vv = p === 0 ? "" : p === 1 ? V(v) : `${V(v)}<sup>${p}</sup>`;
    const body = p === 0 ? String(a) : (a === 1 ? "" : a) + vv;
    out += out === "" ? (c < 0 ? MINUS : "") + body : (c < 0 ? ` ${MINUS} ` : " + ") + body;
  });
  return out || "0";
}
const lin = (a, b) => `(${poly([a, b])})`; // (ax + b)
const xPow = (e) => (e === 1 ? V("x") : `${V("x")}<sup>${typeof e === "number" ? num(e) : e}</sup>`);
const sqrtH = (inner) => `<span class="rt">√<span class="rad">${inner}</span></span>`;
const nrootH = (n, inner) => (n === 2 ? sqrtH(inner) : `<span class="rt"><sup class="idx">${n}</sup>√<span class="rad">${inner}</span></span>`);
const pm = (h, r) => `${num(h)} ± ${r}`;

Object.assign(GEN, {
  "adv.equiv": {
    easy() {
      if (Math.random() < 0.5) {
        const P = [RNZ(-6, 8), RNZ(-9, 9), RNZ(-12, 12)], Q = [RNZ(-5, 6), RNZ(-9, 9), RNZ(-12, 12)];
        const minus = Math.random() < 0.5, sg = minus ? -1 : 1;
        const Rr = P.map((p, i) => p + sg * Q[i]);
        const W = P.map((p, i) => p - sg * Q[i]);
        const wrongs = [0, 1, 2].map((j) => poly(Rr.map((r, i) => (i === j ? W[i] : r))));
        return { type: "mcq",
          stem: `Which expression is equivalent to (${poly(P)}) ${minus ? MINUS : "+"} (${poly(Q)})?`,
          explain: minus
            ? `Subtracting a polynomial means changing the sign of every one of its terms: (${poly(P)}) + (${poly(Q.map((q) => -q))}). Then combine like terms: ${poly(Rr)}.`
            : `Combine like terms: ${V("x")}<sup>2</sup> terms ${num(P[0])} + ${paren(Q[0])} = ${num(Rr[0])}, ${V("x")} terms ${num(P[1])} + ${paren(Q[1])} = ${num(Rr[1])}, constants ${num(P[2])} + ${paren(Q[2])} = ${num(Rr[2])}. Result: ${poly(Rr)}.`,
          ...textMCQ(poly(Rr), shuffle(wrongs)) };
      }
      const a = R(2, 7), b = RNZ(-8, 8), c = R(2, 6), d = RNZ(-8, 8);
      const res = [a - c, a * b - c * d];
      return { type: "mcq",
        stem: `Which expression is equivalent to ${a}${lin(1, b)} ${MINUS} ${c}${lin(1, d)}?`,
        explain: `Distribute each group: ${a}${lin(1, b)} = ${poly([a, a * b])} and ${c}${lin(1, d)} = ${poly([c, c * d])}. The minus sign applies to both terms of the second result: ${poly([a, a * b])} + (${poly([-c, -c * d])}). Combine like terms: ${poly(res)}.`,
        ...textMCQ(poly(res), [poly([a - c, a * b + c * d]), poly([a + c, a * b - c * d]), poly([a - c, b - d])]) };
    },
    medium() {
      const a = R(1, 5), b = RNZ(-7, 7), c = R(1, 5), d = RNZ(-7, 7);
      const res = [a * c, a * d + b * c, b * d];
      const r = Math.random();
      if (r < 0.4) {
        return { type: "mcq",
          stem: `Which expression is equivalent to ${lin(a, b)}${lin(c, d)}?`,
          explain: `Multiply every term in the first factor by every term in the second (FOIL): ${a * c === 1 ? "" : a * c}${V("x")}<sup>2</sup> + ${paren(a * d)}${V("x")} + ${paren(b * c)}${V("x")} + ${paren(b * d)}. Combine the ${V("x")} terms: ${poly(res)}.`,
          ...textMCQ(poly(res), [poly([a * c, 0, b * d]), poly([a * c, a * d - b * c, b * d]), poly([a * c, a * d + b * c, -b * d]), poly([a * c, b + d, b * d])]) };
      }
      if (r < 0.7) {
        return { type: "spr", value: F(res[1]),
          stem: `The expression ${lin(a, b)}${lin(c, d)} is equivalent to ${V("p")}${V("x")}<sup>2</sup> + ${V("q")}${V("x")} + ${V("r")}, where ${V("p")}, ${V("q")}, and ${V("r")} are constants. What is the value of ${V("q")}?`,
          explain: `Expand: the ${V("x")} terms come from the outer and inner products, ${a}·${paren(d)} + ${paren(b)}·${c} = ${num(a * d)} + ${paren(b * c)} = ${num(res[1])}. So ${V("q")} = ${num(res[1])}.`,
        };
      }
      let r1, r2; do { r1 = RNZ(-9, 9); r2 = RNZ(-9, 9); } while (r1 === r2 || r1 === -r2);
      const fac = (k) => `(${poly([1, -k])})`;
      return { type: "mcq",
        stem: `Which of the following is a factor of ${poly([1, -(r1 + r2), r1 * r2])}?`,
        explain: `Find two numbers that multiply to ${num(r1 * r2)} and add to ${num(-(r1 + r2))}: ${num(-r1)} and ${num(-r2)}. So ${poly([1, -(r1 + r2), r1 * r2])} = ${fac(r1)}${fac(r2)}, and ${fac(r1)} is a factor.`,
        ...textMCQ(fac(r1), [fac(-r1), fac(-r2), fac(r1 + r2), fac(r1 * r2)]) };
    },
    hard() {
      const r = Math.random();
      if (r < 0.4) {
        const p = R(2, 5), q = RNZ(-6, 6), k = RNZ(-9, 9), N = k * q, m = p * q + k;
        return numQ({
          stem: `If (${p}${V("x")} + ${V("k")})${lin(1, q)} = ${p}${V("x")}<sup>2</sup> + ${V("m")}${V("x")} ${N < 0 ? MINUS : "+"} ${Math.abs(N)} for all values of ${V("x")}, where ${V("k")} and ${V("m")} are constants, what is the value of ${V("m")}?`,
          explain: `Expanding the left side gives ${p}${V("x")}<sup>2</sup> + (${p}·${paren(q)} + ${V("k")})${V("x")} ${q < 0 ? MINUS : "+"} ${Math.abs(q) === 1 ? "" : Math.abs(q)}${V("k")}. Matching constants: ${num(q)}${V("k")} = ${num(N)}, so ${V("k")} = ${num(k)}. Then ${V("m")} = ${num(p * q)} + ${paren(k)} = ${num(m)}.`,
        }, F(m), [F(p * q), F(k), F(p * q - k), F(-m), F(p + q + k)]);
      }
      if (r < 0.7) {
        let m, n; do { m = R(2, 7); n = R(2, 5); } while (m === n || gcd(m, n) !== 1);
        const fe = (a, b) => xPow(`${a}/${b}`);
        return { type: "mcq",
          stem: `Which expression is equivalent to ${nrootH(n, xPow(m))}, for ${V("x")} &gt; 0?`,
          explain: `A root is a fractional exponent: the index ${n} goes in the denominator and the power ${m} in the numerator, so ${nrootH(n, xPow(m))} = ${fe(m, n)}.`,
          ...textMCQ(fe(m, n), [fe(n, m), xPow(m - n), xPow(m * n)]) };
      }
      const a = R(2, 6), b = R(1, 5), c = R(2, 4), d = R(1, 9), e = c * (a + b) - d;
      return { type: "mcq",
        stem: `Which expression is equivalent to <span class="nowrap"><span class="frac"><span>(${xPow(a)} · ${xPow(b)})<sup>${c}</sup></span><span>${xPow(d)}</span></span></span>, for ${V("x")} &gt; 0?`,
        explain: `Multiply powers by adding exponents: ${xPow(a)} · ${xPow(b)} = ${xPow(a + b)}. Raise a power to a power by multiplying: (${xPow(a + b)})<sup>${c}</sup> = ${xPow(c * (a + b))}. Divide by subtracting: ${xPow(c * (a + b))} ÷ ${xPow(d)} = ${xPow(e)}.`,
        ...textMCQ(xPow(e), [xPow(a * b * c - d), xPow(a + b + c - d), xPow(c * (a + b) + d), xPow(c * a + b - d)]) };
    },
  },

  "adv.nonlin": {
    easy() {
      if (Math.random() < 0.5) {
        const a = R(2, 6), x = R(2, 12), N = a * x * x;
        return numQ({
          stem: `What is the positive solution to the equation ${a}${V("x")}<sup>2</sup> = ${N}?`,
          explain: `Divide both sides by ${a}: ${V("x")}<sup>2</sup> = ${x * x}. Take the square root: ${V("x")} = ±${x}. The positive solution is ${x}.`,
        }, F(x), [F(x * x), F(N / 2), F(2 * x), F(x + a)]);
      }
      let p, q; do { p = RNZ(-9, 9); q = RNZ(-9, 9); } while (p === -q);
      return numQ({
        stem: `What is the sum of the solutions to ${lin(1, -p)}${lin(1, q)} = 0?`,
        explain: `A product is 0 when a factor is 0: ${poly([1, -p])} = 0 gives ${V("x")} = ${num(p)}, and ${poly([1, q])} = 0 gives ${V("x")} = ${num(-q)}. The sum is ${num(p)} + ${paren(-q)} = ${num(p - q)}.`,
      }, F(p - q), [F(p + q), F(q - p), F(-p - q), F(p * q)]);
    },
    medium() {
      const r = Math.random();
      if (r < 0.4) {
        const r1 = R(1, 12), r2 = -R(1, 12), b = -(r1 + r2), c = r1 * r2;
        return numQ({
          stem: `What is the positive solution to the equation ${poly([1, b, c])} = 0?`,
          explain: `Factor: you need two numbers that multiply to ${num(c)} and add to ${num(b)}, which are ${num(-r1)} and ${num(-r2)}. So ${lin(1, -r1)}${lin(1, -r2)} = 0, giving ${V("x")} = ${r1} or ${V("x")} = ${num(r2)}. The positive solution is ${r1}.`,
        }, F(r1), [F(-r2), F(r1 + r2 === 0 ? r1 + 1 : Math.abs(r1 + r2)), F(Math.abs(c)), F(r1 - r2)]);
      }
      if (r < 0.7) {
        const b = R(2, 9), p = R(1, 4), x = R(-3, Math.floor((b * b) / p)), c = b * b - p * x;
        return numQ({
          stem: `What value of ${V("x")} satisfies the equation ${sqrtH(poly([p, c]))} = ${b}?`,
          explain: `Square both sides: ${poly([p, c])} = ${b * b}. ${moveConst(c)}: ${p === 1 ? "" : p}${V("x")} = ${num(b * b - c)}${p === 1 ? "" : `, so ${V("x")} = ${num(x)}`}. Check: ${sqrtH(String(b * b))} = ${b}. ✓`,
        }, F(x), [F(b - c), F(b * b + c), F(-x), F(b * b)]);
      }
      const a = R(2, 20), c = R(2, 6), b = RNZ(-6, 6), x = F(a - b * c, c);
      return { type: "spr", value: x,
        stem: `What is the solution to the equation <span class="nowrap"><span class="frac"><span>${a}</span><span>${poly([1, b])}</span></span> = ${c}</span>?`,
        explain: `Multiply both sides by (${poly([1, b])}): ${a} = ${c}(${poly([1, b])}) = ${poly([c, c * b])}. ${moveConst(c * b)}: ${c}${V("x")} = ${num(a - c * b)}, so ${V("x")} = ${fHtml(x)}.`,
      };
    },
    hard() {
      const r = Math.random();
      if (r < 0.33) {
        const a = R(1, 3), t = RNZ(-5, 5), b = 2 * a * t, k = a * t * t;
        return numQ({
          stem: `In the equation ${poly([a, b])} + ${V("k")} = 0, ${V("k")} is a constant. If the equation has exactly one real solution, what is the value of ${V("k")}?`,
          explain: `A quadratic has exactly one real solution when its discriminant ${V("b")}<sup>2</sup> ${MINUS} 4${V("a")}${V("c")} is 0: ${paren(b)}<sup>2</sup> ${MINUS} 4(${a})${V("k")} = 0, so ${b * b} = ${4 * a}${V("k")} and ${V("k")} = ${k}.`,
        }, F(k), [F(b * b), F(-k), F(Math.abs(b) / 2 === k ? k + a : Math.abs(b) / 2), F(2 * k), F(b * b / 2)]);
      }
      if (r < 0.66) {
        let r1, r2; do { r1 = RNZ(-6, 6); r2 = RNZ(-6, 6); } while (r1 === r2);
        const m = RNZ(-4, 4), d = RNZ(-8, 8), b = m - (r1 + r2), c = d + r1 * r2;
        const big = Math.max(r1, r2), yv = m * big + d;
        return numQ({
          stem: `<div class="sys"><div>${V("y")} = ${poly([1, b, c])}</div><div>${V("y")} = ${poly([m, d])}</div></div>The graphs of the equations above intersect at two points. What is the ${V("y")}-coordinate of the intersection point with the greater ${V("x")}-coordinate?`,
          explain: `Set the right sides equal: ${poly([1, b, c])} = ${poly([m, d])}, so ${poly([1, b - m, c - d])} = 0. Factor: ${lin(1, -r1)}${lin(1, -r2)} = 0, so ${V("x")} = ${num(Math.min(r1, r2))} or ${V("x")} = ${num(big)}. With ${V("x")} = ${num(big)}: ${V("y")} = ${num(m)}(${num(big)}) + ${paren(d)} = ${num(yv)}. (Desmos: graph both and click the intersections.)`,
        }, F(yv), [F(m * Math.min(r1, r2) + d), F(big), F(-yv), F(yv + m)]);
      }
      const h = RNZ(-6, 6), D = pick([2, 3, 5, 6, 7, 10, 11, 13]), c = h * h - D;
      const correct = pm(-h, sqrtH(D));
      return { type: "mcq",
        stem: `What are the solutions to ${poly([1, 2 * h, c])} = 0?`,
        explain: `Complete the square: ${poly([1, 2 * h, 0])} = ${num(-c)}. Add ${h * h} to both sides: (${poly([1, h])})<sup>2</sup> = ${D}. Take the square root: ${poly([1, h])} = ±${sqrtH(D)}, so ${V("x")} = ${correct}. (The quadratic formula gives the same result.)`,
        ...textMCQ(correct, [pm(h, sqrtH(D)), pm(-h, `2${sqrtH(D)}`), pm(-2 * h, `2${sqrtH(D)}`)]) };
    },
  },

  "adv.nlfn": {
    easy() {
      if (Math.random() < 0.5) {
        const a = RNZ(-3, 4), b = RNZ(-6, 6), c = RNZ(-9, 9), k = RNZ(-4, 4), v = a * k * k + b * k + c;
        return numQ({
          stem: `The function ${V("f")} is defined by ${V("f")}(${V("x")}) = ${poly([a, b, c])}. What is the value of ${V("f")}(${num(k)})?`,
          explain: `Replace every ${V("x")} with ${num(k)}: ${a === 1 ? "" : a === -1 ? MINUS : num(a)}(${num(k)})<sup>2</sup> + ${paren(b)}(${num(k)}) + ${paren(c)} = ${num(a * k * k)} + ${paren(b * k)} + ${paren(c)} = ${num(v)}. Remember (${num(k)})<sup>2</sup> = ${k * k}.`,
        }, F(v), [F(-a * k * k + b * k + c), F(a * 2 * k + b * k + c), F(a * k * k - b * k + c), F(v + c)]);
      }
      const a = R(2, 9), b = R(2, 4), k = R(1, 3), v = a * b ** k;
      return numQ({
        stem: `The function ${V("g")} is defined by ${V("g")}(${V("x")}) = ${a}(${b})<sup>${V("x")}</sup>. What is the value of ${V("g")}(${k})?`,
        explain: `Do the exponent first: ${b}<sup>${k}</sup> = ${b ** k}. Then multiply by ${a}: ${a} × ${b ** k} = ${v}.`,
      }, F(v), [F((a * b) ** k), F(a * b * k), F(a + b ** k), F(a * k + b)]);
    },
    medium() {
      const r = Math.random();
      if (r < 0.4) {
        const ctx = pick([
          () => { const A = R(8, 40) * 500, g = R(2, 9);
            return { f: `${V("P")}(${V("t")}) = ${A.toLocaleString("en-US")}(1.0${g})<sup>${V("t")}</sup>`, what: `the population of a town ${V("t")} years after 2020`, base: `1.0${g}`, init: A.toLocaleString("en-US"),
              baseOk: `The population increases by ${g}% each year.`, baseWrong: [`The population increases by 10${g}% each year.`, `The population increases by 1.0${g} people each year.`, `The population increases by 0.0${g}% each year.`],
              initOk: `The population of the town in 2020 was ${A.toLocaleString("en-US")}.`, initWrong: [`The population increases by ${A.toLocaleString("en-US")} people each year.`, `The population will reach ${A.toLocaleString("en-US")} in ${g} years.`, `The population of the town after 1 year was ${A.toLocaleString("en-US")}.`] }; },
          () => { const A = R(18, 45) * 1000, k = pick([80, 82, 85, 88, 90]), loss = 100 - k;
            return { f: `${V("V")}(${V("t")}) = ${A.toLocaleString("en-US")}(0.${k})<sup>${V("t")}</sup>`, what: `the value, in dollars, of a car ${V("t")} years after it was bought`, base: `0.${k}`, init: A.toLocaleString("en-US"),
              baseOk: `The car loses ${loss}% of its value each year.`, baseWrong: [`The car loses ${k}% of its value each year.`, `The car loses $0.${k} of its value each year.`, `The car's value increases by ${k}% each year.`],
              initOk: `The car cost $${A.toLocaleString("en-US")} when it was bought.`, initWrong: [`The car loses $${A.toLocaleString("en-US")} of value each year.`, `The car's value after 1 year is $${A.toLocaleString("en-US")}.`, `The car will be worth $0 after ${A / 1000} years.`] }; },
        ])();
        const askBase = Math.random() < 0.6;
        return { type: "mcq",
          stem: `The function ${ctx.f} models ${ctx.what}. What is the best interpretation of ${askBase ? ctx.base : ctx.init} in this context?`,
          explain: askBase
            ? `In ${V("a")}(${V("b")})<sup>${V("t")}</sup>, the base ${V("b")} is the growth or decay factor. ${ctx.base} = 1 ${Number(ctx.base) > 1 ? "+" : MINUS} ${Math.abs(Math.round((Number(ctx.base) - 1) * 100))}%, so each year the amount is multiplied by ${ctx.base}. ${ctx.baseOk}`
            : `${ctx.init} is the value when ${V("t")} = 0, because any number to the power 0 is 1. ${ctx.initOk}`,
          ...textMCQ(askBase ? ctx.baseOk : ctx.initOk, askBase ? ctx.baseWrong : ctx.initWrong) };
      }
      const a = RNZ(-4, 4), h = RNZ(-7, 7), k = RNZ(-12, 12), up = a > 0;
      const form = `${V("f")}(${V("x")}) = ${a === 1 ? "" : a === -1 ? MINUS : num(a)}${lin(1, -h)}<sup>2</sup> ${k < 0 ? MINUS : "+"} ${Math.abs(k)}`;
      if (r < 0.75) {
        return numQ({
          stem: `The function ${V("f")} is defined by ${form}. What is the ${up ? "minimum" : "maximum"} value of ${V("f")}(${V("x")})?`,
          explain: `This is vertex form ${V("a")}(${V("x")} ${MINUS} ${V("h")})<sup>2</sup> + ${V("k")}, with vertex (${num(h)}, ${num(k)}). Because ${V("a")} = ${num(a)} is ${up ? "positive, the parabola opens up and the vertex is the lowest point" : "negative, the parabola opens down and the vertex is the highest point"}. The ${up ? "minimum" : "maximum"} value is the ${V("y")}-coordinate, ${num(k)}.`,
        }, F(k), [F(h), F(-h), F(-k), F(a + k)]);
      }
      const yi = a * h * h + k;
      return numQ({
        stem: `The function ${V("f")} is defined by ${form}. The graph of ${V("y")} = ${V("f")}(${V("x")}) crosses the ${V("y")}-axis at (0, ${V("b")}). What is the value of ${V("b")}?`,
        explain: `The ${V("y")}-intercept is ${V("f")}(0) = ${a === 1 ? "" : a === -1 ? MINUS : num(a)}(0 ${MINUS} ${paren(h)})<sup>2</sup> + ${paren(k)} = ${num(a)}(${h * h}) + ${paren(k)} = ${num(yi)}.`,
      }, F(yi), [F(k), F(a * h + k), F(-a * h * h + k), F(a * h * h - k)]);
    },
    hard() {
      const r = Math.random();
      if (r < 0.35) {
        const a = RNZ(-3, 3), t = RNZ(-5, 5), c = RNZ(-12, 12), b = 2 * a * t, h = -t, k = c - a * t * t;
        return numQ({
          stem: `The function ${V("f")} is defined by ${V("f")}(${V("x")}) = ${poly([a, b, c])}. What is the ${a > 0 ? "minimum" : "maximum"} value of ${V("f")}(${V("x")})?`,
          explain: `The vertex is at ${V("x")} = ${MINUS}${V("b")}/(2${V("a")}) = ${MINUS}${paren(b)}/(${2 * a}) = ${num(h)}. Then ${V("f")}(${num(h)}) = ${num(a * h * h)} + ${paren(b * h)} + ${paren(c)} = ${num(k)}. Because ${V("a")} is ${a > 0 ? "positive this is a minimum" : "negative this is a maximum"}.`,
        }, F(k), [F(h), F(c), F(-k), F(c + a * t * t)]);
      }
      if (r < 0.7) {
        const a = R(1, 6), b = R(2, 4);
        return numQ({
          stem: `For the exponential function ${V("f")}(${V("x")}) = ${V("a")}·${V("b")}<sup>${V("x")}</sup>, where ${V("a")} and ${V("b")} are positive constants, ${V("f")}(1) = ${a * b} and ${V("f")}(3) = ${a * b ** 3}. What is the value of ${V("f")}(2)?`,
          explain: `${V("f")}(3) ÷ ${V("f")}(1) = ${V("b")}<sup>2</sup> = ${a * b ** 3} ÷ ${a * b} = ${b * b}, so ${V("b")} = ${b}. Then ${V("a")} = ${a * b} ÷ ${b} = ${a}, and ${V("f")}(2) = ${a}·${b}<sup>2</sup> = ${a * b * b}.`,
        }, F(a * b * b), [F((a * b + a * b ** 3) / 2), F(a * b * 2), F(a * b ** 3 - a * b), F(b * b)]);
      }
      const b = RNZ(-6, 6), c = RNZ(-9, 9), p = RNZ(-4, 4), q = RNZ(-8, 8), x = RNZ(-3, 4);
      const u = x - p, v = u * u + b * u + c + q;
      return numQ({
        stem: `The function ${V("f")} is defined by ${V("f")}(${V("x")}) = ${poly([1, b, c])}. The function ${V("g")} is defined by ${V("g")}(${V("x")}) = ${V("f")}(${poly([1, -p])}) ${q < 0 ? MINUS : "+"} ${Math.abs(q)}. What is the value of ${V("g")}(${num(x)})?`,
        explain: `${V("g")}(${num(x)}) = ${V("f")}(${num(x)} ${MINUS} ${paren(p)}) ${q < 0 ? MINUS : "+"} ${Math.abs(q)} = ${V("f")}(${num(u)}) ${q < 0 ? MINUS : "+"} ${Math.abs(q)}. And ${V("f")}(${num(u)}) = ${u * u} + ${paren(b * u)} + ${paren(c)} = ${num(u * u + b * u + c)}. So ${V("g")}(${num(x)}) = ${num(v)}.`,
      }, F(v), [F((x + p) ** 2 + b * (x + p) + c + q), F(x * x + b * x + c + q), F(u * u + b * u + c - q), F(v - 2 * q)]);
    },
  },
});

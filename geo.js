/* ===== Geometry & Trigonometry generators ===== */
const DEG = "°";
const piH = (k) => (fEq(k, F(1)) ? "π" : `${fHtml(k)}π`);
const svgFig = (w, h, inner, label) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${label}">${inner}</svg>`;
const tx = (x, y, s, anchor = "middle", cls = "lbl") => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
const vI = (s) => `<tspan font-style="italic">${s}</tspan>`;
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

/* right triangle: right angle at C (bottom-left), A bottom-right, B top-left */
function rightTriSVG(a, b, labels) {
  const maxW = 230, maxH = 150, s = Math.min(maxW / b, maxH / a);
  const C = [50, +(30 + a * s).toFixed(1)], A = [+(50 + b * s).toFixed(1), +(30 + a * s).toFixed(1)], B = [50, 30];
  const q = 12;
  let g = `<polygon class="shape" points="${C} ${A} ${B}"/><polyline class="shape thin" points="${C[0]},${C[1] - q} ${C[0] + q},${C[1] - q} ${C[0] + q},${C[1]}"/>`;
  g += tx(C[0] - 10, C[1] + 16, vI("C")) + tx(A[0] + 10, A[1] + 16, vI("A")) + tx(B[0] - 10, B[1] - 6, vI("B"));
  if (labels.b) g += tx((C[0] + A[0]) / 2, C[1] + 20, labels.b);
  if (labels.a) g += tx(C[0] - 10, (C[1] + B[1]) / 2 + 4, labels.a, "end");
  if (labels.c) g += tx((A[0] + B[0]) / 2 + 12, (A[1] + B[1]) / 2 - 8, labels.c, "start");
  return svgFig(Math.max(330, A[0] + 40), C[1] + 30, g, "Right triangle ABC with the right angle at C");
}

/* triangle with three angle labels */
function triAngleSVG(labels) {
  const A = [40, 180], B = [300, 180], C = [190, 30];
  let g = `<polygon class="shape" points="${A} ${B} ${C}"/>`;
  g += tx(A[0] + 34, A[1] - 10, labels[0]) + tx(B[0] - 32, B[1] - 10, labels[1]) + tx(C[0] - 2, C[1] + 34, labels[2]);
  return svgFig(340, 200, g, "Triangle with its three interior angles labeled");
}

/* two parallel lines cut by a transversal; labels: {pos: text} at intersection 0 (top) or 1 */
function parallelSVG(lab) {
  const y1 = 80, y2 = 170, P = (y) => [+(140 + ((240 - y) / 240) * 190).toFixed(1), y];
  const top = P(y1), bot = P(y2);
  const off = { UR: [0.9, -0.43], UL: [-0.44, -0.9], LL: [-0.9, 0.43], LR: [0.44, 0.9] };
  const svgSafe = (s) => s.replace(/<i>(.*?)<\/i>/g, '<tspan font-style="italic">$1</tspan>');
  let g = `<line class="shape" x1="20" y1="${y1}" x2="440" y2="${y1}"/><line class="shape" x1="20" y1="${y2}" x2="440" y2="${y2}"/><line class="shape" x1="${P(240)[0]}" y1="240" x2="${P(0)[0]}" y2="0"/>`;
  g += tx(448, y1 + 5, vI("ℓ"), "start") + tx(448, y2 + 5, vI("m"), "start");
  for (const [key, text] of Object.entries(lab)) {
    const [which, pos] = key.split("."), p = which === "0" ? top : bot, o = off[pos];
    const anchor = o[0] > 0.2 ? "start" : o[0] < -0.2 ? "end" : "middle";
    g += tx(p[0] + o[0] * 30, p[1] + o[1] * 24 + 5, svgSafe(text), anchor);
  }
  return svgFig(470, 240, g, "Parallel lines l and m cut by a transversal");
}

/* triangle ABC with DE parallel to BC */
function similarSVG(t, lab) {
  const A = [170, 20], B = [30, 200], C = [330, 200];
  const D = [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])].map((v) => +v.toFixed(1)), E = [A[0] + t * (C[0] - A[0]), A[1] + t * (C[1] - A[1])].map((v) => +v.toFixed(1));
  let g = `<polygon class="shape" points="${A} ${B} ${C}"/><line class="shape" x1="${D[0]}" y1="${D[1]}" x2="${E[0]}" y2="${E[1]}"/>`;
  g += tx(A[0], A[1] - 6, vI("A")) + tx(B[0] - 10, B[1] + 14, vI("B")) + tx(C[0] + 10, C[1] + 14, vI("C")) + tx(D[0] - 12, D[1] + 4, vI("D"), "end") + tx(E[0] + 12, E[1] + 4, vI("E"), "start");
  g += tx((A[0] + D[0]) / 2 - 12, (A[1] + D[1]) / 2, lab.AD, "end") + tx((D[0] + B[0]) / 2 - 12, (D[1] + B[1]) / 2, lab.DB, "end");
  g += tx((D[0] + E[0]) / 2, D[1] - 7, lab.DE) + tx((B[0] + C[0]) / 2, B[1] + 20, lab.BC);
  return svgFig(380, 230, g, "Triangle ABC with segment DE parallel to BC");
}

Object.assign(GEN, {
  "geo.area": {
    easy() {
      if (Math.random() < 0.5) {
        const l = R(5, 30), w = R(2, l - 1), P = 2 * (l + w);
        return numQ({
          stem: `A rectangle has a perimeter of ${P} centimeters and a length of ${l} centimeters. What is the width of the rectangle, in centimeters?`,
          explain: `Perimeter = 2(length + width), so ${P} = 2(${l} + ${V("w")}). Divide by 2: ${P / 2} = ${l} + ${V("w")}, so ${V("w")} = ${w}.`,
        }, F(w), [F(P - l), F(P / 2), F(P - 2 * l), F(P / l > 1 ? Math.round(P / l) : 1)]);
      }
      const l = R(2, 12), w = R(2, 10), h = R(2, 9), V0 = l * w * h;
      return numQ({
        stem: `A rectangular box has a length of ${l} inches, a width of ${w} inches, and a height of ${h} inches. What is the volume of the box, in cubic inches?`,
        explain: `Volume of a rectangular prism = length × width × height = ${l} × ${w} × ${h} = ${V0}.`,
      }, F(V0), [F(l + w + h), F(2 * (l * w + w * h + l * h)), F(l * w), F(V0 + l * w)]);
    },
    medium() {
      const r = Math.random();
      if (r < 0.4) {
        const rad = R(2, 9), h = R(2, 12), k = rad * rad * h;
        return numQ({
          stem: `A right circular cylinder has a radius of ${rad} meters and a height of ${h} meters. The volume of the cylinder is ${V("k")}π cubic meters. What is the value of ${V("k")}?`,
          explain: `Volume of a cylinder = π${V("r")}<sup>2</sup>${V("h")} = π(${rad})<sup>2</sup>(${h}) = ${k}π. So ${V("k")} = ${k}.`,
        }, F(k), [F(2 * rad * h), F(rad * h), F(rad * rad), F(2 * rad * rad * h)]);
      }
      if (r < 0.7) {
        const f = pick([2, 3, 4, 5]), what = pick(["volume", "surface area"]), mult = what === "volume" ? f ** 3 : f * f;
        return numQ({
          stem: `The edge length of a cube is multiplied by ${f}. The ${what} of the new cube is how many times the ${what} of the original cube?`,
          explain: `When every length is multiplied by ${f}, areas are multiplied by ${f}<sup>2</sup> = ${f * f} and volumes by ${f}<sup>3</sup> = ${f ** 3}. ${what === "volume" ? "Volume" : "Surface area"} is ${what === "volume" ? "three-dimensional" : "an area"}, so the answer is ${mult}.`,
        }, F(mult), [F(f), F(what === "volume" ? f * f : f ** 3), F(3 * f), F(6 * f)]);
      }
      const b = R(4, 20), h = R(3, 16), A0 = F(b * h, 2);
      return numQ({
        stem: `A triangle has a base of ${b} feet and a height of ${h} feet. What is the area of the triangle, in square feet?`,
        explain: `Area of a triangle = <span class="frac"><span>1</span><span>2</span></span> × base × height = <span class="frac"><span>1</span><span>2</span></span> × ${b} × ${h} = ${fHtml(A0)}.`,
      }, A0, [F(b * h), F(b + h), F(2 * (b + h)), F(b * h, 3)]);
    },
    hard() {
      const r = Math.random();
      if (r < 0.35) {
        let rad, h; do { rad = R(2, 9); h = R(2, 15); } while ((rad * rad * h) % 3 !== 0);
        const k = (rad * rad * h) / 3;
        return numQ({
          stem: `A right circular cone has a radius of ${rad} centimeters and a height of ${h} centimeters. Its volume is ${V("k")}π cubic centimeters. What is the value of ${V("k")}?`,
          explain: `Volume of a cone = <span class="frac"><span>1</span><span>3</span></span>π${V("r")}<sup>2</sup>${V("h")} = <span class="frac"><span>1</span><span>3</span></span>π(${rad * rad})(${h}) = ${k}π. (It's on the reference sheet.)`,
        }, F(k), [F(rad * rad * h), F((rad * h) / 3 % 1 === 0 ? (rad * h) / 3 : rad * h), F(2 * k), F(k + rad)]);
      }
      if (r < 0.7) {
        const p = R(1, 3), q = p + R(1, 2), Vs = (p ** 3) * R(2, 9) * (q % 2 === 0 ? 1 : 1);
        const Vl = F(Vs * q ** 3, p ** 3);
        return numQ({
          stem: `Two solids are similar. The ratio of their corresponding edge lengths is ${p}:${q}. The volume of the smaller solid is ${Vs} cubic units. What is the volume of the larger solid, in cubic units?`,
          explain: `For similar solids, volumes scale by the cube of the length ratio: (${q}/${p})<sup>3</sup> = ${q ** 3}/${p ** 3}. So the larger volume is ${Vs} × ${q ** 3}/${p ** 3} = ${fHtml(Vl)}.`,
        }, Vl, [F(Vs * q, p), F(Vs * q * q, p * p), F(Vs * q ** 3), F(Vs + q - p)]);
      }
      const rad = R(2, 12), k = 4 * rad * rad;
      return numQ({
        stem: `The surface area of a sphere with radius ${rad} inches is ${V("k")}π square inches. What is the value of ${V("k")}? (The surface area of a sphere is 4π${V("r")}<sup>2</sup>.)`,
        explain: `Surface area = 4π${V("r")}<sup>2</sup> = 4π(${rad})<sup>2</sup> = ${k}π, so ${V("k")} = ${k}.`,
      }, F(k), [F(rad * rad), F(2 * rad * rad), F(F(4 * rad ** 3, 3).d === 1 ? (4 * rad ** 3) / 3 : 8 * rad), F(4 * rad)]);
    },
  },

  "geo.lines": {
    easy() {
      const a = R(25, 85), b = R(25, 150 - a), c = 180 - a - b;
      const k = R(0, 2), labs = [a, b, c].map((v, i) => (i === k ? `${vI("x")}${DEG}` : `${v}${DEG}`));
      return numQ({
        stem: `${triAngleSVG(labs)}<p>In the triangle shown, what is the value of ${V("x")}?</p>`,
        explain: `The angles of a triangle add up to 180${DEG}. ${V("x")} = 180 ${MINUS} ${[a, b, c].filter((_, i) => i !== k).join(` ${MINUS} `)} = ${[a, b, c][k]}.`,
      }, F([a, b, c][k]), [F(360 - [a, b, c].filter((_, i) => i !== k).reduce((x, y) => x + y)), F(90 - Math.min(...[a, b, c].filter((_, i) => i !== k)) > 0 ? 90 - Math.min(...[a, b, c].filter((_, i) => i !== k)) : 45), F(180 - [a, b, c].filter((_, i) => i !== k)[0]), F([a, b, c][k] + 10)]);
    },
    medium() {
      const theta = R(40, 80), pos = ["UR", "UL", "LL", "LR"];
      const acute = (p) => p === "UR" || p === "LL";
      let pA, pB; do { pA = pick(pos); pB = pick(pos); } while (false);
      const val = (p) => (acute(p) ? theta : 180 - theta);
      const equal = acute(pA) === acute(pB);
      // angle A = (a x + b), angle B = (c x + d)
      const x = R(5, 25), a = R(2, 5);
      const bA = val(pA) - a * x;
      let c; do { c = R(1, 6); } while (c === a && equal);
      const dB = val(pB) - c * x;
      const exA = `(${expr([[a, "x"], [bA, ""]])})${DEG}`, exB = `(${expr([[c, "x"], [dB, ""]])})${DEG}`;
      const lab = { [`0.${pA}`]: exA, [`1.${pB}`]: exB };
      return numQ({
        stem: `${parallelSVG(lab)}<p>In the figure, line ${V("ℓ")} is parallel to line ${V("m")}. What is the value of ${V("x")}?</p>`,
        explain: equal
          ? `The two marked angles are in matching positions (one is a corresponding or alternate angle of the other), so they are equal: ${expr([[a, "x"], [bA, ""]])} = ${expr([[c, "x"], [dB, ""]])}. Solving gives ${V("x")} = ${x}. Check: both angles measure ${val(pA)}${DEG}.`
          : `One marked angle is acute and the other is obtuse, so they are supplementary (they add to 180${DEG}): (${expr([[a, "x"], [bA, ""]])}) + (${expr([[c, "x"], [dB, ""]])}) = 180. Solving gives ${V("x")} = ${x}. Check: ${val(pA)}${DEG} + ${val(pB)}${DEG} = 180${DEG}.`,
      }, F(x), [F(equal ? Math.round((180 - bA - dB) / (a + c)) : (a !== c ? (dB - bA) / (a - c) : x + 5)), F(val(pA)), F(x + 10), F(180 - val(pA) === x ? x + 3 : 180 - val(pA))].map((f) => (isFinite(fVal(f)) ? f : F(x + 7))));
    },
    hard() {
      if (Math.random() < 0.6) {
        const p = R(2, 6), q = R(1, 6), k = R(2, 5), AD = p * k, DB = q * k, DE = R(3, 12) * (p);
        const BC = F(DE * (p + q), p), t = p / (p + q);
        return numQ({
          stem: `${similarSVG(t, { AD: String(AD), DB: String(DB), DE: String(DE), BC: vI("x") })}<p>In triangle ${V("ABC")}, segment ${V("DE")} is parallel to ${V("BC")}. ${V("AD")} = ${AD}, ${V("DB")} = ${DB}, and ${V("DE")} = ${DE}. What is the value of ${V("x")}, the length of ${V("BC")}?</p>`,
          explain: `Because ${V("DE")} ∥ ${V("BC")}, triangle ${V("ADE")} is similar to triangle ${V("ABC")}. ${V("AB")} = ${AD} + ${DB} = ${AD + DB}, so the scale factor is ${AD + DB}/${AD}. Then ${V("x")} = ${DE} × ${AD + DB}/${AD} = ${fHtml(BC)}. (Using ${DB} instead of the whole side ${AD + DB} is the usual trap.)`,
        }, BC, [F(DE * DB, AD), F(DE + DB), F(DE * AD, DB), F(DE * 2)]);
      }
      const apex = 2 * R(10, 70), base = (180 - apex) / 2, ext = 180 - base;
      return numQ({
        stem: `In isosceles triangle ${V("PQR")}, ${V("PQ")} = ${V("PR")} and the measure of angle ${V("P")} is ${apex}${DEG}. Side ${V("QR")} is extended past ${V("R")} to point ${V("S")}. What is the measure, in degrees, of angle ${V("PRS")}?`,
        explain: `The base angles of an isosceles triangle are equal: (180 ${MINUS} ${apex}) ÷ 2 = ${base}${DEG} each. Angle ${V("PRS")} forms a straight line with angle ${V("PRQ")}, so it is 180 ${MINUS} ${base} = ${ext}${DEG}. (Also: an exterior angle equals the sum of the two far interior angles, ${apex} + ${base} = ${ext}.)`,
      }, F(ext), [F(base), F(180 - apex), F(apex), F(apex + 2 * base === 180 ? 2 * base : 90)]);
    },
  },

  "geo.trig": {
    easy() {
      const [p, q, h] = pick(TRIPLES.slice(0, 4)), k = R(1, 4), a = p * k, b = q * k, c = h * k;
      const findHyp = Math.random() < 0.5, swap = Math.random() < 0.5;
      const [va, vb] = swap ? [b, a] : [a, b];
      if (findHyp) {
        return numQ({
          stem: `${rightTriSVG(va, vb, { a: String(va), b: String(vb), c: vI("x") })}<p>In right triangle ${V("ABC")}, what is the value of ${V("x")}?</p>`,
          explain: `Pythagorean theorem: ${V("x")}<sup>2</sup> = ${va}<sup>2</sup> + ${vb}<sup>2</sup> = ${va * va} + ${vb * vb} = ${c * c}, so ${V("x")} = ${c}.`,
        }, F(c), [F(va + vb), F(Math.abs(vb - va) || 1), F(c * c), F(c + 1)]);
      }
      return numQ({
        stem: `${rightTriSVG(va, vb, { a: vI("x"), b: String(vb), c: String(c) })}<p>In right triangle ${V("ABC")}, what is the value of ${V("x")}?</p>`,
        explain: `Pythagorean theorem with the hypotenuse ${c}: ${V("x")}<sup>2</sup> + ${vb}<sup>2</sup> = ${c}<sup>2</sup>, so ${V("x")}<sup>2</sup> = ${c * c} ${MINUS} ${vb * vb} = ${va * va} and ${V("x")} = ${va}.`,
      }, F(va), [F(c - vb), F(c + vb), F(vb), F(va * va)]);
    },
    medium() {
      const [p, q, h] = pick(TRIPLES), swap = Math.random() < 0.5, [a, b] = swap ? [q, p] : [p, q];
      // a = BC (opposite A), b = AC (adjacent to A), c = AB
      const fn = pick(["sin", "cos", "tan"]), ang = pick(["A", "B"]);
      const opp = ang === "A" ? a : b, adj = ang === "A" ? b : a;
      const val = { sin: F(opp, h), cos: F(adj, h), tan: F(opp, adj) }[fn];
      const other = [F(opp, h), F(adj, h), F(opp, adj), F(adj, opp), F(h, opp)];
      return numQ({
        stem: `${rightTriSVG(a, b, { a: String(a), b: String(b), c: String(h) })}<p>In right triangle ${V("ABC")}, what is the value of ${fn}(${V(ang)})?</p>`,
        explain: `From angle ${V(ang)}, the opposite side is ${opp}, the adjacent side is ${adj}, and the hypotenuse is ${h}. ${fn === "sin" ? "Sine = opposite/hypotenuse" : fn === "cos" ? "Cosine = adjacent/hypotenuse" : "Tangent = opposite/adjacent"} = ${fHtml(val)}. (SOH-CAH-TOA)`,
      }, val, other, 0.25);
    },
    hard() {
      const r = Math.random();
      if (r < 0.35) {
        const [p, q, h] = pick(TRIPLES), f = pick(["sin", "cos"]);
        return numQ({
          stem: `In right triangle ${V("ABC")}, angle ${V("C")} is a right angle and ${f}(${V("A")}) = <span class="frac"><span>${p}</span><span>${h}</span></span>. What is the value of ${f === "sin" ? "cos" : "sin"}(${V("B")})?`,
          explain: `Angles ${V("A")} and ${V("B")} are complementary (they add to 90${DEG}). The side opposite ${V("A")} is the side adjacent to ${V("B")}, so ${f === "sin" ? "sin(A) = cos(B)" : "cos(A) = sin(B)"}. The answer is <span class="frac"><span>${p}</span><span>${h}</span></span>.`,
        }, F(p, h), [F(q, h), F(p, q), F(q, p), F(h, p)], 0.3);
      }
      if (r < 0.7) {
        const k = R(2, 12), kind = pick(["30", "45"]);
        if (kind === "30") {
          const ask = pick(["short", "long"]), hyp = 2 * k;
          const correct = ask === "short" ? String(k) : `${k}${sqrtH(3)}`;
          return { type: "mcq",
            stem: `In right triangle ${V("PQR")}, the measure of angle ${V("Q")} is 90${DEG}, the measure of angle ${V("P")} is 30${DEG}, and ${V("PR")} = ${hyp}. What is the length of ${ask === "short" ? V("QR") : V("PQ")}?`,
            explain: `This is a 30${DEG}-60${DEG}-90${DEG} triangle, with sides in the ratio 1 : ${sqrtH(3)} : 2 (reference sheet). The hypotenuse ${V("PR")} = ${hyp} = 2(${k}). The side opposite the 30${DEG} angle (${V("QR")}) is ${k}, and the side opposite the 60${DEG} angle (${V("PQ")}) is ${k}${sqrtH(3)}.`,
            ...textMCQ(correct, ask === "short" ? [`${k}${sqrtH(3)}`, String(hyp), `${k}${sqrtH(2)}`] : [String(k), `${hyp}${sqrtH(3)}`, `${k}${sqrtH(2)}`]) };
        }
        return { type: "mcq",
          stem: `An isosceles right triangle has legs of length ${k}. What is the length of its hypotenuse?`,
          explain: `In a 45${DEG}-45${DEG}-90${DEG} triangle, the hypotenuse is ${sqrtH(2)} times a leg: ${k}${sqrtH(2)}.`,
          ...textMCQ(`${k}${sqrtH(2)}`, [String(2 * k), `${k}${sqrtH(3)}`, `${2 * k}${sqrtH(2)}`]) };
      }
      const d = pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 270, 300, 315]), rad = F(d, 180);
      if (Math.random() < 0.5) {
        return numQ({
          stem: `What is the measure, in degrees, of an angle of ${piH(rad)} radians?`,
          explain: `π radians = 180${DEG}, so multiply by 180/π: ${piH(rad)} × 180/π = ${d}${DEG}.`,
        }, F(d), [F(Math.round(fVal(rad) * 360)), F(Math.round(fVal(rad) * 90)), F(360 - d), F(180 - d === 0 ? 90 : Math.abs(180 - d))]);
      }
      return { type: "mcq",
        stem: `An angle measures ${d}${DEG}. What is its measure in radians?`,
        explain: `180${DEG} = π radians, so multiply by π/180: ${d} × π/180 = ${piH(rad)}.`,
        ...textMCQ(piH(rad), [piH(F(d, 360)), piH(F(d, 90)), piH(F(2 * d, 180)).replace(/^(.*)$/, (m) => (m === piH(rad) ? piH(F(d + 30, 180)) : m))]) };
    },
  },

  "geo.circ": {
    easy() {
      const rad = R(2, 15), area = Math.random() < 0.5, useD = Math.random() < 0.4;
      const k = area ? rad * rad : 2 * rad;
      return numQ({
        stem: `A circle has a ${useD ? "diameter" : "radius"} of ${useD ? 2 * rad : rad} units. Its ${area ? "area" : "circumference"} is ${V("k")}π ${area ? "square units" : "units"}. What is the value of ${V("k")}?`,
        explain: `${useD ? `The radius is half the diameter: ${rad}. ` : ""}${area ? `Area = π${V("r")}<sup>2</sup> = π(${rad})<sup>2</sup> = ${k}π.` : `Circumference = 2π${V("r")} = 2π(${rad}) = ${k}π.`} So ${V("k")} = ${k}.`,
      }, F(k), [F(area ? 2 * rad : rad * rad), F(area ? 4 * rad * rad : 4 * rad), F(rad), F(area && useD ? 4 * rad * rad + 1 : k + 2)]);
    },
    medium() {
      const h = RNZ(-8, 8), k = RNZ(-8, 8), r = R(2, 12);
      const eq = `(${poly([1, -h])})<sup>2</sup> + (${poly([1, -k], "y")})<sup>2</sup> = ${r * r}`;
      if (Math.random() < 0.5) {
        return numQ({
          stem: `In the ${V("xy")}-plane, the graph of ${eq} is a circle. What is the radius of the circle?`,
          explain: `In the form (${V("x")} ${MINUS} ${V("h")})<sup>2</sup> + (${V("y")} ${MINUS} ${V("k")})<sup>2</sup> = ${V("r")}<sup>2</sup>, the right side is ${V("r")}<sup>2</sup>. So ${V("r")}<sup>2</sup> = ${r * r} and ${V("r")} = ${r}.`,
        }, F(r), [F(r * r), F(r * r / 2 % 1 === 0 ? r * r / 2 : r + 2), F(2 * r), F(Math.abs(h) + Math.abs(k))]);
      }
      const ctr = `(${num(h)}, ${num(k)})`;
      return { type: "mcq",
        stem: `In the ${V("xy")}-plane, the graph of ${eq} is a circle. What are the coordinates of its center?`,
        explain: `The center (${V("h")}, ${V("k")}) comes from (${V("x")} ${MINUS} ${V("h")}) and (${V("y")} ${MINUS} ${V("k")}): the signs flip. So the center is ${ctr}.`,
        ...textMCQ(ctr, [`(${num(-h)}, ${num(-k)})`, `(${num(h)}, ${num(-k)})`, `(${num(-h)}, ${num(k)})`]) };
    },
    hard() {
      if (Math.random() < 0.5) {
        const h = RNZ(-6, 6), k = RNZ(-6, 6), r = R(2, 9), D = -2 * h, E = -2 * k, Fc = h * h + k * k - r * r;
        return numQ({
          stem: `In the ${V("xy")}-plane, the graph of ${V("x")}<sup>2</sup> ${D < 0 ? MINUS : "+"} ${Math.abs(D)}${V("x")} + ${V("y")}<sup>2</sup> ${E < 0 ? MINUS : "+"} ${Math.abs(E)}${V("y")} ${Fc < 0 ? MINUS : "+"} ${Math.abs(Fc)} = 0 is a circle. What is the radius of the circle?`,
          explain: `Complete the square for ${V("x")} and ${V("y")}: add ${h * h} and ${k * k} to both sides. (${poly([1, -h])})<sup>2</sup> + (${poly([1, -k], "y")})<sup>2</sup> = ${num(-Fc)} + ${h * h} + ${k * k} = ${r * r}. So ${V("r")} = ${r}.`,
        }, F(r), [F(r * r), F(Math.abs(Fc) <= 0 ? r + 1 : Math.abs(Fc)), F(r + 1), F(Math.round(Math.sqrt(Math.abs(Fc))) || 2)]);
      }
      const ang = pick([30, 40, 45, 60, 72, 90, 120, 135, 150]), rad = R(2, 12), arc = Math.random() < 0.5;
      const k = arc ? F(ang * 2 * rad, 360) : F(ang * rad * rad, 360);
      return numQ({
        stem: `A circle has a radius of ${rad} centimeters. A central angle of ${ang}${DEG} cuts off ${arc ? "an arc" : "a sector"}. The ${arc ? "arc length" : "area of the sector"} is ${V("k")}π ${arc ? "centimeters" : "square centimeters"}. What is the value of ${V("k")}?`,
        explain: `The ${arc ? "arc" : "sector"} is ${ang}/360 of the whole circle. ${arc ? `Whole circumference = 2π(${rad}) = ${2 * rad}π` : `Whole area = π(${rad})<sup>2</sup> = ${rad * rad}π`}, so ${V("k")} = ${ang}/360 × ${arc ? 2 * rad : rad * rad} = ${fHtml(k)}.`,
      }, k, [F(arc ? rad * rad * ang : 2 * rad * ang, 360), F(ang * rad, 180), F(arc ? 2 * rad : rad * rad), F(ang, 360)]);
    },
  },
});

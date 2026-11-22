/* ===== Problem-Solving & Data Analysis generators ===== */
const pctS = (v) => `${+v.toFixed(2)}%`;
const money = (v) => `$${Number.isInteger(v) ? v.toLocaleString("en-US") : v.toFixed(2)}`;
function dtable(head, rows, cap) {
  return `<div class="dt-wrap"><table class="dtable">${cap ? `<caption>${cap}</caption>` : ""}<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const sum = (a) => a.reduce((x, y) => x + y, 0);
const median = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? F(s[(n - 1) / 2]) : F(s[n / 2 - 1] + s[n / 2], 2); };
const listS = (a) => a.map(num).join(", ");
const ord = (n) => n + ([, "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10] || "th");

/* scatterplot with optional line; xs/ys data units, integer grid */
function scatterSVG(pts, opt) {
  const { xmax, ymax, xl, yl, line, ystep = 1, xstep = 1, labelEvery = 5, highlight } = opt;
  const Wd = 360, Ht = 250, L = 44, Rm = 12, T = 12, B = 40;
  const X = (x) => +(L + (x / xmax) * (Wd - L - Rm)).toFixed(1), Y = (y) => +(T + (1 - y / ymax) * (Ht - T - B)).toFixed(1);
  let g = "";
  for (let x = 0; x <= xmax; x += xstep) g += `<line class="gl${x % labelEvery === 0 ? " gl2" : ""}" x1="${X(x)}" x2="${X(x)}" y1="${Y(0)}" y2="${Y(ymax)}"/>`;
  for (let y = 0; y <= ymax; y += ystep) g += `<line class="gl${y % (ystep * labelEvery) === 0 ? " gl2" : ""}" x1="${X(0)}" x2="${X(xmax)}" y1="${Y(y)}" y2="${Y(y)}"/>`;
  let lab = "";
  for (let x = 0; x <= xmax; x += labelEvery * xstep) lab += `<text x="${X(x)}" y="${Y(0) + 14}" text-anchor="middle" class="tk">${x}</text>`;
  for (let y = 0; y <= ymax; y += labelEvery * ystep) lab += `<text x="${X(0) - 6}" y="${Y(y) + 4}" text-anchor="end" class="tk">${y}</text>`;
  let ln = "";
  if (line) { const [m, b] = line; const xa = Math.max(0, m ? (0 - b) / m : 0), xb = Math.min(xmax, m ? (ymax - b) / m : xmax); const x1 = m < 0 ? Math.max(0, (ymax - b) / m) : xa, x2 = m < 0 ? Math.min(xmax, (0 - b) / m) : xb; ln = `<line class="fitln" x1="${X(x1)}" y1="${Y(m * x1 + b)}" x2="${X(x2)}" y2="${Y(m * x2 + b)}"/>`; }
  const dots = pts.map(([x, y]) => `<circle class="pt${highlight && highlight[0] === x && highlight[1] === y ? " hl" : ""}" cx="${X(x)}" cy="${Y(y)}" r="4"/>`).join("");
  return `<svg class="fig" viewBox="0 0 ${Wd} ${Ht}" width="${Wd}" role="img" aria-label="Scatterplot of ${yl} against ${xl}">${g}<line class="ax" x1="${X(0)}" x2="${X(xmax)}" y1="${Y(0)}" y2="${Y(0)}"/><line class="ax" x1="${X(0)}" x2="${X(0)}" y1="${Y(0)}" y2="${Y(ymax)}"/>${ln}${dots}${lab}<text x="${(L + Wd - Rm) / 2}" y="${Ht - 6}" text-anchor="middle" class="axl">${xl}</text><text transform="translate(12 ${(T + Ht - B) / 2}) rotate(-90)" text-anchor="middle" class="axl">${yl}</text></svg>`;
}

Object.assign(GEN, {
  "psda.ratio": {
    easy() {
      if (Math.random() < 0.5) {
        const b = R(2, 4) * 12, a = R(2, 5), m = R(2, 4), c = b * m;
        return numQ({
          stem: `A recipe uses ${a} cups of flour to make ${b} cookies. At this rate, how many cups of flour are needed to make ${c} cookies?`,
          explain: `${c} cookies is ${c} ÷ ${b} = ${m} times the recipe, so you need ${m} × ${a} = ${a * m} cups. (Or set up a proportion: ${a}/${b} = ${V("x")}/${c}.)`,
        }, F(a * m), [F(a + m), F(c / a < 100 ? Math.round(c / a) : a * m + 2), F(a * b), F(a * m + 1)]);
      }
      const s = R(35, 70), h = R(2, 5), k = R(3, 9), d = s * h;
      return numQ({
        stem: `A train travels ${d} miles in ${h} hours at a constant speed. At this speed, how many miles will it travel in ${k} hours?`,
        explain: `Speed = ${d} ÷ ${h} = ${s} miles per hour. In ${k} hours: ${s} × ${k} = ${s * k} miles.`,
      }, F(s * k), [F(d * k), F(d + k), F(s * (k - 1)), F(s + k)]);
    },
    medium() {
      if (Math.random() < 0.5) {
        const q = pick([2, 4]), p = pick(q === 2 ? [3, 5, 7, 9] : [3, 5, 7, 9, 11, 13, 15]), m = q * R(3, 12), inches = p / q;
        return numQ({
          stem: `On a map, 1 inch represents ${m} miles. Two towns are ${inches} inches apart on the map. What is the actual distance, in miles, between the towns?`,
          explain: `Multiply the map distance by the scale: ${inches} × ${m} = ${(m * p) / q} miles.`,
        }, F(m * p, q), [F(m + p), F(m * Math.floor(inches)), F(Math.round(m / inches)), F((m * p) / q + m)]);
      }
      const k = R(1, 4), f = 22 * k, mph = 15 * k;
      return numQ({
        stem: `A cyclist rides at a constant speed of ${f} feet per second. What is this speed in miles per hour? (1 mile = 5,280 feet)`,
        explain: `In one hour (3,600 seconds) the cyclist rides ${f} × 3,600 = ${(f * 3600).toLocaleString("en-US")} feet. Divide by 5,280 feet per mile: ${(f * 3600).toLocaleString("en-US")} ÷ 5,280 = ${mph} miles per hour.`,
      }, F(mph), [F(f * 60 / 5280 * 60 === mph ? mph + 5 : mph), F(Math.round((f * 5280) / 3600)), F(Math.round((f * 60) / 5280 * 10) || 1), F(mph * 2)]);
    },
    hard() {
      if (Math.random() < 0.55) {
        let a, b; do { a = R(2, 12); b = R(2, 12); } while (a === b);
        const t = F(a * b, a + b);
        return { type: "spr", value: t,
          stem: `Pump A can fill a tank in ${a} hours. Pump B can fill the same tank in ${b} hours. Working together at these rates, how many hours will it take the two pumps to fill the tank?`,
          explain: `Add the rates: pump A fills <span class="frac"><span>1</span><span>${a}</span></span> of the tank per hour and pump B fills <span class="frac"><span>1</span><span>${b}</span></span>. Together: <span class="frac"><span>1</span><span>${a}</span></span> + <span class="frac"><span>1</span><span>${b}</span></span> = <span class="frac"><span>${a + b}</span><span>${a * b}</span></span> tank per hour. Time = 1 ÷ rate = ${fHtml(t)} hours.`,
        };
      }
      const d = R(2, 9), s = pick([5, 10, 20]), kg = F(d * s ** 3, 1000);
      return numQ({
        stem: `A metal has a density of ${d} grams per cubic centimeter. What is the mass, in kilograms, of a solid cube of this metal with edge length ${s} centimeters? (1 kilogram = 1,000 grams)`,
        explain: `Volume = ${s}<sup>3</sup> = ${(s ** 3).toLocaleString("en-US")} cubic centimeters. Mass = density × volume = ${d} × ${(s ** 3).toLocaleString("en-US")} = ${(d * s ** 3).toLocaleString("en-US")} grams = ${fHtml(kg)} kilograms.`,
      }, kg, [F(d * s ** 3), F(d * s * s, 1000), F(d * s * 3, 1000), F(d * s ** 3, 100)]);
    },
  },

  "psda.pct": {
    easy() {
      const N = R(2, 30) * 20, p = pick([5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 80]), v = (N * p) / 100;
      if (Math.random() < 0.6) {
        return numQ({
          stem: `What is ${p}% of ${N}?`,
          explain: `${p}% means ${p}/100, so ${p}% of ${N} = ${p / 100} × ${N} = ${v}.`,
        }, F(v), [F(N - v), F(N * p / 10), F(N + v), F(p)]);
      }
      return numQ({
        stem: `${v} is what percent of ${N}?`,
        explain: `Divide the part by the whole and multiply by 100: ${v} ÷ ${N} = ${p / 100}, which is ${p}%.`,
      }, F(p), [F(100 - p), F(Math.round((N / v) * 10)), F(p / 10 < 1 ? p * 2 : p / 5), F(p + 10)]);
    },
    medium() {
      const p = pick([5, 10, 15, 20, 25, 30, 40, 50]);
      if (Math.random() < 0.5) {
        const O = R(4, 40) * 20, X = (O * (100 - p)) / 100;
        return numQ({
          stem: `After a ${p}% discount, the sale price of a jacket is ${money(X)}. What was the original price, in dollars?`,
          explain: `The sale price is ${100 - p}% of the original: ${(100 - p) / 100}${V("p")} = ${X}. Divide: ${V("p")} = ${X} ÷ ${(100 - p) / 100} = ${O}. (Adding ${p}% back onto ${X} is a common mistake: the discount was ${p}% of the original price, not of the sale price.)`,
        }, F(O), [F(Math.round((X * (100 + p)) / 100)), F(X + p), F(Math.round(X * (1 - p / 100))), F(O + 20)]);
      }
      const A = R(2, 20) * 20, up = Math.random() < 0.5, B = (A * (100 + (up ? p : -p))) / 100;
      return numQ({
        stem: `The number of members in a club changed from ${A} to ${B}. By what percent did the number of members ${up ? "increase" : "decrease"}?`,
        explain: `Percent change = change ÷ original × 100 = ${Math.abs(B - A)} ÷ ${A} × 100 = ${p}%. Always divide by the original amount (${A}), not the new one.`,
      }, F(p), [F(Math.abs(B - A)), F(Math.round((Math.abs(B - A) / B) * 100) === p ? p + 5 : Math.round((Math.abs(B - A) / B) * 100)), F(100 - p), F(p * 2)]);
    },
    hard() {
      if (Math.random() < 0.5) {
        const p = pick([10, 20, 25, 30, 40, 50]), q = pick([10, 20, 25, 30, 40, 50]), v = F((100 + p) * (100 - q), 100);
        return numQ({
          stem: `The value of ${V("x")} is ${p}% greater than the value of ${V("y")}, and the value of ${V("y")} is ${q}% less than the value of ${V("z")}. The value of ${V("x")} is what percent of the value of ${V("z")}?`,
          explain: `Write each change as a multiplier: ${V("x")} = ${(100 + p) / 100}${V("y")} and ${V("y")} = ${(100 - q) / 100}${V("z")}. So ${V("x")} = ${(100 + p) / 100} × ${(100 - q) / 100}${V("z")} = ${fVal(v) / 100}${V("z")}, which is ${fHtml(v)}% of ${V("z")}. You can't just add ${p}% and subtract ${q}%.`,
        }, v, [F(100 + p - q), F((100 - p) * (100 + q), 100), F(p + q), F(100 - q)]);
      }
      const p = pick([10, 20, 30, 40, 50]), d = (p * p) / 100;
      return numQ({
        stem: `The price of a stock increased by ${p}% on Monday and then decreased by ${p}% on Tuesday. By what percent did the price decrease over the two days?`,
        explain: `Multiply the factors: ${(100 + p) / 100} × ${(100 - p) / 100} = ${((100 + p) * (100 - p)) / 10000}. The final price is ${100 - d}% of the original, a decrease of ${d}%. The ${p}% decrease is taken from a bigger number, so it's larger than the ${p}% increase.`,
      }, F(d), [F(0), F(p), F(p / 2), F(2 * p)]);
    },
  },

  "psda.data1": {
    easy() {
      const n = pick([5, 6, 7]);
      if (Math.random() < 0.5) {
        const m = R(6, 30); let a;
        do { a = Array.from({ length: n - 1 }, () => R(m - 8, m + 8)); a.push(n * m - sum(a)); } while (a[n - 1] < 0 || Math.abs(a[n - 1] - m) > 12);
        a = shuffle(a);
        return numQ({
          stem: `What is the mean of the data set ${listS(a)}?`,
          explain: `Add the values (${sum(a)}) and divide by how many there are (${n}): ${sum(a)} ÷ ${n} = ${m}.`,
        }, F(m), [median(a), F(sum(a)), F(Math.max(...a) - Math.min(...a)), F(m + 1)]);
      }
      const odd = n % 2 ? n : n + 1, a = Array.from({ length: odd }, () => R(1, 40));
      const md = median(a), s = [...a].sort((x, y) => x - y);
      return numQ({
        stem: `What is the median of the data set ${listS(a)}?`,
        explain: `Put the values in order: ${listS(s)}. With ${odd} values, the median is the middle one, the ${ord((odd + 1) / 2)}: ${fHtml(md)}.`,
      }, md, [F(a[(odd - 1) / 2]), F(sum(a), odd), F(s[(odd - 1) / 2 + 1]), F(s[(odd - 1) / 2 - 1])]);
    },
    medium() {
      if (Math.random() < 0.5) {
        const label = pick([["Number of pets", "Number of students"], ["Books read", "Number of people"], ["Goals scored", "Number of games"]]);
        const vals = [0, 1, 2, 3, 4], fr = vals.map(() => R(1, 9));
        const data = vals.flatMap((v, i) => Array(fr[i]).fill(v)), N = data.length;
        const askMean = Math.random() < 0.4;
        const ans = askMean ? F(sum(data), N) : median(data);
        return { ...(askMean || Math.random() < 0.3 ? { type: "spr", value: ans } : { type: "mcq", ...numericMCQ(ans, [F(2), F(sum(fr), 5), F(Math.max(...fr)), F(vals[fr.indexOf(Math.max(...fr))]), F(sum(data), N)]) }),
          stem: `${dtable([label[0], label[1]], vals.map((v, i) => [v, fr[i]]))}The table summarizes a data set. What is the ${askMean ? "mean" : "median"} of the data?`,
          explain: askMean
            ? `Multiply each value by its frequency and add: ${vals.map((v, i) => `${v}·${fr[i]}`).join(" + ")} = ${sum(data)}. There are ${N} data values, so the mean is ${sum(data)} ÷ ${N} = ${fHtml(ans)}.`
            : `There are ${N} values in all. ${N % 2 ? `The median is the ${ord((N + 1) / 2)} value` : `The median is the average of the ${ord(N / 2)} and ${ord(N / 2 + 1)} values`}. Counting up the frequencies (${fr.map((f, i) => sum(fr.slice(0, i + 1))).join(", ")} running total), that is ${fHtml(ans)}. The median is a data value (${label[0].toLowerCase()}), not a frequency.`,
        };
      }
      const k = R(3, 6), m = R(10, 40), m2 = m + RNZ(-4, 6), x = (k + 1) * m2 - k * m;
      return numQ({
        stem: `The mean of ${k} numbers is ${m}. When a new number is added, the mean of the ${k + 1} numbers is ${m2}. What is the new number?`,
        explain: `The original total is ${k} × ${m} = ${k * m}. The new total is ${k + 1} × ${m2} = ${(k + 1) * m2}. The new number is the difference: ${(k + 1) * m2} ${MINUS} ${k * m} = ${x}.`,
      }, F(x), [F(m2), F(2 * m2 - m), F(m2 + (m2 - m) * k / 2 | 0), F(x + k)]);
    },
    hard() {
      if (Math.random() < 0.5) {
        const n = pick([7, 9]);
        let a = Array.from({ length: n - 1 }, () => R(10, 30)); a.push(R(70, 99)); a = shuffle(a);
        const mx = Math.max(...a), b = [...a]; b.splice(b.indexOf(mx), 1);
        const meanD = fVal(F(sum(b), b.length)) < sum(a) / n ? "decreases" : "stays the same";
        const mdA = fVal(median(a)), mdB = fVal(median(b));
        const medD = mdB < mdA ? "decreases" : mdB > mdA ? "increases" : "stays the same";
        const S = (mn, md) => (mn === md ? `Both the mean and the median ${mn === "stays the same" ? "stay the same" : mn.replace(/s$/, "")}.` : `The mean ${mn}, and the median ${md}.`);
        const correct = S(meanD, medD);
        const pool = [S("decreases", "decreases"), S("decreases", "stays the same"), S("stays the same", "decreases"), S("increases", "stays the same"), S("stays the same", "stays the same"), S("decreases", "increases")];
        return { type: "mcq",
          stem: `A data set has ${n} values: ${listS(a)}. If the value ${mx} is removed, which statement best describes how the mean and median change?`,
          explain: `${mx} is far above the other values, so removing it pulls the mean down a lot (from about ${(sum(a) / n).toFixed(1)} to about ${(sum(b) / b.length).toFixed(1)}). The median only depends on the middle values: it goes from ${+mdA.toFixed(2)} to ${+mdB.toFixed(2)}, so it ${medD}. ${correct}`,
          ...textMCQ(correct, shuffle(pool)) };
      }
      const m = R(20, 60), s1 = [1, 2], s2 = [8, 12];
      const A = [m - s1[1], m - s1[0], m, m + s1[0], m + s1[1]], B = [m - s2[1], m - s2[0], m, m + s2[0], m + s2[1]];
      const swap = Math.random() < 0.5, [dA, dB] = swap ? [B, A] : [A, B];
      const wide = swap ? "Data set A" : "Data set B";
      return { type: "mcq",
        stem: `${dtable(["Data set", "Values"], [["A", listS(shuffle(dA))], ["B", listS(shuffle(dB))]])}Both data sets have a mean of ${m}. Which statement about their standard deviations is true?`,
        explain: `Standard deviation measures how spread out the values are from the mean. The values in ${wide} are much farther from ${m} (as far as ${s2[1]} away, compared with ${s1[1]}), so ${wide} has the larger standard deviation. You don't need to calculate it.`,
        ...textMCQ(`${wide} has the larger standard deviation.`, [`${wide === "Data set A" ? "Data set B" : "Data set A"} has the larger standard deviation.`, "The standard deviations are equal because the means are equal.", "The standard deviations can't be compared without more information."]) };
    },
  },

  "psda.data2": {
    easy() {
      const m2 = pick([3, 4, 5, 6, 7, 8]), m = m2 / 2, b = R(2, 10);
      const pts = []; for (let x = 1; x <= 10; x++) pts.push([x, Math.max(0, Math.round(m * x + b + R(-2, 2)))]);
      const ymax = Math.ceil((m * 10 + b + 4) / 5) * 5, k = 2 * R(2, 5), v = F(m2 * k + 2 * b, 2);
      return numQ({
        stem: `${scatterSVG(pts, { xmax: 10, ymax, xl: "x", yl: "y", line: [m, b], labelEvery: 5 })}<p>The scatterplot shows ${pts.length} data points and the line of best fit ${V("y")} = ${m}${V("x")} + ${b}. Based on the line of best fit, what is the predicted value of ${V("y")} when ${V("x")} = ${k}?</p>`,
        explain: `Substitute ${V("x")} = ${k} into the line's equation: ${V("y")} = ${m}(${k}) + ${b} = ${m * k} + ${b} = ${fHtml(v)}. A prediction comes from the line, not from a data point.`,
      }, v, [F(Math.round(m * k)), F(pts[k - 1][1] === fVal(v) ? fVal(v) + 2 : pts[k - 1][1]), F(m * k + b + m2), F(k + b)]);
    },
    medium() {
      const ctx = pick([
        { xl: "Hours studied", yl: "Test score", m: pick([3.5, 4.2, 5.5]), b: R(40, 52), xmax: 8, unit: (m) => `${m} points`, sx: "hour studied", subj: "the test score", dir: "increase" },
        { xl: "Temperature (°C)", yl: "Drinks sold", m: pick([2.5, 3.4, 4.5]), b: R(5, 20), xmax: 30, unit: (m) => `${m} drinks`, sx: "degree Celsius", subj: "the number of drinks sold", dir: "increase" },
        { xl: "Age of car (years)", yl: "Value (thousand $)", m: -pick([1.2, 1.5, 1.8, 2.2]), b: R(24, 32), xmax: 12, unit: (m) => `${m} thousand dollars`, sx: "year of age", subj: "the predicted value of the car", dir: "decrease" },
      ]);
      const { m, b, xmax } = ctx, n = 10, pts = [];
      for (let i = 0; i < n; i++) { const x = R(1, xmax - 1); pts.push([x, Math.max(1, Math.round(m * x + b + R(-3, 3)))]); }
      const ymax = Math.ceil((Math.max(...pts.map((p) => p[1]), m > 0 ? m * xmax + b : b) + 3) / 10) * 10;
      const am = Math.abs(m);
      const correct = `For each additional ${ctx.sx}, ${ctx.subj} is predicted to ${ctx.dir} by about ${ctx.unit(am)}.`;
      return { type: "mcq",
        stem: `${scatterSVG(pts, { xmax, ymax, xl: ctx.xl, yl: ctx.yl, line: [m, b], xstep: xmax > 15 ? 2 : 1, ystep: ymax > 60 ? 5 : 2, labelEvery: ymax > 60 ? 4 : 5 })}<p>The line of best fit for the data is ${V("y")} = ${m < 0 ? `${MINUS}${am}` : am}${V("x")} + ${b}. Which is the best interpretation of ${am} in this context?</p>`,
        explain: `${am} is the slope of the line: the change in predicted ${ctx.yl.toLowerCase()} for each 1-unit increase in ${ctx.xl.toLowerCase().replace(/ \(.*\)/, "")}. ${m < 0 ? "The slope is negative, so the prediction goes down. " : ""}${correct} (${b} is the ${V("y")}-intercept, the predicted value when ${V("x")} = 0.)`,
        ...textMCQ(correct, [`${ctx.subj[0].toUpperCase() + ctx.subj.slice(1)} is predicted to be ${ctx.unit(am)} when ${V("x")} = 0.`, `For each additional ${ctx.sx}, ${ctx.subj} is predicted to ${ctx.dir === "increase" ? "decrease" : "increase"} by about ${ctx.unit(am)}.`, `Every data point is exactly ${ctx.unit(am)} from the line of best fit.`]) };
    },
    hard() {
      if (Math.random() < 0.5) {
        const m = pick([0.5, 1, 1.5, 2]), b = R(1, 4);
        const xs = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 8).sort((p, q) => p - q);
        const pts = xs.map((x) => [x, Math.max(0, Math.round(m * x + b) + RNZ(-3, 3))]);
        const evens = pts.filter(([x]) => x % 2 === 0 || m % 1 === 0);
        const hp = pick(evens), pred = m * hp[0] + b, res = hp[1] - pred;
        const ymax = Math.ceil((Math.max(...pts.map((p) => p[1]), m * 10 + b) + 1) / 5) * 5;
        return numQ({
          stem: `${scatterSVG(pts, { xmax: 10, ymax, xl: "x", yl: "y", line: [m, b], labelEvery: 5, highlight: hp })}<p>The scatterplot shows a data set and its line of best fit, ${V("y")} = ${m === 1 ? "" : m}${V("x")} + ${b}. For the highlighted data point, at ${V("x")} = ${hp[0]}, what is the actual ${V("y")}-value minus the ${V("y")}-value predicted by the line?</p>`,
          explain: `The highlighted point is (${hp[0]}, ${hp[1]}). The line predicts ${V("y")} = ${m}(${hp[0]}) + ${b} = ${pred}. Actual minus predicted: ${hp[1]} ${MINUS} ${pred} = ${num(res)}. ${res > 0 ? "The point is above the line." : "The point is below the line."}`,
        }, F(res), [F(-res), F(hp[1]), F(pred), F(res + (res > 0 ? 1 : -1))]);
      }
      const exp = Math.random() < 0.5, inc = Math.random() < 0.5;
      const a = exp ? (inc ? R(2, 6) : pick([162, 243, 324, 405])) : R(10, 60), r = exp ? (inc ? pick([2, 3]) : 3) : RNZ(3, 9) * (inc ? 1 : -1);
      const ys = [0, 1, 2, 3, 4].map((x) => (exp ? (inc ? a * r ** x : a / r ** x) : a + r * x));
      const correct = `${inc ? "Increasing" : "Decreasing"} ${exp ? "exponential" : "linear"}`;
      return { type: "mcq",
        stem: `${dtable([V("x"), V("y")], [0, 1, 2, 3, 4].map((x, i) => [x, ys[i].toLocaleString("en-US")]))}Which of the following best describes the relationship between ${V("x")} and ${V("y")} in the table?`,
        explain: exp
          ? `Check the ratios: each ${V("y")}-value is ${inc ? `${r} times` : `1/${r} of`} the one before. A constant ratio (multiplying by the same number) means exponential. ${correct}.`
          : `Check the differences: each ${V("y")}-value is ${Math.abs(r)} ${inc ? "more" : "less"} than the one before. A constant difference (adding the same number) means linear. ${correct}.`,
        ...textMCQ(correct, ["Increasing linear", "Decreasing linear", "Increasing exponential", "Decreasing exponential"].filter((s) => s !== correct)) };
    },
  },

  "psda.prob": {
    easy() {
      const r = R(2, 12), b = R(2, 12), g = R(2, 12), n = r + b + g;
      const pickC = pick([["red", r], ["blue", b], ["green", g]]), notQ = Math.random() < 0.3;
      const v = F(notQ ? n - pickC[1] : pickC[1], n);
      return numQ({
        stem: `A bag contains ${r} red marbles, ${b} blue marbles, and ${g} green marbles. If one marble is chosen at random, what is the probability that it is ${notQ ? "not " : ""}${pickC[0]}?`,
        explain: `There are ${n} marbles in all, and ${notQ ? n - pickC[1] : pickC[1]} of them are ${notQ ? "not " : ""}${pickC[0]}. Probability = favorable ÷ total = ${notQ ? n - pickC[1] : pickC[1]}/${n}${v.d !== n ? ` = ${fHtml(v)}` : ""}.`,
      }, v, [F(pickC[1], n - pickC[1]), F(notQ ? pickC[1] : n - pickC[1], n), F(1, 3), F(pickC[1], n + 1)], 0.25);
    },
    medium() { return twoWay(false); },
    hard() { return twoWay(true); },
  },

  "psda.infer": {
    easy() {
      const n = pick([50, 80, 100, 120, 200, 250]), k = R(Math.round(n * 0.15), Math.round(n * 0.7)), N = n * R(5, 40);
      const who = pick([["students at a high school", "said they walk to school", "students at the school"], ["residents of a town", "said they support a new park", "residents of the town"], ["customers of a store", "said they would buy a new snack", "regular customers of the store"]]);
      const est = (k * N) / n;
      return numQ({
        stem: `A random sample of ${n} ${who[0]} was surveyed, and ${k} of them ${who[1]}. There are ${N.toLocaleString("en-US")} ${who[2]} in total. Based on the survey, about how many of them would be expected to say this?`,
        explain: `In the sample, ${k}/${n} = ${+(k / n).toFixed(4)} of people said yes. Because the sample was random, apply the same fraction to everyone: ${+(k / n).toFixed(4)} × ${N.toLocaleString("en-US")} = ${est.toLocaleString("en-US")}.`,
      }, F(est), [F(k), F(N - est), F(Math.round(N / k)), F(est + n)], 0.2);
    },
    medium() {
      const p = R(30, 70), moe = R(2, 5);
      const inside = p + RNZ(-(moe - 1), moe - 1) * (Math.random() < 0.3 ? 0 : 1) || p + 1;
      const outs = shuffle([p - moe - R(2, 6), p + moe + R(2, 6), p - moe - R(7, 12), p + moe + R(7, 12)]).slice(0, 3);
      const what = pick(["of voters in a city support a ballot measure", "of adults in a state exercise at least three times a week", "of students at a university live on campus"]);
      const opts = [inside, ...outs].sort((x, y) => x - y).map((v) => `${v}%`);
      return { type: "mcq", choices: opts, answer: opts.indexOf(`${inside}%`),
        stem: `Based on a random sample, researchers estimate that ${p}% ${what}, with a margin of error of ${moe}%. Which of the following is a plausible value for the true percentage?`,
        explain: `The margin of error gives a range of plausible values: ${p}% ± ${moe}%, or ${p - moe}% to ${p + moe}%. Only ${inside}% falls inside that range.`,
      };
    },
    hard() {
      const t = R(0, 2);
      if (t === 0) {
        const n = pick([200, 300, 400, 500]);
        return { type: "mcq",
          stem: `A survey of a random sample of ${n} people produced an estimate with a margin of error of ${R(4, 6)}%. Which change to the survey would most likely produce a smaller margin of error?`,
          explain: `Larger random samples give more precise estimates, so the margin of error shrinks as the sample size grows. Changing the confidence level to a higher one, or sampling less, makes it bigger; a nonrandom sample doesn't fix precision and adds bias.`,
          ...textMCQ(`Survey a random sample of ${n * 4} people instead.`, [`Survey a random sample of ${n / 2} people instead.`, `Survey ${n} volunteers who respond to an online ad.`, `Report the result with a higher confidence level.`]) };
      }
      if (t === 1) {
        const grp = pick([["members of a gym", "adults in the city"], ["students in one math class", "students at the school"], ["shoppers at one mall", "residents of the state"]]);
        return { type: "mcq",
          stem: `To estimate a typical number of hours of sleep, a researcher surveyed a random sample of ${grp[0]}. Which conclusion is most appropriate?`,
          explain: `A random sample represents only the group it was drawn from. The results can be generalized to all ${grp[0]}, but not to ${grp[1]}, who may differ from them.`,
          ...textMCQ(`The results can be generalized to all ${grp[0]}, but not to all ${grp[1]}.`, [`The results can be generalized to all ${grp[1]}.`, `The results can't be generalized to anyone, because it was only a sample.`, `The results apply only to the specific people who were surveyed.`]) };
      }
      const nA = pick([100, 200, 300]), nB = nA * 4;
      return { type: "mcq",
        stem: `Two researchers estimated the same population mean using random samples. Researcher A used a sample of ${nA} and Researcher B used a sample of ${nB}. Which statement is most likely true?`,
        explain: `With random sampling, a bigger sample gives a more precise estimate. Researcher B's sample is four times as large, so B's margin of error is most likely smaller (about half as big).`,
        ...textMCQ(`Researcher B's estimate has a smaller margin of error.`, [`Researcher A's estimate has a smaller margin of error.`, `The two estimates have the same margin of error.`, `Researcher B's estimate must equal the true mean exactly.`]) };
    },
  },

  "psda.claims": {
    easy() { return claim(pick([0, 2])); },
    medium() { return claim(pick([1, 2, 3])); },
    hard() { return claim(R(0, 3)); },
  },
});

/* two-way table probability */
function twoWay(hard) {
  const ctx = pick([
    { rows: ["10th grade", "11th grade"], cols: ["Soccer", "Basketball", "Tennis"], what: "students were asked which sport they prefer", unit: "student" },
    { rows: ["Under 30", "30 or older"], cols: ["Email", "Text", "Phone"], what: "adults were asked how they prefer to be contacted", unit: "adult" },
    { rows: ["Morning", "Evening"], cols: ["Passed", "Did not pass"], what: "drivers' test results were recorded by time of day", unit: "driver" },
  ]);
  const cells = ctx.rows.map(() => ctx.cols.map(() => R(5, 40)));
  const rowT = cells.map(sum), colT = ctx.cols.map((_, j) => sum(cells.map((r) => r[j]))), N = sum(rowT);
  const table = dtable(["", ...ctx.cols, "Total"], [...ctx.rows.map((r, i) => [r, ...cells[i], rowT[i]]), ["Total", ...colT, N]]);
  const i = R(0, 1), j = R(0, ctx.cols.length - 1), c = cells[i][j];
  let v, q, ex;
  if (!hard) {
    if (Math.random() < 0.5) { v = F(colT[j], N); q = `If one of these ${ctx.unit}s is chosen at random, what is the probability that the ${ctx.unit} is in the "${ctx.cols[j]}" column?`; ex = `Use the grand total. ${colT[j]} of the ${N} ${ctx.unit}s are in "${ctx.cols[j]}", so the probability is ${colT[j]}/${N}${v.d !== N ? ` = ${fHtml(v)}` : ""}.`; }
    else { v = F(c, rowT[i]); q = `If a ${ctx.unit} in the "${ctx.rows[i]}" row is chosen at random, what is the probability that the ${ctx.unit} is also in the "${ctx.cols[j]}" column?`; ex = `"Chosen from the ${ctx.rows[i]} row" means only that row counts: the total is ${rowT[i]}, not ${N}. ${c} of those ${rowT[i]} are in "${ctx.cols[j]}", so the probability is ${c}/${rowT[i]}${v.d !== rowT[i] ? ` = ${fHtml(v)}` : ""}.`; }
  } else {
    if (Math.random() < 0.5) { v = F(c, colT[j]); q = `If a ${ctx.unit} in the "${ctx.cols[j]}" column is chosen at random, what is the probability that the ${ctx.unit} is in the "${ctx.rows[i]}" row?`; ex = `Restrict to the "${ctx.cols[j]}" column: ${colT[j]} ${ctx.unit}s. ${c} of them are "${ctx.rows[i]}", so the probability is ${c}/${colT[j]}${v.d !== colT[j] ? ` = ${fHtml(v)}` : ""}. Watch which total goes in the denominator.`; }
    else { const notC = rowT[i] - c; v = F(notC, rowT[i]); q = `If a ${ctx.unit} in the "${ctx.rows[i]}" row is chosen at random, what is the probability that the ${ctx.unit} is <em>not</em> in the "${ctx.cols[j]}" column?`; ex = `In the "${ctx.rows[i]}" row there are ${rowT[i]} ${ctx.unit}s, and ${c} are in "${ctx.cols[j]}". So ${rowT[i]} ${MINUS} ${c} = ${notC} are not, and the probability is ${notC}/${rowT[i]}${v.d !== rowT[i] ? ` = ${fHtml(v)}` : ""}.`; }
  }
  return numQ({ stem: `${table}<p>In a survey, ${N} ${ctx.what}. The results are shown in the table.</p><p>${q}</p>`, explain: ex },
    v, [F(c, N), F(c, colT[j]), F(c, rowT[i]), F(colT[j], N), F(rowT[i], N), F(rowT[i] - c, N)], 0.3);
}

/* observational study vs experiment */
function claim(kind) {
  const c = pick([
    { pop: "adults in a large city", t: "taking a daily vitamin D supplement", eff: "reduces the number of colds", assoc: "is associated with having fewer colds", out: "the number of colds over the winter" },
    { pop: "high school students in a state", t: "using a flashcard app for 15 minutes a day", eff: "improves vocabulary test scores", assoc: "is associated with higher vocabulary test scores", out: "vocabulary test scores" },
    { pop: "office workers at a large company", t: "using a standing desk", eff: "reduces back pain", assoc: "is associated with less back pain", out: "reported back pain" },
  ]);
  const randSample = kind === 0 || kind === 2, randAssign = kind === 0 || kind === 1;
  const sel = randSample ? `selected a random sample of 400 ${c.pop}` : `recruited 400 volunteers from among ${c.pop}`;
  const asg = randAssign ? `randomly assigned half of them to start ${c.t}, while the other half did not` : `asked each participant whether they were ${c.t}`;
  const opts = [
    `${c.t[0].toUpperCase() + c.t.slice(1)} ${c.eff} for ${c.pop}.`,
    `${c.t[0].toUpperCase() + c.t.slice(1)} ${c.eff} for people like the volunteers, but the result may not apply to all ${c.pop}.`,
    `${c.t[0].toUpperCase() + c.t.slice(1)} ${c.assoc} among ${c.pop}, but it can't be concluded that it causes the difference.`,
    `${c.t[0].toUpperCase() + c.t.slice(1)} ${c.assoc} among the participants, but this can't be shown to cause the difference or be generalized to all ${c.pop}.`,
  ];
  const why = [
    "The participants were a random sample, so results generalize to the population, and the treatment was randomly assigned, so cause and effect can be concluded.",
    "Random assignment allows a cause-and-effect conclusion, but volunteers aren't a random sample, so the result can't be generalized to the whole population.",
    "The random sample lets you generalize to the population, but participants weren't randomly assigned (it's an observational study), so only an association can be concluded, not cause.",
    "Without random assignment there's no cause-and-effect conclusion, and without random sampling the association can't be generalized beyond the participants.",
  ];
  return { type: "mcq",
    stem: `Researchers ${sel}. They ${asg}, and they compared ${c.out} for the two groups. Those ${c.t} had significantly better results. Which conclusion is most appropriate?`,
    explain: `Two questions decide it. Was there random <em>sampling</em> from the population? ${randSample ? "Yes" : "No"}. Was the treatment <em>randomly assigned</em>? ${randAssign ? "Yes" : "No"}. ${why[kind]}`,
    ...textMCQ(opts[kind], opts.filter((_, k) => k !== kind)) };
}

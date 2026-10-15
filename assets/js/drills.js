/* Read the Room: interactive drills.
   Each drill: { title, blurb, defaults, options, describe(cfg), mount(el, cfg, done) -> cleanup } */

(function () {
  const D = window.DRILL_DATA;
  const B = window.BANKS;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const norm = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  function lcsMatch(a, b, eq) {
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
      dp[i][j] = eq(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const hitA = new Array(n).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (eq(a[i], b[j])) { hitA[i] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    return { len: dp[0][0], hitA };
  }

  function lev(a, b) {
    const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }

  function binomTail(n, k) { // P(X >= k), X ~ Bin(n, 0.5)
    if (k <= 0) return 1;
    let total = 0, c = 1;
    for (let i = 0; i <= n; i++) { if (i >= k) total += c; c = c * (n - i) / (i + 1); }
    return total / Math.pow(2, n);
  }

  function fmtTime(s) { const m = Math.floor(s / 60), r = s % 60; return m + ":" + String(r).padStart(2, "0"); }

  /* A countdown that renders into a .timer element. */
  function countdown(el, seconds, onEnd) {
    let left = seconds;
    const bar = el.querySelector(".timer-fill");
    const txt = el.querySelector(".timer-text");
    const paint = () => { txt.textContent = fmtTime(left); bar.style.transform = "scaleX(" + (left / seconds) + ")"; };
    paint();
    const id = setInterval(() => { left--; paint(); if (left <= 0) { clearInterval(id); onEnd(); } }, 1000);
    return () => clearInterval(id);
  }
  const timerHTML = (label) => `<div class="timer" role="timer" aria-label="${esc(label)}"><span class="timer-text">0:00</span><span class="timer-track"><span class="timer-fill"></span></span></div>`;

  function introScreen(el, title, lines, startLabel, onStart) {
    el.innerHTML = `<div class="drill-intro"><h3>${esc(title)}</h3>${lines.map((l) => `<p>${l}</p>`).join("")}<button class="btn primary" data-act="start">${esc(startLabel || "Start")}</button></div>`;
    el.querySelector("[data-act=start]").addEventListener("click", onStart);
    el.querySelector("[data-act=start]").focus();
  }

  function resultHead(score, max, target, extra) {
    let verdict = "";
    if (typeof target === "number") verdict = score >= target
      ? `<p class="verdict ok">Passed. The target was ${target}.</p>`
      : `<p class="verdict bad">Not yet. The target is ${target}. Practise and try again.</p>`;
    return `<div class="result-head"><p class="big-score"><span>${score}</span> out of ${max}</p>${verdict}${extra || ""}</div>`;
  }

  const DRILLS = {};

  /* ---------------- Kim's Game ---------------- */
  DRILLS.kims = {
    title: "Kim's Game",
    blurb: "Study a set of objects, then pick out the ones you saw from a larger set.",
    defaults: { count: 15, seconds: 60 },
    options: { count: [9, 12, 15, 20, 25], seconds: [30, 60, 90] },
    describe: (c) => `${c.count} objects, ${c.seconds} seconds`,
    mount(el, cfg, done) {
      let stop = () => {};
      const seen = sample(D.objects, cfg.count);
      const decoys = sample(D.objects.filter((o) => !seen.includes(o)), cfg.count);
      introScreen(el, "Kim's Game", [
        `You will see <strong>${cfg.count} objects</strong> for <strong>${cfg.seconds} seconds</strong>.`,
        "Name each one silently and group them, for example three foods, two tools, something round.",
        "Then you will pick out the ones you saw from a larger set. Wrong picks cost a point."
      ], "Show the objects", study);

      function study() {
        el.innerHTML = `${timerHTML("Study time left")}<div class="obj-grid" aria-label="Objects to memorise">${seen.map((o) => `<span class="obj" role="img">${o}</span>`).join("")}</div><div class="drill-actions"><button class="btn" data-act="ready">I'm ready</button></div>`;
        stop = countdown(el.querySelector(".timer"), cfg.seconds, recall);
        el.querySelector("[data-act=ready]").addEventListener("click", () => { stop(); recall(); });
      }
      function recall() {
        const all = shuffle(seen.concat(decoys));
        const picked = new Set();
        el.innerHTML = `<p class="drill-msg">Tap every object you saw. <span class="count">0</span> picked.</p><div class="obj-grid pick">${all.map((o, i) => `<button class="obj" data-i="${i}" aria-pressed="false">${o}</button>`).join("")}</div><div class="drill-actions"><button class="btn primary" data-act="check">Check my answers</button></div>`;
        el.querySelectorAll(".obj").forEach((b) => b.addEventListener("click", () => {
          const i = +b.dataset.i;
          if (picked.has(i)) picked.delete(i); else picked.add(i);
          b.setAttribute("aria-pressed", picked.has(i));
          el.querySelector(".count").textContent = picked.size;
        }));
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          let hits = 0, wrong = 0;
          all.forEach((o, i) => { if (picked.has(i)) { if (seen.includes(o)) hits++; else wrong++; } });
          const score = Math.max(0, hits - wrong);
          el.innerHTML = resultHead(score, cfg.count, cfg.target, `<p class="muted">${hits} correct picks, ${wrong} wrong picks, ${cfg.count - hits} missed. Score is correct minus wrong.</p>`) +
            `<div class="obj-grid review">${all.map((o, i) => {
              const s = seen.includes(o), p = picked.has(i);
              const cls = s && p ? "hit" : !s && p ? "false" : s ? "miss" : "decoy";
              const lab = { hit: "seen and picked", false: "not shown, picked", miss: "seen, missed", decoy: "not shown" }[cls];
              return `<span class="obj ${cls}" title="${lab}" aria-label="${o} ${lab}">${o}</span>`;
            }).join("")}</div><p class="legend"><span class="key hit"></span>Correct <span class="key miss"></span>Missed <span class="key false"></span>Wrong pick</p>`;
          done({ score, max: cfg.count });
        });
      }
      return () => stop();
    }
  };

  /* ---------------- Word list ---------------- */
  DRILLS.words = {
    title: "Word list",
    blurb: "Memorise random words in order with your memory palace, then type them back.",
    defaults: { count: 20, seconds: 180 },
    options: { count: [10, 20, 30, 40, 50], seconds: [60, 120, 180, 300, 600] },
    describe: (c) => `${c.count} words, ${fmtTime(c.seconds)} to study`,
    mount(el, cfg, done) {
      let stop = () => {};
      const words = sample(D.words, cfg.count);
      introScreen(el, "Word list", [
        `You will see <strong>${cfg.count} words</strong> and have <strong>${fmtTime(cfg.seconds)}</strong> to memorise them in order.`,
        "Walk your memory palace and place a vivid, strange image of each word at the next spot.",
        "Then type them back in order. Your score counts the longest run of words you got in the right order, so one slip doesn't ruin the rest."
      ], "Show the words", study);

      function study() {
        el.innerHTML = `${timerHTML("Study time left")}<ol class="word-list">${words.map((w) => `<li>${esc(w)}</li>`).join("")}</ol><div class="drill-actions"><button class="btn" data-act="ready">I'm ready to recall</button></div>`;
        stop = countdown(el.querySelector(".timer"), cfg.seconds, recall);
        el.querySelector("[data-act=ready]").addEventListener("click", () => { stop(); recall(); });
      }
      function recall() {
        el.innerHTML = `<label class="drill-msg" for="recall">Type the words in order, one per line or separated by commas.</label><textarea id="recall" rows="10" autocomplete="off" autocapitalize="none" spellcheck="false"></textarea><div class="drill-actions"><button class="btn primary" data-act="check">Check my answers</button></div>`;
        const ta = el.querySelector("textarea"); ta.focus();
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          const typed = ta.value.split(/[\n,;]+|\s{2,}/).map((s) => s.trim()).filter(Boolean);
          const flat = typed.length === 1 ? typed[0].split(/\s+/) : typed;
          const { len, hitA } = lcsMatch(words, flat, (x, y) => norm(x) === norm(y));
          const anywhere = words.filter((w) => flat.some((t) => norm(t) === norm(w))).length;
          el.innerHTML = resultHead(len, cfg.count, cfg.target, `<p class="muted">${anywhere} of ${cfg.count} words remembered in any order.</p>`) +
            `<ol class="word-list review">${words.map((w, i) => `<li class="${hitA[i] ? "hit" : "miss"}">${esc(w)}<span class="sr">${hitA[i] ? " correct" : " missed"}</span></li>`).join("")}</ol>`;
          done({ score: len, max: cfg.count });
        });
      }
      return () => stop();
    }
  };

  /* ---------------- Names and faces ---------------- */
  DRILLS.names = {
    title: "Names",
    blurb: "Meet a group of people with distinct features, then match each one back to their name.",
    defaults: { count: 10, seconds: 120 },
    options: { count: [6, 10, 15, 20], seconds: [60, 120, 180, 300] },
    describe: (c) => `${c.count} people, ${fmtTime(c.seconds)} to study`,
    mount(el, cfg, done) {
      let stop = () => {};
      const feats = shuffle(D.features);
      const people = sample(D.names, cfg.count).map((n, i) => ({ n, f: [feats[(i * 2) % feats.length], feats[(i * 2 + 1) % feats.length]] }));
      introScreen(el, "Names", [
        `You will meet <strong>${cfg.count} people</strong>, each with two distinctive features.`,
        "For each: say the name, turn it into an image, and pin that image to one of their features.",
        "Then you'll see the features and type the name."
      ], "Meet the people", study);

      function study() {
        el.innerHTML = `${timerHTML("Study time left")}<div class="people">${people.map((p) => `<div class="person"><p class="pname">${esc(p.n)}</p><p class="pfeat">${esc(p.f[0])}, ${esc(p.f[1])}</p></div>`).join("")}</div><div class="drill-actions"><button class="btn" data-act="ready">I'm ready</button></div>`;
        stop = countdown(el.querySelector(".timer"), cfg.seconds, recall);
        el.querySelector("[data-act=ready]").addEventListener("click", () => { stop(); recall(); });
      }
      function recall() {
        const order = shuffle(people);
        el.innerHTML = `<p class="drill-msg">Who is this? Type each name.</p><div class="people recall">${order.map((p, i) => `<label class="person"><span class="pfeat">${esc(p.f[0])}, ${esc(p.f[1])}</span><input type="text" data-i="${i}" autocomplete="off" autocapitalize="words" spellcheck="false" aria-label="Name of the person with ${esc(p.f[0])}"></label>`).join("")}</div><div class="drill-actions"><button class="btn primary" data-act="check">Check my answers</button></div>`;
        el.querySelector("input").focus();
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          let score = 0;
          const marks = order.map((p, i) => {
            const v = norm(el.querySelector(`input[data-i="${i}"]`).value), t = norm(p.n);
            const ok = v && (v === t || (t.length > 4 && lev(v, t) <= 1));
            if (ok) score++;
            return { p, v: el.querySelector(`input[data-i="${i}"]`).value, ok };
          });
          el.innerHTML = resultHead(score, cfg.count, cfg.target, `<p class="muted">Small spelling slips are accepted.</p>`) +
            `<div class="people">${marks.map((m) => `<div class="person ${m.ok ? "hit" : "miss"}"><p class="pname">${esc(m.p.n)}</p><p class="pfeat">${esc(m.p.f[0])}, ${esc(m.p.f[1])}</p>${m.ok ? "" : `<p class="pyou">You wrote: ${esc(m.v || "nothing")}</p>`}</div>`).join("")}</div>`;
          done({ score, max: cfg.count });
        });
      }
      return () => stop();
    }
  };

  /* ---------------- Card order ---------------- */
  DRILLS.cards = {
    title: "Card order",
    blurb: "Memorise a sequence of playing cards, then tap them back in order.",
    defaults: { count: 10, seconds: 120 },
    options: { count: [5, 10, 15, 20, 26, 52], seconds: [60, 120, 180, 300, 600] },
    describe: (c) => `${c.count} cards, ${fmtTime(c.seconds)} to study`,
    mount(el, cfg, done) {
      let stop = () => {};
      const deck = []; D.suits.forEach((s) => D.ranks.forEach((r) => deck.push({ r, s: s.s, red: s.red, id: r + s.s })));
      const seq = sample(deck, cfg.count);
      const card = (c, extra) => `<span class="card ${c.red ? "red" : ""} ${extra || ""}"><b>${c.r}</b>${c.s}</span>`;
      introScreen(el, "Card order", [
        `You will see <strong>${cfg.count} cards</strong> in order for <strong>${fmtTime(cfg.seconds)}</strong>.`,
        "Give each card a person or object (for example, king of hearts is a king holding a heart), and place it in your palace.",
        "Then tap the cards back in the same order."
      ], "Show the cards", study);

      function study() {
        el.innerHTML = `${timerHTML("Study time left")}<div class="card-row">${seq.map((c, i) => `<span class="card-wrap"><small>${i + 1}</small>${card(c)}</span>`).join("")}</div><div class="drill-actions"><button class="btn" data-act="ready">I'm ready</button></div>`;
        stop = countdown(el.querySelector(".timer"), cfg.seconds, recall);
        el.querySelector("[data-act=ready]").addEventListener("click", () => { stop(); recall(); });
      }
      function recall() {
        const chosen = [];
        const paint = () => {
          el.querySelector(".chosen").innerHTML = chosen.length ? chosen.map((c) => card(c)).join("") : `<span class="muted">Your sequence appears here.</span>`;
          el.querySelector(".count").textContent = chosen.length;
          el.querySelectorAll(".deck button").forEach((b) => { b.disabled = chosen.some((c) => c.id === b.dataset.id); });
        };
        el.innerHTML = `<p class="drill-msg">Tap the cards in order. <span class="count">0</span> of ${cfg.count}.</p><div class="chosen card-row"></div><div class="deck">${D.suits.map((s) => `<div class="deck-row">${deck.filter((c) => c.s === s.s).map((c) => `<button data-id="${c.id}" aria-label="${c.r} of ${s.s}">${card(c)}</button>`).join("")}</div>`).join("")}</div><div class="drill-actions"><button class="btn" data-act="undo">Undo</button><button class="btn primary" data-act="check">Check my answers</button></div>`;
        el.querySelectorAll(".deck button").forEach((b) => b.addEventListener("click", () => { if (chosen.length < cfg.count) { chosen.push(deck.find((c) => c.id === b.dataset.id)); paint(); } }));
        el.querySelector("[data-act=undo]").addEventListener("click", () => { chosen.pop(); paint(); });
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          const { len, hitA } = lcsMatch(seq, chosen, (a, b) => a.id === b.id);
          el.innerHTML = resultHead(len, cfg.count, cfg.target, `<p class="muted">Score counts the longest run of cards in the correct order.</p>`) +
            `<div class="card-row">${seq.map((c, i) => `<span class="card-wrap"><small>${i + 1}</small>${card(c, hitA[i] ? "hit" : "miss")}</span>`).join("")}</div><p class="legend"><span class="key hit"></span>In order <span class="key miss"></span>Missed or out of order</p>`;
          done({ score: len, max: cfg.count });
        });
        paint();
      }
      return () => stop();
    }
  };

  /* ---------------- Quizzes ---------------- */
  DRILLS.quiz = {
    title: "Quiz",
    blurb: "Scenario questions with explanations.",
    defaults: { bank: "biases", n: 10 },
    describe: (c) => `${c.n} questions`,
    mount(el, cfg, done) {
      const bank = B[cfg.bank];
      const qs = sample(bank.items, Math.min(cfg.n, bank.items.length)).map((it) => {
        const opts = it.options ? shuffle(it.options) : shuffle([it.a].concat(sample(bank.pool.filter((p) => p !== it.a), 3)));
        return Object.assign({}, it, { opts });
      });
      let i = 0, score = 0;
      introScreen(el, bank.title, [`<strong>${qs.length} questions.</strong> ${esc(bank.prompt)} Each answer comes with a short explanation.`], "Start the quiz", show);

      function show() {
        const q = qs[i];
        el.innerHTML = `<p class="q-count">Question ${i + 1} of ${qs.length}</p><p class="q-text">${esc(q.q)}</p><p class="q-prompt">${esc(bank.prompt)}</p><div class="q-opts">${q.opts.map((o) => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div><div class="q-feedback" aria-live="polite"></div>`;
        el.querySelector(".opt").focus();
        el.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
          const ok = b.dataset.o === q.a;
          if (ok) score++;
          el.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.o === q.a) x.classList.add("right"); });
          if (!ok) b.classList.add("wrong");
          const last = i === qs.length - 1;
          el.querySelector(".q-feedback").innerHTML = `<p><strong>${ok ? "Correct." : "Not quite. It's " + esc(q.a) + "."}</strong> ${esc(q.e)}</p><button class="btn primary" data-act="next">${last ? "See my score" : "Next question"}</button>`;
          const nx = el.querySelector("[data-act=next]"); nx.focus();
          nx.addEventListener("click", () => { if (last) finish(); else { i++; show(); } });
        }));
      }
      function finish() {
        el.innerHTML = resultHead(score, qs.length, cfg.target) + `<p class="muted">Retake it any time; the questions and options are shuffled each time.</p>`;
        done({ score, max: qs.length });
      }
      return () => {};
    }
  };

  /* ---------------- Which hand ---------------- */
  DRILLS.whichhand = {
    title: "Which-hand tracker",
    blurb: "Play the coin game with a friend and log each round. See whether you're beating luck.",
    defaults: { rounds: 20 },
    options: { rounds: [10, 20, 30, 50] },
    describe: (c) => `${c.rounds} rounds`,
    mount(el, cfg, done) {
      const log = [];
      introScreen(el, "Which-hand tracker", [
        "A friend hides a coin in one hand behind their back, then shows you both fists.",
        "Watch their eyes, shoulders and grip. Hover over each hand and ask \"this one?\" Then guess.",
        `Log each round below. After <strong>${cfg.rounds} rounds</strong> you get your result and the odds of scoring that well by pure luck.`
      ], "Start logging", play);

      function play() {
        const hits = log.filter(Boolean).length, n = log.length;
        const p = binomTail(n, hits);
        const finished = n >= cfg.rounds;
        el.innerHTML = `<p class="big-score"><span>${hits}</span> right out of ${n}</p>
          <div class="dots" aria-label="Round history">${log.map((r) => `<span class="dot ${r ? "hit" : "miss"}"></span>`).join("")}${Array.from({ length: Math.max(0, cfg.rounds - n) }, () => `<span class="dot"></span>`).join("")}</div>
          <p class="muted">${n ? `Hit rate ${Math.round((hits / n) * 100)} percent. Chance of doing at least this well by pure luck: ${(p * 100).toFixed(p < 0.1 ? 1 : 0)} percent.` : "Luck alone gets about half right."}</p>
          ${finished ? "" : `<div class="drill-actions split"><button class="btn primary" data-act="hit">I guessed right</button><button class="btn" data-act="miss">I guessed wrong</button></div>`}
          <div class="drill-actions">${n ? `<button class="btn ghost" data-act="undo">Undo last round</button>` : ""}${finished ? `<button class="btn primary" data-act="finish">Save result</button>` : ""}</div>`;
        const bind = (a, f) => { const b = el.querySelector(`[data-act=${a}]`); if (b) b.addEventListener("click", f); };
        bind("hit", () => { log.push(true); play(); });
        bind("miss", () => { log.push(false); play(); });
        bind("undo", () => { log.pop(); play(); });
        bind("finish", () => {
          el.innerHTML = resultHead(hits, cfg.rounds, cfg.target, `<p class="muted">Odds of this by luck: ${(p * 100).toFixed(1)} percent. Under 5 percent is strong evidence you're really reading them.</p>`);
          done({ score: hits, max: cfg.rounds });
        });
      }
      return () => {};
    }
  };

  window.DRILLS = DRILLS;
  window.DRILL_UTILS = { esc, shuffle, sample };
})();

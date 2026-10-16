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
    el.innerHTML = `<div class="drill-intro"><h3>${esc(title)}</h3>${lines.map((l) => (l.startsWith("<details") ? l : `<p>${l}</p>`)).join("")}<button class="btn primary" data-act="start">${esc(startLabel || "Start")}</button></div>`;
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
  const SEEN_KEY = "read-the-room-seen";
  function recentSeen(bank) { try { return (JSON.parse(localStorage.getItem(SEEN_KEY)) || {})[bank] || []; } catch (e) { return []; } }
  function rememberSeen(bank, ids, size) {
    try {
      const all = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
      const keep = Math.max(0, size - 10); /* always leave at least one quiz's worth of questions unseen */
      all[bank] = ids.concat((all[bank] || []).filter((k) => !ids.includes(k))).slice(0, keep);
      localStorage.setItem(SEEN_KEY, JSON.stringify(all));
    } catch (e) { /* storage unavailable: plain random order */ }
  }
  DRILLS.quiz = {
    title: "Quiz",
    blurb: "Scenario questions with explanations.",
    defaults: { bank: "biases", n: 10 },
    describe: (c) => `${c.n} questions`,
    mount(el, cfg, done) {
      const bank = B[cfg.bank];
      const n = Math.min(cfg.n, bank.items.length);
      /* Prefer questions not seen in the last few runs, so a bigger bank actually gets used. */
      const seen = recentSeen(cfg.bank);
      const idx = bank.items.map((_, k) => k);
      const fresh = shuffle(idx.filter((k) => !seen.includes(k))), stale = shuffle(idx.filter((k) => seen.includes(k)));
      const chosen = fresh.concat(stale).slice(0, n);
      rememberSeen(cfg.bank, chosen, bank.items.length);
      const qs = chosen.map((k) => bank.items[k]).map((it) => {
        const opts = it.options ? shuffle(it.options) : shuffle([it.a].concat(sample(bank.pool.filter((p) => p !== it.a && !(it.x || []).includes(p)), 3)));
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
        el.innerHTML = resultHead(score, qs.length, cfg.target) + `<p class="muted">Retake it any time. Questions you have not seen recently come first, and the options are shuffled.</p>`;
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

  const F = window.FACES;
  const wait = (ms, timers) => new Promise((res) => { timers.push(setTimeout(res, ms)); });
  const fmtMs = (v) => (v ? v + " ms" : "Until you answer");

  /* ---------------- Baseline spotter (week 5) ---------------- */
  const BL_QUESTIONS = ["How was your journey here?", "What do you do for work?", "Where did you grow up?", "What did you do last weekend?", "How do you know the host?", "What are you working on at the moment?", "Do you have any brothers or sisters?", "What's your favourite place to eat?", "How long have you lived here?", "Why did you choose your course or job?", "Are you planning any trips?", "What do you do to relax?", "How is your family doing?", "Did you watch the match last night?", "What's the hardest part of your job?", "How did the interview go?", "What did you think of the film?", "Have you been busy lately?"];
  const BL_CUES = {
    lips: { label: "Lips pressed together", g: "face" },
    smile: { label: "Smile dropped", g: "face" },
    brows: { label: "Brows lowered and drawn together", g: "face" },
    neck: { label: "Hand to the neck", g: "hands" },
    face: { label: "Hand to the face", g: "hands" },
    crossed: { label: "Arms crossed", g: "hands" },
    cup: { label: "Cup held in front of the body", g: "hands" },
    door: { label: "Feet turned toward the door", g: "feet" },
    tucked: { label: "Feet pulled back under the chair", g: "feet" },
    turned: { label: "Body turned toward the door", g: "torso" }
  };
  const BL_ORDER = Object.keys(BL_CUES);

  function applyCues(base, cues) {
    const st = Object.assign({}, base);
    cues.forEach((c) => {
      if (c === "lips") st.lips = true;
      else if (c === "smile") st.smile = false;
      else if (c === "brows") st.brows = true;
      else if (BL_CUES[c].g === "hands") st.hands = c;
      else if (BL_CUES[c].g === "feet") st.feet = c;
      else if (c === "turned") st.torso = "turned";
    });
    return st;
  }
  function faceExpr(st) {
    const e = {};
    if (st.smile && !st.lips) { e[6] = 0.6; e[12] = 0.75; }
    if (st.lips) { e[24] = 1; e[23] = 0.4; }
    if (st.brows) { e[4] = 0.8; e[7] = 0.3; }
    return e;
  }

  /* Seated person, front view. The door is on the right. */
  function figureSVG(p, st) {
    const shirt = F.SHIRT[p.shirt], arm = F.mix(shirt, "#000000", 0.18), skin = F.SKIN[p.skin];
    const pants = "#3A3F52", shoe = "#2A211C";
    const tx = st.torso === "turned" ? 14 : 0;
    let s = `<rect x="246" y="40" width="58" height="240" rx="3" fill="var(--sunk)" stroke="var(--line)" stroke-width="2"/><circle cx="256" cy="166" r="4" fill="var(--muted)"/><text x="275" y="32" text-anchor="middle" font-size="12" fill="var(--muted)">Door</text>`;
    s += `<line x1="0" y1="281" x2="320" y2="281" stroke="var(--line)" stroke-width="2"/>`;
    /* Side table and cup */
    s += `<rect x="14" y="196" width="54" height="8" rx="2" fill="#8A6A4A"/><line x1="41" y1="204" x2="41" y2="281" stroke="#8A6A4A" stroke-width="5"/>`;
    const mug = (x, y) => `<rect x="${x}" y="${y}" width="22" height="24" rx="3" fill="#E9E2D3" stroke="#9C8E78" stroke-width="1.5"/><path d="M${x + 22} ${y + 6} q8 0 8 7 q0 7 -8 7" fill="none" stroke="#9C8E78" stroke-width="2.5"/>`;
    if (st.hands !== "cup") s += mug(28, 172);
    /* Chair */
    s += `<rect x="92" y="96" width="96" height="116" rx="10" fill="#8A6A4A"/><rect x="84" y="200" width="112" height="14" rx="4" fill="#77583C"/><line x1="94" y1="214" x2="94" y2="281" stroke="#77583C" stroke-width="6"/><line x1="186" y1="214" x2="186" y2="281" stroke="#77583C" stroke-width="6"/>`;
    /* Legs and feet */
    if (st.feet === "tucked") {
      s += `<path d="M126 214 L134 252 M154 214 L146 252" stroke="${pants}" stroke-width="20" stroke-linecap="round"/>`;
      s += `<ellipse cx="146" cy="260" rx="11" ry="5" fill="${shoe}"/><ellipse cx="134" cy="262" rx="11" ry="5" fill="${shoe}"/>`;
    } else if (st.feet === "door") {
      s += `<path d="M126 214 L132 266 M154 214 L160 258" stroke="${pants}" stroke-width="20" stroke-linecap="round"/>`;
      s += `<path d="M150 252 h20 q15 0 17 9 q0 3 -3 3 h-34 z" fill="${shoe}" opacity=".85"/><path d="M122 262 h20 q15 0 17 9 q0 3 -3 3 h-34 z" fill="${shoe}"/>`;
    } else {
      s += `<path d="M126 214 L126 268 M154 214 L154 268" stroke="${pants}" stroke-width="20" stroke-linecap="round"/>`;
      s += `<ellipse cx="124" cy="274" rx="12" ry="8" fill="${shoe}"/><ellipse cx="156" cy="274" rx="12" ry="8" fill="${shoe}"/>`;
    }
    s += `<rect x="${110 + tx}" y="196" width="${60 - tx}" height="26" rx="10" fill="${pants}"/>`;
    /* Torso */
    const sl = 102 + tx * 1.6, sr = 178 - tx * 0.4;
    s += `<path d="M${sl} 136 C${sl} 126 ${sl + 10} 124 ${sl + 18} 124 L${sr - 18} 124 C${sr - 10} 124 ${sr} 126 ${sr} 136 L${sr - 8} 208 L${sl + 8 + tx * 0.3} 208 Z" fill="${shirt}"/>`;
    if (tx) s += `<path d="M${sr - 14} 125 C${sr - 6} 126 ${sr} 128 ${sr} 136 L${sr - 8} 208 L${sr - 22} 208 Z" fill="${arm}" opacity=".7"/>`;
    /* Head */
    s += `<g transform="translate(${90 + tx * 0.5} 27) scale(.5)">${F.group(p, faceExpr(st), 1, true)}</g>`;
    /* Arms: viewer's left is the person's right arm */
    const limb = (pts) => `<path d="M${pts.map((q) => q.join(" ")).join(" L")}" fill="none" stroke="${arm}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>`;
    const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${skin}"/>`;
    const L0 = [sl + 6, 138], R0 = [sr - 6, 138];
    const lapL = limb([L0, [100 + tx, 188], [124, 206]]) + hand(126, 207);
    const lapR = limb([R0, [180, 188], [156, 206]]) + hand(154, 207);
    if (st.hands === "crossed") s += limb([R0, [176, 178], [122, 170]]) + hand(118, 168) + limb([L0, [104 + tx, 180], [158, 166]]) + hand(162, 164);
    else if (st.hands === "neck") s += limb([L0, [92 + tx, 168], [124 + tx, 126]]) + hand(126 + tx, 122) + lapR;
    else if (st.hands === "face") s += limb([L0, [104 + tx, 176], [120 + tx, 112]]) + hand(122 + tx, 106) + lapR;
    else if (st.hands === "cup") s += limb([L0, [104 + tx, 184], [132, 168]]) + limb([R0, [176, 184], [150, 168]]) + mug(130, 146) + hand(132, 168) + hand(150, 168);
    else s += lapL + lapR;
    return `<svg class="figure" viewBox="0 0 320 290" role="img" aria-label="Wide shot of the person in the chair">${s}</svg>`;
  }

  DRILLS.baseline = {
    title: "Baseline spotter",
    blurb: "Watch someone answer a run of questions. Learn their normal, then catch the moment a cluster of signals changes.",
    defaults: { rounds: 3, seconds: 5 },
    options: { rounds: [2, 3, 5], seconds: [3, 5, 8] },
    labels: { seconds: "Each answer" },
    fmt: { seconds: (v) => v + " s" },
    describe: (c) => `${c.rounds} conversations`,
    figure: figureSVG,
    mount(el, cfg, done) {
      const timers = [];
      let alive = true, total = 0, round = 0;
      const results = [];
      introScreen(el, "Baseline spotter", [
        `You will watch <strong>${cfg.rounds} short conversations</strong>, eight questions each. Each answer shows for <strong>${cfg.seconds} seconds</strong>, with a close-up of the face and a wide shot of the body.`,
        "Spend the first answers learning their baseline: how they sit, where their hands and feet are, what their face does.",
        "At one question, <strong>a cluster</strong> of three signals changes together. Elsewhere there may be a single change that means little on its own. Afterwards, say which question it was and what changed."
      ], "Start the first conversation", play);

      function build() {
        const p = F.randomIdentity();
        const base = { smile: Math.random() < 0.5, lips: false, brows: false, hands: Math.random() < 0.35 ? "crossed" : "lap", feet: "forward", torso: "square" };
        const avail = BL_ORDER.filter((c) => !(c === "smile" && !base.smile) && !(c === "crossed" && base.hands === "crossed"));
        const groups = shuffle(["face", "hands", "feet", "torso"]).slice(0, 3);
        const cluster = groups.map((g) => sample(avail.filter((c) => BL_CUES[c].g === g), 1)[0]);
        const n = 8, k = 3 + Math.floor(Math.random() * 4); /* index 3..6, so questions 4 to 7 */
        const dCands = [1, 2, 3, 4, 5, 6, 7].filter((i) => i !== k && i !== k + 1 && i !== k - 1);
        const d = sample(dCands, 1)[0];
        const single = sample(["face", "neck", "tucked", base.hands === "lap" ? "crossed" : "face"].filter((c) => avail.includes(c)), 1)[0];
        const linger = sample(cluster, 1)[0];
        const qs = sample(BL_QUESTIONS, n);
        const frames = qs.map((q, i) => ({ q, st: applyCues(base, i === k ? cluster : i === k + 1 ? [linger] : i === d ? [single] : []) }));
        return { p, base, cluster, k, d, single, linger, frames };
      }

      async function play() {
        const r = build();
        for (let i = 0; i < r.frames.length && alive; i++) {
          const f = r.frames[i];
          el.innerHTML = `<p class="q-count">Conversation ${round + 1} of ${cfg.rounds}. Question ${i + 1} of ${r.frames.length}</p><p class="q-text">“${esc(f.q)}”</p>
            <div class="bl-stage"><div class="bl-face"><p class="bl-cap">Close-up</p>${F.svg(r.p, faceExpr(f.st), { label: "Close-up of the person's face" })}</div><div class="bl-body"><p class="bl-cap">Wide shot</p>${figureSVG(r.p, f.st)}</div></div>
            <div class="timer-track bl-bar"><span class="timer-fill" style="transition:none;transform:scaleX(1)"></span></div>`;
          const bar = el.querySelector(".bl-bar .timer-fill");
          requestAnimationFrame(() => requestAnimationFrame(() => { if (bar) { bar.style.transition = `transform ${cfg.seconds}s linear`; bar.style.transform = "scaleX(0)"; } }));
          await wait(cfg.seconds * 1000, timers);
        }
        if (alive) ask(r);
      }

      function ask(r) {
        el.innerHTML = `<p class="q-count">Conversation ${round + 1} of ${cfg.rounds}</p>
          <fieldset class="bl-q"><legend>At which question did a cluster of signals change?</legend>${r.frames.map((f, i) => `<label class="opt-line"><input type="radio" name="bl-k" value="${i}"> Q${i + 1}: ${esc(f.q)}</label>`).join("")}</fieldset>
          <fieldset class="bl-q"><legend>Which changes did you see at that question? Tick all that apply.</legend>${BL_ORDER.map((c) => `<label class="opt-line"><input type="checkbox" name="bl-c" value="${c}"> ${esc(BL_CUES[c].label)}</label>`).join("")}</fieldset>
          <div class="drill-actions"><button class="btn primary" data-act="check">Check</button></div>`;
        el.querySelector("input").focus();
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          const kSel = el.querySelector("input[name=bl-k]:checked");
          if (!kSel) { el.querySelector("input[name=bl-k]").focus(); return; }
          const picked = Array.from(el.querySelectorAll("input[name=bl-c]:checked")).map((x) => x.value);
          const qOk = +kSel.value === r.k;
          const diff = picked.filter((c) => !r.cluster.includes(c)).length + r.cluster.filter((c) => !picked.includes(c)).length;
          const cuePts = diff === 0 ? 2 : diff === 1 ? 1 : 0;
          const pts = (qOk ? 1 : 0) + cuePts;
          total += pts; results.push(pts);
          const notes = [];
          if (r.base.hands === "crossed") notes.push("Their baseline included crossed arms. On its own that meant nothing; it was simply their normal.");
          notes.push(`Question ${r.d + 1} had a single change (${BL_CUES[r.single].label.toLowerCase()}) that went straight back to normal. One signal alone is not a cluster.`);
          notes.push(`At question ${r.k + 2}, one signal (${BL_CUES[r.linger].label.toLowerCase()}) was still there as they settled back to normal.`);
          el.innerHTML = `<div class="result-head"><p class="big-score"><span>${pts}</span> out of 3</p><p class="muted">${qOk ? "Right question." : `The cluster came at question ${r.k + 1}.`} ${cuePts === 2 ? "You named every change." : cuePts === 1 ? "One change missed or extra." : "Several changes missed or extra."}</p></div>
            <div class="bl-compare"><div><p class="bl-cap">Baseline (question 1)</p>${figureSVG(r.p, r.frames[0].st)}</div><div><p class="bl-cap">Question ${r.k + 1}</p>${figureSVG(r.p, r.frames[r.k].st)}</div></div>
            <div class="bl-compare faces"><div>${F.svg(r.p, faceExpr(r.frames[0].st), { label: "Face at baseline" })}</div><div>${F.svg(r.p, faceExpr(r.frames[r.k].st), { label: "Face at the cluster" })}</div></div>
            <p><strong>What changed at question ${r.k + 1}:</strong> ${r.cluster.map((c) => BL_CUES[c].label.toLowerCase()).join("; ")}.</p>
            ${notes.map((n) => `<p class="muted">${esc(n)}</p>`).join("")}
            <p class="muted">A cluster tells you a topic matters to someone. It never tells you why, and it is not a sign of lying.</p>
            <div class="drill-actions"><button class="btn primary" data-act="next">${round + 1 < cfg.rounds ? "Next conversation" : "See my score"}</button></div>`;
          el.querySelector("[data-act=next]").focus();
          el.querySelector("[data-act=next]").addEventListener("click", () => {
            round++;
            if (round < cfg.rounds) play();
            else {
              el.innerHTML = resultHead(total, cfg.rounds * 3, cfg.target, `<p class="muted">Each conversation scores 1 for the right question and up to 2 for naming the changes: ${results.join(", ")}.</p>`);
              done({ score: total, max: cfg.rounds * 3 });
            }
          });
        });
      }
      return () => { alive = false; timers.forEach(clearTimeout); };
    }
  };

  /* ---------------- Expression faces (week 6) ---------------- */
  DRILLS.faces = {
    title: "Faces: expressions",
    blurb: "Name the emotion on illustrated faces built from real facial muscle movements. Flash mode trains micro-expressions.",
    defaults: { count: 10, flash: 0 },
    options: { count: [10, 20, 30], flash: [0, 500, 200, 100] },
    labels: { flash: "Show face for" },
    fmt: { flash: fmtMs },
    describe: (c) => `${c.count} faces`,
    mount(el, cfg, done) {
      const timers = [];
      let alive = true;
      const cats = cfg.flash ? ["happiness", "sadness", "anger", "fear", "surprise", "disgust", "contempt"] : ["happiness", "social", "sadness", "anger", "fear", "surprise", "disgust", "contempt"];
      let seq = [];
      while (seq.length < cfg.count) seq = seq.concat(shuffle(cats));
      const items = seq.slice(0, cfg.count).map((e) => ({ e, p: F.randomIdentity(), k: 0.7 + Math.random() * 0.3 }));
      let i = 0, score = 0;
      introScreen(el, "Faces: expressions", [
        `<strong>${cfg.count} faces.</strong> ${cfg.flash ? `Each emotion flashes for only <strong>${cfg.flash} milliseconds</strong> between two neutral faces, like a micro-expression.` : "Take your time with each face."}`,
        "Look at the brows, the eyes and the mouth separately, then name the emotion.",
        "These are drawings built from the muscle movements in the week 6 lesson. Real faces are messier, and in real life context matters as much as the face."
      ], "Show the first face", show);

      async function show() {
        const it = items[i];
        const opts = cats.map((c) => `<button class="opt" data-o="${c}" ${cfg.flash ? "disabled" : ""}>${esc(F.LABELS[c])}</button>`).join("");
        el.innerHTML = `<p class="q-count">Face ${i + 1} of ${items.length}</p><div class="face-stage">${F.svg(it.p, cfg.flash ? "neutral" : it.e, { label: "Face", intensity: it.k })}</div><p class="q-prompt">What does this face most likely show?</p><div class="q-opts cols">${opts}</div><div class="q-feedback" aria-live="polite"></div>`;
        const stage = el.querySelector(".face-stage");
        if (cfg.flash) {
          await wait(900, timers); if (!alive) return;
          stage.innerHTML = F.svg(it.p, it.e, { label: "Face", intensity: it.k });
          await wait(cfg.flash, timers); if (!alive) return;
          stage.innerHTML = F.svg(it.p, "neutral", { label: "Face" });
          el.querySelectorAll(".opt").forEach((b) => { b.disabled = false; });
        }
        el.querySelector(".opt").focus();
        el.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
          const ok = b.dataset.o === it.e;
          if (ok) score++;
          el.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.o === it.e) x.classList.add("right"); });
          if (!ok) b.classList.add("wrong");
          if (cfg.flash) stage.innerHTML = F.svg(it.p, it.e, { label: "The face again, held still", intensity: it.k });
          const last = i === items.length - 1;
          el.querySelector(".q-feedback").innerHTML = `<p><strong>${ok ? "Correct." : "Not quite. It's " + esc(F.LABELS[it.e].toLowerCase()) + "."}</strong> ${esc(F.CUES[it.e])}</p><button class="btn primary" data-act="next">${last ? "See my score" : "Next face"}</button>`;
          const nx = el.querySelector("[data-act=next]"); nx.focus();
          nx.addEventListener("click", () => { if (last) finish(); else { i++; show(); } });
        }));
      }
      function finish() {
        el.innerHTML = resultHead(score, items.length, cfg.target, `<p class="muted">${cfg.flash ? `Flash time: ${cfg.flash} ms. Try a shorter flash once you score 8 out of 10.` : "Try flash mode next, starting at 500 ms."} Research is mixed on whether this training helps with real faces, so treat it as practice in noticing, not as lie detection.</p>`);
        done({ score, max: items.length });
      }
      return () => { alive = false; timers.forEach(clearTimeout); };
    }
  };

  /* ---------------- Faces and names ---------------- */
  DRILLS.facenames = {
    title: "Faces and names",
    blurb: "Meet a group of faces with names. Then the faces come back in a new order, with a different expression, and you type each name.",
    defaults: { count: 8, seconds: 120 },
    options: { count: [6, 8, 12, 16, 20], seconds: [60, 120, 180, 300] },
    describe: (c) => `${c.count} faces, ${fmtTime(c.seconds)} to study`,
    mount(el, cfg, done) {
      let stop = () => {};
      const ids = F.distinctIdentities(cfg.count);
      const people = sample(D.names, cfg.count).map((n, i) => ({ n, p: ids[i] }));
      introScreen(el, "Faces and names", [
        `You will meet <strong>${cfg.count} people</strong> and have <strong>${fmtTime(cfg.seconds)}</strong> to learn their names.`,
        "For each: say the name, turn it into an image, and pin the image to the most distinctive feature of the face: hair, glasses, beard, earrings, face shape.",
        "When they come back, they will be in a new order and wearing a different expression, just like meeting someone a second time."
      ], "Meet the people", study);

      function study() {
        el.innerHTML = `${timerHTML("Study time left")}<div class="face-grid">${people.map((x) => `<figure class="face-card">${F.svg(x.p, "social", { label: "Face of " + esc(x.n), intensity: 0.8 })}<figcaption>${esc(x.n)}</figcaption></figure>`).join("")}</div><div class="drill-actions"><button class="btn" data-act="ready">I'm ready</button></div>`;
        stop = countdown(el.querySelector(".timer"), cfg.seconds, recall);
        el.querySelector("[data-act=ready]").addEventListener("click", () => { stop(); recall(); });
      }
      function recall() {
        const order = shuffle(people);
        el.innerHTML = `<p class="drill-msg">Who is this? Type each name.</p><div class="face-grid">${order.map((x, i) => `<label class="face-card">${F.svg(x.p, Math.random() < 0.5 ? "neutral" : "happiness", { label: "Face number " + (i + 1), intensity: 0.7 })}<input type="text" data-i="${i}" autocomplete="off" autocapitalize="words" spellcheck="false" aria-label="Name of face number ${i + 1}"></label>`).join("")}</div><div class="drill-actions"><button class="btn primary" data-act="check">Check my answers</button></div>`;
        el.querySelector("input").focus();
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          let score = 0;
          const marks = order.map((x, i) => {
            const raw = el.querySelector(`input[data-i="${i}"]`).value, v = norm(raw), t = norm(x.n);
            const ok = !!v && (v === t || (t.length > 4 && lev(v, t) <= 1));
            if (ok) score++;
            return { x, raw, ok };
          });
          el.innerHTML = resultHead(score, cfg.count, cfg.target, `<p class="muted">Small spelling slips are accepted.</p>`) +
            `<div class="face-grid">${marks.map((m) => `<figure class="face-card ${m.ok ? "hit" : "miss"}">${F.svg(m.x.p, "neutral", { label: "Face of " + esc(m.x.n) })}<figcaption>${esc(m.x.n)}${m.ok ? "" : `<span class="pyou">You wrote: ${esc(m.raw || "nothing")}</span>`}</figcaption></figure>`).join("")}</div>`;
          done({ score, max: cfg.count });
        });
      }
      return () => stop();
    }
  };

  /* ---------------- Numbers with the Major system ---------------- */
  const MAJOR = [["0", "s, z", "sea, zoo"], ["1", "t, d", "tie, day"], ["2", "n", "Noah, knee"], ["3", "m", "ma, mow"], ["4", "r", "ray, row"], ["5", "l", "law, lie"], ["6", "j, sh, ch, soft g", "shoe, jaw"], ["7", "k, hard c, hard g", "key, cow"], ["8", "f, v", "fee, ivy"], ["9", "p, b", "pie, bee"]];
  const majorTable = () => `<details class="major"><summary>Major system reference</summary><p>Each digit is a consonant sound. Vowels and w, h, y are free fillers. Turn pairs of digits into words, then place the words in your memory palace. For example, 14 is t + r: <em>tyre</em>; 32 is m + n: <em>moon</em>; 91 is b + t: <em>bat</em>.</p><div class="table-wrap"><table><thead><tr><th>Digit</th><th>Sounds</th><th>Example</th></tr></thead><tbody>${MAJOR.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div></details>`;
  DRILLS.major = {
    title: "Numbers",
    blurb: "Memorise a long number with the Major system, which turns digits into sounds and words, then type it back.",
    defaults: { count: 20, seconds: 120 },
    options: { count: [10, 20, 30, 40, 60, 80], seconds: [60, 120, 180, 300, 600] },
    labels: { count: "Digits" },
    describe: (c) => `${c.count} digits, ${fmtTime(c.seconds)} to study`,
    mount(el, cfg, done) {
      let stop = () => {};
      const digits = Array.from({ length: cfg.count }, () => String(Math.floor(Math.random() * 10)));
      const rows = []; for (let i = 0; i < digits.length; i += 10) rows.push(digits.slice(i, i + 10));
      const showRows = (cls) => `<div class="digits">${rows.map((r) => `<p>${r.map((d, i) => `<span class="${cls ? cls(r, i) : ""}">${d}</span>${i % 2 ? " " : ""}`).join("")}</p>`).join("")}</div>`;
      introScreen(el, "Numbers", [
        `You will see <strong>${cfg.count} digits</strong> and have <strong>${fmtTime(cfg.seconds)}</strong> to memorise them in order.`,
        "Split them into pairs, turn each pair into a word with the Major system, and place the words along your memory palace.",
        majorTable()
      ], "Show the number", study);

      function study() {
        el.innerHTML = `${timerHTML("Study time left")}${showRows()}${majorTable()}<div class="drill-actions"><button class="btn" data-act="ready">I'm ready to recall</button></div>`;
        stop = countdown(el.querySelector(".timer"), cfg.seconds, recall);
        el.querySelector("[data-act=ready]").addEventListener("click", () => { stop(); recall(); });
      }
      function recall() {
        el.innerHTML = `<label class="drill-msg" for="recall">Type the digits in order. Spaces and line breaks are ignored.</label><textarea id="recall" rows="4" inputmode="numeric" autocomplete="off" spellcheck="false"></textarea><div class="drill-actions"><button class="btn primary" data-act="check">Check my answers</button></div>`;
        const ta = el.querySelector("textarea"); ta.focus();
        el.querySelector("[data-act=check]").addEventListener("click", () => {
          const typed = ta.value.replace(/\D/g, "").split("");
          const { len, hitA } = lcsMatch(digits, typed, (x, y) => x === y);
          let k = 0;
          el.innerHTML = resultHead(len, cfg.count, cfg.target, `<p class="muted">Score counts the longest run of digits in the correct order. You typed ${typed.length} digits.</p>`) + showRows(() => (hitA[k++] ? "hit" : "miss"));
          done({ score: len, max: cfg.count });
        });
      }
      return () => stop();
    }
  };

  /* ---------------- Wide view: centre and periphery at once ---------------- */
  const DIRS = [["Top left", -1, -1], ["Top", 0, -1], ["Top right", 1, -1], ["Left", -1, 0], null, ["Right", 1, 0], ["Bottom left", -1, 1], ["Bottom", 0, 1], ["Bottom right", 1, 1]];
  DRILLS.peripheral = {
    title: "Wide view",
    blurb: "Identify what flashes in the centre and, at the same time, where a star appears at the edge. Trains the width of your attention.",
    defaults: { rounds: 15, ms: 250, clutter: 0 },
    options: { rounds: [10, 15, 20, 30], ms: [500, 250, 150, 100], clutter: [0, 1] },
    labels: { ms: "Flash", clutter: "Distractors" },
    fmt: { ms: (v) => v + " ms", clutter: (v) => (v ? "On" : "Off") },
    describe: (c) => `${c.rounds} flashes of ${c.ms} ms`,
    mount(el, cfg, done) {
      const timers = [];
      let alive = true, i = 0, score = 0;
      introScreen(el, "Wide view", [
        `Keep your eyes on the <strong>+</strong> in the centre. For <strong>${cfg.ms} milliseconds</strong>, a car or a truck appears there, and a star appears somewhere near the edge${cfg.clutter ? ", hidden among squares" : ""}.`,
        "Then say what was in the centre and where the star was. A round only counts if you get both.",
        "This is based on the useful field of view task used in attention research. Training improves the task itself; how much it carries over to daily life is still debated."
      ], "Start", trial);

      function stageHTML(content) { return `<p class="q-count">Round ${i + 1} of ${cfg.rounds}</p><div class="pv-stage" aria-hidden="true">${content}</div>`; }
      const cell = (dx, dy, html, r) => `<span class="pv-item" style="left:${50 + dx * r}%;top:${50 + dy * r}%">${html}</span>`;
      async function trial() {
        const center = Math.random() < 0.5 ? "car" : "truck";
        const dirIdx = sample([0, 1, 2, 3, 5, 6, 7, 8], 1)[0];
        const [, dx, dy] = DIRS[dirIdx];
        const r = 40;
        el.innerHTML = stageHTML(`<span class="pv-fix">+</span>`);
        await wait(700, timers); if (!alive) return;
        let items = cell(dx, dy, "★", r);
        if (cfg.clutter) DIRS.forEach((d, j) => { if (d && j !== dirIdx) items += cell(d[1], d[2], "■", r); if (d) items += cell(d[1], d[2], "■", r / 2); });
        el.querySelector(".pv-stage").innerHTML = `<span class="pv-fix pv-target">${center === "car" ? "🚗" : "🚚"}</span>${items}`;
        await wait(cfg.ms, timers); if (!alive) return;
        let mask = `<span class="pv-fix pv-mask">▩</span>`; DIRS.forEach((d) => { if (d) { mask += cell(d[1], d[2], "▩", r); mask += cell(d[1], d[2], "▩", r / 2); } });
        el.querySelector(".pv-stage").innerHTML = mask;
        await wait(250, timers); if (!alive) return;
        answer(center, dirIdx);
      }
      function answer(center, dirIdx) {
        let cSel = null, dSel = null;
        el.innerHTML = `<p class="q-count">Round ${i + 1} of ${cfg.rounds}</p>
          <p class="drill-msg">What was in the centre?</p><div class="drill-actions left"><button class="btn" data-c="car" aria-pressed="false">🚗 Car</button><button class="btn" data-c="truck" aria-pressed="false">🚚 Truck</button></div>
          <p class="drill-msg pv-gap">Where was the star?</p><div class="pv-dirs">${DIRS.map((d, j) => (d ? `<button class="btn" data-d="${j}" aria-pressed="false" aria-label="${d[0]}">${["↖", "↑", "↗", "←", "", "→", "↙", "↓", "↘"][j]}</button>` : `<span></span>`)).join("")}</div>
          <div class="q-feedback" aria-live="polite"></div>`;
        const check = () => {
          if (!cSel || dSel === null) return;
          const ok = cSel === center && dSel === dirIdx;
          if (ok) score++;
          el.querySelectorAll("[data-c],[data-d]").forEach((b) => { b.disabled = true; });
          const last = i === cfg.rounds - 1;
          el.querySelector(".q-feedback").innerHTML = `<p><strong>${ok ? "Both right." : `It was a ${center}, and the star was ${DIRS[dirIdx][0].toLowerCase()}.`}</strong></p><button class="btn primary" data-act="next">${last ? "See my score" : "Next round"}</button>`;
          const nx = el.querySelector("[data-act=next]"); nx.focus();
          nx.addEventListener("click", () => { if (last) finish(); else { i++; trial(); } });
        };
        el.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { cSel = b.dataset.c; el.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", x === b)); check(); }));
        el.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { dSel = +b.dataset.d; el.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", x === b)); check(); }));
        el.querySelector("[data-c]").focus();
      }
      function finish() {
        el.innerHTML = resultHead(score, cfg.rounds, cfg.target, `<p class="muted">${score >= cfg.rounds * 0.8 ? "Strong. Shorten the flash or turn on distractors next time." : "Keep your eyes on the centre; let the edge come to you."}</p>`);
        done({ score, max: cfg.rounds });
      }
      return () => { alive = false; timers.forEach(clearTimeout); };
    }
  };

  /* ---------------- Spot the change (flicker task) ---------------- */
  DRILLS.changes = {
    title: "Spot the change",
    blurb: "Two versions of a scene flicker back and forth. One thing differs. Find it before time runs out.",
    defaults: { rounds: 6, seconds: 30 },
    options: { rounds: [4, 6, 8, 10], seconds: [20, 30, 60] },
    labels: { seconds: "Time each" },
    describe: (c) => `${c.rounds} scenes`,
    mount(el, cfg, done) {
      const timers = [];
      let alive = true, i = 0, score = 0, flick = null, stopClock = () => {};
      const times = [];
      const COLS = 5, ROWS = 4;
      introScreen(el, "Spot the change", [
        `You will see <strong>${cfg.rounds} scenes</strong>. Each one flickers between two versions with a blank flash in between. One object disappears, changes or moves.`,
        `Tap the place where it changes. You have <strong>${cfg.seconds} seconds</strong> and three taps per scene.`,
        "The blank flash hides the movement your eyes would normally catch. This is called change blindness, and the only way through is a systematic scan."
      ], "Show the first scene", round);

      function build() {
        const n = 11 + Math.floor(Math.random() * 4);
        const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, k) => k));
        const filled = cells.slice(0, n), empty = cells.slice(n);
        const objs = sample(D.objects, n + 1);
        const A = {}; filled.forEach((c, k) => { A[c] = objs[k]; });
        const B = Object.assign({}, A);
        const type = sample(["remove", "swap", "move"], 1)[0];
        const target = sample(filled, 1)[0];
        let hits = [target];
        if (type === "remove") delete B[target];
        else if (type === "swap") B[target] = objs[n];
        else { const to = sample(empty, 1)[0]; B[to] = A[target]; delete B[target]; hits = [target, to]; }
        const jitter = Array.from({ length: COLS * ROWS }, () => [Math.round(Math.random() * 16 - 8), Math.round(Math.random() * 12 - 6)]);
        return { A, B, type, hits, jitter };
      }
      const paint = (scene, s) => { el.querySelectorAll(".fl-cell").forEach((b) => { const c = +b.dataset.c; b.querySelector("span").textContent = scene && scene[c] ? scene[c] : ""; }); if (s) el.querySelector(".fl-grid").classList.toggle("blank", !scene); };
      function round() {
        const r = build();
        let wrong = 0, ended = false;
        const t0 = Date.now();
        el.innerHTML = `${timerHTML("Time left")}<p class="q-count">Scene ${i + 1} of ${cfg.rounds}. <span class="fl-tries">3 taps left.</span></p><div class="fl-grid" style="grid-template-columns:repeat(${COLS},1fr)">${Array.from({ length: COLS * ROWS }, (_, c) => `<button class="fl-cell" data-c="${c}" aria-label="Row ${Math.floor(c / COLS) + 1}, column ${(c % COLS) + 1}"><span style="transform:translate(${r.jitter[c][0]}px,${r.jitter[c][1]}px)"></span></button>`).join("")}</div><div class="q-feedback" aria-live="polite"></div>`;
        let phase = 0;
        const seq = [[r.A, 280], [null, 110], [r.B, 280], [null, 110]];
        const tick = () => { if (!alive || ended) return; const [sc, ms] = seq[phase % 4]; paint(sc, true); phase++; flick = setTimeout(tick, ms); };
        tick();
        stopClock = countdown(el.querySelector(".timer"), cfg.seconds, () => finishRound(false));
        el.querySelectorAll(".fl-cell").forEach((b) => b.addEventListener("click", () => {
          if (ended) return;
          const c = +b.dataset.c;
          if (r.hits.includes(c)) finishRound(true);
          else {
            wrong++; b.classList.add("wrong"); b.disabled = true;
            el.querySelector(".fl-tries").textContent = `${3 - wrong} ${3 - wrong === 1 ? "tap" : "taps"} left.`;
            if (wrong >= 3) finishRound(false);
          }
        }));
        function finishRound(found) {
          if (ended) return; ended = true;
          clearTimeout(flick); stopClock();
          const secs = Math.round((Date.now() - t0) / 100) / 10;
          if (found) { score++; times.push(secs); }
          const label = { remove: "An object disappeared", swap: "An object changed into another", move: "An object moved" }[r.type];
          el.querySelector(".fl-grid").classList.remove("blank");
          el.querySelectorAll(".fl-cell").forEach((b) => { b.disabled = true; const c = +b.dataset.c; b.querySelector("span").textContent = r.A[c] || r.B[c] || ""; if (r.hits.includes(c)) b.classList.add("target"); });
          if (r.type === "swap") r.hits.forEach((c) => { el.querySelector(`.fl-cell[data-c="${c}"] span`).textContent = r.A[c] + "→" + r.B[c]; });
          if (r.type === "move") { el.querySelector(`.fl-cell[data-c="${r.hits[0]}"] span`).textContent = r.A[r.hits[0]] + "→"; el.querySelector(`.fl-cell[data-c="${r.hits[1]}"] span`).textContent = "→" + r.B[r.hits[1]]; }
          const last = i === cfg.rounds - 1;
          el.querySelector(".q-feedback").innerHTML = `<p><strong>${found ? `Found in ${secs} seconds.` : "Not this time."}</strong> ${label}; it is highlighted.</p><button class="btn primary" data-act="next">${last ? "See my score" : "Next scene"}</button>`;
          const nx = el.querySelector("[data-act=next]"); nx.focus();
          nx.addEventListener("click", () => { if (last) finish(); else { i++; round(); } });
        }
      }
      function finish() {
        const avg = times.length ? (times.reduce((x, y) => x + y, 0) / times.length).toFixed(1) : null;
        el.innerHTML = resultHead(score, cfg.rounds, cfg.target, `<p class="muted">${avg ? `Average time when found: ${avg} seconds. ` : ""}Scan in a fixed order, row by row, rather than waiting for the change to jump out.</p>`);
        done({ score, max: cfg.rounds });
      }
      return () => { alive = false; clearTimeout(flick); stopClock(); timers.forEach(clearTimeout); };
    }
  };

  /* ---------------- Pacing (week 10) ---------------- */
  const SAMPLE_SCRIPT = "I want to try something that doesn't always work. In a moment I'll ask you to think of a number, and I'll try to read it from the way you think about it. There's no trick question and no right answer. Just be yourself. Ready? Think of a number between one and ten. Not the first one that comes to mind, the second. Got it? Picture it written on a white card. Make it bigger. Now hold it there.";
  const wordsIn = (t) => (String(t).trim().match(/\S+/g) || []).length;
  DRILLS.pacing = {
    title: "Pacing timer",
    blurb: "Perform your script aloud against a target time. See your speaking pace and how close you landed.",
    defaults: { minutes: 2 },
    options: { minutes: [1, 2, 3, 5, 10] },
    labels: { minutes: "Target" },
    fmt: { minutes: (v) => v + " min" },
    describe: (c) => `${c.minutes} minute target`,
    mount(el, cfg, done) {
      let id = null;
      const target = cfg.minutes * 60;
      el.innerHTML = `<div class="drill-intro"><h3>Pacing timer</h3><p>Paste or write the script you will perform. Aim to land within 10 percent of <strong>${cfg.minutes} ${cfg.minutes === 1 ? "minute" : "minutes"}</strong>.</p>
        <label class="drill-msg" for="pace-script">Your script</label><textarea id="pace-script" rows="8">${esc(cfg.script || SAMPLE_SCRIPT)}</textarea>
        <p class="muted pace-est"></p><div class="drill-actions"><button class="btn primary" data-act="start">Start the timer</button></div></div>`;
      const ta = el.querySelector("textarea"), est = el.querySelector(".pace-est");
      const upd = () => { const w = wordsIn(ta.value); est.textContent = w ? `${w} words. At a stage pace of about 130 words a minute, that is roughly ${fmtTime(Math.round((w / 130) * 60))}, plus your pauses.` : "Add your script to see an estimate."; };
      ta.addEventListener("input", upd); upd();
      el.querySelector("[data-act=start]").addEventListener("click", () => {
        const script = ta.value, words = wordsIn(script);
        if (cfg.onScript) cfg.onScript(script);
        const t0 = Date.now();
        el.innerHTML = `<p class="pace-clock" aria-live="off">0:00</p><div class="timer-track"><span class="timer-fill pace-fill" style="transform:scaleX(0)"></span></div><p class="muted pace-target">Target ${fmtTime(target)}. Perform it out loud, with your pauses.</p><div class="drill-actions"><button class="btn primary" data-act="stop">I've finished</button></div>`;
        const clock = el.querySelector(".pace-clock"), fill = el.querySelector(".pace-fill");
        id = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); clock.textContent = fmtTime(s); fill.style.transform = `scaleX(${Math.min(1, s / target)})`; clock.classList.toggle("over", s > target * 1.1); }, 250);
        el.querySelector("[data-act=stop]").addEventListener("click", () => {
          clearInterval(id); id = null;
          const secs = Math.max(1, Math.round((Date.now() - t0) / 1000));
          const off = Math.abs(secs - target) / target;
          const score = Math.max(0, 10 - Math.round(off * 20));
          const wpm = words >= 20 && secs >= 20 ? Math.round(words / (secs / 60)) : null;
          const paceNote = wpm === null ? "" : wpm > 160 ? `${wpm} words a minute is fast for performing. Slow down, and pause before each reveal.` : wpm < 100 ? `${wpm} words a minute is slow. Check that your pauses are deliberate, not hesitations.` : `${wpm} words a minute is a comfortable stage pace.`;
          el.innerHTML = resultHead(score, 10, cfg.target, `<p class="muted">You took ${fmtTime(secs)} against a target of ${fmtTime(target)} (${secs > target ? "over" : "under"} by ${Math.round(off * 100)} percent). Each 5 percent off costs a point.</p>${paceNote ? `<p class="muted">${paceNote}</p>` : ""}`);
          done({ score, max: 10 });
        });
      });
      return () => { if (id) clearInterval(id); };
    }
  };

  window.DRILLS = DRILLS;
  window.DRILL_UTILS = { esc, shuffle, sample, fmtTime, wordsIn, binomTail };
})();

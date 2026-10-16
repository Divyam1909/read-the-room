/* Read the Room: app shell, routing and pages. */
(function () {
  const C = window.COURSE, DR = window.DRILLS, BK = window.BANKS, CH = window.CHARTS;
  const { esc, sample, shuffle, fmtTime, wordsIn } = window.DRILL_UTILS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const view = $("#view");

  /* ---------------- Storage ---------------- */
  const KEY = "read-the-room-v1";
  let memoryOnly = false;
  const blankShow = () => ({ effects: [], draft: "", runs: [], target: 10, prompter: { speed: 40, size: 44, mirror: false } });
  const blank = () => ({ v: 1, start: null, tasks: {}, tests: {}, practice: {}, journal: [], theme: null, activity: {}, name: "", show: blankShow(), readings: [], readingDraft: { who: "", log: [] }, books: {} });
  function normalise(d) {
    const s = Object.assign(blank(), d);
    s.show = Object.assign(blankShow(), s.show);
    s.show.prompter = Object.assign(blankShow().prompter, s.show.prompter);
    s.readingDraft = Object.assign({ who: "", log: [] }, s.readingDraft);
    if (!s.books || typeof s.books !== "object") s.books = {};
    return s;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? normalise(JSON.parse(raw)) : blank(); }
    catch (e) { memoryOnly = true; return blank(); }
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memoryOnly = true; } }

  /* Dates use the visitor's local calendar day, so streaks roll over at their midnight. */
  const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => ymd(new Date());
  const dayNum = (k) => { const [y, m, d] = k.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
  const fmtDate = (k, o) => new Date(k + "T00:00").toLocaleDateString(undefined, o || { day: "numeric", month: "short" });
  const weekBy = (n) => C.weeks.find((w) => w.n === n);

  /* ---------------- Progress logic ---------------- */
  function partState(week, part) {
    const rec = (S.tests[week.n] || {})[part.id];
    if (!rec) return { rec: null, passed: false, note: "" };
    if (part.beat) {
      const ref = (S.tests[part.beat.week] || {})[part.beat.part];
      if (!ref) return { rec, passed: false, note: `Record your week ${part.beat.week} score first to compare.` };
      return { rec, passed: rec.score > ref.score, note: `Week ${part.beat.week} score: ${ref.score}.` };
    }
    if (typeof part.target !== "number") return { rec, passed: true, note: "" };
    return { rec, passed: rec.score >= part.target, note: "" };
  }
  function weekPassed(w) { return w.test.parts.every((p) => partState(w, p).passed); }
  function weekTaskPct(w) {
    let done = 0; const total = w.tasks.length * 7;
    w.tasks.forEach((_, i) => { (S.tasks[`w${w.n}t${i}`] || []).forEach((d) => { if (d) done++; }); });
    return total ? Math.round((done / total) * 100) : 0;
  }
  function currentWeek() {
    const firstOpen = C.weeks.find((w) => !weekPassed(w));
    return firstOpen ? firstOpen.n : 12;
  }
  const passedCount = () => C.weeks.filter(weekPassed).length;
  const hasStarted = () => !!(S.start || Object.keys(S.tests).length || Object.keys(S.tasks).length || Object.keys(S.practice).length || S.journal.length);

  /* ---------------- Activity and streaks ---------------- */
  function markActive() { const k = today(); S.activity[k] = (S.activity[k] || 0) + 1; }
  function activityCounts() {
    const c = Object.assign({}, S.activity);
    const add = (k) => { if (k) c[k] = (c[k] || 0) + 1; };
    /* Older records only carry a date, so derive activity from them too. Task ticks are the only source stored separately. */
    Object.values(S.practice).forEach((arr) => arr.forEach((h) => { if (!h.logged) add(h.date); }));
    Object.values(S.tests).forEach((w) => Object.values(w).forEach((r) => { if (!r.logged) add(r.date); }));
    S.journal.forEach((e) => { if (!e.logged) add(e.saved || e.date); });
    return c;
  }
  function streaks() {
    const counts = activityCounts();
    const set = new Set(Object.keys(counts).filter((k) => counts[k] > 0));
    let cur = 0; const d = new Date();
    const doneToday = set.has(ymd(d));
    if (!doneToday) d.setDate(d.getDate() - 1);
    while (set.has(ymd(d))) { cur++; d.setDate(d.getDate() - 1); }
    let best = 0, run = 0, prev = null;
    Array.from(set).sort().forEach((k) => { const n = dayNum(k); run = prev !== null && n - prev === 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; });
    return { cur, best, doneToday, total: set.size };
  }

  /* ---------------- Theme ---------------- */
  function applyTheme() { if (S.theme) document.documentElement.setAttribute("data-theme", S.theme); else document.documentElement.removeAttribute("data-theme"); }
  applyTheme();
  $("#theme-toggle").addEventListener("click", () => {
    const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    S.theme = dark ? "light" : "dark"; save(); applyTheme();
  });

  /* ---------------- Sidebar and search box ---------------- */
  function renderOutline() {
    const route = location.hash || "#/";
    const on = (href) => route === href || (href !== "#/" && route.startsWith(href + "/"));
    const link = (href, label, extra) => `<a href="${href}" class="${on(href) ? "active" : ""}" ${on(href) ? 'aria-current="page"' : ""}>${label}${extra || ""}</a>`;
    $("#outline").innerHTML = `
      <div class="nav-group">${link("#/", "Home")}${link("#/start", "Before you begin")}</div>
      ${C.months.map((m) => `<div class="nav-group"><p class="nav-month">Month ${m.n}: ${esc(m.title)}</p>
        ${m.weeks.map((n) => { const w = weekBy(n); return link(`#/week/${n}`, `<span class="wk-n">${n}</span><span>${esc(w.title)}</span>`, weekPassed(w) ? `<span class="tick" aria-label="passed">✓</span>` : ""); }).join("")}</div>`).join("")}
      <div class="nav-group">${link("#/tools", "Practice tools")}${link("#/perform", "Performance mode")}${link("#/tracker", "Progress tracker")}${link("#/journal", "Journal")}</div>
      <div class="nav-group">${link("#/library", "Library")}${link("#/glossary", "Glossary")}${link("#/search", "Search")}${link("#/about", "About and ethics")}</div>`;
  }
  const drawer = () => document.body.classList.toggle("nav-open");
  $("#menu-btn").addEventListener("click", drawer);
  $("#scrim").addEventListener("click", drawer);
  $("#top-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#top-q").value.trim();
    location.hash = "#/search/" + encodeURIComponent(q);
    $("#top-q").value = "";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (!$("#overlay").hidden || $(".prompter")) return;
    e.preventDefault();
    const box = $("#top-q");
    if (box && box.offsetParent) box.focus(); else location.hash = "#/search";
  });

  /* ---------------- Drill overlay ---------------- */
  let cleanup = null, pageCleanup = null, lastFocus = null;
  function openDrill(toolId, cfg, onResult) {
    const d = DR[toolId];
    lastFocus = document.activeElement;
    const ov = $("#overlay");
    const name = toolId === "quiz" ? BK[cfg.bank].title : d.title;
    ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(name)}"><div class="sheet-head"><p>${esc(name)}</p><button class="btn ghost" data-act="close">Close</button></div><div class="sheet-body"></div></div>`;
    ov.hidden = false; document.body.classList.add("locked");
    const body = $(".sheet-body", ov);
    cleanup = d.mount(body, cfg, (res) => {
      onResult && onResult(res);
      body.insertAdjacentHTML("beforeend", `<div class="drill-actions"><button class="btn" data-act="again">Try again</button><button class="btn primary" data-act="close">Done</button></div>`);
      $("[data-act=again]", body).addEventListener("click", () => { closeDrill(true); openDrill(toolId, cfg, onResult); });
      const btns = $$("[data-act=close]", body); btns[btns.length - 1].addEventListener("click", () => closeDrill());
    });
    $$("[data-act=close]", ov).forEach((b) => b.addEventListener("click", () => closeDrill()));
  }
  function closeDrill(quiet) {
    if (cleanup) cleanup(); cleanup = null;
    const ov = $("#overlay"); ov.hidden = true; ov.innerHTML = ""; document.body.classList.remove("locked");
    if (!quiet) { render(); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#overlay").hidden) closeDrill(); });

  function logPractice(id, res) {
    (S.practice[id] = S.practice[id] || []).push({ score: res.score, max: res.max, date: today(), t: Date.now(), logged: true });
    S.practice[id] = S.practice[id].slice(-100);
    markActive(); save();
  }

  /* Tools, grouped by skill. Each entry is [drill id, quiz bank or null]. */
  const TOOL_GROUPS = [
    ["Observation", [["kims", null], ["changes", null], ["peripheral", null]]],
    ["Memory", [["words", null], ["names", null], ["facenames", null], ["major", null], ["cards", null]]],
    ["Reading people", [["baseline", null], ["faces", null], ["quiz", "emotions"], ["whichhand", null]]],
    ["Psychology", [["quiz", "biases"], ["quiz", "influence"], ["quiz", "cold"]]],
    ["Performance", [["pacing", null]]]
  ];
  const TOOL_LIST = TOOL_GROUPS.reduce((a, g) => a.concat(g[1]), []);
  const toolKey = (t, b) => (b ? "quiz:" + b : t);
  const parseKey = (k) => (k.startsWith("quiz:") ? ["quiz", k.slice(5)] : [k, null]);
  const toolName = (t, b) => (b ? BK[b].title : DR[t].title);
  const toolBlurb = (t, b) => (b ? `${BK[b].items.length} questions in the bank. ${BK[b].prompt}` : DR[t].blurb);
  const optLabel = (d, k) => (d.labels && d.labels[k]) || { count: "Items", seconds: "Time", rounds: "Rounds" }[k] || k;
  const optText = (d, k, v) => (d.fmt && d.fmt[k] ? d.fmt[k](v) : k === "seconds" ? (v >= 60 ? v / 60 + " min" : v + " s") : v);
  const scriptMinutes = () => S.show.effects.reduce((a, e) => a + (+e.mins || 0), 0);
  function toolCfg(t, bank) {
    if (t === "quiz") return { bank, n: 10 };
    const cfg = Object.assign({}, DR[t].defaults);
    if (t === "pacing") { cfg.script = S.show.draft; cfg.onScript = (txt) => { S.show.draft = txt; save(); }; }
    return cfg;
  }
  function startTool(key, overrides) {
    const [t, b] = parseKey(key);
    const cfg = Object.assign(toolCfg(t, b), overrides || {});
    openDrill(t, cfg, (r) => logPractice(key, r));
  }
  const ago = (ts) => { const n = dayNum(today()) - dayNum(ymd(new Date(ts))); return n <= 0 ? "today" : n === 1 ? "yesterday" : n + " days ago"; };
  const lastRun = (key) => { const h = S.practice[key] || []; const x = h[h.length - 1]; return x ? x.t || Date.parse(x.date + "T12:00") : 0; };

  /* ---------------- Pages ---------------- */
  const pages = {};

  /* Home */
  const todayIdx = () => (new Date().getDay() + 6) % 7;
  function todayPanel() {
    const cw = weekBy(currentWeek());
    const st = streaks();
    const counts = activityCounts();
    const d = todayIdx();
    const keys = cw.tools.length ? cw.tools : ["kims"];
    const next = keys.slice().sort((a, b) => lastRun(a) - lastRun(b))[0];
    const [nt, nb] = parseKey(next);
    const parts = cw.test.parts, passedParts = parts.filter((p) => partState(cw, p).passed).length;
    const journaled = S.journal.some((e) => e.date === today());
    const strip = Array.from({ length: 14 }, (_, i) => { const x = new Date(); x.setDate(x.getDate() - 13 + i); const k = ymd(x); return `<span class="sd ${counts[k] ? "on" : ""} ${i === 13 ? "now" : ""}" title="${esc(fmtDate(k, { weekday: "short", day: "numeric", month: "short" }))}${counts[k] ? ": active" : ""}"></span>`; }).join("");
    const lastRunKey = lastRun(next);
    return `
    <section class="today" aria-labelledby="today-h">
      <div class="today-head"><h2 id="today-h">Today</h2><p class="muted">${esc(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }))}. Week ${cw.n}: <a href="#/week/${cw.n}">${esc(cw.title)}</a></p></div>
      <div class="today-grid">
        <div class="tile streak">
          <p class="tile-label">Current streak</p>
          <p class="tile-value">${st.cur} <span>${st.cur === 1 ? "day" : "days"}</span></p>
          <p class="muted small">${st.doneToday ? "Today counts. " : st.cur ? "Do one thing today to keep it going. " : "Practise today to start a streak. "}Best: ${st.best} ${st.best === 1 ? "day" : "days"}.</p>
          <div class="strip" aria-label="Activity over the last 14 days">${strip}</div>
        </div>
        <div class="tile">
          <p class="tile-label">Today's tasks, week ${cw.n}</p>
          <ul class="today-tasks">${cw.tasks.map((t, i) => { const k = `w${cw.n}t${i}`, on = !!(S.tasks[k] || [])[d]; return `<li><button class="check" data-k="${k}" data-d="${d}" aria-pressed="${on}"><span class="box" aria-hidden="true"></span><span>${esc(t)}</span></button></li>`; }).join("")}</ul>
        </div>
        <div class="tile">
          <p class="tile-label">Up next</p>
          <p><strong>${esc(toolName(nt, nb))}</strong><br><span class="muted small">${lastRunKey ? "Last practised " + ago(lastRunKey) + "." : "Not tried yet."}</span></p>
          <button class="btn primary small" data-run-key="${next}">Practise now</button>
          <ul class="today-status">
            <li class="${passedParts === parts.length ? "ok" : ""}"><a href="#/week/${cw.n}/test">${cw.n % 4 === 0 ? "Exam" : "Sunday test"}: ${passedParts} of ${parts.length} ${parts.length === 1 ? "part" : "parts"} passed</a></li>
            <li class="${journaled ? "ok" : ""}"><a href="#/journal">${journaled ? "Journal written today" : "Journal entry tonight"}</a></li>
            ${lastBook() ? `<li class="book"><a href="#/read/${lastBook().id}">Continue ${esc(lastBook().title || "your book")}, page ${lastBook().page}</a></li>` : ""}
          </ul>
        </div>
      </div>
    </section>`;
  }
  function bindToday() {
    $$(".today .check").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.k, d = +b.dataset.d; const arr = S.tasks[k] || [];
      arr[d] = !arr[d]; S.tasks[k] = arr;
      if (arr[d]) markActive(); else if (S.activity[today()]) S.activity[today()]--;
      save();
      $(".today").outerHTML = todayPanel(); bindToday();
      const again = $(`.today .check[data-k="${k}"]`); if (again) again.focus();
    }));
    $$("[data-run-key]").forEach((b) => b.addEventListener("click", () => startTool(b.dataset.runKey)));
  }

  pages.home = () => {
    const cw = weekBy(currentWeek());
    const started = hasStarted();
    const ch = C.challenges[Math.floor(Date.now() / 86400000) % C.challenges.length];
    return `
    ${started ? todayPanel() : ""}
    <section class="hero">
      <div class="hero-copy">
        <h1>Read the Room</h1>
        <p class="hero-lede">Learn to notice what others miss, remember what you see, read people honestly, and perform mentalism, from scratch, in 12 weeks.</p>
        <div class="hero-cta"><a class="btn primary" href="${started ? `#/week/${cw.n}` : "#/start"}">${started ? `Continue week ${cw.n}: ${esc(cw.title)}` : "Start the course"}</a><a class="btn" href="#/tools">Try a practice tool</a></div>
      </div>
      <div class="hero-test" id="hero-test" aria-live="polite"></div>
    </section>

    <section class="block">
      <h2>What you'll learn</h2>
      <div class="skills">${C.skills.map((s) => `<div class="skill"><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p><p class="skill-goal">By week 12: ${esc(s.milestone)}</p></div>`).join("")}</div>
    </section>

    <section class="block">
      <h2>The 12 weeks</h2>
      <div class="months">${C.months.map((m) => `<div class="month"><h3>Month ${m.n}: ${esc(m.title)}</h3><p>${esc(m.blurb)}</p><ol start="${m.weeks[0]}">${m.weeks.map((n) => { const w = weekBy(n); return `<li><a href="#/week/${n}">${esc(w.title)}</a>${weekPassed(w) ? ' <span class="tick">✓</span>' : ""}</li>`; }).join("")}</ol></div>`).join("")}</div>
    </section>

    <section class="block two">
      <div><h2>How it works</h2><p>Every day takes 60 to 90 minutes: a short observation drill, memory training, the week's lesson, real-world practice and a journal entry. Every Sunday there is a test, and every fourth week a bigger exam. Your progress is saved in this browser.</p><p><a href="#/start">Read the ground rules</a></p></div>
      <div class="challenge"><h2>Today's challenge</h2><p>${esc(ch)}</p><p><a href="#/journal">Log it in your journal</a></p></div>
    </section>`;
  };

  function heroTest() {
    const el = $("#hero-test"); if (!el) return;
    const pool = window.DRILL_DATA.objects;
    const set = sample(pool, 9);
    const missing = set[Math.floor(Math.random() * 9)];
    const decoys = sample(pool.filter((o) => !set.includes(o)), 3);
    el.innerHTML = `<p class="ht-title">Ten-second test</p><p class="ht-sub">Look at these nine objects. One will disappear.</p><button class="btn primary" data-act="go">Start the clock</button>`;
    $("[data-act=go]", el).addEventListener("click", () => {
      let t = 10;
      el.innerHTML = `<p class="ht-title"><span class="ht-clock">${t}</span> seconds</p><div class="obj-grid hero-grid">${set.map((o) => `<span class="obj">${o}</span>`).join("")}</div>`;
      const id = setInterval(() => {
        t--; const c = $(".ht-clock", el); if (c) c.textContent = t;
        if (t <= 0) {
          clearInterval(id);
          const rest = shuffle(set.filter((o) => o !== missing));
          const opts = shuffle([missing].concat(decoys));
          el.innerHTML = `<p class="ht-title">Which one is gone?</p><div class="obj-grid hero-grid dim">${rest.map((o) => `<span class="obj">${o}</span>`).join("")}</div><div class="ht-opts">${opts.map((o) => `<button class="obj" data-o="${o}">${o}</button>`).join("")}</div>`;
          $$(".ht-opts button", el).forEach((b) => b.addEventListener("click", () => {
            const ok = b.dataset.o === missing;
            el.innerHTML = `<p class="ht-title">${ok ? "Right." : "It was " + missing + "."}</p><p class="ht-sub">${ok ? "Your eyes are already working. This course trains them to take in twenty objects, a room, a stranger." : "Most people miss it the first time. Observation is a trained habit, and this course trains it."}</p><button class="btn" data-act="again">Try again</button>`;
            $("[data-act=again]", el).addEventListener("click", heroTest);
          }));
        }
      }, 1000);
      pageCleanup = () => clearInterval(id);
    });
  }

  /* Before you begin */
  pages.start = () => `
    <article class="prose">
      <p class="crumb">Orientation</p>
      <h1>Before you begin</h1>
      <p class="lede">This course runs for 12 weeks at 60 to 90 minutes a day. It builds six skills in order: observation and memory first, then reading people, then mentalism performance. You need no prior knowledge.</p>
      <h2>Ground rules</h2>
      <ul class="rules">${C.rules.map((r) => `<li><strong>${esc(r[0])}</strong> ${esc(r[1])}</li>`).join("")}</ul>
      <h2>Your daily routine</h2>
      <div class="table-wrap"><table><thead><tr><th>Block</th><th>Time</th><th>What you do</th></tr></thead><tbody>${C.routine.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>
      <h2>How each week works</h2>
      <p>Every week has a lesson, a short note on what the research really says, links to the best books and videos, a set of daily tasks you tick off, and a Sunday test. Some tests are scored automatically by the practice tools; for others, you or a friend score yourself honestly and enter the number.</p>
      <h2>A note on honesty</h2>
      <p>Patrick Jane is a fictional character. Real people-reading is about being right more often than average, not about certainty. This course flags claims that research doesn't support, such as reliable lie detection from body language. Performers like Suhani Shah and Derren Brown are open that their work is skill and psychology, and so should you be.</p>
      <div class="startbox">
        <label for="startdate">When are you starting?</label>
        <input type="date" id="startdate" value="${S.start || today()}">
        <button class="btn primary" data-act="begin">Begin week 1</button>
      </div>
    </article>`;
  function bindStart() {
    const b = $("[data-act=begin]"); if (!b) return;
    b.addEventListener("click", () => { S.start = $("#startdate").value || today(); save(); location.hash = "#/week/1"; });
  }

  /* Week */
  function toolButton(key) {
    const [t, b] = parseKey(key);
    return `<button class="tool-chip" data-key="${key}">${esc(toolName(t, b))}</button>`;
  }
  pages.week = (n) => {
    const w = weekBy(n); if (!w) return pages.notfound();
    const m = C.months.find((x) => x.n === w.month);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const prev = weekBy(n - 1), next = weekBy(n + 1);
    const passed = weekPassed(w);
    return `
    <article class="prose week">
      <p class="crumb"><a href="#/">Course</a> / Month ${m.n}: ${esc(m.title)} / Week ${n}</p>
      <h1><span class="wk-big">${n}</span>${esc(w.title)}</h1>
      <p class="lede">${esc(w.summary)}</p>
      <div class="week-status"><span>Daily tasks ${weekTaskPct(w)} percent done</span><span class="${passed ? "ok" : ""}">${passed ? "Sunday test passed" : "Sunday test not passed yet"}</span></div>
      ${w.intro ? `<section class="intro-video"><h2>Try this first</h2>${videoHTML(w.intro, w.intro.note)}</section>` : ""}

      ${w.lessons.map((l, i) => `<section id="w${n}-s${i}" tabindex="-1"><h2>${esc(l.h)}</h2>${l.body}</section>`).join("")}

      <aside class="evidence" id="w${n}-evidence" tabindex="-1"><h2>What the research says</h2>${w.evidence}</aside>

      <section><h2>Study this week</h2><ul class="study">${w.study.map((s) => (s.v ? `<li class="study-video">${videoHTML(s)}</li>` : `<li><a href="${s.u}" ${s.u.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>${esc(s.t)}</a></li>`)).join("")}</ul></section>

      ${w.tools.length ? `<section id="w${n}-tools" tabindex="-1"><h2>Practice tools</h2><p>Use these as often as you like. Practice runs don't affect your test.</p><div class="tool-chips">${w.tools.map(toolButton).join("")}</div></section>` : ""}

      <section id="w${n}-tasks" tabindex="-1"><h2>Daily tasks</h2><p>Tick each day you complete a task.</p>
        <div class="tasks">${w.tasks.map((t, i) => { const k = `w${n}t${i}`, arr = S.tasks[k] || []; return `<div class="task"><p>${esc(t)}</p><div class="days" role="group" aria-label="Days completed">${days.map((d, j) => `<button class="day" data-k="${k}" data-d="${j}" aria-pressed="${!!arr[j]}">${d}</button>`).join("")}</div></div>`; }).join("")}</div>
      </section>

      <section class="test" id="w${n}-test" tabindex="-1"><h2>${n === 12 ? "Final exam" : n % 4 === 0 ? "Month " + m.n + " exam" : "Sunday test"}</h2><p>${esc(w.test.intro)}</p>
        ${w.test.parts.map((p) => partHTML(w, p)).join("")}
      </section>

      <nav class="pager">${prev ? `<a href="#/week/${prev.n}">Week ${prev.n}: ${esc(prev.title)}</a>` : `<a href="#/start">Before you begin</a>`}${next ? `<a href="#/week/${next.n}" class="next">Week ${next.n}: ${esc(next.title)}</a>` : `<a href="#/tracker" class="next">See your progress</a>`}</nav>
    </article>`;
  };
  function partHTML(w, p) {
    const st = partState(w, p);
    const tgt = p.beat ? `Target: beat your week ${p.beat.week} score` : typeof p.target === "number" ? `Target: ${p.target}` : "Record your score";
    const status = st.rec ? `<span class="pstat ${st.passed ? "ok" : "bad"}">${st.passed ? "Passed" : "Not yet"}: ${st.rec.score}${st.rec.max ? " out of " + st.rec.max : ""}</span>` : `<span class="pstat">Not taken</span>`;
    const control = p.tool
      ? `<button class="btn primary" data-test="${p.id}" data-week="${w.n}">${st.rec ? "Retake" : "Take this test"}</button>`
      : `<span class="num-entry"><label class="sr" for="in-${w.n}-${p.id}">Your score</label><input id="in-${w.n}-${p.id}" type="number" inputmode="decimal" min="0" step="${p.step || 1}" value="${st.rec ? st.rec.score : ""}"><button class="btn" data-save="${p.id}" data-week="${w.n}">Save</button></span>`;
    return `<div class="part"><div class="part-main"><p class="part-label">${esc(p.label)}</p><p class="part-meta">${tgt}${st.note ? ". " + esc(st.note) : ""}</p></div><div class="part-side">${status}${control}</div></div>`;
  }
  function recordTest(wn, pid, res) {
    S.tests[wn] = S.tests[wn] || {};
    S.tests[wn][pid] = { score: res.score, max: res.max || null, date: today(), t: Date.now(), logged: true };
    markActive(); save();
  }
  function bindWeek(n) {
    const w = weekBy(n); if (!w) return;
    $$(".day").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.k, d = +b.dataset.d; const arr = S.tasks[k] || [];
      arr[d] = !arr[d]; S.tasks[k] = arr;
      if (arr[d]) markActive(); else if (S.activity[today()]) S.activity[today()]--;
      save();
      b.setAttribute("aria-pressed", !!arr[d]);
      $(".week-status span").textContent = `Daily tasks ${weekTaskPct(w)} percent done`;
    }));
    $$(".tool-chip").forEach((b) => b.addEventListener("click", () => startTool(b.dataset.key)));
    $$("[data-test]").forEach((b) => b.addEventListener("click", () => {
      const p = w.test.parts.find((x) => x.id === b.dataset.test);
      const cfg = Object.assign({}, p.config, { target: p.target });
      openDrill(p.tool, cfg, (r) => { recordTest(w.n, p.id, r); renderOutline(); });
    }));
    $$("[data-save]").forEach((b) => b.addEventListener("click", () => {
      const p = w.test.parts.find((x) => x.id === b.dataset.save);
      const inp = $(`#in-${w.n}-${p.id}`); const v = parseFloat(inp.value);
      if (isNaN(v)) { inp.focus(); inp.setAttribute("aria-invalid", "true"); return; }
      recordTest(w.n, p.id, { score: v }); render(); toast("Score saved");
    }));
  }

  /* Tools */
  const toolId = (key) => "tool-" + key.replace(":", "-");
  pages.tools = () => `
    <article class="prose wide">
      <p class="crumb">Practice</p>
      <h1>Practice tools</h1>
      <p class="lede">Every drill from the course, with adjustable difficulty. Practice runs are kept separately from your tests, and your scores over time appear in the <a href="#/tracker">progress tracker</a>.</p>
      ${TOOL_GROUPS.map(([g, list]) => `<h2>${esc(g)}</h2><div class="tool-grid">${list.map(([t, b]) => {
        const key = toolKey(t, b), hist = S.practice[key] || [];
        const best = hist.length ? hist.reduce((x, h) => (h.max && (!x || h.score / h.max > x.score / x.max) ? h : x), null) : null;
        const d = DR[t];
        const opts = d.options ? Object.keys(d.options).map((k) => `<label>${esc(optLabel(d, k))}<select data-opt="${k}">${d.options[k].map((v) => `<option value="${v}" ${v === d.defaults[k] ? "selected" : ""}>${esc(optText(d, k, v))}</option>`).join("")}</select></label>`).join("") : "";
        return `<div class="tool-card" id="${toolId(key)}" tabindex="-1" data-key="${key}"><h3>${esc(toolName(t, b))}</h3><p>${esc(toolBlurb(t, b))}</p>${opts ? `<div class="tool-opts">${opts}</div>` : ""}<div class="tool-foot"><span class="muted">${best ? `Best: ${best.score} of ${best.max}. Runs: ${hist.length}.` : "Not tried yet."}</span><button class="btn primary" data-run>Start</button></div></div>`;
      }).join("")}</div>`).join("")}
    </article>`;
  function bindTools() {
    $$(".tool-card").forEach((card) => $("[data-run]", card).addEventListener("click", () => {
      const o = {}; $$("select", card).forEach((s) => { o[s.dataset.opt] = +s.value; });
      startTool(card.dataset.key, o);
    }));
  }

  /* Library */
  const ol = (q) => "https://openlibrary.org/search?q=" + encodeURIComponent(q);
  pages.library = () => {
    const L = C.library;
    const tiers = { Core: "Core: read during the course", Extra: "Extra: if you want more", Next: "Next: after the 12 weeks" };
    return `
    <article class="prose wide">
      <p class="crumb">Resources</p>
      <h1>Library</h1>
      <p class="lede">The best books, free courses and videos, in the order the course uses them. Book links search Open Library, where many titles can be borrowed free and legally.</p>
      ${readHereHTML()}
      <h2>Books</h2>
      ${Object.keys(tiers).map((tier) => `<h3>${tiers[tier]}</h3><div class="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Skill</th><th>Week</th></tr></thead><tbody>${L.books.filter((b) => b.tier === tier).map((b) => `<tr><td><a href="${b.free || ol(b.t + " " + b.a)}" ${b.free && b.free.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>${esc(b.t)}</a>${b.free ? ' <span class="pill">free</span>' : ""}</td><td>${esc(b.a)}</td><td>${esc(b.skill)}</td><td>${esc(b.week)}</td></tr>`).join("")}</tbody></table></div>`).join("")}
      <h2>Free and legal: textbooks, courses and tests</h2>
      <p>Avoid pirated PDFs of mentalism books. They are often incomplete, and the mentalism community is small and depends on people buying from creators.</p>
      <div class="table-wrap"><table><thead><tr><th>Resource</th><th>Type</th><th>What it covers</th></tr></thead><tbody>${L.free.map((r) => `<tr><td><a href="${r.u}" ${r.u.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>${esc(r.t)}</a></td><td>${esc(r.type)}</td><td>${esc(r.what)}</td></tr>`).join("")}</tbody></table></div>
      <h2>Videos and channels</h2>
      <p>Where there is one definitive video or playlist, the link goes straight to it. Other links open a YouTube search, so you always reach the creator's current official uploads. Skip channels promising "dark psychology" or instant lie detection.</p>
      <div class="table-wrap"><table><thead><tr><th>Channel or video</th><th>What you learn</th><th>Week</th></tr></thead><tbody>${L.videos.map((v) => `<tr><td><a href="${v.u}" target="_blank" rel="noopener">${esc(v.t)}</a></td><td>${esc(v.what)}</td><td>${esc(v.week)}</td></tr>`).join("")}</tbody></table></div>
    </article>`;
  };

  /* Tracker */
  function seriesFor(key) {
    const pts = [];
    const at = (r) => r.t || Date.parse(r.date + "T12:00");
    (S.practice[key] || []).forEach((h) => { if (h.max) pts.push({ t: at(h), v: Math.round((h.score / h.max) * 100), label: fmtDate(h.date), detail: `${h.score} of ${h.max}, practice` }); });
    C.weeks.forEach((w) => w.test.parts.forEach((p) => {
      if (!p.tool || (p.tool === "quiz" ? "quiz:" + p.config.bank : p.tool) !== key) return;
      const r = (S.tests[w.n] || {})[p.id];
      if (r && r.max) pts.push({ t: at(r), v: Math.round((r.score / r.max) * 100), label: fmtDate(r.date), detail: `${r.score} of ${r.max}, week ${w.n} test` });
    }));
    return pts.sort((a, b) => a.t - b.t);
  }
  const COMPARE = [
    ["Kim's Game", [[1, "kims15"], [4, "kims20"], [12, "kimsF"]]],
    ["Word list", [[2, "words30"], [4, "words40"], [12, "wordsF"]]],
    ["Names", [[2, "names10"], [12, "namesF"]]],
    ["Mind in the Eyes", [[6, "eyes", 36], [12, "eyesF", 36]]]
  ];
  function compareRows() {
    return COMPARE.map(([label, parts]) => {
      const recs = parts.map(([w, id, fixedMax]) => { const r = (S.tests[w] || {})[id]; if (!r) return null; const max = r.max || fixedMax; if (!max || r.score > max) return null; return { w, score: r.score, max, t: r.t || Date.parse(r.date + "T12:00") }; }).filter(Boolean).sort((a, b) => a.t - b.t);
      if (recs.length < 2) return null;
      const f = recs[0], l = recs[recs.length - 1];
      const pt = (r) => ({ v: Math.round((r.score / r.max) * 100), text: `${r.score} of ${r.max} (week ${r.w})` });
      return { label, first: pt(f), last: pt(l) };
    }).filter(Boolean);
  }
  /* Best run of a drill: by percentage, or by raw score when bigger lists are the achievement (word lists). */
  function bestFor(key, byRaw) {
    const all = (S.practice[key] || []).slice();
    C.weeks.forEach((w) => w.test.parts.forEach((p) => { if (p.tool === key) { const r = (S.tests[w.n] || {})[p.id]; if (r && r.max) all.push(r); } }));
    const better = (h, x) => (byRaw ? h.score > x.score || (h.score === x.score && h.score / h.max > x.score / x.max) : h.score / h.max > x.score / x.max || (h.score / h.max === x.score / x.max && h.score > x.score));
    return all.filter((h) => h.max).reduce((x, h) => (!x || better(h, x) ? h : x), null);
  }
  function cardData() {
    const pc = passedCount(), st = streaks();
    const stats = [{ value: `${pc} of 12`, label: "weeks passed" }];
    const k = bestFor("kims"), wd = bestFor("words", true), nm = bestFor("names") || bestFor("facenames");
    if (k) stats.push({ value: `${k.score} of ${k.max}`, label: "best Kim's Game" });
    if (wd) stats.push({ value: String(wd.score), label: "words remembered in order" });
    if (nm && stats.length < 4) stats.push({ value: `${nm.score} of ${nm.max}`, label: "names remembered" });
    if (stats.length < 4) stats.push({ value: `${st.best} ${st.best === 1 ? "day" : "days"}`, label: "best practice streak" });
    if (stats.length < 4) stats.push({ value: String(st.total), label: "days practised" });
    const dates = []; Object.values(S.tests).forEach((w) => Object.values(w).forEach((r) => dates.push(r.date)));
    const last = dates.sort().pop();
    return { name: S.name.trim(), certificate: pc === 12, date: last ? fmtDate(last, { day: "numeric", month: "long", year: "numeric" }) : "", subtitle: `Week ${currentWeek()} of 12 in a course on observation, memory and reading people`, stats, url: location.host || "read-the-room-zeta.vercel.app" };
  }

  pages.tracker = () => {
    const pc = passedCount(), st = streaks();
    const multiples = TOOL_LIST.map(([t, b]) => ({ key: toolKey(t, b), name: toolName(t, b) })).map((x) => Object.assign(x, { pts: seriesFor(x.key) })).filter((x) => x.pts.length >= 2);
    const rows = compareRows();
    return `
    <article class="prose wide">
      <p class="crumb">Progress</p>
      <h1>Progress tracker</h1>
      <p class="lede">${pc} of 12 weeks passed${S.start ? `, started ${esc(fmtDate(S.start, { day: "numeric", month: "long", year: "numeric" }))}` : ""}. Current streak ${st.cur} ${st.cur === 1 ? "day" : "days"}, best ${st.best}.</p>
      <div class="meter" role="progressbar" aria-label="Weeks passed" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${pc}"><span style="width:${(pc / 12) * 100}%"></span></div>

      <h2>Your practice</h2>
      ${CH.calendar(activityCounts(), 12, today())}
      ${rows.length ? CH.compare(rows) : `<p class="muted">Before-and-after comparisons appear once you have taken the same skill's test twice, for example Kim's Game in week 1 and again in week 4 or 12.</p>`}
      <h3>Scores over time</h3>
      ${multiples.length ? `<p class="muted">Each chart shows one drill as a percentage of the maximum, so harder settings and easier ones share a scale. Practice runs and tests are both included.</p><div class="chart-grid">${multiples.map((x) => CH.line(x.name, x.pts)).join("")}</div>` : `<p class="muted">Run any drill twice and its chart appears here.</p>`}

      <h2>Tests</h2>
      <div class="table-wrap"><table class="tracker"><thead><tr><th>Week</th><th>Test</th><th>Target</th><th>Your score</th><th>Result</th></tr></thead><tbody>
      ${C.weeks.map((w) => w.test.parts.map((p, i) => { const st2 = partState(w, p); return `<tr class="${i === 0 ? "first" : ""}">${i === 0 ? `<td rowspan="${w.test.parts.length}"><a href="#/week/${w.n}/test">${w.n}. ${esc(w.title)}</a></td>` : ""}<td>${esc(p.label)}</td><td>${p.beat ? "Beat week " + p.beat.week : typeof p.target === "number" ? p.target : "Record"}</td><td>${st2.rec ? st2.rec.score + (st2.rec.max ? " / " + st2.rec.max : "") : "<span class=muted>none</span>"}</td><td>${st2.rec ? `<span class="pstat ${st2.passed ? "ok" : "bad"}">${st2.passed ? "Passed" : "Not yet"}</span>` : ""}</td></tr>`; }).join("")).join("")}
      </tbody></table></div>

      <h2>${pc === 12 ? "Your certificate" : "Share your progress"}</h2>
      <p>${pc === 12 ? "You passed every week. Create your certificate of completion." : "Make an image of your results to share or keep. It is created in your browser; nothing is uploaded."}</p>
      <div class="share-row"><label>Name on the image (optional)<input type="text" id="card-name" maxlength="40" value="${esc(S.name)}" autocomplete="name"></label><button class="btn primary" data-act="card">${pc === 12 ? "Create certificate" : "Create image"}</button></div>
      <div class="card-out" hidden><canvas width="1200" height="630" aria-hidden="true"></canvas><img alt=""><div class="drill-actions left"><button class="btn primary" data-act="card-dl">Download image</button><button class="btn" data-act="card-share" hidden>Share</button></div></div>

      <h2>Your data</h2>
      <p>Everything is saved in this browser only${memoryOnly ? ". Storage is unavailable here, so progress will be lost when you close the page; export it to keep a copy" : ""}. Export a backup to move to another device.</p>
      <div class="drill-actions left"><button class="btn" data-act="export">Export backup</button><label class="btn">Import backup<input type="file" accept="application/json" hidden data-act="import"></label><button class="btn ghost danger" data-act="reset">Reset all progress</button></div>
    </article>`;
  };
  function download(name, blobOrText, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], { type }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function bindTracker() {
    const ex = $("[data-act=export]"); if (!ex) return;
    CH.bind(view);
    ex.addEventListener("click", () => download(`read-the-room-backup-${today()}.json`, JSON.stringify(S, null, 2), "application/json"));
    $("[data-act=import]").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { const d = JSON.parse(t); if (!d || d.v !== 1) throw 0; S = normalise(d); save(); applyTheme(); render(); toast("Backup imported"); } catch (_) { toast("That file isn't a Read the Room backup"); } });
    });
    $("[data-act=reset]").addEventListener("click", () => { if (confirm("Delete all progress, test scores and journal entries? This can't be undone.")) { S = blank(); save(); applyTheme(); render(); toast("Progress reset"); } });

    let blob = null;
    const out = $(".card-out"), img = $("img", out), canvas = $("canvas", out), shareBtn = $("[data-act=card-share]");
    $("#card-name").addEventListener("change", (e) => { S.name = e.target.value.trim().slice(0, 40); save(); });
    $("[data-act=card]").addEventListener("click", async () => {
      S.name = $("#card-name").value.trim().slice(0, 40); save();
      const d = cardData();
      await window.CARD.draw(canvas, d);
      blob = await window.CARD.toBlob(canvas);
      if (img.src) URL.revokeObjectURL(img.src);
      img.src = URL.createObjectURL(blob);
      img.alt = d.certificate ? `Certificate of completion${d.name ? " for " + d.name : ""}` : `Progress card: ${d.stats.map((s) => s.value + " " + s.label).join(", ")}`;
      out.hidden = false;
      const file = new File([blob], "read-the-room.png", { type: "image/png" });
      shareBtn.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
      $("[data-act=card-dl]").focus();
    });
    $("[data-act=card-dl]").addEventListener("click", () => { if (blob) download(cardData().certificate ? "read-the-room-certificate.png" : "read-the-room-progress.png", blob); });
    shareBtn.addEventListener("click", async () => {
      if (!blob) return;
      try { await navigator.share({ files: [new File([blob], "read-the-room.png", { type: "image/png" })], title: "Read the Room", text: "My progress on Read the Room, a free course in observation, memory and mentalism." }); }
      catch (e) { if (e && e.name !== "AbortError") toast("Sharing isn't available here. Download the image instead."); }
    });
  }

  /* Journal */
  pages.journal = () => {
    const ch = C.challenges[Math.floor(Date.now() / 86400000) % C.challenges.length];
    const entries = S.journal.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    return `
    <article class="prose">
      <p class="crumb">Daily habit</p>
      <h1>Journal</h1>
      <p class="lede">Ten minutes each night. This is the habit that turns practice into skill.</p>
      <p class="challenge-line">Today's challenge: ${esc(ch)}</p>
      <form class="journal-form" novalidate>
        <label>Date<input type="date" name="date" value="${today()}"></label>
        <label>Three things I noticed<textarea name="noticed" rows="3"></textarea></label>
        <label>One guess I made about someone<textarea name="guess" rows="2"></textarea></label>
        <fieldset><legend>Was it right?</legend><label class="inline"><input type="radio" name="right" value="yes"> Yes</label><label class="inline"><input type="radio" name="right" value="no"> No</label><label class="inline"><input type="radio" name="right" value="unknown" checked> Couldn't check</label></fieldset>
        <label>One lesson<textarea name="lesson" rows="2"></textarea></label>
        <div class="drill-actions left"><button class="btn primary" type="submit">Save entry</button>${entries.length ? `<button class="btn" type="button" data-act="jexport">Export journal</button>` : ""}</div>
      </form>
      <h2>${entries.length ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"}` : "No entries yet"}</h2>
      ${entries.length ? "" : "<p>Your first entry will appear here. Start tonight.</p>"}
      ${guessStats(entries)}
      <div class="entries">${entries.map((e) => `<div class="entry"><div class="entry-head"><p>${esc(fmtDate(e.date, { weekday: "long", day: "numeric", month: "long" }))}</p><button class="btn ghost small" data-del="${e.id}">Delete</button></div>${e.noticed ? `<p><strong>Noticed:</strong> ${esc(e.noticed)}</p>` : ""}${e.guess ? `<p><strong>Guess:</strong> ${esc(e.guess)} <span class="pstat ${e.right === "yes" ? "ok" : e.right === "no" ? "bad" : ""}">${e.right === "yes" ? "Right" : e.right === "no" ? "Wrong" : "Unchecked"}</span></p>` : ""}${e.lesson ? `<p><strong>Lesson:</strong> ${esc(e.lesson)}</p>` : ""}</div>`).join("")}</div>
    </article>`;
  };
  function guessStats(entries) {
    const checked = entries.filter((e) => e.guess && e.right !== "unknown");
    if (checked.length < 3) return "";
    const r = checked.filter((e) => e.right === "yes").length;
    return `<p class="muted">Your checked guesses: ${r} right out of ${checked.length} (${Math.round((r / checked.length) * 100)} percent).</p>`;
  }
  function bindJournal() {
    const f = $(".journal-form"); if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(f);
      const entry = { id: Date.now().toString(36), date: d.get("date") || today(), saved: today(), logged: true, noticed: d.get("noticed").trim(), guess: d.get("guess").trim(), right: d.get("right"), lesson: d.get("lesson").trim() };
      if (!entry.noticed && !entry.guess && !entry.lesson) { f.querySelector("textarea").focus(); toast("Write at least one line first"); return; }
      S.journal.push(entry); markActive(); save(); render(); toast("Entry saved");
    });
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => { if (confirm("Delete this entry?")) { S.journal = S.journal.filter((e) => e.id !== b.dataset.del); save(); render(); } }));
    const jx = $("[data-act=jexport]");
    if (jx) jx.addEventListener("click", () => {
      const txt = S.journal.slice().sort((a, b) => (a.date > b.date ? 1 : -1)).map((e) => `${e.date}\nNoticed: ${e.noticed}\nGuess: ${e.guess} (${e.right})\nLesson: ${e.lesson}\n`).join("\n");
      download(`read-the-room-journal-${today()}.txt`, txt, "text/plain");
    });
  }

  /* ---------------- Performance mode ---------------- */
  const PERF_TABS = [["script", "Script builder"], ["prompter", "Teleprompter"], ["timer", "Show timer"], ["readings", "Reading tracker"]];
  const FIELDS = [["hook", "Hook", "One line that makes people curious."], ["premise", "Premise", "What you will attempt, stated clearly."], ["process", "Process", "Their free choices. Slow down here."], ["climax", "Climax", "The reveal. Pause before it."], ["applause", "Applause cue", "A clear end: a smile, a step back, thank you."], ["out", "Out (not read aloud)", "What you do if it misses."]];
  const STARTERS = [
    { name: "The 1089 prediction", mins: 2, hook: "Before we start, I've sealed a prediction in this envelope. Nobody touches it.", out: "If the total isn't 1089, check their subtraction together, laughing: \"Let's make sure the calculator is on my side.\"" },
    { name: "The psychological guess", mins: 2, hook: "I want to try something that doesn't always work.", out: "If I miss, say I was reading their second choice and ask how close I was." },
    { name: "The memory demonstration", mins: 4, hook: "Call out any objects you like, and I'll try to remember every one of them.", out: "If I blank on one, skip it, finish the rest, and come back to it at the end." }
  ];
  const TECHS = [["obs", "Observation (warm reading)"], ["barnum", "Barnum statement"], ["rainbow", "Rainbow ruse"], ["fishing", "Fishing question"], ["shotgun", "Shotgunning"], ["force", "Psychological force or guess"], ["other", "Other"]];
  const techName = (k) => (TECHS.find((t) => t[0] === k) || [k, k])[1];

  pages.perform = (tab) => `
    <article class="prose wide perform">
      <p class="crumb">Weeks 9 to 12</p>
      <h1>Performance mode</h1>
      <p class="lede">Build your script, rehearse with a teleprompter, time the whole show, and keep an honest record of your readings.</p>
      <nav class="tabs" aria-label="Performance mode">${PERF_TABS.map(([k, l]) => `<a href="#/perform/${k}" class="tab${k === tab ? " on" : ""}"${k === tab ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      ${{ script: perfScript, prompter: perfPrompter, timer: perfTimer, readings: perfReadings }[tab]()}
    </article>`;

  function perfScript() {
    const ef = S.show.effects;
    return `<p>Each effect follows the shape from <a href="#/week/10">week 10</a>: hook, premise, process, climax and applause cue, plus an out in case it misses. Everything saves as you type.</p>
      <div class="effects">${ef.map((e, i) => `<section class="effect" data-i="${i}" aria-label="Effect ${i + 1}">
        <div class="effect-head"><span class="wk-n">${i + 1}</span><input type="text" class="effect-name" data-f="name" value="${esc(e.name || "")}" placeholder="Effect name" aria-label="Effect ${i + 1} name"><label class="mins">Minutes<input type="number" min="0" step="0.5" data-f="mins" value="${esc(e.mins || "")}"></label>
          <span class="effect-tools"><button class="btn ghost small" data-move="-1" ${i ? "" : "disabled"} aria-label="Move effect ${i + 1} up">↑</button><button class="btn ghost small" data-move="1" ${i < ef.length - 1 ? "" : "disabled"} aria-label="Move effect ${i + 1} down">↓</button><button class="btn ghost small danger" data-del aria-label="Delete effect ${i + 1}">Delete</button></span></div>
        <div class="effect-fields">${FIELDS.map(([k, l, hint]) => `<label>${l}<textarea rows="2" data-f="${k}" placeholder="${esc(hint)}">${esc(e[k] || "")}</textarea></label>`).join("")}</div>
      </section>`).join("")}</div>
      ${ef.length ? "" : `<p class="muted">No effects yet. Start with the three from week 9, or add your own.</p>`}
      <div class="drill-actions left"><button class="btn" data-act="add">Add an effect</button>${ef.length ? "" : `<button class="btn" data-act="starter">Start with the week 9 effects</button>`}<button class="btn primary" data-act="compile" ${ef.length ? "" : "disabled"}>Send to teleprompter</button></div>
      <p class="muted planned">Planned length: ${fmtTime(Math.round(scriptMinutes() * 60))}.</p>`;
  }
  function compileScript() {
    return S.show.effects.map((e) => [e.name ? e.name.toUpperCase() : "", e.hook, e.premise, e.process, e.climax, e.applause].map((x) => (x || "").trim()).filter(Boolean).join("\n\n")).filter(Boolean).join("\n\n*   *   *\n\n");
  }
  function bindScript() {
    let t = null;
    const later = () => { clearTimeout(t); t = setTimeout(save, 300); };
    $$(".effect").forEach((sec) => {
      const i = +sec.dataset.i, e = S.show.effects[i];
      $$("[data-f]", sec).forEach((inp) => inp.addEventListener("input", () => {
        e[inp.dataset.f] = inp.dataset.f === "mins" ? parseFloat(inp.value) || 0 : inp.value; later();
        if (inp.dataset.f === "mins") $(".planned").textContent = `Planned length: ${fmtTime(Math.round(scriptMinutes() * 60))}.`;
      }));
      $$("[data-move]", sec).forEach((b) => b.addEventListener("click", () => {
        const j = i + +b.dataset.move; const a = S.show.effects; [a[i], a[j]] = [a[j], a[i]]; save(); render();
        const moved = $(`.effect[data-i="${j}"] [data-move="${b.dataset.move}"]`); if (moved && !moved.disabled) moved.focus();
      }));
      $("[data-del]", sec).addEventListener("click", () => { if (confirm(`Delete "${e.name || "this effect"}"?`)) { S.show.effects.splice(i, 1); save(); render(); } });
    });
    pageCleanup = () => { clearTimeout(t); save(); };
    const add = $("[data-act=add]"); if (!add) return;
    add.addEventListener("click", () => { S.show.effects.push({ name: "", mins: 2 }); save(); render(); const n = $$(".effect-name"); n[n.length - 1].focus(); });
    const st = $("[data-act=starter]"); if (st) st.addEventListener("click", () => { S.show.effects = STARTERS.map((x) => Object.assign({}, x)); save(); render(); });
    $("[data-act=compile]").addEventListener("click", () => {
      const txt = compileScript();
      if (!txt) { toast("Write at least one line first"); return; }
      if (S.show.draft.trim() && S.show.draft !== txt && !confirm("Replace the current teleprompter text with this script?")) return;
      S.show.draft = txt; save(); location.hash = "#/perform/prompter";
    });
  }

  function perfPrompter() {
    const p = S.show.prompter, w = wordsIn(S.show.draft);
    return `<p>Read your script from a screen that scrolls at your pace. Put it on a phone or laptop just below the camera when you rehearse on video.</p>
      <label class="drill-msg" for="pr-text">Script</label><textarea id="pr-text" rows="10" placeholder="Paste your script here, or build it in the script builder.">${esc(S.show.draft)}</textarea>
      <p class="muted pr-est">${w ? `${w} words, about ${fmtTime(Math.round((w / 130) * 60))} at a stage pace of 130 words a minute.` : "No script yet."}</p>
      <div class="pr-controls">
        <label>Scroll speed <output id="pr-speed-o">${p.speed}</output><input type="range" id="pr-speed" min="10" max="150" step="5" value="${p.speed}"></label>
        <label>Text size <output id="pr-size-o">${p.size}</output><input type="range" id="pr-size" min="28" max="80" step="2" value="${p.size}"></label>
        <label class="inline"><input type="checkbox" id="pr-mirror" ${p.mirror ? "checked" : ""}> Mirror the text, for a glass teleprompter</label>
      </div>
      <div class="drill-actions left"><button class="btn primary" data-act="roll">Start teleprompter</button><button class="btn" data-act="pace">Time a run with the pacing timer</button></div>
      <p class="muted">While it rolls: space pauses, the up and down arrows change speed, Esc exits.</p>`;
  }
  function bindPrompter() {
    const ta = $("#pr-text"); if (!ta) return;
    const p = S.show.prompter;
    let t = null;
    ta.addEventListener("input", () => { S.show.draft = ta.value; clearTimeout(t); t = setTimeout(save, 300); const w = wordsIn(ta.value); $(".pr-est").textContent = w ? `${w} words, about ${fmtTime(Math.round((w / 130) * 60))} at a stage pace of 130 words a minute.` : "No script yet."; });
    pageCleanup = () => { clearTimeout(t); save(); };
    $("#pr-speed").addEventListener("input", (e) => { p.speed = +e.target.value; $("#pr-speed-o").textContent = p.speed; save(); });
    $("#pr-size").addEventListener("input", (e) => { p.size = +e.target.value; $("#pr-size-o").textContent = p.size; save(); });
    $("#pr-mirror").addEventListener("change", (e) => { p.mirror = e.target.checked; save(); });
    $("[data-act=roll]").addEventListener("click", () => { if (!S.show.draft.trim()) { ta.focus(); toast("Add your script first"); return; } rollPrompter(); });
    $("[data-act=pace]").addEventListener("click", () => startTool("pacing", { minutes: scriptMinutes() ? Math.max(1, Math.round(scriptMinutes())) : 2 }));
  }
  async function keepAwake() { try { return navigator.wakeLock ? await navigator.wakeLock.request("screen") : null; } catch (e) { return null; } }
  function rollPrompter() {
    const p = S.show.prompter, back = document.activeElement;
    const el = document.createElement("div");
    el.className = "prompter"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Teleprompter");
    el.innerHTML = `<div class="pr-guide" aria-hidden="true"></div><div class="pr-text${p.mirror ? " mirror" : ""}" style="font-size:${p.size}px"></div><div class="pr-count" aria-live="assertive">3</div>
      <div class="pr-bar"><button class="btn" data-pr="slower" aria-label="Slower">−</button><button class="btn primary" data-pr="toggle">Pause</button><button class="btn" data-pr="faster" aria-label="Faster">+</button><span class="pr-speed">${p.speed}</span><button class="btn ghost" data-pr="exit">Exit</button></div>`;
    $(".pr-text", el).textContent = S.show.draft;
    document.body.appendChild(el); document.body.classList.add("locked");
    const txt = $(".pr-text", el), toggle = $("[data-pr=toggle]", el), cnt = $(".pr-count", el);
    let y = 0, playing = false, last = 0, raf = 0, lock = null, timers = [];
    keepAwake().then((l) => { lock = l; });
    const paint = () => { txt.style.transform = `translateY(${-y}px)${p.mirror ? " scaleX(-1)" : ""}`; };
    const step = (ts) => {
      if (playing) {
        y += (p.speed * (ts - (last || ts))) / 1000;
        const maxY = txt.scrollHeight - window.innerHeight * 0.3;
        if (y >= maxY) { y = maxY; setPlaying(false); toggle.textContent = "Restart"; }
        paint();
      }
      last = ts; raf = requestAnimationFrame(step);
    };
    const setPlaying = (v) => { playing = v; toggle.textContent = v ? "Pause" : "Play"; };
    const speed = (d) => { p.speed = Math.max(10, Math.min(150, p.speed + d)); $(".pr-speed", el).textContent = p.speed; save(); };
    const prevCleanup = pageCleanup;
    const exit = () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); document.removeEventListener("keydown", keys, true); if (lock) lock.release().catch(() => {}); el.remove(); document.body.classList.remove("locked"); pageCleanup = prevCleanup; if (back && document.contains(back)) back.focus(); };
    const keys = (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); exit(); }
      else if (e.key === " " && e.target.tagName !== "BUTTON") { e.preventDefault(); toggle.click(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); speed(5); }
      else if (e.key === "ArrowDown") { e.preventDefault(); speed(-5); }
    };
    document.addEventListener("keydown", keys, true);
    toggle.addEventListener("click", () => { if (toggle.textContent === "Restart") { y = 0; paint(); } setPlaying(!playing); });
    $("[data-pr=slower]", el).addEventListener("click", () => speed(-5));
    $("[data-pr=faster]", el).addEventListener("click", () => speed(5));
    $("[data-pr=exit]", el).addEventListener("click", exit);
    paint(); toggle.focus();
    [3, 2, 1].forEach((n, i) => timers.push(setTimeout(() => { cnt.textContent = n; }, i * 800)));
    timers.push(setTimeout(() => { cnt.remove(); setPlaying(true); }, 2400));
    raf = requestAnimationFrame(step);
    pageCleanup = () => { exit(); if (prevCleanup) prevCleanup(); };
  }

  function showSegments() {
    return S.show.effects.length ? S.show.effects.map((e) => ({ name: e.name || "Untitled effect", plan: Math.round((+e.mins || 0) * 60) })) : [{ name: "Show", plan: Math.round((+S.show.target || 10) * 60) }];
  }
  function perfTimer() {
    const segs = showSegments(), total = segs.reduce((a, s) => a + s.plan, 0);
    const runs = S.show.runs.slice().reverse().slice(0, 10);
    return `<p>Time a full run of the show, effect by effect. ${S.show.effects.length ? "The effects come from your script builder." : `There are no effects in your <a href="#/perform/script">script builder</a> yet, so this times the show as one block.`}</p>
      ${S.show.effects.length ? "" : `<label class="st-target">Target length in minutes <input type="number" id="st-target" min="1" step="1" value="${esc(S.show.target)}"></label>`}
      <div class="show-timer">
        <p class="st-total" aria-live="off">0:00</p><p class="muted">Planned ${fmtTime(total)}</p>
        <ol class="st-segs">${segs.map((s, i) => `<li data-i="${i}"><span class="st-name">${esc(s.name)}</span><span class="st-plan">${s.plan ? fmtTime(s.plan) : "no plan"}</span><span class="st-act">0:00</span></li>`).join("")}</ol>
        <div class="drill-actions left"><button class="btn primary" data-act="st-start">Start the show</button><button class="btn" data-act="st-next" disabled>Next effect</button><button class="btn" data-act="st-finish" disabled>Finish</button></div>
      </div>
      <h2>Past runs</h2>
      ${runs.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Length</th><th>Planned</th><th>Difference</th><th>Effects</th></tr></thead><tbody>${runs.map((r) => { const d = r.total - r.planned; return `<tr><td>${esc(fmtDate(r.date))}</td><td>${fmtTime(r.total)}</td><td>${fmtTime(r.planned)}</td><td>${r.planned ? (d >= 0 ? "+" : "−") + fmtTime(Math.abs(d)) : "–"}</td><td>${r.segs.filter((s) => s.done !== false).map((s) => `${esc(s.name)} ${fmtTime(s.act)}`).join(", ")}${r.segs.some((s) => s.done === false) ? " (stopped early)" : ""}</td></tr>`; }).join("")}</tbody></table></div>` : `<p class="muted">Your runs will appear here.</p>`}`;
  }
  function bindTimer() {
    const startB = $("[data-act=st-start]"); if (!startB) return;
    const tgt = $("#st-target");
    if (tgt) tgt.addEventListener("change", () => { S.show.target = Math.max(1, parseFloat(tgt.value) || 10); save(); render(); });
    const segs = showSegments();
    const nextB = $("[data-act=st-next]"), finB = $("[data-act=st-finish]");
    let id = null, lock = null, t0 = 0, segStart = 0, cur = 0;
    const acts = segs.map(() => 0);
    const li = (i) => $(`.st-segs li[data-i="${i}"]`);
    const tick = () => {
      const now = Date.now(), tot = Math.floor((now - t0) / 1000), seg = Math.floor((now - segStart) / 1000);
      $(".st-total").textContent = fmtTime(tot);
      const row = li(cur); $(".st-act", row).textContent = fmtTime(seg);
      row.classList.toggle("over", segs[cur].plan > 0 && seg > segs[cur].plan * 1.1);
    };
    const close = () => { acts[cur] = Math.round((Date.now() - segStart) / 1000); const row = li(cur); row.classList.remove("on"); row.classList.add("done"); $(".st-act", row).textContent = fmtTime(acts[cur]); };
    startB.addEventListener("click", async () => {
      t0 = segStart = Date.now(); cur = 0; li(0).classList.add("on");
      startB.disabled = true; finB.disabled = false; nextB.disabled = segs.length < 2; if (tgt) tgt.disabled = true;
      id = setInterval(tick, 250); tick(); nextB.disabled ? finB.focus() : nextB.focus();
      lock = await keepAwake();
    });
    nextB.addEventListener("click", () => { close(); cur++; segStart = Date.now(); li(cur).classList.add("on"); if (cur === segs.length - 1) { nextB.disabled = true; finB.focus(); } });
    finB.addEventListener("click", () => {
      close(); clearInterval(id); id = null; if (lock) lock.release().catch(() => {});
      const total = Math.round((Date.now() - t0) / 1000);
      S.show.runs.push({ date: today(), t: Date.now(), total, planned: segs.reduce((a, s) => a + s.plan, 0), segs: segs.map((s, i) => ({ name: s.name, plan: s.plan, act: acts[i], done: i <= cur })) });
      S.show.runs = S.show.runs.slice(-30); markActive(); save(); render(); toast("Run saved");
    });
    pageCleanup = () => { if (id) clearInterval(id); if (lock) lock.release().catch(() => {}); };
  }

  function perfReadings() {
    const d = S.readingDraft;
    const all = S.readings.reduce((a, r) => a.concat(r.log), []);
    const rate = (log) => (log.length ? Math.round((log.reduce((a, x) => a + (x.out === "hit" ? 1 : x.out === "partial" ? 0.5 : 0), 0) / log.length) * 100) : null);
    const specific = all.filter((x) => x.tech !== "barnum" && x.tech !== "rainbow");
    const byTech = TECHS.map(([k, l]) => ({ l, log: all.filter((x) => x.tech === k) })).filter((x) => x.log.length);
    return `<p>Log every statement you make in a practice reading and whether it landed. Be strict: a hit is something they confirmed without you adjusting it. A partial hit needed reshaping.</p>
      <div class="reading-log">
        <fieldset class="techs"><legend>What kind of statement?</legend>${TECHS.map(([k, l], i) => `<label class="chip"><input type="radio" name="tech" value="${k}" ${i === 0 ? "checked" : ""}><span>${l}</span></label>`).join("")}</fieldset>
        <div class="drill-actions left split"><button class="btn primary" data-out="hit">Hit</button><button class="btn" data-out="partial">Partly</button><button class="btn" data-out="miss">Miss</button></div>
        <p class="muted">This session: ${d.log.length ? `${d.log.length} ${d.log.length === 1 ? "statement" : "statements"}, ${rate(d.log)} percent landed.` : "nothing logged yet."}</p>
        ${d.log.length ? `<ol class="rd-list">${d.log.slice(-8).map((x) => `<li><span class="pstat ${x.out === "hit" ? "ok" : x.out === "miss" ? "bad" : ""}">${x.out === "hit" ? "Hit" : x.out === "miss" ? "Miss" : "Partly"}</span> ${esc(techName(x.tech))}</li>`).join("")}</ol>` : ""}
        <div class="share-row"><label>Who it was for (optional, a nickname is enough)<input type="text" id="rd-who" maxlength="40" value="${esc(d.who)}"></label></div>
        <div class="drill-actions left"><button class="btn" data-act="rd-undo" ${d.log.length ? "" : "disabled"}>Undo last</button><button class="btn primary" data-act="rd-save" ${d.log.length ? "" : "disabled"}>Save session</button><button class="btn ghost" data-act="rd-clear" ${d.log.length ? "" : "disabled"}>Discard</button></div>
      </div>
      <h2>Your record</h2>
      ${all.length ? `<p><strong>${rate(specific) === null ? "No specific statements yet" : `Specific statements landed ${rate(specific)} percent of the time`}</strong>${specific.length ? ` (${specific.length} logged)` : ""}. Overall, including Barnum statements and rainbow ruses: ${rate(all)} percent of ${all.length}.</p>
        <p class="muted">Barnum statements and rainbow ruses are built to fit almost anyone, so their hits say nothing about your reading skill. The specific rate is the honest measure.</p>
        <div class="table-wrap"><table><thead><tr><th>Statement type</th><th>Logged</th><th>Landed</th></tr></thead><tbody>${byTech.map((x) => `<tr><td>${esc(x.l)}</td><td>${x.log.length}</td><td>${rate(x.log)} percent</td></tr>`).join("")}</tbody></table></div>
        <h3>Sessions</h3><ul class="rd-sessions">${S.readings.slice().reverse().map((r) => `<li><span>${esc(fmtDate(r.date))}${r.who ? ", " + esc(r.who) : ""}: ${r.log.length} statements, ${rate(r.log)} percent landed</span><button class="btn ghost small" data-rdel="${r.id}">Delete</button></li>`).join("")}</ul>`
        : `<p class="muted">Saved sessions build up your record here.</p>`}`;
  }
  function bindReadings() {
    const d = S.readingDraft;
    $$("[data-out]").forEach((b) => b.addEventListener("click", () => {
      const tech = ($("input[name=tech]:checked") || {}).value || "other";
      d.log.push({ tech, out: b.dataset.out }); save(); render();
      const r = $(`input[name=tech][value="${tech}"]`); if (r) r.checked = true;
      const same = $(`[data-out="${b.dataset.out}"]`); if (same) same.focus();
    }));
    const who = $("#rd-who"); if (who) who.addEventListener("input", () => { d.who = who.value; save(); });
    const on = (a, f) => { const b = $(`[data-act=${a}]`); if (b) b.addEventListener("click", f); };
    on("rd-undo", () => { d.log.pop(); save(); render(); });
    on("rd-clear", () => { if (confirm("Discard this session?")) { S.readingDraft = { who: "", log: [] }; save(); render(); } });
    on("rd-save", () => { S.readings.push({ id: Date.now().toString(36), date: today(), who: d.who.trim(), log: d.log.slice() }); S.readingDraft = { who: "", log: [] }; markActive(); save(); render(); toast("Session saved"); });
    $$("[data-rdel]").forEach((b) => b.addEventListener("click", () => { if (confirm("Delete this session?")) { S.readings = S.readings.filter((r) => r.id !== b.dataset.rdel); save(); render(); } }));
  }

  /* ---------------- Glossary ---------------- */
  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  pages.glossary = () => {
    const terms = C.glossary.slice().sort((a, b) => a.t.localeCompare(b.t));
    const letters = Array.from(new Set(terms.map((g) => g.t[0].toUpperCase())));
    return `
    <article class="prose">
      <p class="crumb">Reference</p>
      <h1>Glossary</h1>
      <p class="lede">${terms.length} terms from the course, each linked to the week that teaches it.</p>
      <nav class="az" aria-label="Jump to letter">${letters.map((l) => `<a href="#/glossary/letter-${l.toLowerCase()}">${l}</a>`).join("")}</nav>
      ${letters.map((l) => `<h2 id="g-letter-${l.toLowerCase()}" tabindex="-1">${l}</h2><dl class="gloss">${terms.filter((g) => g.t[0].toUpperCase() === l).map((g) => `<div id="g-${slug(g.t)}" tabindex="-1"><dt>${esc(g.t)}</dt><dd>${esc(g.d)} <a href="#/week/${g.w}">Week ${g.w}</a></dd></div>`).join("")}</dl>`).join("")}
    </article>`;
  };

  /* ---------------- Search ---------------- */
  const strip = (h) => String(h).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  let INDEX = null;
  function buildIndex() {
    const ix = [];
    C.weeks.forEach((w) => {
      ix.push({ kind: `Week ${w.n}`, title: w.title, text: w.summary, href: `#/week/${w.n}` });
      w.lessons.forEach((l, i) => ix.push({ kind: `Week ${w.n} lesson`, title: l.h, text: strip(l.body), href: `#/week/${w.n}/s${i}` }));
      ix.push({ kind: `Week ${w.n}`, title: "What the research says", text: strip(w.evidence), href: `#/week/${w.n}/evidence` });
      ix.push({ kind: `Week ${w.n}`, title: "Daily tasks", text: w.tasks.join(" "), href: `#/week/${w.n}/tasks` });
      ix.push({ kind: `Week ${w.n}`, title: w.n % 4 === 0 ? "Exam" : "Sunday test", text: w.test.intro + " " + w.test.parts.map((p) => p.label).join(". "), href: `#/week/${w.n}/test` });
    });
    C.glossary.forEach((g) => ix.push({ kind: "Glossary", title: g.t, text: g.d, href: `#/glossary/${slug(g.t)}` }));
    TOOL_LIST.forEach(([t, b]) => ix.push({ kind: "Practice tool", title: toolName(t, b), text: toolBlurb(t, b), href: `#/tools/${toolKey(t, b)}` }));
    C.readable.forEach((b) => ix.push({ kind: "Read on this site", title: b.t, text: `${b.a}. ${b.note}`, href: `#/read/${b.id}` }));
    C.library.books.forEach((b) => ix.push({ kind: "Book", title: b.t, text: `${b.a}. ${b.skill}. Week ${b.week}.`, href: "#/library" }));
    C.library.free.forEach((r) => ix.push({ kind: "Free resource", title: r.t, text: `${r.type}. ${r.what}`, href: "#/library" }));
    C.library.videos.forEach((v) => ix.push({ kind: "Video", title: v.t, text: `${v.what}. Week ${v.week}.`, href: "#/library" }));
    C.rules.forEach((r) => ix.push({ kind: "Before you begin", title: r[0], text: r[1], href: "#/start" }));
    PERF_TABS.forEach(([k, l]) => ix.push({ kind: "Performance mode", title: l, text: { script: "Write each effect: hook, premise, process, climax, applause cue and out.", prompter: "Scrolling teleprompter with speed, text size and mirror mode.", timer: "Time a full show effect by effect against your plan.", readings: "Log reading statements as hits, partial hits or misses and see your honest hit rate." }[k], href: `#/perform/${k}` }));
    ix.forEach((x) => { x.lt = x.title.toLowerCase(); x.lx = x.text.toLowerCase(); });
    return ix;
  }
  function searchResults(q) {
    INDEX = INDEX || buildIndex();
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1 || /\d/.test(t));
    if (!terms.length) return [];
    const res = [];
    INDEX.forEach((x) => {
      let score = 0;
      for (const t of terms) {
        const inT = x.lt.includes(t), inX = x.lx.includes(t);
        if (!inT && !inX) return;
        score += (inT ? 6 : 0) + (x.lt === t ? 6 : 0) + Math.min(3, x.lx.split(t).length - 1);
      }
      if (x.kind === "Glossary") score += 1;
      res.push({ x, score });
    });
    return res.sort((a, b) => b.score - a.score).slice(0, 40).map((r) => r.x);
  }
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function highlight(text, terms) {
    let h = esc(text);
    terms.forEach((t) => { const e = esc(t); if (e) h = h.replace(new RegExp(reEsc(e), "gi"), (m) => `<mark>${m}</mark>`); });
    return h;
  }
  function snippet(text, terms) {
    const lx = text.toLowerCase();
    const hits = terms.map((t) => lx.indexOf(t)).filter((k) => k >= 0);
    const i = hits.length ? Math.min.apply(null, hits) : 0;
    const from = Math.max(0, i - 70), to = Math.min(text.length, i + 150);
    return (from ? "…" : "") + text.slice(from, to).trim() + (to < text.length ? "…" : "");
  }
  function resultsHTML(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!q.trim()) return `<p class="muted">Search lessons, research notes, tasks, tests, glossary terms, drills and the library. Press / anywhere to jump to search.</p><p class="muted">Try: <a href="#/search/baseline">baseline</a>, <a href="#/search/micro-expression">micro-expression</a>, <a href="#/search/memory%20palace">memory palace</a>, <a href="#/search/cold%20reading">cold reading</a>.</p>`;
    const res = searchResults(q);
    if (!res.length) return `<p>No results for “${esc(q)}”. Try a shorter or different word.</p>`;
    return `<p class="muted">${res.length}${res.length === 40 ? "+" : ""} ${res.length === 1 ? "result" : "results"}</p><ol class="results">${res.map((x) => `<li><a href="${x.href}"><span class="r-kind">${esc(x.kind)}</span><span class="r-title">${highlight(x.title, terms)}</span></a><p>${highlight(snippet(x.text, terms), terms)}</p></li>`).join("")}</ol>`;
  }
  pages.search = (q) => `
    <article class="prose">
      <p class="crumb">Search</p>
      <h1>Search the course</h1>
      <form class="search-form" role="search"><label class="sr" for="search-q">Search the course</label><input type="search" id="search-q" value="${esc(q)}" placeholder="For example: anchoring, names, teleprompter" autocomplete="off"></form>
      <div class="search-results" aria-live="polite">${resultsHTML(q)}</div>
    </article>`;
  function bindSearch() {
    const inp = $("#search-q"); if (!inp) return;
    let t = null;
    const run = () => { const q = inp.value; $(".search-results").innerHTML = resultsHTML(q); history.replaceState(null, "", "#/search/" + encodeURIComponent(q)); lastRoute = location.hash; };
    inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(run, 120); });
    $(".search-form").addEventListener("submit", (e) => { e.preventDefault(); clearTimeout(t); run(); const first = $(".results a"); if (first) first.focus(); });
    pageCleanup = () => clearTimeout(t);
    inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
  }

  /* ---------------- Videos ---------------- */
  /* Click-to-play: nothing loads from YouTube until the reader presses play, and then it uses the privacy-enhanced domain. */
  function videoHTML(v, note) {
    return `<figure class="yt"><div class="yt-frame" data-yt="${esc(v.v)}" data-title="${esc(v.t)}"><button class="yt-play" type="button"><span class="yt-icon" aria-hidden="true"></span><span class="yt-title">${esc(v.t)}</span><span class="yt-note">Plays from YouTube in privacy-enhanced mode</span></button></div>${note ? `<figcaption>${esc(note)}</figcaption>` : ""}<p class="yt-link"><a href="https://www.youtube.com/watch?v=${esc(v.v)}" target="_blank" rel="noopener">Open on YouTube</a></p></figure>`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".yt-play"); if (!b) return;
    const f = b.parentElement, id = f.dataset.yt;
    if (!/^[\w-]{6,20}$/.test(id)) return;
    const ifr = document.createElement("iframe");
    ifr.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    ifr.title = f.dataset.title;
    ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    ifr.allowFullscreen = true;
    ifr.referrerPolicy = "strict-origin-when-cross-origin";
    f.replaceChildren(ifr); ifr.focus();
  });

  /* ---------------- Books ---------------- */
  /* Hosted books are public domain. A reader's own PDFs are kept in IndexedDB on their device and never uploaded. */
  const IDB = {
    p: null,
    open() {
      if (!this.p) this.p = new Promise((res, rej) => {
        if (!window.indexedDB) { rej(new Error("no indexedDB")); return; }
        const r = indexedDB.open("read-the-room", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("books", { keyPath: "id" });
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      });
      return this.p;
    },
    async run(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => { const t = db.transaction("books", mode); const req = fn(t.objectStore("books")); t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
    },
    all() { return this.run("readonly", (s) => s.getAll()); },
    get(id) { return this.run("readonly", (s) => s.get(id)); },
    put(v) { return this.run("readwrite", (s) => s.put(v)); },
    del(id) { return this.run("readwrite", (s) => s.delete(id)); }
  };
  const memBooks = {};
  const hosted = (id) => C.readable.find((b) => b.id === id);
  const bookPos = (id) => S.books[id] || null;
  const posText = (p) => (p && p.pages ? `Page ${p.page} of ${p.pages}` : "Not started");
  function hashId(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return "my-" + h.toString(36); }
  function lastBook() {
    const ids = Object.keys(S.books).filter((id) => S.books[id].pages);
    if (!ids.length) return null;
    const id = ids.sort((a, b) => S.books[b].at - S.books[a].at)[0];
    return Object.assign({ id }, S.books[id]);
  }

  function bookCard(b) {
    const p = bookPos(b.id), pct = p && p.pages ? Math.round((p.page / p.pages) * 100) : 0;
    return `<div class="book-card"><p class="book-week">${esc(b.week)}</p><h3>${esc(b.t)}</h3><p class="muted">${esc(b.a)}</p><p>${esc(b.note)}</p>
      <div class="book-progress"><span class="meter thin" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></span><span class="muted small">${posText(p)}</span></div>
      <div class="drill-actions left"><a class="btn primary" href="#/read/${b.id}">${p && p.pages ? "Continue reading" : "Read"}</a><a class="btn" href="${b.file}" download="${esc(b.t)}.pdf">Download PDF (${esc(b.size)})</a></div></div>`;
  }
  const readHereHTML = () => `
      <h2 id="read-here" tabindex="-1">Read on this site</h2>
      <p>Books open in the reader and remember exactly where you stopped, so the next time you open one, you're back on the same spot.</p>
      <div class="book-grid">${C.readable.map(bookCard).join("")}
        <div class="book-card own"><h3>Your own books</h3><p class="muted">Open a PDF you own, such as a copy of <em>Mastermind</em>. It stays on this device and is never uploaded. Your place is remembered here too.</p>
          <ul class="own-list" aria-live="polite"></ul>
          <label class="btn">Open a PDF from this device<input type="file" accept="application/pdf,.pdf" hidden data-act="own-open"></label></div>
      </div>`;
  async function bindOwnBooks() {
    const list = $(".own-list"); if (!list) return;
    let recs = [];
    try { recs = await IDB.all(); } catch (e) { recs = Object.values(memBooks); }
    recs.sort((a, b) => ((S.books[b.id] || {}).at || b.added) - ((S.books[a.id] || {}).at || a.added));
    list.innerHTML = recs.map((r) => `<li><a href="#/read/${r.id}">${esc(r.name)}</a><span class="muted small">${posText(bookPos(r.id))}</span><button class="btn ghost small" data-own-del="${r.id}" aria-label="Remove ${esc(r.name)} from this device">Remove</button></li>`).join("");
    $$("[data-own-del]", list).forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Remove this book and its saved page from this device?")) return;
      try { await IDB.del(b.dataset.ownDel); } catch (e) { /* not stored */ }
      delete memBooks[b.dataset.ownDel]; delete S.books[b.dataset.ownDel]; save(); bindOwnBooks();
    }));
    const inp = $("[data-act=own-open]");
    if (inp && !inp.dataset.bound) {
      inp.dataset.bound = "1";
      inp.addEventListener("change", async () => {
        const f = inp.files[0]; inp.value = ""; if (!f) return;
        const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
        if (!isPdf) { toast("That file isn't a PDF"); return; }
        const id = hashId(f.name + "|" + f.size + "|" + f.lastModified);
        const rec = { id, name: f.name.replace(/\.pdf$/i, ""), size: f.size, added: Date.now(), blob: f };
        try { await IDB.put(rec); }
        catch (e) { memBooks[id] = rec; toast("This browser can't keep the file, so open it again next time. Your page is still remembered."); }
        location.hash = "#/read/" + id;
      });
    }
  }

  let pdfjsP = null;
  function loadPdfjs() {
    if (!pdfjsP) pdfjsP = import(new URL("assets/vendor/pdfjs/pdf.min.mjs?v=4.10.38", document.baseURI).href).then((m) => {
      m.GlobalWorkerOptions.workerSrc = new URL("assets/vendor/pdfjs/pdf.worker.min.mjs?v=4.10.38", document.baseURI).href;
      return m;
    });
    return pdfjsP;
  }

  pages.read = (id) => {
    const b = hosted(id);
    return `
    <article class="reader" aria-label="Book reader">
      <div class="reader-bar">
        <a class="btn ghost small" href="#/library/read-here" aria-label="Back to the library"><span aria-hidden="true">←</span><span class="rb-label" aria-hidden="true">Library</span></a>
        <p class="reader-title"><span class="rt-name">${b ? esc(b.t) : "Your book"}</span>${b ? ` <span class="muted">${esc(b.a)}</span>` : ""}</p>
        <div class="reader-nav"><button class="btn small" data-rd="prev" aria-label="Previous page">‹</button><label class="sr" for="rd-page">Page number</label><input id="rd-page" type="number" min="1" inputmode="numeric" value="1"><span class="muted small rd-of">of …</span><button class="btn small" data-rd="next" aria-label="Next page">›</button></div>
        <div class="reader-zoom"><button class="btn small" data-rd="out" aria-label="Zoom out">−</button><span class="rd-zoom small" aria-live="polite">100%</span><button class="btn small" data-rd="in" aria-label="Zoom in">+</button></div>
        ${b ? `<a class="btn small" href="${b.file}" download="${esc(b.t)}.pdf">Download</a>` : ""}
      </div>
      <p class="reader-status muted" role="status">Opening the book…</p>
      <div class="reader-pages"></div>
    </article>`;
  };

  async function openReader(id) {
    const status = $(".reader-status"), wrap = $(".reader-pages"); if (!wrap) return;
    let alive = true, doc = null, task = null;
    const timers = [];
    const off = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); off.push(() => el.removeEventListener(ev, fn, o)); };
    let flush = () => {};
    pageCleanup = () => { alive = false; flush(); off.forEach((f) => f()); timers.forEach(clearTimeout); if (io) io.disconnect(); if (task) task.destroy(); };
    let io = null;

    const b = hosted(id);
    let src = null, title = b ? b.t : "";
    try {
      if (b) src = { url: b.file };
      else {
        let rec = memBooks[id] || null;
        if (!rec) { try { rec = await IDB.get(id); } catch (e) { rec = null; } }
        if (!rec) { status.innerHTML = `This book isn't saved on this device. <a href="#/library/read-here">Open it again from the library</a>; your page is still remembered.`; return; }
        title = rec.name; $(".rt-name").textContent = rec.name; document.title = rec.name + " | " + C.name;
        src = { data: new Uint8Array(await rec.blob.arrayBuffer()) };
      }
      const pdfjs = await loadPdfjs(); if (!alive) return;
      task = pdfjs.getDocument(Object.assign({ isEvalSupported: false }, src));
      doc = await task.promise; if (!alive) return;
      if (!b) {
        /* Prefer the title stored inside the PDF over the file name. */
        const meta = await doc.getMetadata().catch(() => null);
        const t = meta && meta.info && String(meta.info.Title || "").trim();
        if (t && alive) {
          title = t; $(".rt-name").textContent = t; document.title = t + " | " + C.name;
          IDB.get(id).then((rec) => { if (rec && rec.name !== t) { rec.name = t; return IDB.put(rec); } }).catch(() => {});
        }
      }

      const n = doc.numPages, saved = bookPos(id) || {};
      let zoom = saved.zoom || 1, renderKey = 1;
      const first = await doc.getPage(1); if (!alive) return;
      const base = first.getViewport({ scale: 1 });
      const ratio = new Array(n).fill(base.height / base.width);
      /* Measure every page first so the layout, and therefore the saved position, is exact even when page sizes vary. */
      status.textContent = "Preparing pages…";
      for (let i = 2; i <= n; i += 40) {
        await Promise.all(Array.from({ length: Math.min(40, n - i + 1) }, (_, j) => doc.getPage(i + j).then((pg) => { const v = pg.getViewport({ scale: 1 }); ratio[i + j - 1] = v.height / v.width; })));
        if (!alive) return;
      }
      const pageInput = $("#rd-page"); pageInput.max = n; $(".rd-of").textContent = `of ${n}`;
      const zoomText = () => { $(".rd-zoom").textContent = Math.round(zoom * 100) + "%"; };
      zoomText();
      const pageW = () => Math.round(Math.min(wrap.clientWidth, 860) * zoom);

      wrap.innerHTML = Array.from({ length: n }, (_, i) => `<div class="rpage" data-n="${i + 1}" role="img" aria-label="Page ${i + 1} of ${n}"></div>`).join("");
      const divs = $$(".rpage", wrap);
      const sizeAll = () => { const w = pageW(); divs.forEach((d, i) => { d.style.width = w + "px"; d.style.height = Math.round(w * ratio[i]) + "px"; }); };
      sizeAll();
      status.textContent = "";

      const drawing = new Set();
      async function draw(div) {
        const k = renderKey, num = +div.dataset.n;
        if (div.dataset.key === String(k) || drawing.has(num + ":" + k)) return;
        drawing.add(num + ":" + k);
        try {
          const page = await doc.getPage(num); if (!alive || k !== renderKey) return;
          const vp1 = page.getViewport({ scale: 1 });
          const r = vp1.height / vp1.width;
          if (Math.abs(r - ratio[num - 1]) > 0.001) { const keep = position(); ratio[num - 1] = r; div.style.height = Math.round(pageW() * r) + "px"; goTo(keep.page, keep.frac); }
          const scale = pageW() / vp1.width, dpr = Math.min(window.devicePixelRatio || 1, 2);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width * dpr); canvas.height = Math.floor(vp.height * dpr);
          await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
          if (!alive || k !== renderKey) return;
          const tl = document.createElement("div"); tl.className = "textLayer"; tl.style.setProperty("--scale-factor", scale);
          div.replaceChildren(canvas, tl); div.dataset.key = String(k);
          new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: tl, viewport: vp }).render().catch(() => {});
        } catch (e) { /* page failed or reader closed */ }
        finally { drawing.delete(num + ":" + k); }
      }
      io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) draw(en.target); }), { rootMargin: "1200px 0px" });
      divs.forEach((d) => io.observe(d));

      /* The reading line sits just under the toolbar; the page crossing it is the current page. */
      const line = () => $(".reader-bar").getBoundingClientRect().bottom + 12;
      function position() {
        const y = line();
        let lo = 0, hi = divs.length - 1;
        while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (divs[mid].getBoundingClientRect().top <= y) lo = mid; else hi = mid - 1; }
        const r = divs[lo].getBoundingClientRect();
        return { page: lo + 1, frac: Math.max(0, Math.min(1, (y - r.top) / r.height)) };
      }
      function goTo(page, frac) {
        const d = divs[Math.max(0, Math.min(n, page) - 1)];
        window.scrollTo(0, window.scrollY + d.getBoundingClientRect().top + (frac || 0) * d.offsetHeight - line() + (frac ? 0 : 4));
      }
      let saveT = null, cur = 1;
      flush = () => { clearTimeout(saveT); if (!doc) return; const p = position(); S.books[id] = { page: p.page, frac: Math.round(p.frac * 1000) / 1000, zoom, pages: n, at: Date.now(), title }; save(); };
      const onScroll = () => {
        const p = position();
        if (p.page !== cur) { cur = p.page; if (document.activeElement !== pageInput) pageInput.value = cur; }
        clearTimeout(saveT); saveT = setTimeout(flush, 400);
        divs.forEach((d, i) => { if (d.dataset.key && Math.abs(i + 1 - cur) > 10) { d.replaceChildren(); delete d.dataset.key; } });
      };
      let ticking = false;
      on(window, "scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; if (alive) onScroll(); }); } }, { passive: true });
      on(window, "pagehide", flush);
      on(document, "visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

      const setZoom = (z) => {
        const keep = position();
        zoom = Math.max(0.6, Math.min(2.4, Math.round(z * 10) / 10)); zoomText();
        renderKey++; divs.forEach((d) => { d.replaceChildren(); delete d.dataset.key; });
        sizeAll(); goTo(keep.page, keep.frac);
        divs.forEach((d) => { io.unobserve(d); io.observe(d); });
        flush();
      };
      $("[data-rd=prev]").addEventListener("click", () => goTo(cur - 1, 0));
      $("[data-rd=next]").addEventListener("click", () => goTo(cur + 1, 0));
      $("[data-rd=in]").addEventListener("click", () => setZoom(zoom + 0.2));
      $("[data-rd=out]").addEventListener("click", () => setZoom(zoom - 0.2));
      pageInput.addEventListener("change", () => { const v = parseInt(pageInput.value, 10); if (v >= 1 && v <= n) goTo(v, 0); else pageInput.value = cur; });
      on(document, "keydown", (e) => {
        const t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        if (!$("#overlay").hidden) return;
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(cur + 1, 0); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(cur - 1, 0); }
      });
      let lastW = wrap.clientWidth;
      on(window, "resize", () => { if (Math.abs(wrap.clientWidth - lastW) > 40) { lastW = wrap.clientWidth; setZoom(zoom); } });

      /* Resume exactly where the reader stopped. Run twice: once now, once after the first pages have drawn and fonts settled. */
      const resume = () => { if (saved.page) goTo(saved.page, saved.frac || 0); else goTo(1, 0); onScroll(); };
      resume(); timers.push(setTimeout(() => { if (alive && saved.page) resume(); }, 350));
    } catch (e) {
      if (alive) status.textContent = "This book couldn't be opened. " + (b ? "Try the download button instead." : "The file may be damaged or password protected.");
    }
  }

  /* About */
  pages.about = () => `
    <article class="prose">
      <p class="crumb">About</p>
      <h1>About and ethics</h1>
      <p class="lede">Read the Room is a free course that teaches observation, memory, psychology and mentalism from scratch, inspired by Patrick Jane in <em>The Mentalist</em> and real performers like Suhani Shah and Derren Brown.</p>
      <h2>How the content was checked</h2>
      <p>Every lesson is original writing based on well-established research and widely used techniques. Each week has a "What the research says" note that separates solid findings from debated ones. Where popular claims go beyond the evidence, such as lie detection from body language, micro-expression training, or social priming, the course says so.</p>
      <p>The faces in the drills are illustrations, not photos of real people. Each expression is drawn from the facial muscle movements (action units) that the week 6 lesson describes, so they are cleaner than real faces. Real expressions are subtler and depend on context.</p>
      <p>Books, courses and videos are linked rather than copied. Videos link to YouTube searches so they stay current.</p>
      <h2>Ethics</h2>
      <ul><li>Never claim real psychic powers. Present your work as psychology, skill and performance.</li><li>Practise readings only on people who know you are practising, and explain afterwards.</li><li>Never use these skills to take money, trust or private information from anyone.</li><li>Ask permission before any touch, including muscle reading.</li><li>Discomfort is not proof of lying. Never accuse anyone based on body language.</li></ul>
      <h2>Your privacy</h2>
      <p>This site has no accounts and no tracking. Your progress, journal, scripts, reading logs and book positions are stored only in your own browser, share images are created on your device, and books you open from your device stay on it. Videos load from YouTube only when you press play.</p>
      <h2>Disclaimer</h2>
      <p>This course is for education and entertainment. It is not psychological, medical or legal advice.</p>
    </article>`;

  pages.notfound = () => `<article class="prose"><h1>Page not found</h1><p>That page doesn't exist. <a href="#/">Go to the home page</a>.</p></article>`;

  /* ---------------- Router ---------------- */
  /* Routes: #/week/3, #/week/3/s1 (a section), #/tools/kims, #/glossary/anchoring, #/perform/timer, #/search/<query> */
  function render() {
    if (cleanup) { cleanup(); cleanup = null; }
    if (pageCleanup) { const f = pageCleanup; pageCleanup = null; f(); }
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const [p, a] = parts;
    const b = parts.slice(2).join("/");
    let html, after = () => {}, title = C.name, target = null;
    if (!p) { html = pages.home(); after = () => { heroTest(); bindToday(); }; }
    else if (p === "start") { html = pages.start(); after = bindStart; title = "Before you begin"; }
    else if (p === "week" && weekBy(+a)) { html = pages.week(+a); after = () => bindWeek(+a); title = `Week ${a}: ${weekBy(+a).title}`; if (b) target = `#w${+a}-${b}`; }
    else if (p === "tools") { html = pages.tools(); after = bindTools; title = "Practice tools"; if (a) target = "#" + toolId(decodeURIComponent(a)); }
    else if (p === "perform") {
      const tab = PERF_TABS.some((t) => t[0] === a) ? a : "script";
      html = pages.perform(tab); title = "Performance mode";
      after = { script: bindScript, prompter: bindPrompter, timer: bindTimer, readings: bindReadings }[tab];
    }
    else if (p === "library") { html = pages.library(); after = bindOwnBooks; title = "Library"; if (a) target = "#" + a; }
    else if (p === "read" && a && (hosted(a) || /^my-[a-z0-9]+$/.test(a))) { html = pages.read(a); after = () => openReader(a); title = hosted(a) ? hosted(a).t : "Reader"; }
    else if (p === "glossary") { html = pages.glossary(); title = "Glossary"; if (a) target = "#g-" + a; }
    else if (p === "search") { let q = ""; try { q = decodeURIComponent(parts.slice(1).join("/")); } catch (e) { q = ""; } html = pages.search(q); after = bindSearch; title = "Search"; }
    else if (p === "tracker") { html = pages.tracker(); after = bindTracker; title = "Progress tracker"; }
    else if (p === "journal") { html = pages.journal(); after = bindJournal; title = "Journal"; }
    else if (p === "about") { html = pages.about(); title = "About and ethics"; }
    else html = pages.notfound();
    view.innerHTML = html;
    document.title = title === C.name ? C.name + ": learn observation, memory and mentalism" : title + " | " + C.name;
    renderOutline();
    after();
    let el = null; try { el = target ? $(target) : null; } catch (e) { el = null; }
    return el;
  }
  let lastRoute = null;
  window.addEventListener("hashchange", () => {
    document.body.classList.remove("nav-open");
    const target = render();
    if (target) { target.scrollIntoView({ block: "start" }); target.focus({ preventScroll: true }); target.classList.add("flash"); setTimeout(() => target.classList.remove("flash"), 1600); }
    else if (location.hash !== lastRoute) { window.scrollTo(0, 0); view.focus({ preventScroll: true }); }
    lastRoute = location.hash;
  });

  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

  lastRoute = location.hash;
  const first = render();
  if (first) setTimeout(() => first.scrollIntoView({ block: "start" }), 0);
})();

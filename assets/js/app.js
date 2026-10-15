/* Read the Room: app shell, routing and pages. */
(function () {
  const C = window.COURSE, DR = window.DRILLS, BK = window.BANKS;
  const { esc, sample, shuffle } = window.DRILL_UTILS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const view = $("#view");

  /* ---------------- Storage ---------------- */
  const KEY = "read-the-room-v1";
  let memoryOnly = false;
  const blank = () => ({ v: 1, start: null, tasks: {}, tests: {}, practice: {}, journal: [], theme: null });
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? Object.assign(blank(), JSON.parse(raw)) : blank(); }
    catch (e) { memoryOnly = true; return blank(); }
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memoryOnly = true; } }

  const today = () => new Date().toISOString().slice(0, 10);
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

  /* ---------------- Theme ---------------- */
  function applyTheme() { if (S.theme) document.documentElement.setAttribute("data-theme", S.theme); else document.documentElement.removeAttribute("data-theme"); }
  applyTheme();
  $("#theme-toggle").addEventListener("click", () => {
    const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    S.theme = dark ? "light" : "dark"; save(); applyTheme();
  });

  /* ---------------- Sidebar ---------------- */
  function renderOutline() {
    const route = location.hash || "#/";
    const link = (href, label, extra) => `<a href="${href}" class="${route === href ? "active" : ""}" ${route === href ? 'aria-current="page"' : ""}>${label}${extra || ""}</a>`;
    $("#outline").innerHTML = `
      <div class="nav-group">${link("#/", "Home")}${link("#/start", "Before you begin")}</div>
      ${C.months.map((m) => `<div class="nav-group"><p class="nav-month">Month ${m.n}: ${esc(m.title)}</p>
        ${m.weeks.map((n) => { const w = weekBy(n); return link(`#/week/${n}`, `<span class="wk-n">${n}</span><span>${esc(w.title)}</span>`, weekPassed(w) ? `<span class="tick" aria-label="passed">✓</span>` : ""); }).join("")}</div>`).join("")}
      <div class="nav-group">${link("#/tools", "Practice tools")}${link("#/library", "Library")}${link("#/tracker", "Progress tracker")}${link("#/journal", "Journal")}${link("#/about", "About and ethics")}</div>`;
  }
  const drawer = () => document.body.classList.toggle("nav-open");
  $("#menu-btn").addEventListener("click", drawer);
  $("#scrim").addEventListener("click", drawer);

  /* ---------------- Drill overlay ---------------- */
  let cleanup = null, lastFocus = null;
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
    (S.practice[id] = S.practice[id] || []).push({ score: res.score, max: res.max, date: today() });
    S.practice[id] = S.practice[id].slice(-30); save();
  }

  /* ---------------- Pages ---------------- */
  const pages = {};

  /* Home */
  pages.home = () => {
    const cw = weekBy(currentWeek());
    const started = Object.keys(S.tests).length || Object.keys(S.tasks).length;
    const ch = C.challenges[Math.floor(Date.now() / 86400000) % C.challenges.length];
    return `
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
      cleanup = () => clearInterval(id);
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
  function toolButton(t) {
    if (t.startsWith("quiz:")) { const bank = t.split(":")[1]; return `<button class="tool-chip" data-tool="quiz" data-bank="${bank}">${esc(BK[bank].title)}</button>`; }
    return `<button class="tool-chip" data-tool="${t}">${esc(DR[t].title)}</button>`;
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

      ${w.lessons.map((l) => `<section><h2>${esc(l.h)}</h2>${l.body}</section>`).join("")}

      <aside class="evidence"><h2>What the research says</h2>${w.evidence}</aside>

      <section><h2>Study this week</h2><ul class="study">${w.study.map((s) => `<li><a href="${s.u}" ${s.u.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>${esc(s.t)}</a></li>`).join("")}</ul></section>

      ${w.tools.length ? `<section><h2>Practice tools</h2><p>Use these as often as you like. Practice runs don't affect your test.</p><div class="tool-chips">${w.tools.map(toolButton).join("")}</div></section>` : ""}

      <section><h2>Daily tasks</h2><p>Tick each day you complete a task.</p>
        <div class="tasks">${w.tasks.map((t, i) => { const k = `w${n}t${i}`, arr = S.tasks[k] || []; return `<div class="task"><p>${esc(t)}</p><div class="days" role="group" aria-label="Days completed">${days.map((d, j) => `<button class="day" data-k="${k}" data-d="${j}" aria-pressed="${!!arr[j]}">${d}</button>`).join("")}</div></div>`; }).join("")}</div>
      </section>

      <section class="test"><h2>${n === 12 ? "Final exam" : n % 4 === 0 ? "Month " + m.n + " exam" : "Sunday test"}</h2><p>${esc(w.test.intro)}</p>
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
    S.tests[wn][pid] = { score: res.score, max: res.max || null, date: today() };
    save();
  }
  function bindWeek(n) {
    const w = weekBy(n); if (!w) return;
    $$(".day").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.k, d = +b.dataset.d; const arr = S.tasks[k] || [];
      arr[d] = !arr[d]; S.tasks[k] = arr; save();
      b.setAttribute("aria-pressed", !!arr[d]);
      $(".week-status span").textContent = `Daily tasks ${weekTaskPct(w)} percent done`;
    }));
    $$(".tool-chip").forEach((b) => b.addEventListener("click", () => {
      const t = b.dataset.tool;
      const cfg = t === "quiz" ? { bank: b.dataset.bank, n: 10 } : Object.assign({}, DR[t].defaults);
      openDrill(t, cfg, (r) => logPractice(t === "quiz" ? "quiz:" + cfg.bank : t, r));
    }));
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
  const TOOL_LIST = [
    ["kims", null], ["words", null], ["names", null], ["cards", null],
    ["quiz", "biases"], ["quiz", "influence"], ["quiz", "emotions"], ["quiz", "cold"], ["whichhand", null]
  ];
  const toolKey = (t, b) => (b ? "quiz:" + b : t);
  const toolName = (t, b) => (b ? BK[b].title : DR[t].title);
  const toolBlurb = (t, b) => (b ? `${BK[b].items.length} questions in the bank. ${BK[b].prompt}` : DR[t].blurb);
  pages.tools = () => `
    <article class="prose wide">
      <p class="crumb">Practice</p>
      <h1>Practice tools</h1>
      <p class="lede">Every drill from the course, with adjustable difficulty. Practice runs are kept separately from your tests.</p>
      <div class="tool-grid">${TOOL_LIST.map(([t, b]) => {
        const hist = S.practice[toolKey(t, b)] || [];
        const best = hist.length ? Math.max.apply(null, hist.map((h) => h.score)) : null;
        const d = DR[t];
        const opts = d.options ? Object.keys(d.options).map((k) => `<label>${k === "count" ? "Items" : k === "seconds" ? "Time" : "Rounds"}<select data-opt="${k}">${d.options[k].map((v) => `<option value="${v}" ${v === d.defaults[k] ? "selected" : ""}>${k === "seconds" ? (v >= 60 ? v / 60 + " min" : v + " s") : v}</option>`).join("")}</select></label>`).join("") : "";
        return `<div class="tool-card" data-t="${t}" data-b="${b || ""}"><h2>${esc(toolName(t, b))}</h2><p>${esc(toolBlurb(t, b))}</p>${opts ? `<div class="tool-opts">${opts}</div>` : ""}<div class="tool-foot"><span class="muted">${best !== null ? `Best: ${best}. Runs: ${hist.length}.` : "Not tried yet."}</span><button class="btn primary" data-run>Start</button></div></div>`;
      }).join("")}</div>
    </article>`;
  function bindTools() {
    $$(".tool-card").forEach((card) => $("[data-run]", card).addEventListener("click", () => {
      const t = card.dataset.t, b = card.dataset.b || null;
      const cfg = b ? { bank: b, n: 10 } : Object.assign({}, DR[t].defaults);
      $$("select", card).forEach((s) => { cfg[s.dataset.opt] = +s.value; });
      openDrill(t, cfg, (r) => logPractice(toolKey(t, b), r));
    }));
  }

  /* Library */
  pages.library = () => {
    const L = C.library;
    const tiers = { Core: "Core: read during the course", Extra: "Extra: if you want more", Next: "Next: after the 12 weeks" };
    return `
    <article class="prose wide">
      <p class="crumb">Resources</p>
      <h1>Library</h1>
      <p class="lede">The best books, free courses and videos, in the order the course uses them. Book links search Open Library, where many titles can be borrowed free and legally.</p>
      <h2>Books</h2>
      ${Object.keys(tiers).map((tier) => `<h3>${tiers[tier]}</h3><div class="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Skill</th><th>Week</th></tr></thead><tbody>${L.books.filter((b) => b.tier === tier).map((b) => `<tr><td><a href="${b.free || ol(b.t + " " + b.a)}" target="_blank" rel="noopener">${esc(b.t)}</a>${b.free ? ' <span class="pill">free</span>' : ""}</td><td>${esc(b.a)}</td><td>${esc(b.skill)}</td><td>${esc(b.week)}</td></tr>`).join("")}</tbody></table></div>`).join("")}
      <h2>Free and legal: textbooks, courses and tests</h2>
      <p>Avoid pirated PDFs of mentalism books. They are often incomplete, and the mentalism community is small and depends on people buying from creators.</p>
      <div class="table-wrap"><table><thead><tr><th>Resource</th><th>Type</th><th>What it covers</th></tr></thead><tbody>${L.free.map((r) => `<tr><td><a href="${r.u}" target="_blank" rel="noopener">${esc(r.t)}</a></td><td>${esc(r.type)}</td><td>${esc(r.what)}</td></tr>`).join("")}</tbody></table></div>
      <h2>Videos and channels</h2>
      <p>Links open a YouTube search, so you always reach the current official uploads. Skip channels promising "dark psychology" or instant lie detection.</p>
      <div class="table-wrap"><table><thead><tr><th>Channel or video</th><th>What you learn</th><th>Week</th></tr></thead><tbody>${L.videos.map((v) => `<tr><td><a href="${v.u}" target="_blank" rel="noopener">${esc(v.t)}</a></td><td>${esc(v.what)}</td><td>${esc(v.week)}</td></tr>`).join("")}</tbody></table></div>
    </article>`;
  };
  const ol = (q) => "https://openlibrary.org/search?q=" + encodeURIComponent(q);

  /* Tracker */
  pages.tracker = () => {
    const pc = passedCount();
    return `
    <article class="prose wide">
      <p class="crumb">Progress</p>
      <h1>Progress tracker</h1>
      <p class="lede">${pc} of 12 weeks passed${S.start ? `, started ${new Date(S.start + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}` : ""}.</p>
      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${pc}"><span style="width:${(pc / 12) * 100}%"></span></div>
      <div class="table-wrap"><table class="tracker"><thead><tr><th>Week</th><th>Test</th><th>Target</th><th>Your score</th><th>Result</th></tr></thead><tbody>
      ${C.weeks.map((w) => w.test.parts.map((p, i) => { const st = partState(w, p); return `<tr class="${i === 0 ? "first" : ""}">${i === 0 ? `<td rowspan="${w.test.parts.length}"><a href="#/week/${w.n}">${w.n}. ${esc(w.title)}</a></td>` : ""}<td>${esc(p.label)}</td><td>${p.beat ? "Beat week " + p.beat.week : typeof p.target === "number" ? p.target : "Record"}</td><td>${st.rec ? st.rec.score + (st.rec.max ? " / " + st.rec.max : "") : "<span class=muted>none</span>"}</td><td>${st.rec ? `<span class="pstat ${st.passed ? "ok" : "bad"}">${st.passed ? "Passed" : "Not yet"}</span>` : ""}</td></tr>`; }).join("")).join("")}
      </tbody></table></div>
      <h2>Your data</h2>
      <p>Everything is saved in this browser only${memoryOnly ? ". Storage is unavailable here, so progress will be lost when you close the page; export it to keep a copy" : ""}. Export a backup to move to another device.</p>
      <div class="drill-actions left"><button class="btn" data-act="export">Export backup</button><label class="btn">Import backup<input type="file" accept="application/json" hidden data-act="import"></label><button class="btn ghost danger" data-act="reset">Reset all progress</button></div>
    </article>`;
  };
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function bindTracker() {
    const ex = $("[data-act=export]"); if (!ex) return;
    ex.addEventListener("click", () => download(`read-the-room-backup-${today()}.json`, JSON.stringify(S, null, 2), "application/json"));
    $("[data-act=import]").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { const d = JSON.parse(t); if (!d || d.v !== 1) throw 0; S = Object.assign(blank(), d); save(); applyTheme(); render(); toast("Backup imported"); } catch (_) { toast("That file isn't a Read the Room backup"); } });
    });
    $("[data-act=reset]").addEventListener("click", () => { if (confirm("Delete all progress, test scores and journal entries? This can't be undone.")) { S = blank(); save(); applyTheme(); render(); toast("Progress reset"); } });
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
      <div class="entries">${entries.map((e) => `<div class="entry"><div class="entry-head"><p>${new Date(e.date + "T00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p><button class="btn ghost small" data-del="${e.id}">Delete</button></div>${e.noticed ? `<p><strong>Noticed:</strong> ${esc(e.noticed)}</p>` : ""}${e.guess ? `<p><strong>Guess:</strong> ${esc(e.guess)} <span class="pstat ${e.right === "yes" ? "ok" : e.right === "no" ? "bad" : ""}">${e.right === "yes" ? "Right" : e.right === "no" ? "Wrong" : "Unchecked"}</span></p>` : ""}${e.lesson ? `<p><strong>Lesson:</strong> ${esc(e.lesson)}</p>` : ""}</div>`).join("")}</div>
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
      const entry = { id: Date.now().toString(36), date: d.get("date") || today(), noticed: d.get("noticed").trim(), guess: d.get("guess").trim(), right: d.get("right"), lesson: d.get("lesson").trim() };
      if (!entry.noticed && !entry.guess && !entry.lesson) { f.querySelector("textarea").focus(); toast("Write at least one line first"); return; }
      S.journal.push(entry); save(); render(); toast("Entry saved");
    });
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => { if (confirm("Delete this entry?")) { S.journal = S.journal.filter((e) => e.id !== b.dataset.del); save(); render(); } }));
    const jx = $("[data-act=jexport]");
    if (jx) jx.addEventListener("click", () => {
      const txt = S.journal.slice().sort((a, b) => (a.date > b.date ? 1 : -1)).map((e) => `${e.date}\nNoticed: ${e.noticed}\nGuess: ${e.guess} (${e.right})\nLesson: ${e.lesson}\n`).join("\n");
      download(`read-the-room-journal-${today()}.txt`, txt, "text/plain");
    });
  }

  /* About */
  pages.about = () => `
    <article class="prose">
      <p class="crumb">About</p>
      <h1>About and ethics</h1>
      <p class="lede">Read the Room is a free course that teaches observation, memory, psychology and mentalism from scratch, inspired by Patrick Jane in <em>The Mentalist</em> and real performers like Suhani Shah and Derren Brown.</p>
      <h2>How the content was checked</h2>
      <p>Every lesson is original writing based on well-established research and widely used techniques. Each week has a "What the research says" note that separates solid findings from debated ones. Where popular claims go beyond the evidence, such as lie detection from body language, micro-expression training, or social priming, the course says so.</p>
      <p>Books, courses and videos are linked rather than copied. Videos link to YouTube searches so they stay current.</p>
      <h2>Ethics</h2>
      <ul><li>Never claim real psychic powers. Present your work as psychology, skill and performance.</li><li>Practise readings only on people who know you are practising, and explain afterwards.</li><li>Never use these skills to take money, trust or private information from anyone.</li><li>Ask permission before any touch, including muscle reading.</li><li>Discomfort is not proof of lying. Never accuse anyone based on body language.</li></ul>
      <h2>Your privacy</h2>
      <p>This site has no accounts and no tracking. Your progress and journal are stored only in your own browser.</p>
      <h2>Disclaimer</h2>
      <p>This course is for education and entertainment. It is not psychological, medical or legal advice.</p>
    </article>`;

  pages.notfound = () => `<article class="prose"><h1>Page not found</h1><p>That page doesn't exist. <a href="#/">Go to the home page</a>.</p></article>`;

  /* ---------------- Router ---------------- */
  function render() {
    if (cleanup) { cleanup(); cleanup = null; }
    const h = location.hash.replace(/^#\/?/, "");
    const [p, a] = h.split("/");
    let html, after = () => {}, title = C.name;
    if (!p) { html = pages.home(); after = heroTest; }
    else if (p === "start") { html = pages.start(); after = bindStart; title = "Before you begin"; }
    else if (p === "week" && weekBy(+a)) { html = pages.week(+a); after = () => bindWeek(+a); title = `Week ${a}: ${weekBy(+a).title}`; }
    else if (p === "tools") { html = pages.tools(); after = bindTools; title = "Practice tools"; }
    else if (p === "library") { html = pages.library(); title = "Library"; }
    else if (p === "tracker") { html = pages.tracker(); after = bindTracker; title = "Progress tracker"; }
    else if (p === "journal") { html = pages.journal(); after = bindJournal; title = "Journal"; }
    else if (p === "about") { html = pages.about(); title = "About and ethics"; }
    else html = pages.notfound();
    view.innerHTML = html;
    document.title = title === C.name ? C.name + ": learn observation, memory and mentalism" : title + " | " + C.name;
    renderOutline();
    after();
  }
  let lastRoute = null;
  window.addEventListener("hashchange", () => {
    document.body.classList.remove("nav-open");
    render();
    if (location.hash !== lastRoute) { window.scrollTo(0, 0); view.focus({ preventScroll: true }); }
    lastRoute = location.hash;
  });

  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

  lastRoute = location.hash;
  render();
})();

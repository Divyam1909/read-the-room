/* Read the Room: small SVG charts for the progress tracker.
   Each chart returns HTML with a table view for screen readers and readers who prefer numbers.
   Call CHARTS.bind(root) after inserting the HTML to switch on hover and keyboard readouts. */

(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Percent score over time for one drill. points: [{ v: 0..100, label, detail }] */
  function line(title, points) {
    const W = 280, H = 124, L = 32, R = 40, T = 12, B = 22;
    const iw = W - L - R, ih = H - T - B;
    const n = points.length;
    const x = (i) => L + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v) => T + ih - (v / 100) * ih;
    const grid = [0, 50, 100].map((g) => `<line x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}" class="c-grid"/><text x="${L - 6}" y="${y(g) + 4}" class="c-axis" text-anchor="end">${g}%</text>`).join("");
    const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
    const area = `${d} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
    const last = points[n - 1];
    const best = Math.max.apply(null, points.map((p) => p.v));
    const data = esc(JSON.stringify(points.map((p, i) => ({ x: x(i), y: y(p.v), v: p.v, l: p.label, d: p.detail }))));
    return `<figure class="chart" data-chart="line" data-points="${data}">
      <figcaption><span class="c-title">${esc(title)}</span><span class="c-sub">${n} ${n === 1 ? "run" : "runs"}. Best ${best}%</span></figcaption>
      <div class="c-plot"><svg viewBox="0 0 ${W} ${H}" tabindex="0" role="img" aria-label="${esc(title)}: ${n} runs, latest ${last.v} percent, best ${best} percent. Use the arrow keys to read each run.">
        ${grid}<text x="${L}" y="${H - 6}" class="c-axis">First</text><text x="${W - R}" y="${H - 6}" class="c-axis" text-anchor="end">Latest</text>
        <path d="${area}" class="c-area"/><path d="${d}" class="c-line"/>
        <circle cx="${x(n - 1)}" cy="${y(last.v)}" r="4" class="c-dot"/><text x="${x(n - 1) + 8}" y="${y(last.v) + 4}" class="c-val">${last.v}%</text>
        <line class="c-cross" x1="0" x2="0" y1="${T}" y2="${T + ih}" visibility="hidden"/><circle class="c-hover" r="4" visibility="hidden"/>
        <rect x="${L - 10}" y="0" width="${iw + 20}" height="${H}" fill="transparent" class="c-hit"/>
      </svg><div class="c-tip" hidden></div></div>
      <details class="c-table"><summary>Show as a table</summary><div class="table-wrap"><table><thead><tr><th>Run</th><th>Date</th><th>Score</th></tr></thead><tbody>${points.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.label)}</td><td>${esc(p.detail)} (${p.v}%)</td></tr>`).join("")}</tbody></table></div></details>
    </figure>`;
  }

  /* First score against latest score, per skill, on one 0 to 100 percent scale.
     Built in HTML rather than SVG so the rows reflow at phone width. */
  function compare(rows) {
    const axis = [0, 25, 50, 75, 100];
    const mark = (r, which) => { const p = r[which]; const other = which === "first" ? r.last : r.first; return `<span class="c-mark cmp-${which}" tabindex="0" style="left:${p.v}%" data-tip="${esc(r.label + ": " + (which === "first" ? "first " + p.text + ", latest " + other.text : "latest " + p.text + ", first " + other.text))}"><span class="dot"></span></span>`; };
    return `<figure class="chart wide" data-chart="marks">
      <figcaption><span class="c-title">First test against latest</span><span class="c-legend"><span class="k-first"></span>First <span class="k-last"></span>Latest</span></figcaption>
      <div class="c-plot cmp" role="img" aria-label="First and latest test scores for ${rows.length} skills, as percentages">
        <div class="cmp-axis" aria-hidden="true">${axis.map((g) => `<span style="left:${g}%">${g}%</span>`).join("")}</div>
        ${rows.map((r) => { const d = r.last.v - r.first.v; return `<div class="cmp-row"><div class="cmp-head"><span class="cmp-label">${esc(r.label)}</span><span class="cmp-delta">${d > 0 ? "+" : ""}${d} points</span></div>
          <div class="cmp-track">${axis.map((g) => `<span class="cmp-grid" style="left:${g}%"></span>`).join("")}<span class="cmp-link" style="left:${Math.min(r.first.v, r.last.v)}%;width:${Math.abs(d)}%"></span>${mark(r, "first")}${mark(r, "last")}</div></div>`; }).join("")}
        <div class="c-tip" hidden></div>
      </div>
      <details class="c-table"><summary>Show as a table</summary><div class="table-wrap"><table><thead><tr><th>Skill</th><th>First</th><th>Latest</th><th>Change</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${esc(r.first.text)}</td><td>${esc(r.last.text)}</td><td>${r.last.v - r.first.v > 0 ? "+" : ""}${r.last.v - r.first.v} points</td></tr>`).join("")}</tbody></table></div></details>
    </figure>`;
  }

  /* Activity over the last weeks: one cell per day, darker for more activity. counts: { "YYYY-MM-DD": n } */
  function calendar(counts, weeks, todayKey) {
    const cell = 14, gap = 3, L = 30, T = 18;
    const end = new Date(todayKey + "T00:00");
    const endIdx = (end.getDay() + 6) % 7;
    const start = new Date(end); start.setDate(end.getDate() - endIdx - (weeks - 1) * 7);
    const W = L + weeks * (cell + gap), H = T + 7 * (cell + gap);
    let s = ["Mon", "", "Wed", "", "Fri", "", "Sun"].map((d, i) => (d ? `<text x="0" y="${T + i * (cell + gap) + 11}" class="c-axis">${d}</text>` : "")).join("");
    let active = 0;
    const key = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    for (let w = 0; w < weeks; w++) {
      const first = new Date(start); first.setDate(start.getDate() + w * 7);
      if (first.getDate() <= 7) s += `<text x="${L + w * (cell + gap)}" y="11" class="c-axis">${first.toLocaleDateString(undefined, { month: "short" })}</text>`;
      for (let d = 0; d < 7; d++) {
        const day = new Date(start); day.setDate(start.getDate() + w * 7 + d);
        if (day > end) continue;
        const k = key(day), n = counts[k] || 0;
        if (n) active++;
        const lvl = n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3;
        const label = `${day.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}: ${n ? n + (n === 1 ? " activity" : " activities") : "no activity"}`;
        s += `<rect x="${L + w * (cell + gap)}" y="${T + d * (cell + gap)}" width="${cell}" height="${cell}" rx="3" class="c-day l${lvl}${k === todayKey ? " today" : ""}"><title>${label}</title></rect>`;
      }
    }
    return `<figure class="chart wide" data-chart="calendar">
      <figcaption><span class="c-title">Active days, last ${weeks} weeks</span><span class="c-sub">${active} active ${active === 1 ? "day" : "days"}</span></figcaption>
      <div class="c-plot cal"><svg viewBox="0 0 ${W} ${H}" style="max-width:${Math.round(W * 1.5)}px" role="img" aria-label="${active} active days in the last ${weeks} weeks">${s}</svg></div>
      <p class="c-legend small">Less <span class="k-day l0"></span><span class="k-day l1"></span><span class="k-day l2"></span><span class="k-day l3"></span> More</p>
    </figure>`;
  }

  function bind(root) {
    root.querySelectorAll('[data-chart="line"]').forEach((fig) => {
      const pts = JSON.parse(fig.dataset.points);
      const svg = fig.querySelector("svg"), tip = fig.querySelector(".c-tip");
      const cross = svg.querySelector(".c-cross"), dot = svg.querySelector(".c-hover");
      let cur = pts.length - 1;
      const show = (i) => {
        cur = Math.max(0, Math.min(pts.length - 1, i));
        const p = pts[cur];
        cross.setAttribute("x1", p.x); cross.setAttribute("x2", p.x); cross.setAttribute("visibility", "visible");
        dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("visibility", "visible");
        tip.textContent = "";
        const b = document.createElement("strong"); b.textContent = p.v + "%";
        const t = document.createElement("span"); t.textContent = " " + p.d + " · " + p.l;
        tip.append(b, t); tip.hidden = false;
        const box = svg.getBoundingClientRect(), scale = box.width / svg.viewBox.baseVal.width;
        const left = Math.max(0, Math.min(p.x * scale - tip.offsetWidth / 2, box.width - tip.offsetWidth));
        tip.style.left = left + "px"; tip.style.top = Math.max(0, p.y * scale - tip.offsetHeight - 12) + "px";
      };
      const hide = () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); };
      svg.addEventListener("pointermove", (e) => {
        const box = svg.getBoundingClientRect(), vx = ((e.clientX - box.left) / box.width) * svg.viewBox.baseVal.width;
        let best = 0; pts.forEach((p, i) => { if (Math.abs(p.x - vx) < Math.abs(pts[best].x - vx)) best = i; });
        show(best);
      });
      svg.addEventListener("pointerleave", hide);
      svg.addEventListener("focus", () => show(cur));
      svg.addEventListener("blur", hide);
      svg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); show(cur + (e.key === "ArrowRight" ? 1 : -1)); }
      });
    });
    root.querySelectorAll('[data-chart="marks"]').forEach((fig) => {
      const tip = fig.querySelector(".c-tip"), plot = fig.querySelector(".c-plot");
      fig.querySelectorAll(".c-mark").forEach((m) => {
        const on = () => {
          tip.textContent = m.dataset.tip; tip.hidden = false;
          const r = m.getBoundingClientRect(), pr = plot.getBoundingClientRect();
          tip.style.left = Math.max(0, Math.min(r.left - pr.left + r.width / 2 - tip.offsetWidth / 2, pr.width - tip.offsetWidth)) + "px";
          tip.style.top = Math.max(0, r.top - pr.top - tip.offsetHeight - 6) + "px";
          m.classList.add("on");
        };
        const off = () => { tip.hidden = true; m.classList.remove("on"); };
        m.addEventListener("pointerenter", on); m.addEventListener("pointerleave", off);
        m.addEventListener("focus", on); m.addEventListener("blur", off);
      });
    });
  }

  window.CHARTS = { line, compare, calendar, bind };
})();

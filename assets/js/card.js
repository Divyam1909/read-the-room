/* Read the Room: shareable results card and certificate, drawn on a canvas in the browser.
   Nothing is uploaded. Also used to produce the site's link-preview image. */

(function () {
  const W = 1200, H = 630;
  const INK = "#1E1B2E", VELVET = "#6A1F45", BRASS = "#D8AE5E", TEXT = "#F4F2F7", MUTED = "#B9B3CC";
  const SERIF = '"Bodoni Moda", "Bodoni 72", Didot, Georgia, serif';
  const SANS = '"Atkinson Hyperlegible", system-ui, "Segoe UI", sans-serif';

  async function fontsReady() {
    if (!document.fonts || !document.fonts.load) return;
    try { await Promise.all([document.fonts.load(`700 64px ${SERIF}`), document.fonts.load(`400 26px ${SANS}`), document.fonts.load(`700 26px ${SANS}`)]); } catch (e) { /* fall back to system fonts */ }
  }

  function wrap(ctx, text, x, y, maxW, lineH) {
    const words = String(text).split(/\s+/);
    let line = "", lines = 0;
    words.forEach((w) => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y + lines * lineH); lines++; line = w; }
      else line = test;
    });
    if (line) { ctx.fillText(line, x, y + lines * lineH); lines++; }
    return lines;
  }

  function frame(ctx) {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W - 120, 80, 40, W - 120, 80, 640);
    g.addColorStop(0, "rgba(106,31,69,0.85)"); g.addColorStop(1, "rgba(106,31,69,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(216,174,94,0.55)"; ctx.lineWidth = 2; ctx.strokeRect(28, 28, W - 56, H - 56);
    /* Eye mark */
    ctx.save(); ctx.translate(64, 62); ctx.scale(1.5, 1.5);
    ctx.strokeStyle = BRASS; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(2, 16); ctx.bezierCurveTo(6, 9, 11, 6, 16, 6); ctx.bezierCurveTo(21, 6, 26, 9, 30, 16); ctx.bezierCurveTo(26, 23, 21, 26, 16, 26); ctx.bezierCurveTo(11, 26, 6, 23, 2, 16); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = BRASS; ctx.beginPath(); ctx.arc(16, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = TEXT; ctx.font = `700 34px ${SERIF}`; ctx.textBaseline = "alphabetic";
    ctx.fillText("Read the Room", 128, 100);
  }

  function footer(ctx, url) {
    ctx.font = `700 24px ${SANS}`; ctx.fillStyle = BRASS; ctx.fillText(url, 64, H - 62);
    ctx.font = `400 22px ${SANS}`; ctx.fillStyle = MUTED; ctx.textAlign = "right";
    ctx.fillText("A free 12-week course in observation, memory and mentalism", W - 64, H - 62);
    ctx.textAlign = "left";
  }

  function tiles(ctx, stats, y, h) {
    h = h || 140;
    const n = stats.length; if (!n) return;
    const gap = 24, tw = (W - 128 - gap * (n - 1)) / n;
    stats.forEach((s, i) => {
      const x = 64 + i * (tw + gap);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; roundRect(ctx, x, y, tw, h, 14); ctx.fill();
      let size = 54;
      do { ctx.font = `700 ${size}px ${SERIF}`; size -= 2; } while (ctx.measureText(s.value).width > tw - 48 && size > 30);
      ctx.fillStyle = TEXT; ctx.fillText(fit(ctx, s.value, tw - 48), x + 24, y + 72);
      ctx.fillStyle = MUTED; ctx.font = `400 22px ${SANS}`; wrap(ctx, s.label, x + 24, y + 108, tw - 48, 26);
    });
  }
  function fit(ctx, text, maxW) { let t = String(text); while (ctx.measureText(t).width > maxW && t.length > 2) t = t.slice(0, -2) + "…"; return t; }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* d: { name, certificate, date, stats: [{ value, label }], url } */
  async function draw(canvas, d) {
    await fontsReady();
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    frame(ctx);
    if (d.og) {
      ctx.fillStyle = TEXT; ctx.font = `700 96px ${SERIF}`; ctx.fillText("Learn to read the room.", 64, 236);
      ctx.fillStyle = MUTED; ctx.font = `400 32px ${SANS}`;
      wrap(ctx, "Notice what others miss, remember what you see, read people honestly and perform mentalism, from scratch, in 12 weeks.", 64, 300, W - 160, 42);
      tiles(ctx, [{ value: "12", label: "weekly lessons, each with a research note" }, { value: "16", label: "interactive drills and quizzes" }, { value: "Free", label: "no account and no tracking" }], 376, 136);
    } else if (d.certificate) {
      ctx.fillStyle = BRASS; ctx.font = `700 24px ${SANS}`; ctx.fillText("CERTIFICATE OF COMPLETION", 64, 190);
      ctx.fillStyle = TEXT; ctx.font = `700 78px ${SERIF}`; ctx.fillText(fit(ctx, d.name || "This learner", W - 128), 64, 280);
      ctx.fillStyle = MUTED; ctx.font = `400 28px ${SANS}`;
      wrap(ctx, `passed all 12 weeks of tests in observation, memory, reading people and mentalism${d.date ? ", completed " + d.date : ""}.`, 64, 330, W - 128, 38);
      tiles(ctx, d.stats.slice(0, 4), 388);
    } else {
      ctx.fillStyle = TEXT; ctx.font = `700 70px ${SERIF}`;
      ctx.fillText(fit(ctx, d.name ? `${d.name}'s progress` : "My progress", W - 128), 64, 220);
      ctx.fillStyle = MUTED; ctx.font = `400 28px ${SANS}`; ctx.fillText(d.subtitle || "", 64, 270);
      tiles(ctx, d.stats.slice(0, 4), 330);
    }
    footer(ctx, d.url || "read-the-room-zeta.vercel.app");
    return canvas;
  }

  const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, "image/png"));

  window.CARD = { draw, toBlob };
})();

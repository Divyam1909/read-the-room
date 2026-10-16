/* Read the Room: illustrated faces.
   Faces are drawn from facial action units (AUs, from the Facial Action Coding System),
   so each expression is built from the same muscle movements the lessons describe.
   No photos, so there are no licensing or consent issues. */

(function () {
  const SKIN = ["#F6D8C4", "#EBC29F", "#D9A47D", "#BA7C52", "#8E5B3C", "#5F3B27"];
  const HAIR = ["#1C1612", "#3B2619", "#6B4529", "#A3532C", "#D8B169", "#9A9A9A"];
  const HAIR_NAMES = ["black", "dark brown", "brown", "auburn", "blonde", "grey"];
  const IRIS = ["#3D2A1E", "#5A3B22", "#2F5A7A", "#4E6B3A", "#6B6B6B"];
  const SHIRT = ["#2E4B7A", "#7A2E46", "#2F6B55", "#8A6A2A", "#4B3F72", "#9B4A2C", "#3D3D46", "#C9C3B6"];
  const STYLES = ["short", "side", "long", "bun", "curly", "bald", "buzz", "bob"];
  const SHAPES = ["oval", "round", "long", "square"];

  /* Expressions as action-unit intensities (0 to 1).
     u12 / u14 are one-sided (the person's left, viewer's right). */
  const EXPRESSIONS = {
    neutral: {},
    happiness: { 6: 1, 12: 1 },
    social: { 12: 0.85 },
    sadness: { 1: 1, 4: 0.45, 15: 1, 43: 0.5 },
    anger: { 4: 1, 5: 0.45, 7: 0.6, 23: 0.8, 24: 0.7 },
    fear: { 1: 1, 2: 1, 4: 0.7, 5: 1, 20: 1, 26: 0.35 },
    surprise: { 1: 1, 2: 1, 5: 0.8, 26: 1 },
    disgust: { 9: 1, 10: 0.9, 4: 0.4, 15: 0.3, 7: 0.3 },
    contempt: { u14: 1, u12: 0.45 },
    press: { 24: 1, 23: 0.4 },
    concentration: { 4: 0.7, 7: 0.4 }
  };

  const LABELS = {
    happiness: "Happiness", social: "Polite or social smile", sadness: "Sadness", anger: "Anger", fear: "Fear",
    surprise: "Surprise", disgust: "Disgust", contempt: "Contempt", neutral: "Neutral", press: "Lips pressed", concentration: "Concentration"
  };

  /* What to look for, in the same words as the week 6 lesson. */
  const CUES = {
    happiness: "Cheeks raised, crinkles at the outer eye corners, lip corners pulled up: a felt (Duchenne) smile.",
    social: "Lip corners up, but the cheeks and eyes have not changed. Without the eyes, a smile is more likely polite than felt.",
    sadness: "Inner corners of the brows raised, upper lids drooping, lip corners pulled down.",
    anger: "Brows lowered and pulled together, a hard stare, lips pressed tight.",
    fear: "Brows raised and pulled together, upper lids raised high, lips stretched sideways.",
    surprise: "Brows raised and curved, eyes wide, jaw dropped. The brows curve rather than pinch together.",
    disgust: "Nose wrinkled and upper lip raised.",
    contempt: "One lip corner tightened and raised, on one side of the face only.",
    neutral: "No muscle movement away from the resting face."
  };

  let uid = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function mix(hex, other, t) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = p(hex), b = p(other);
    return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  function randomIdentity() {
    const shape = pick(SHAPES), style = pick(STYLES);
    const beard = Math.random() < 0.3 ? pick(["stubble", "full", "moustache"]) : "none";
    return {
      skin: Math.floor(Math.random() * SKIN.length), hair: style, hairColor: Math.floor(Math.random() * HAIR.length),
      iris: Math.floor(Math.random() * IRIS.length), brow: 4 + Math.random() * 3.5, shape,
      glasses: Math.random() < 0.3 ? pick(["round", "square"]) : "none", beard,
      earrings: beard === "none" && Math.random() < 0.3, shirt: Math.floor(Math.random() * SHIRT.length),
      freckles: Math.random() < 0.18, mole: Math.random() < 0.2
    };
  }
  const signature = (p) => [p.skin, p.hair, p.hairColor, p.glasses, p.beard, p.earrings].join("|");

  /* A set of identities that differ from each other on at least two visible features. */
  function distinctIdentities(n) {
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < 5000) {
      const c = randomIdentity();
      const keys = ["skin", "hair", "hairColor", "glasses", "beard", "earrings", "shape"];
      const ok = out.every((o) => keys.filter((k) => o[k] !== c[k]).length >= 3 && signature(o) !== signature(c));
      if (ok) out.push(c);
    }
    while (out.length < n) out.push(randomIdentity());
    return out;
  }

  function describe(p) {
    const parts = [];
    if (p.hair === "bald") parts.push("bald"); else parts.push(HAIR_NAMES[p.hairColor] + " " + ({ short: "short hair", side: "side-swept hair", long: "long hair", bun: "hair in a bun", curly: "curly hair", buzz: "buzz cut", bob: "bob haircut" })[p.hair]);
    if (p.glasses !== "none") parts.push(p.glasses + " glasses");
    if (p.beard !== "none") parts.push(p.beard === "moustache" ? "moustache" : p.beard === "full" ? "beard" : "stubble");
    if (p.earrings) parts.push("earrings");
    return parts.join(", ");
  }

  /* Returns SVG markup (a <g>) for a face in a 200 x 240 box. */
  function group(p, expr, intensity, noBust) {
    const id = "f" + (++uid);
    const k = intensity == null ? 1 : intensity;
    const raw = typeof expr === "string" ? EXPRESSIONS[expr] || {} : expr || {};
    const a = (n) => clamp((raw[n] || 0) * k, 0, 1);
    const skin = SKIN[p.skin], line = mix(skin, "#140B07", p.skin > 3 ? 0.68 : 0.55), shade = mix(skin, "#2A1710", 0.18);
    const hair = HAIR[p.hairColor], lip = mix(mix(skin, "#B5485A", 0.45), "#2A1710", p.skin > 3 ? 0.25 : 0.05);
    const cx = 100, cy = 120;
    const jaw = a(26);
    const shapes = { oval: [60, 76], round: [65, 70], long: [56, 82], square: [63, 74] };
    const [rx, ry0] = shapes[p.shape] || shapes.oval; const ry = ry0 + jaw * 7;
    let s = "";

    /* Neck and shoulders */
    if (!noBust) s += `<path d="M18 240 C24 214 52 204 80 200 L120 200 C148 204 176 214 182 240 Z" fill="${SHIRT[p.shirt]}"/>`;
    s += `<path d="M82 170 L82 206 C92 214 108 214 118 206 L118 170 Z" fill="${shade}"/>`;

    /* Hair behind the head */
    if (p.hair === "long") s += `<path d="M${cx - rx - 8} 112 C${cx - rx - 14} 40 ${cx + rx + 14} 40 ${cx + rx + 8} 112 L${cx + rx + 12} 212 C${cx + 30} 222 ${cx - 30} 222 ${cx - rx - 12} 212 Z" fill="${hair}"/>`;
    if (p.hair === "bob") s += `<path d="M${cx - rx - 8} 112 C${cx - rx - 12} 40 ${cx + rx + 12} 40 ${cx + rx + 8} 112 L${cx + rx + 10} 170 C${cx + rx} 178 ${cx + rx - 10} 176 ${cx + rx - 14} 168 L${cx - rx + 14} 168 C${cx - rx + 10} 176 ${cx - rx} 178 ${cx - rx - 10} 170 Z" fill="${hair}"/>`;
    if (p.hair === "bun") s += `<circle cx="${cx}" cy="40" r="20" fill="${hair}"/>`;

    /* Ears and earrings */
    [-1, 1].forEach((d) => {
      s += `<ellipse cx="${cx + d * (rx - 1)}" cy="124" rx="9" ry="15" fill="${skin}" stroke="${shade}" stroke-width="1.5"/>`;
      if (p.earrings) s += `<circle cx="${cx + d * (rx - 1)}" cy="142" r="3.5" fill="#D8B45A" stroke="#8A6A22" stroke-width="1"/>`;
    });

    /* Face, with beard and skin marks clipped to it */
    const faceD = p.shape === "square"
      ? `M${cx - rx} ${cy - 30} C${cx - rx} ${cy - ry - 4} ${cx + rx} ${cy - ry - 4} ${cx + rx} ${cy - 30} L${cx + rx - 2} ${cy + ry - 34} C${cx + rx - 8} ${cy + ry - 4} ${cx + 22} ${cy + ry} ${cx} ${cy + ry} C${cx - 22} ${cy + ry} ${cx - rx + 8} ${cy + ry - 4} ${cx - rx + 2} ${cy + ry - 34} Z`
      : `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
    s += `<clipPath id="${id}f"><path d="${faceD}"/></clipPath><path d="${faceD}" fill="${skin}"/><g clip-path="url(#${id}f)">`;
    if (p.beard === "full") s += `<path d="M${cx - rx - 4} ${cy + 6} L${cx - rx - 4} ${cy + ry + 10} L${cx + rx + 4} ${cy + ry + 10} L${cx + rx + 4} ${cy + 6} C${cx + rx - 12} ${cy + 42} ${cx + 30} ${cy + 36} ${cx} ${cy + 36} C${cx - 30} ${cy + 36} ${cx - rx + 12} ${cy + 42} ${cx - rx - 4} ${cy + 6} Z" fill="${hair}" opacity=".92"/>`;
    if (p.beard === "stubble") s += `<path d="M${cx - rx - 4} ${cy + 14} L${cx - rx - 4} ${cy + ry + 10} L${cx + rx + 4} ${cy + ry + 10} L${cx + rx + 4} ${cy + 14} C${cx + 24} ${cy + 40} ${cx - 24} ${cy + 40} ${cx - rx - 4} ${cy + 14} Z" fill="${mix(hair, "#000000", 0.5)}" opacity=".2"/>`;
    if (p.freckles) [[-30, 140], [-24, 146], [-36, 146], [30, 140], [24, 146], [36, 146], [-28, 152], [28, 152]].forEach(([x, y]) => { s += `<circle cx="${cx + x}" cy="${y}" r="1.4" fill="${mix(skin, "#6B3A20", 0.5)}"/>`; });
    if (p.mole) s += `<circle cx="${cx + 30}" cy="164" r="2.2" fill="${mix(skin, "#2A1710", 0.6)}"/>`;
    s += `</g>`;

    /* Forehead lines (AU1, AU2) and brow furrows (AU4) */
    const lift = a(1) * 0.6 + a(2) * 0.4;
    if (lift > 0.35) {
      const span = 14 + 22 * a(2);
      [70, 79].forEach((y, i) => { s += `<path d="M${cx - span} ${y + 2} Q${cx} ${y - 4 - 4 * a(1)} ${cx + span} ${y + 2}" fill="none" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity="${(lift * (i ? 0.55 : 0.7)).toFixed(2)}"/>`; });
    }
    if (a(4) > 0.35) s += `<path d="M${cx - 4} 92 L${cx - 3} 104 M${cx + 4} 92 L${cx + 3} 104" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity="${(a(4) * 0.8).toFixed(2)}"/>`;
    if (a(9) > 0.3) s += `<path d="M${cx - 7} 112 Q${cx} 109 ${cx + 7} 112 M${cx - 6} 117 Q${cx} 114 ${cx + 6} 117 M${cx - 5} 122 Q${cx} 119.5 ${cx + 5} 122" fill="none" stroke="${line}" stroke-width="1.3" stroke-linecap="round" opacity="${(a(9) * 0.8).toFixed(2)}"/>`;

    /* Eyes */
    [-1, 1].forEach((d) => {
      const ex = cx + d * 25, ey = 116;
      const up = clamp(7 + 6 * a(5) - 3 * a(7) - 3.2 * a(43) - 1.2 * a(9), 2, 14);
      const lo = clamp(5 - 2.6 * a(6) - 2 * a(7) - 1 * a(9), 1.5, 7);
      const eye = `M${ex - 13} ${ey} Q${ex} ${ey - 2 * up} ${ex + 13} ${ey} Q${ex} ${ey + 2 * lo} ${ex - 13} ${ey} Z`;
      s += `<clipPath id="${id}e${d}"><path d="${eye}"/></clipPath>`;
      s += `<path d="${eye}" fill="#FBFAF7"/>`;
      s += `<g clip-path="url(#${id}e${d})"><circle cx="${ex}" cy="${ey + 0.5}" r="6" fill="${IRIS[p.iris]}"/><circle cx="${ex}" cy="${ey + 0.5}" r="2.6" fill="#120C0A"/><circle cx="${ex + 1.8}" cy="${ey - 1.6}" r="1.3" fill="#fff" opacity=".85"/></g>`;
      s += `<path d="M${ex - 13} ${ey} Q${ex} ${ey - 2 * up} ${ex + 13} ${ey}" fill="none" stroke="${line}" stroke-width="2.2" stroke-linecap="round"/>`;
      if (a(43) > 0.2) s += `<path d="M${ex - 12} ${ey - 4} Q${ex} ${ey - 2 * up - 5} ${ex + 12} ${ey - 4}" fill="none" stroke="${shade}" stroke-width="1.6" opacity="${a(43).toFixed(2)}"/>`;
      if (a(6) > 0.3 || a(7) > 0.3) s += `<path d="M${ex - 10} ${ey + 2 * lo + 3} Q${ex} ${ey + 2 * lo + 6} ${ex + 10} ${ey + 2 * lo + 3}" fill="none" stroke="${line}" stroke-width="1.2" opacity="${(Math.max(a(6), a(7)) * 0.7).toFixed(2)}"/>`;
      if (a(6) > 0.3) {
        const ox = ex + d * 15;
        s += `<path d="M${ox} ${ey - 4} l${d * 6} -3 M${ox + d} ${ey} l${d * 7} 0 M${ox} ${ey + 4} l${d * 6} 3" stroke="${line}" stroke-width="1.2" stroke-linecap="round" opacity="${(a(6) * 0.8).toFixed(2)}"/>`;
      }
      /* Glasses */
      if (p.glasses === "round") s += `<circle cx="${ex}" cy="${ey}" r="17" fill="none" stroke="#2B2522" stroke-width="2.6"/>`;
      if (p.glasses === "square") s += `<rect x="${ex - 18}" y="${ey - 13}" width="36" height="25" rx="5" fill="none" stroke="#2B2522" stroke-width="2.8"/>`;
    });
    if (p.glasses !== "none") s += `<path d="M${cx - 8} 113 Q${cx} 108 ${cx + 8} 113" fill="none" stroke="#2B2522" stroke-width="2.4"/><path d="M${cx - 42} 112 L${cx - rx + 2} 118 M${cx + 42} 112 L${cx + rx - 2} 118" stroke="#2B2522" stroke-width="2.4"/>`;

    /* Brows */
    [-1, 1].forEach((d) => {
      const ix = cx + d * (12 - 4 * a(4)), iy = 96 - 10 * a(1) + 7 * a(4) + 2 * a(9);
      const ox = cx + d * 42, oy = 98 - 9 * a(2) + 2 * a(4) + 1.5 * a(9);
      const arch = 4 + 5 * a(2) * (1 - a(4)) - 3 * a(4);
      const mx = cx + d * 28, my = (iy + oy) / 2 - arch;
      s += `<path d="M${ix} ${iy} Q${mx} ${my} ${ox} ${oy}" fill="none" stroke="${p.hair === "bald" ? HAIR[1] : hair}" stroke-width="${p.brow.toFixed(1)}" stroke-linecap="round"/>`;
    });

    /* Nose */
    const nUp = 3 * a(9) + 1.5 * a(10), nW = 2 * a(9);
    s += `<path d="M${cx - 2} 120 Q${cx - 5} 138 ${cx - 6} ${146 - nUp}" fill="none" stroke="${shade}" stroke-width="1.8" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 11 - nW} ${147 - nUp} Q${cx - 9} ${153 - nUp} ${cx} ${153 - nUp} Q${cx + 9} ${153 - nUp} ${cx + 11 + nW} ${147 - nUp}" fill="none" stroke="${line}" stroke-width="2" stroke-linecap="round"/>`;

    /* Nasolabial folds */
    const fold = Math.max(a(6) * 0.6 + a(12) * 0.5, a(10) * 0.9, a(9) * 0.6);
    if (fold > 0.35) [-1, 1].forEach((d) => { s += `<path d="M${cx + d * 15} ${150 - nUp} Q${cx + d * 26} ${160} ${cx + d * (24 + 4 * a(12))} ${176 - 5 * a(12)}" fill="none" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity="${(fold * 0.7).toFixed(2)}"/>`; });

    /* Mouth */
    const my = 172 + 2 * jaw;
    const u14 = a("u14"), u12 = a("u12");
    const hw = 21 + 4 * a(12) + 7 * a(20) - 4 * a(23) - 2 * a(24);
    const L = [cx - hw, my - 7 * a(12) + 5 * a(15) + 1.5 * a(20)];
    const R = [cx + hw + 2 * u14, my - 7 * a(12) + 5 * a(15) + 1.5 * a(20) - 4 * u14 - 6 * u12];
    const avg = (L[1] + R[1]) / 2;
    const seam = 2 * my - avg;
    const tu = 5 * (1 - 0.85 * a(24)) * (1 - 0.4 * a(23)) + 1.5 * a(10);
    const tl = 6.5 * (1 - 0.85 * a(24)) * (1 - 0.4 * a(23));
    const gapTop = 3.5 * a(10) + 2.5 * a(12) * a(6);
    const gapBot = 20 * jaw + 1.5 * a(12) * a(6) + 1 * a(20);
    const uI = seam - 2 * gapTop, lI = seam + 2 * gapBot;
    const uO = uI - 2 * tu, lO = lI + 2 * tl;
    const P = (pt) => pt[0].toFixed(1) + " " + pt[1].toFixed(1);
    s += `<path d="M${P(L)} Q${cx} ${uO} ${P(R)} Q${cx} ${lO} ${P(L)} Z" fill="${lip}"/>`;
    if (gapTop + gapBot > 0.6) {
      const cav = `M${P(L)} Q${cx} ${uI} ${P(R)} Q${cx} ${lI} ${P(L)} Z`;
      s += `<clipPath id="${id}m"><path d="${cav}"/></clipPath><path d="${cav}" fill="#3A1A20"/>`;
      s += `<g clip-path="url(#${id}m)"><path d="M${P(L)} Q${cx} ${uI} ${P(R)} L${R[0]} ${R[1] + 12} Q${cx} ${uI + 12} ${L[0]} ${L[1] + 12} Z" fill="#F4EFE6" transform="translate(0 ${-4 + Math.min(4, gapTop)})"/></g>`;
    } else {
      s += `<path d="M${P(L)} Q${cx} ${seam} ${P(R)}" fill="none" stroke="${mix(lip, "#2A1710", 0.5)}" stroke-width="${(1.6 + 1.2 * a(24)).toFixed(1)}" stroke-linecap="round"/>`;
    }
    if (u14 > 0.3) s += `<path d="M${R[0] + 3} ${R[1] - 4} q3 4 0 8" fill="none" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity="${(u14 * 0.8).toFixed(2)}"/>`;
    if (a(15) > 0.4) [-1, 1].forEach((d) => { s += `<path d="M${cx + d * (hw + 1)} ${my + 6} q${d * 2} 5 ${d * 1} 10" fill="none" stroke="${line}" stroke-width="1.2" opacity="${(a(15) * 0.5).toFixed(2)}"/>`; });

    /* Moustache */
    if (p.beard === "full" || p.beard === "moustache") s += `<path d="M${cx - hw - 4} ${Math.min(L[1], R[1]) - 2} C${cx - 14} ${uO - 14} ${cx + 14} ${uO - 14} ${cx + hw + 4} ${Math.min(L[1], R[1]) - 2} C${cx + 10} ${uO - 4} ${cx - 10} ${uO - 4} ${cx - hw - 4} ${Math.min(L[1], R[1]) - 2} Z" fill="${hair}"/>`;

    /* Hair in front */
    const top = cy - ry;
    if (p.hair === "buzz") s += `<path d="M${cx - rx + 2} 106 C${cx - rx} ${top - 6} ${cx + rx} ${top - 6} ${cx + rx - 2} 106 C${cx + rx - 8} 80 ${cx + 30} ${top + 18} ${cx} ${top + 18} C${cx - 30} ${top + 18} ${cx - rx + 8} 80 ${cx - rx + 2} 106 Z" fill="${hair}" opacity=".55"/>`;
    else if (p.hair === "bald") s += `<path d="M${cx - rx + 1} 122 C${cx - rx - 2} 100 ${cx - rx + 4} 92 ${cx - rx + 10} 88 L${cx - rx + 8} 120 Z M${cx + rx - 1} 122 C${cx + rx + 2} 100 ${cx + rx - 4} 92 ${cx + rx - 10} 88 L${cx + rx - 8} 120 Z" fill="${hair}" opacity=".7"/>`;
    else if (p.hair === "curly") {
      for (let i = 0; i <= 12; i++) {
        const t = Math.PI * (1 + i / 12), r = 9 + (i % 3);
        s += `<circle cx="${(cx + Math.cos(t) * (rx + 2)).toFixed(1)}" cy="${(108 + Math.sin(t) * (108 - top + 4)).toFixed(1)}" r="${r}" fill="${hair}"/>`;
      }
      s += `<path d="M${cx - rx - 2} 108 C${cx - rx} ${top - 8} ${cx + rx} ${top - 8} ${cx + rx + 2} 108 C${cx + rx - 10} 82 ${cx + 30} ${top + 22} ${cx} ${top + 22} C${cx - 30} ${top + 22} ${cx - rx + 10} 82 ${cx - rx - 2} 108 Z" fill="${hair}"/>`;
    } else if (p.hair === "side") s += `<path d="M${cx - rx - 3} 112 C${cx - rx - 6} ${top - 14} ${cx + rx + 6} ${top - 14} ${cx + rx + 3} 112 C${cx + rx - 4} 86 ${cx + rx - 14} ${top + 22} ${cx + 18} ${top + 20} C${cx - 10} ${top + 24} ${cx - 40} ${top + 34} ${cx - rx + 2} 104 Z" fill="${hair}"/>`;
    else s += `<path d="M${cx - rx - 3} 112 C${cx - rx - 6} ${top - 14} ${cx + rx + 6} ${top - 14} ${cx + rx + 3} 112 C${cx + rx - 6} 84 ${cx + 34} ${top + 20} ${cx} ${top + 22} C${cx - 34} ${top + 20} ${cx - rx + 6} 84 ${cx - rx - 3} 112 Z" fill="${hair}"/>`;

    return s;
  }

  function svg(p, expr, opts) {
    const o = opts || {};
    return `<svg class="${o.cls || "face"}" viewBox="0 0 200 240" role="img" aria-label="${o.label || "An illustrated face"}"${o.size ? ` width="${o.size}" height="${Math.round(o.size * 1.2)}"` : ""}>${group(p, expr, o.intensity)}</svg>`;
  }

  window.FACES = { svg, group, SKIN, SHIRT, mix, randomIdentity, distinctIdentities, describe, EXPRESSIONS, LABELS, CUES };
})();

# Read the Room

A free 12-week course in observation, memory, reading people and mentalism, inspired by Patrick Jane (*The Mentalist*) and real performers like Suhani Shah and Derren Brown.

## What's inside

- **12 weekly lessons** written from scratch, each with a "What the research says" note that separates solid findings from debated ones.
- **16 practice tools:** Kim's Game, spot the change (flicker task), wide view (useful field of view), word list, names, faces and names, numbers with the Major system, card order, baseline spotter, illustrated facial expressions with a micro-expression flash mode, a which-hand tracker that shows the odds of your score by luck, a pacing timer, and four scenario quizzes (biases, influence, expressions, cold reading) with 40 to 51 questions each.
- **Weekly tests and monthly exams**, scored automatically where possible.
- **Today dashboard** with daily streaks, today's tasks and the drill due next.
- **Progress tracker** with an activity calendar, before-and-after test comparisons, score charts for every drill, and a shareable results card or certificate made in the browser.
- **Performance mode:** script builder, teleprompter, show timer and an honest reading tracker.
- **Search** across lessons, research notes, tasks, tools and the library, plus a 60-term **glossary**.
- **Journal** for nightly notes and guesses.
- **Library** of the best books, free legal textbooks and courses, and videos.
- Light and dark themes, works on phones, keyboard accessible, no accounts and no tracking.

Progress is saved in the visitor's own browser (localStorage). Visitors can export and import a backup from the tracker page.

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Project structure

```
index.html              App shell
assets/css/styles.css   All styles (light and dark)
assets/js/content.js    Course content: weeks, lessons, tasks, tests, library, glossary
assets/js/banks.js      Quiz questions and drill data
assets/js/faces.js      Illustrated faces built from facial action units
assets/js/drills.js     Interactive drills
assets/js/charts.js     SVG and HTML charts for the tracker
assets/js/card.js       Share card, certificate and link-preview image (canvas)
assets/js/app.js        Routing, pages, storage, streaks, tracker, search, performance mode
assets/og.png           Link-preview image (made with card.js)
assets/favicon.svg      Icon
vercel.json             Vercel settings (static site)
```

## Editing the course

All lesson text lives in `assets/js/content.js`. Each week has `lessons`, `evidence`, `study` links, `tasks`, practice `tools` and a `test`. Quiz questions are in `assets/js/banks.js`; add items to any bank and they appear automatically. If a wrong option could also fit a scenario, list it in the item's `x` array so it is never offered as a distractor.

When you change any file in `assets`, bump the `?v=` number on its link in `index.html` so returning visitors get the new version.

## Deploy

See `DEPLOY.md` for GitHub and Vercel steps, plus a ready-made Claude Code prompt.

## Content and credits

Lessons are original. Books, courses and videos are linked to their creators and never copied. Before choosing a license for public release, decide whether you want others to reuse your content (for example MIT for the code and CC BY-NC 4.0 for the lesson text).

This course is for education and entertainment, not psychological, medical or legal advice.

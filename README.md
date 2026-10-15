# Read the Room

A free 12-week course in observation, memory, reading people and mentalism, inspired by Patrick Jane (*The Mentalist*) and real performers like Suhani Shah and Derren Brown.

## What's inside

- **12 weekly lessons** written from scratch, each with a "What the research says" note that separates solid findings from debated ones.
- **Interactive drills:** Kim's Game, word-list memory, names, card order, four scenario quizzes (biases, influence, facial expressions, cold reading) and a which-hand tracker that shows the odds of your score by luck.
- **Weekly tests and monthly exams**, scored automatically where possible.
- **Daily task checklists**, a **progress tracker**, and a **journal**.
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
assets/js/content.js    Course content: weeks, lessons, tasks, tests, library
assets/js/banks.js      Quiz questions and drill data
assets/js/drills.js     Interactive drills
assets/js/app.js        Routing, pages, storage, tracker, journal
assets/favicon.svg      Icon
vercel.json             Vercel settings (static site)
```

## Editing the course

All lesson text lives in `assets/js/content.js`. Each week has `lessons`, `evidence`, `study` links, `tasks`, practice `tools` and a `test`. Quiz questions are in `assets/js/banks.js`; add items to any bank and they appear automatically.

## Deploy

See `DEPLOY.md` for GitHub and Vercel steps, plus a ready-made Claude Code prompt.

## Content and credits

Lessons are original. Books, courses and videos are linked to their creators and never copied. Before choosing a license for public release, decide whether you want others to reuse your content (for example MIT for the code and CC BY-NC 4.0 for the lesson text).

This course is for education and entertainment, not psychological, medical or legal advice.

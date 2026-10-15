# Deploying Read the Room

This is a plain static site: no build step, no server, no database.

## Option A: do it yourself (about 5 minutes)

### 1. Put it on GitHub
1. Go to github.com and create a new repository, for example `read-the-room`. Leave it empty (no README).
2. On the new repository page, choose **uploading an existing file**.
3. Drag in **everything inside** this folder (`index.html`, `assets`, `README.md`, `DEPLOY.md`, `vercel.json`), keeping the `assets` folder structure.
4. Click **Commit changes**.

### 2. Deploy on Vercel
1. Go to vercel.com and sign in with GitHub.
2. Click **Add New**, then **Project**, and import your `read-the-room` repository.
3. Framework preset: **Other**. Leave the build command and output directory empty.
4. Click **Deploy**. You get a live link like `read-the-room.vercel.app`.

Every time you change a file on GitHub, Vercel redeploys automatically.

### Alternative: GitHub Pages
In the repository, open **Settings**, then **Pages**. Under **Source**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. Your site appears at `https://<your-username>.github.io/read-the-room/`.

## Option B: let Claude Code do it

Unzip this folder on your computer, open a terminal inside it, start Claude Code, and paste this prompt:

```
This folder is a finished static website called "Read the Room" (index.html plus an assets folder, no build step). Please deploy it for me:

1. Check that git, the GitHub CLI (gh) and the Vercel CLI are installed. If any are missing, tell me the exact install command for my operating system and wait for me to confirm before continuing.
2. Make sure I'm logged in: run `gh auth status` and `vercel whoami`. If not logged in, start the login flow (`gh auth login`, `vercel login`) and wait for me to finish it in the browser.
3. Serve the site locally (for example `npx serve .`), open it, and check there are no console errors on the home page, a week page (#/week/1), the tools page and the tracker. Fix any errors you find, and tell me what you changed.
4. Initialise a git repository if there isn't one, add a sensible .gitignore, and make a first commit with the message "Initial version of Read the Room".
5. Create a new public GitHub repository named read-the-room with `gh repo create read-the-room --public --source=. --push`.
6. Deploy to Vercel as a static site with no build command (`vercel --prod`), linked to that repository, project name read-the-room.
7. When done, give me the GitHub repository URL and the live Vercel URL, and explain how to update the site later (edit, commit, push).

Do not change the course content or design unless something is broken. Ask me before doing anything destructive.
```

## Before going public

- Read through every week once yourself.
- Ideally, ask someone with a psychology background to review the "What the research says" notes.
- Choose a license (see README.md).
- Optional: buy a domain and add it in Vercel under **Project**, **Settings**, **Domains**.

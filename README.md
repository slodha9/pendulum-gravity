# 🌌 Petrova Lab — Pendulum Gravity Experiment

A *Project Hail Mary*–themed interactive science experiment for your book club. Visitors
follow a guided pendulum experiment, time swings with a built-in stopwatch, record as many
trials as they like, optionally compare two string lengths, and calculate Earth's gravity
from `g = 4π²L / T²`.

It's a **static website** — just HTML, CSS, and JavaScript. No build step, no dependencies,
no server. That makes deployment extremely simple.

## Files

| File | What it is |
|------|------------|
| `index.html` | The whole page structure (intro → instructions → record → results) |
| `styles.css` | All styling (the spacecraft-console look) |
| `app.js` | Stopwatch, data tables, gravity math, results |
| `vercel.json` | Optional Vercel config (clean URLs) |
| `.gitignore` | Keeps junk out of your repo |

To preview locally, just open `index.html` in any browser. (Optionally, run a tiny local
server with `python3 -m http.server` and visit `http://localhost:8000`.)

---

# 🚀 Part 1 — Put it on GitHub

You can do this entirely in the browser — **no command line required.**

### Step 1. Create a new repository
1. Go to **https://github.com/new** (sign in if needed).
2. **Repository name**: something like `pendulum-gravity` or `book-club-pmh`.
3. Set it to **Public** (Vercel works with private too, but public is simplest).
4. Leave "Add a README" **unchecked** (you already have one).
5. Click **Create repository**.

### Step 2. Upload the files
1. On the new empty repo page, click the link **“uploading an existing file”**
   (or go to **Add file → Upload files**).
2. Drag **all of these files** into the upload area at once:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `vercel.json`
   - `README.md`
   - `.gitignore`
3. Scroll down and click **Commit changes**.

✅ Your code is now on GitHub. That's the whole first part.

> **Prefer the command line?** From inside the project folder:
> ```bash
> git init
> git add .
> git commit -m "Pendulum gravity experiment"
> git branch -M main
> git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
> git push -u origin main
> ```

---

# 🛰️ Part 2 — Deploy with Vercel

Because this is a static site, Vercel needs **zero configuration**. It will just serve your
files.

### Step 1. Import the project
1. Go to **https://vercel.com/new** (sign in with your GitHub account).
2. If this is your first time, Vercel will ask to **install/authorize the Vercel GitHub app** —
   approve it for the repository you just created (you can grant access to “All repositories”
   or just this one).
3. Find your repo in the **“Import Git Repository”** list and click **Import**.

### Step 2. Configure (there's nothing to configure)
On the configuration screen:
- **Framework Preset**: leave as **“Other”** (Vercel auto-detects a static site).
- **Root Directory**: leave as `./`.
- **Build Command**: leave **empty**.
- **Output Directory**: leave **empty** (defaults to the repo root, which is what we want).
- **Install Command**: leave empty.

Then click **Deploy**.

### Step 3. Done
After ~20 seconds you'll get a confetti screen and a live URL like:
```
https://your-repo-name.vercel.app
```
Click it — your experiment is live. Share that link with your book club. 🎉

### Updating the site later
Any time you push a change to GitHub (or upload a new file version via the GitHub web UI),
Vercel **automatically redeploys**. No extra steps.

---

## Optional: a custom name
In your Vercel project → **Settings → Domains**, you can rename the `.vercel.app` subdomain
(e.g. `hail-mary-bookclub.vercel.app`) or attach a custom domain you own.

## The science, briefly
A pendulum's period for small swings is `T = 2π√(L/g)`. Rearranging gives
`g = 4π²L / T²`. Timing **10 swings** and dividing by 10 reduces your reaction-time error
tenfold. With `L ≈ 1 m` and a period near `2 s`, you'll land close to **9.8 m/s²** — Earth's
gravity, measured with a shoelace and a key. Very Ryland Grace.

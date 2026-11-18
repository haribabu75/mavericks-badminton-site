# Mavericks Badminton Academy site

Static site (no build step), published with GitHub Pages from `main` at
https://haribabu75.github.io/mavericks-badminton-site/

## What is live
`/` is the V8 site (junior-coaching-first, dark theme, session finder, Juniors/Grown-ups switch).
Earlier versions (original by Chinthan, `/preview/` redesign) were removed from the served files on go-live;
they remain in git history (commit `b5e37d9` original, `c3db6ba` preview).

| File | Purpose |
|---|---|
| `index.html`, `css/`, `js/`, `images/` | The site (self-contained, relative paths only) |
| `tools/session-manager.html` | Members' session tool, linked from the footer only, `noindex` |
| `CNAME` | Custom domain `mavericks-badminton.com` (keep!) |
| `robots.txt`, `sitemap.xml` | Search engines |

## Preview locally
```bash
python3 -m http.server 3010   # from the repo root
```
Then open http://localhost:3010/. Hard refresh (Cmd+Shift+R) if a page looks old.

## Making changes
Edit, commit, push to `main`: GitHub Pages republishes in 1-2 minutes. Better: work on a branch, check it locally, then merge.

## V8 notes
- Name: Mavericks Badminton Academy (formerly Mavericks Badminton Club). Motto: Enjoy. Enable. Empower.
- Contacts: all numbers/links come from the `CONTACT` object at the top of `js/main.js`. Public email is hello@mavericks-badminton.com (forwards to mavericks.clubs@gmail.com via Namecheap). Visible phone is Priya's only (07404 671992). WhatsApp links use the club number but never display it.
- Sunday Mens session stopped (2026-11-18). Men play Friday 7-9pm; Mens membership £30/month, Fridays only.
- Themes: five themes in `css/style.css`, default `dark`. `?theme=name` in the URL previews others.
- Photos: put images in `images/photos/`, edit `photos.json`. Guide: `images/photos/README.txt`.
- Lisa Curtin: only "Elite England National Player" leading special sessions. Do not add titles/achievements not already on the site.
- Keep animation light; it respects reduced-motion.
- Junior fees are "ask us" on purpose (not published).

## Publishing rules
- `main` is the live site (mavericks-badminton.com).
- Work on a branch, preview locally, then merge.

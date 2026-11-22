# Mavericks Badminton Academy site

Static site (no build step), published with GitHub Pages from `main` at
https://haribabu75.github.io/mavericks-badminton-site/

## What is live
`/` is the V8 site (junior-coaching-first, dark theme, session finder, Juniors/Grown-ups switch).
Earlier versions (original by Chinthan, `/preview/` redesign) were removed from the served files on go-live;
they remain in git history (commit `b5e37d9` original, `c3db6ba` preview).

| File | Purpose |
|---|---|
| `index.html`, `css/`, `js/`, `images/` | The site (self-contained, relative paths only). `css/style.css` is the base; `css/refine.css` loads after it and holds the redesign (amber = junior, aqua = grown-up; Anton headlines, Figtree body) |
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
- Name: Mavericks Badminton Academy (formerly Mavericks Badminton Club). "Junior" is a programme ("Junior coaching"), never part of the brand name. Motto: Enjoy. Enable. Empower.
- Contacts: all numbers/links come from the `CONTACT` object at the top of `js/main.js`. Public email is hello@mavericks-badminton.com (forwards to mavericks.clubs@gmail.com via Namecheap). Visible phone is Priya's only (07404 671992). WhatsApp links use Priya's number (447404671992, same as the visible phone) and the number is never printed as WhatsApp.
- Sunday Mens session stopped (2026-11-18). Men play Friday 7-9pm; Mens membership £30/month, Fridays only.
- Themes: five themes in `css/style.css`, default `dark`. `?theme=name` in the URL previews others.
- Photos: put images in `images/photos/`, edit `photos.json`. Guide: `images/photos/README.txt`.
- Lisa Curtin leads only a few guest sessions per term (1 to 3), not regular sessions: always say "guest sessions", never "train with her" as if weekly. Also: only "Elite England National Player" leading special sessions. Do not add titles/achievements not already on the site.
- Keep animation light; it respects reduced-motion.
- Junior fees are "ask us" on purpose (not published).

## Publishing rules
- `main` is the live site (mavericks-badminton.com).
- Work on a branch, preview locally, then merge.

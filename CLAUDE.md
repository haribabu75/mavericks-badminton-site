# Mavericks Badminton Academy site

Static site (no build step), published with GitHub Pages from `main` at
https://haribabu75.github.io/mavericks-badminton-site/

## Three versions live side by side
| Path | What it is |
|---|---|
| `/` (`index.html`, `css/`, `js/`, `images/`, `tools/`) | Original Mavericks Club site |
| `/preview/` | Earlier "Mavericks Badminton Academy" redesign with a 3-tap session finder |
| `/v8/` | V8: junior-coaching-first, dark cinematic theme, scroll-driven court, session finder, Juniors/Grown-ups switch. Test version, has `noindex` |

Each version is self-contained and uses relative paths only. Do not make paths absolute (`/css/...`), or they break when served from a subfolder.

## Preview locally
```bash
python3 -m http.server 3010   # from the repo root
```
Then open `/`, `/preview/`, `/v8/`. Do a hard refresh (Cmd+Shift+R) if a page looks old.

## V8 notes (`v8/`)
- Name: Mavericks Badminton Academy. Motto: Enjoy. Enable. Empower.
- Contacts: all numbers/links come from the `CONTACT` object at the top of `v8/js/main.js`. Visible phone number is Priya's only (07404 671992), shown without a name. WhatsApp links use the club's existing number but never display it. No QR code.
- Sunday Mens session is intentionally removed. Friday mixed session includes men.
- Themes: five themes in `v8/css/style.css` driven by CSS variables. Default is `dark`
  (`<html data-theme="dark">`). `THEME_PICKER` at the top of `v8/js/main.js` is `false`
  (picker hidden); `?theme=name` in the URL still previews others.
- Photos: none yet. Put images in `v8/images/photos/`, then edit `photos.json`
  (named slots and a `gallery` array). Step-by-step guide: `v8/images/photos/README.txt`.
- Lisa Curtin is described only as "Elite England National Player" leading special sessions. Do not add titles or achievements that are not on the site already.
- Keep animation light: it pauses when the tab is hidden or offscreen and respects reduced-motion.

## Publishing rules
- Never push or merge to `main` without the owner's say-so; `main` is the live site.
- Work on a branch, preview locally, then merge.
- When V8 replaces the live site: remove the `noindex` meta in `v8/index.html`, and decide on the domain/CNAME (currently held until the domain switch).

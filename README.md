# Makgoba & Sons Plumbing — website

A single-page landing site built to the four specification documents in
`../website prompts/` and the brand guidelines in `../Design Brief/`.

Static HTML, CSS and JavaScript. No build step, no dependencies, no npm install.

---

## Running it

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8753 --directory website
```

Then visit <http://localhost:8753>.

Serving is preferred over opening the file directly, because the Google Maps
embed and the Google Fonts request behave more predictably over `http://`.

---

## Files

```
website/
├── index.html              Entire page: markup, copy and JSON-LD structured data
├── assets/
│   ├── css/styles.css      Design tokens and all styling
│   ├── js/main.js          Loader, nav, reveals, slider, lightbox, form
│   └── images/
│       ├── manifest.json   Source-to-export map with real pixel dimensions
│       ├── hero/ services/ about/ emergency/ process/
│       ├── projects/ testimonials/ cta/ backgrounds/ brand/
└── README.md
```

---

## Current status: client preview

The site is deployed as a **private-in-practice preview**, not a production
launch:

- Live preview: <https://raafinco-art.github.io/makgoba-and-sons-plumbing/>
- Repository: <https://github.com/raafinco-art/makgoba-and-sons-plumbing>

`index.html` carries `<meta name="robots" content="noindex, nofollow">`, so
search engines will not list the temporary `github.io` address. This matters for
two reasons: it stops the preview competing with the real domain later, and it
keeps the placeholder review content out of search results.

There is deliberately **no** `robots.txt` blocking crawlers. A `Disallow` rule
would stop Google reading the page at all, which means it would never see the
`noindex` instruction — the tag alone is the reliable method.

The repository is public, so treat the preview link as shareable-with-the-client
rather than secret. Anyone with the URL can view it.

---

## Going live

A checklist for moving from preview to production.

1. **Point the real domain at the host.** For GitHub Pages, add a `CNAME` file
   containing `www.makgobaandsonsplumbing.co.za` and set the DNS records, or
   redeploy the folder to Netlify, Vercel, Cloudflare Pages or cPanel hosting.
   There is nothing to compile — upload `website/` as-is.
2. **Remove the preview block** at the top of `<head>` in `index.html` and
   restore `<meta name="robots" content="index, follow">`.
3. **Confirm the production domain** is correct everywhere. If it differs from
   `https://www.makgobaandsonsplumbing.co.za/`, update:
   - the `<link rel="canonical">` tag
   - the four `og:` / `twitter:` meta tags
   - the JSON-LD block at the bottom of `index.html` (several `@id` and `url`
     values)
4. **Replace the placeholder reviews** — see the section below. Do not launch
   with the placeholder cards visible.
5. **Add the real operating hours** to the Contact section and the JSON-LD.
6. Submit the domain to Google Search Console and register a Google Business
   Profile — the structured data is already in place to support both.

---

## Before launch — items that need real information

These are deliberately unfinished because inventing the content would be
dishonest or would breach platform policy. Everything else is complete.

### 1. Customer reviews (required)

The Reviews section contains **three placeholder cards**, not fake reviews.
Publishing invented testimonials for a real business breaches Google and Meta
review policy, so real ones are needed.

To fill them in, edit each `.review-card` in the Reviews section of
`index.html`:

1. Replace the quote text, customer name and location with a real, verified
   review from the Facebook page or a Google Business profile.
2. Delete the `review-card--placeholder` class from the `<article>`.
3. Delete the `<span class="review-card__tag">` line.

Once three genuine reviews are published, star ratings and `Review` /
`AggregateRating` structured data can be added — do not add rating markup
before then.

### 2. Operating hours

The Contact section states that bookings are taken during business hours and
that emergency call-outs are arranged by phone. No specific times are claimed,
because none were supplied. Once confirmed, update the "Operating hours" row in
the Contact section and add an `openingHoursSpecification` block to the
`PlumbingBusiness` JSON-LD.

### 3. Physical address

The structured data and Contact section give the locality (Seshego, Polokwane,
Limpopo) but no street address, since none was available. If the business wants
to appear in Google Maps local results, add `streetAddress` and `postalCode` to
the `PostalAddress` in the JSON-LD, and register a Google Business Profile.

### 4. Before-and-after gallery

The animation specification asks for a before-and-after comparison slider. The
supplied photo set contains no matched before/after pairs, so the slider was
not built rather than faked with unrelated images. Once genuinely paired photos
exist (same camera position, same framing), the component can be added to the
Gallery section.

---

## How the quote form works

There is no server, so the form does not email anything. On submit it:

1. Validates every field and shows inline errors next to the field concerned.
2. Builds a formatted message and opens WhatsApp with it pre-filled, so the
   customer can review and send it.

The button is labelled "Send request on WhatsApp" and the helper text says so
explicitly — the visitor is never misled about what happens.

To switch to email delivery instead, replace the `form.addEventListener('submit', …)`
handler in `assets/js/main.js` with a `fetch()` to a form backend such as
Formspree, Netlify Forms or Web3Forms. The validation logic above it can stay
as it is.

---

## Images

All 27 approved photographs from `photos/Website phots/` are used, and every one
appears exactly once. Nothing from `photos/do not use for website/` is
referenced.

They were exported from the source PNGs to WebP at the delivery sizes set out in
the image usage guideline (hero and banners ~1600–1920px, gallery ~1000–1400px,
service cards ~1100px, portraits ~1200px tall). Total photographic payload is
about **2.4 MB**, down from roughly 56 MB of source PNGs.

Full-bleed banners also have `-mobile` variants, served through `<picture>` so
phones do not download desktop-sized files.

Filenames follow the guideline's lowercase-hyphen convention, and every
informative image carries descriptive alt text. Decorative images — the FAQ
valve backdrop and the footer pipework texture — use empty `alt` so screen
readers skip them.

To regenerate the exports after replacing a source photo, re-run the conversion
script (it reads from `photos/Website phots/` and writes into
`assets/images/`, refreshing `manifest.json` with real dimensions).

---

## Design decisions worth knowing

**The riser rail.** The vertical pipe down the left gutter on wide screens is
the site's signature element. Its water level tracks scroll position, and each
section branches off it with a pipe joint. It intentionally does three jobs the
brief listed separately — scroll progress indicator, section divider, and brand
motif — as one device rather than three competing ornaments.

It is anchored to the **centred content column**, not the viewport edge, and
only appears above 83rem where there is genuine room for it beside the content.
Below that a thin progress bar at the top of the viewport stands in. Anchoring
it to the viewport edge is what made the page look pushed to the left when
zoomed out: the rail and its branch lines stranded themselves in the far-left
margin while the content stayed centred.

**Mobile contact pills.** Call and WhatsApp sit in two floating pills at the
bottom of the screen below 60rem, visible from load rather than after a scroll
threshold — on a plumbing site the phone number is the product. The space they
occupy is reserved inside the footer, not on the body, so the dark footer runs
all the way to the bottom of the page.

**The chevron notch.** The team portrait is masked with a notch taken from the
angular "M" in the logo, tying the photography to the wordmark. It is used once,
deliberately, rather than applied to every image.

**Numbered process steps.** The 01–04 markers on the service process are used
because that section genuinely is a sequence. They are not repeated elsewhere as
decoration.

**Statistics.** Only figures that can be verified from the brief are shown:
9 services, 8 service areas, 3 sectors. No years of experience, job counts or
response times are claimed, because none were supplied and the specification
forbids invented numbers.

---

## Accessibility and performance

- Every text/background pair meets WCAG AA; most reach AAA. Footer links measure
  11.4:1 and hero copy 14.5:1 against their backgrounds.
- All interactive controls are at least 44px in the touch dimension, including
  the desktop navigation, which is also touch-operated on tablets from 960px up.
- Layout wrappers and the review carousel set `min-width: 0`. Grid and flex
  items otherwise refuse to shrink below their content's intrinsic minimum, and
  a nowrap flex row reports the *sum* of its children as that minimum. That is
  what made the whole page wider than a phone screen, causing the browser to
  shrink it to fit and leave the content sitting against the left edge. Do not
  remove those declarations.
- Verified from 320px to 1440px. The hero heading carries fixed line breaks for
  its mask reveal, so it cannot reflow; its size steps down at 360px and again
  at 320px to stay on three lines. Measured against the longest line rather than
  guessed.
- The type scale floors are lower than the typography guideline specifies
  (`2.5rem` rather than `2.75rem` for H1, `1.9rem` rather than `2.15rem` for H2).
  At 360px — the common entry-level Android width the animation spec calls out —
  the original minimums forced the hero heading to wrap to five lines and broke
  the reveal. Desktop sizes are unchanged.
- Full keyboard support with visible focus rings. The mobile drawer and the
  gallery lightbox trap focus while open and restore it on close.
- `prefers-reduced-motion: reduce` disables all animation and reveals content
  immediately.
- One `<h1>`, sequential heading order, labelled form fields, `role="alert"` on
  errors.
- Images carry explicit `width`/`height` to prevent layout shift, the hero is
  preloaded, and everything below the fold is lazy-loaded.

---

## Known trade-offs

**Page title length.** The `<title>` is the exact string specified in the SEO
document (78 characters). The same document also recommends 50–60 characters,
which that string exceeds — Google will truncate it in results. A shorter
alternative that keeps the primary keyword would be
`Plumber in Polokwane & Seshego | Makgoba & Sons Plumbing` (56 characters).
The specified string was kept; change it if the shorter one is preferred.

**Section headings.** The `<h2>` text uses the exact wording from the SEO
document, because those strings are its stated ranking targets. The typography
guideline separately advises against generic "Our …" headings. The compromise:
the keyword-bearing `<h2>` is kept, and the specific, direct language lives in
the supporting line beneath it.

**Business name.** The specification documents alternate between
"Makgoba & Son's Plumbing" and "Makgoba & Sons Plumbing". The logo artwork reads
**MAKGOBA & SONS** with no apostrophe, so that spelling is used throughout.

**Accordion animation.** The FAQ panels animate using `grid-template-rows`,
which needs a 2023-or-newer browser. On older browsers the panel opens
instantly instead of sliding — the content is always reachable.

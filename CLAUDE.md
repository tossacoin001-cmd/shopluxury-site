# CLAUDE.md — SHOPKYLUXURY Design System Rules

This document is the source of truth for any agent (Claude Code, Figma MCP, or human) working on this codebase. Read it fully before touching a file. The brand is a Lagos/New York luxury womenswear house — every decision must protect **aura, restraint, and boldness**.

---

## 1. Token Definitions

- **Location:** `assets/css/tokens.css` — the ONLY place colors, fonts, spacing, and motion values are defined.
- **Format:** Native CSS custom properties on `:root`, scoped by theme via `html[data-theme]`.
- **Themes:** Two first-class themes, both fully curated (never auto-derived):
  - `noir` (default) — espresso night `#15100c`, champagne gold `#c9a24b`, ivory text.
  - `ivoire` (light) — warm paper `#f6f0e4`, deepened gold `#9d7a2b` (darkened for WCAG contrast on light), espresso ink.
- **Semantic naming:** Components NEVER reference raw hex. They read semantic roles:

```css
--bg / --bg-elev        /* page base / raised panels */
--ink / --muted         /* primary / secondary text */
--accent / --accent-ink /* gold + the text color that sits ON gold */
--hot                   /* the single coral moment (pulse dot only) */
--line / --line-faint   /* borders at two intensities */
--tint                  /* accent wash backgrounds */
--silk-a/-b/-c          /* hero gradient stops, theme-aware */
--photo-shade           /* overlay on imagery — stays dark in BOTH themes for legibility */
```

- **Transformation rule:** Adding a color = adding it to BOTH theme blocks in `tokens.css`. A token defined in only one theme is a bug. There is no build-time token pipeline; the cascade is the pipeline.
- **The `--photo-shade` exception:** text over photography always sits on a dark scrim (`#f3ece1` text), in both themes. Do not "lighten" image overlays in ivoire — it breaks legibility and the editorial look.

## 2. Component Library

- **Location:** All components live as class patterns in `assets/css/main.css`, ordered top-of-file → bottom: base → preloader → nav → hero → marquee → edit tiles → product cards/rails → brand story → concierge → occasions → VIP invite → PDP → footer → WhatsApp float.
- **Architecture:** Class-based, BEM-lite (`.card`, `.card .ph`, `.card .meta`). No component framework yet — this is intentionally a zero-build static site so it deploys anywhere instantly. If migrating to React/Next later, each CSS block maps 1:1 to a component.
- **Key reusable patterns:**
  - `.btn` / `.btn.solid` / `.btn.wide` — pill CTAs. Solid = gold fill; default = gold outline. Hover always lifts `-2px`.
  - `.card` — product card (image 3/4, italic serif name, gold price).
  - `.tile` — category tile with dark gradient scrim + gold underline on hover.
  - `.reveal` — scroll-entrance (IntersectionObserver adds `.in`).
  - `.alt` on a `<section>` — elevated background band with gold hairlines.
- **Docs:** This file. No Storybook (overkill at this size).

## 3. Frameworks & Libraries

- **UI framework:** None — semantic HTML5 + vanilla JS (ES6). Keep it that way unless the client signs off on a platform migration (Next.js + Shopify Hydrogen is the intended v2 path; note it in PRs, don't start it unprompted).
- **Styling:** Plain CSS with custom properties. No Tailwind, no Sass — the cascade and tokens do the work.
- **Build/bundler:** None. Deploy the folder as-is (Netlify / Vercel / GitHub Pages / Cloudflare Pages all work with zero config).
- **Fonts:** Google Fonts via `<link>` — `Bodoni Moda` (display serif, the brand's voice) + `Jost` (UI sans). Never substitute. Never use Bodoni below 15px.

## 4. Asset Management

- **Location:** `assets/img/` for local assets. Currently product imagery hotlinks the client's existing WordPress uploads (`shopkyluxury.com/wp-content/uploads/...`) as placeholders — these are 300px thumbnails.
- **MIGRATION REQUIRED before launch:** replace every hotlinked URL with high-res originals in `assets/img/`, exported as WebP/AVIF at 1200w + 600w with `srcset`. Grep for `shopkyluxury.com/wp-content` to find them all.
- **Optimization rules:** `loading="lazy"` on everything below the fold; hero/PDP main image loads eager. Aspect ratios are locked in CSS (`aspect-ratio`) so layout never shifts while images load.
- **CDN:** none configured; host platform CDN (Vercel/Netlify edge) is sufficient at this scale.

## 5. Icon System

- **Location:** Inline SVG only (see the WhatsApp float in both pages). No icon font, no library.
- **Convention:** Decorative glyphs are typographic — `◆` separators, `✦` confirmations, `→` arrows, roman numerals `i.–iv.` in the concierge strip. This is a deliberate luxury-print choice; do not replace them with icon libraries (Lucide/FontAwesome would cheapen the look).
- **New icons:** inline `<svg viewBox="0 0 24 24" fill="currentColor">` so they inherit theme color automatically.

## 6. Styling Approach

- **Methodology:** Single global stylesheet + token sheet. Specificity stays flat (single class selectors, max one level of nesting like `.card .nm`). Never use `!important` outside the reduced-motion block.
- **Global styles:** Reset + base typography at the top of `main.css`. `::selection` is gold. Focus states use `:focus-visible` with a gold outline — do not remove.
- **Responsive:** Fluid-first. `clamp()` for type and spacing; named breakpoints at `920/900px` (grids collapse), `860px` (nav links hide), `560px` (single column). Mobile is the primary device for this audience — test 375px width first.
- **Theme switching:** `html[data-theme="noir|ivoire"]` set by `assets/js/theme.js`. Persistence: localStorage wrapped in try/catch (in-memory fallback for sandboxed previews). System `prefers-color-scheme` is the first-visit default. A `.theming` class on `<html>` cross-fades colors for 0.5s during a switch.
- **Theme invariants (the "unbroken in both" contract):**
  1. Every visible element must pass AA contrast in BOTH themes — `--accent` differs per theme for exactly this reason.
  2. Text over photos always uses the fixed light ivory + `--photo-shade` scrim.
  3. Never branch styles with `[data-theme=...]` selectors in `main.css`; if you need a theme-specific value, it belongs in `tokens.css` as a token.
- **Motion:** Slow and silky (`--ease`, 0.35–1.2s). One ambient animation per viewport max. `prefers-reduced-motion` kills everything — already wired; keep new animations inside that contract.

## 7. Project Structure

```
shopkyluxury-site/
├── CLAUDE.md            ← you are here — read before editing
├── README.md            ← human-facing: run, deploy, roadmap
├── .gitignore
├── index.html           ← homepage (hero, edit, drops rail, story, occasions, VIP)
├── shop.html            ← product listing (PLP) — filters + sort, shareable URLs
├── product.html         ← PDP shell — hydrated by pdp.js from ?id=<slug>
├── care.html            ← concierge hub (sizing, shipping, returns, FAQ, visit)
├── legal.html           ← privacy & terms
├── 404.html             ← branded not-found
├── sitemap.xml / robots.txt
├── lib/doll-core.js     ← Ask Doll server brain (Claude persona + catalog)
├── api/doll.js          ← Vercel serverless endpoint  → lib/doll-core
├── netlify/functions/doll.js + netlify.toml ← Netlify endpoint → lib/doll-core
└── assets/
    ├── css/
    │   ├── tokens.css   ← themes & primitives ONLY
    │   └── main.css     ← all component styles, token-driven
    ├── js/
    │   ├── theme.js     ← Noir/Ivoire engine (load in <head>, before paint)
    │   ├── products.js  ← THE CATALOG — single source of truth (window.KY)
    │   ├── cart.js      ← bag drawer + global currency + WhatsApp checkout
    │   ├── shop.js      ← PLP renderer + filters (shop.html only)
    │   ├── pdp.js       ← PDP renderer + Product JSON-LD (product.html only)
    │   ├── home.js      ← homepage rail + category counts (index.html only)
    │   ├── doll.js      ← Ask Doll concierge widget + local-brain fallback
    │   └── main.js      ← shared interactions; each block element-guarded
    └── img/             ← favicon.svg; product photos hotlink the brand CDN (see §4)
```

### Data layer — `assets/js/products.js` (read this before touching catalog code)

- Exposes one global namespace: `window.KY`.
- `KY.PRODUCTS` is the array of products. Each item:
  `{ id, name, price (USD int), cats[], occasions[], badge, sizes[], colors[], blurb, images[] }`.
  `images` is an array of galleries; each gallery is an array of `[width, "path"]`
  responsive variants. `KY.IMG` is prefixed to every path.
- Helpers: `KY.byId`, `KY.usd`/`KY.ngn`/`KY.money`, `KY.srcset`, `KY.src`, `KY.card`.
- Config knobs: `KY.RATE` (USD→NGN), `KY.WA` (WhatsApp number), `KY.IMG` (CDN base).
- **To add a product:** append one object to `KY.PRODUCTS` — it auto-appears on the
  homepage rail, the shop grid, and `product.html?id=<id>`. Do NOT hand-write product
  cards in HTML; they are rendered from this file.

### Bag + currency — `assets/js/cart.js`

- Bag persists in `localStorage` (`ky-bag`), currency in `ky-cur`; both fall back to
  in-memory in sandboxed previews (same try/catch contract as `theme.js`).
- Any element with `data-price="<usd-int>"` is repainted to the active currency on load
  and on toggle. Use this attribute for every price — never hardcode a formatted price.
- `data-open-bag` on any element opens the drawer; `[data-bag-count]` shows the count.
- Checkout builds a WhatsApp order to `KY.WA`. There is no payment gateway in v1 — keep
  it that way unless the client signs off (Paystack/Stripe is the v2 path).

### Ask Doll — AI concierge (`assets/js/doll.js` + `lib/doll-core.js`)

- A floating "Ask Doll" widget on every page. Doll is the house stylist persona —
  she greets with "Hey doll", matches the customer's tone, knows the brand voice
  and the live catalog, and hands off to WhatsApp for orders/complaints.
- **Two-tier brain, invisible fallback.** The client posts the conversation +
  catalog snapshot to `/api/doll` (Claude, via the serverless functions). If that
  call fails for ANY reason — missing `ANTHROPIC_API_KEY`, exhausted credits,
  network error, refusal, or a static host with no function — `doll.js` silently
  switches to a **local rule-based brain** (`localBrain`) that answers the common
  questions from `KY.PRODUCTS` and always offers WhatsApp. The customer never sees
  an error. Keep this contract: never surface a server failure to the UI.
- The persona/system prompt lives ONLY in `lib/doll-core.js` (server-side). The
  API key is never sent to the client. The client sends a catalog snapshot built
  from `KY.PRODUCTS` so the prompt always matches the live catalog.
- Brand-voice rules apply to Doll's replies too (see §Brand Voice). When editing
  the persona, edit `lib/doll-core.js`; when editing the offline answers, edit
  `localBrain` in `doll.js` — keep the two in the same voice.

- **Page pattern:** every page = `tokens.css` + `main.css` + `theme.js` in `<head>`;
  shared `nav` (with `.nav-toggle`, `.theme-switch`, `.cur-toggle`, `data-open-bag` bag),
  `.mobile-menu`, content, shared `footer`, gold `.wa` float; then scripts in this order
  before `</body>`: `products.js` → `cart.js` → `doll.js` → page renderer (`shop`/`pdp`/`home`) → `main.js`.
- **Adding a page:** copy `care.html` as the shell (cleanest nav/footer/menu), keep those
  blocks intact, write content with existing classes (`.page-wrap`, `.page-block`,
  `.prose`) before inventing new ones.

## Brand Voice Rules (copy is part of the design system)

- Short. Confident. Never explains itself. "When she's gone, she's gone."
- Lagos vernacular is a feature: *owambe, doll, soft life, aso-ebi*. Don't sanitize it.
- Products are women: italic serif names ("The *Ciara*"), referred to as "she."
- Never use: "high quality," "affordable," exclamation marks, or more than one emoji per page (current count: zero — keep it).

## Roadmap (agreed with client lead)

1. ✅ Homepage + PDP + theme system
2. ✅ Collection/PLP page with category + occasion filters (`shop.html`)
3. ✅ Data-driven catalog (`products.js`) — one source for home, shop, PDP
4. ✅ Persistent bag + WhatsApp checkout + global currency
5. ✅ Care/concierge, legal, 404 pages; sitemap, robots, JSON-LD, OG tags
6. ✅ Ask Doll — AI concierge (Claude via serverless) with local-brain fallback + WhatsApp handoff
6. ☐ Occasion landing pages with editorial headers (deep links work today via `?occasion=`)
7. ☐ Mirror product photography into `assets/img/` for CDN independence (§4)
8. ☐ Real checkout: Paystack (₦) + Stripe ($), or migrate to Shopify storefront
9. ☐ Wire VIP / Inner Circle form to an email provider (Klaviyo/Mailchimp)
10. ☐ CMS for Friday drops

# SHOPKYLUXURY — Luxury Storefront

Statement womenswear from Lagos to the world. A zero-build static storefront with a
data-driven catalog, persistent bag, WhatsApp checkout, two curated themes
(**Noir** dark / **Ivoire** light), and a token-driven design system.

## Run locally

No build step. Serve the folder (don't just open `index.html` from disk — the pages
fetch nothing, but `?id=` product routing and relative assets behave best over HTTP):

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## What's inside

| Path | Purpose |
|---|---|
| `index.html` | Homepage — hero, The Edit, Just Landed rail, brand story, occasions, VIP |
| `shop.html` | Product listing — category + occasion filters, sort, shareable URLs (`?cat=`, `?occasion=`, `?sort=`) |
| `product.html` | Dynamic product page — hydrated from `?id=<slug>` (gallery, sizes, colours, related, JSON-LD) |
| `care.html` | Concierge hub — size guide, shipping, returns, FAQ, contact, visit |
| `legal.html` | Privacy & terms |
| `404.html` | Branded not-found |
| `assets/js/products.js` | **The catalog** — single source of truth (18 products, prices, sizes, colours, images, copy) |
| `assets/js/cart.js` | Bag engine — drawer, localStorage, global currency, WhatsApp checkout |
| `assets/js/doll.js` | **Ask Doll** — AI concierge widget + local-brain fallback |
| `lib/doll-core.js` | Doll's server brain (Claude persona + catalog), shared by both functions |
| `api/doll.js` · `netlify/functions/doll.js` | Serverless endpoints for Doll (Vercel · Netlify) |
| `assets/js/shop.js` | Shop (PLP) renderer + filters |
| `assets/js/pdp.js` | Product page renderer + Product JSON-LD |
| `assets/js/home.js` | Homepage rail + category counts |
| `assets/js/theme.js` | Noir/Ivoire engine — persisted, system-aware, smooth cross-fade |
| `assets/js/main.js` | Shared interactions — preloader, reveals, marquee, mobile menu, VIP form |
| `assets/css/tokens.css` | The two themes. All colours live here and only here |
| `assets/css/main.css` | Every component, token-driven, unbroken in both themes |
| `sitemap.xml` / `robots.txt` | SEO |
| `CLAUDE.md` | **Design-system rules — read before editing anything** |

## How it works

- **One catalog drives everything.** Add or edit a product in `assets/js/products.js`
  and it appears on the homepage rail, the shop grid, and its own `product.html?id=<slug>`
  page automatically. Prices, sizes, colours and images all flow from there.
- **Bag + checkout.** Items persist in `localStorage`. Checkout opens a pre-filled
  WhatsApp order to the concierge (`+234 818 030 5391`) — no payment gateway needed for v1.
- **Currency.** A global `$ / ₦` toggle (in the nav) repaints every price in place
  and persists the choice. The USD→NGN rate refreshes live on load (cached 12h),
  falling back to `KY.RATE` in `products.js` if offline.
- **Ask Doll (AI concierge).** The floating "Ask Doll" button opens a chat with
  Doll, the house stylist. She greets with "Hey doll", knows the brand voice and
  the live catalog, recommends pieces, and answers shipping/sizing/returns. She
  runs on Claude via a serverless function (`/api/doll`) — and if that's
  unavailable (no key, out of credits, offline, or a static-only host), she
  **silently falls back to a local brand brain** so customers never see an error.
  WhatsApp handoff is always one tap away.
- **Script order matters:** `products.js` → `cart.js` → `doll.js` → (`shop.js` |
  `pdp.js` | `home.js`) → `main.js`. `theme.js` loads in `<head>` before paint.

## Turning on the AI (optional)

The storefront works fully without it — Doll falls back to her local brain. To
switch on the live Claude-powered concierge:

1. Get an API key from the [Anthropic Console](https://console.anthropic.com).
2. Set it as an environment variable on your host:
   - **Vercel:** Project → Settings → Environment Variables → `ANTHROPIC_API_KEY`.
     The `api/doll.js` function is picked up automatically.
   - **Netlify:** Site settings → Environment variables → `ANTHROPIC_API_KEY`.
     `netlify.toml` already routes `/api/doll` to the function.
3. *(Optional)* `DOLL_MODEL` to choose the model (default `claude-opus-4-8`; set
   `claude-haiku-4-5` for the lowest cost on a high-traffic store) and `DOLL_WA`
   to override the WhatsApp number.
4. Redeploy. No key in the client, ever — it lives only in the serverless function.

> GitHub Pages / Cloudflare Pages (static only) can't run the function — Doll
> still works there on her local brain. Use Vercel or Netlify for the live AI.

## Deploy (pick one — all zero-config)

- **Vercel:** `npx vercel` from the repo root
- **Netlify:** drag the folder into app.netlify.com, or `npx netlify deploy --prod`
- **GitHub Pages:** push, then Settings → Pages → deploy from `main` root
- **Cloudflare Pages:** connect the repo, framework preset "None"

## Push to Git

```bash
git init
git add .
git commit -m "feat: storefront — catalog, shop, dynamic PDP, bag + WhatsApp checkout"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Before launch (recommended)

1. **Phone/contacts:** verify the WhatsApp number (`KY.WA` in `products.js` and the
   `wa.me/2348180305391` links) and `hello@shopkyluxury.com`.
2. **Images (optional hardening):** product imagery currently loads full-resolution
   responsive variants from the brand CDN (`shopkyluxury.com/wp-content/uploads/...`).
   For full independence, mirror them into `assets/img/` and update `KY.IMG`.
3. **VIP form:** wire the Inner Circle form to an email provider (Klaviyo/Mailchimp).
4. **Domain:** update the absolute URLs in `sitemap.xml`, canonicals and OG tags if the
   production domain differs from `shopkyluxury.com`.
5. Run Lighthouse in both themes on a phone; both should stay ≥90.

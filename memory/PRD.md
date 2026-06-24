# Petals Atelier — Light-Luxury Floral Couture PRD

## Original Problem Statement
An ultra-premium, London-based florist e-commerce + bespoke atelier website.
Inspired by **Amarante London**, **Grace Floral Couture**, and **Neill Strain**.
**Light luxury** aesthetic — NOT dark. Airy, editorial, restrained.

Business verticals:
1. **Signature Bouquets** — luxury gift arrangements from £80
2. **Weddings** — bridal couture & ceremonial design
3. **Sympathy** — dignified, bespoke tributes
4. **Corporate** — weekly install programmes, launches, gala events
5. **House Installs** — private residence floral programmes
6. **Bespoke Portfolio** — gallery of past commissioned works with inquiry CTA

NOT targeting supermarket-tier gifting.

## User Personas
1. **Private Clients (London)** — ordering bouquets £80–£345 as gifts
2. **Brides & Couples** — bespoke wedding floristry £2,500+
3. **Bereaved Families** — dignified sympathy tributes
4. **Corporate Buyers** — hotels, members' clubs, luxury brand houses
5. **Private Residences** — weekly/fortnightly home installation programmes
6. **Bespoke Commissioners** — clients who've seen portfolio work and want a similar piece

## Architecture
- **Backend**: FastAPI + MongoDB (motor async)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Payment**: Stripe (test keys in pod)
- **Auth**: JWT-based

## Design System (v2 — Light Luxury)
- **Palette**: ivory `#FAFAF7` · white `#FFFFFF` · taupe `#B3A89B` · blush `#E8D8D0` · sage `#C4CFC0`
- **Ink**: `#1A1A1A` primary, `#7A7A7A` secondary
- **Typography**: Cormorant Garamond (headings, light italic), Montserrat (body, 200–500)
- **Layout**: Asymmetric, generous whitespace, full-bleed editorial imagery
- **Buttons**: Sharp corners, `btn-dark` (black) / `btn-outline-dark`
- **Accent label**: small uppercase with 0.22em tracking + thin-rule dash

## What's Been Implemented

### Send-flow refinements — Feb 2026 (latest)
- [x] **&ldquo;No card&rdquo; tile** in the card step — automatically skips the message step (progress bar adapts from 6 to 5 dots) and renders &ldquo;No card (flowers only)&rdquo; in the cart.
- [x] **Boxes are now admin-managed** — new `boxes` Mongo collection + endpoints (`GET /api/boxes` public, `POST/PUT/DELETE /api/admin/boxes`). Each box has `name`, `description`, `image_url`, `price`, **`bg_color`** (canvas surface for personalised), **`is_personalised`** (opens designer when chosen), `sort_order`, `active`. Idempotent seed at `POST /api/seed/boxes` (5 starting boxes: kraft, vase, personalised kraft, personalised ivory linen, personalised midnight black).
- [x] **New Admin → Boxes tab** — full CRUD with image preview, BG colour swatch picker, hex input, personalised toggle.
- [x] **Designer responsive** — Konva stage now scales to its container via `ResizeObserver`; no more overlap with the right-hand inspector panel on smaller laptops.
- [x] **Designer canvas BG inherits the chosen box** — `initialBg` is taken from `box.bg_color`, so each personalised box opens with the right base colour (kraft, ivory, midnight, etc.). Customer can still override via the BG colour swatches.
- [x] **Cart line now displays the full send-flow** via new `<SendFlowSummary />` component — card thumbnail + name, message, delivery date, box (with PERSONALISED badge if applicable), saved box design preview image, full add-ons list with prices.
- [x] **Cart order summary** now shows separate **Bouquets / Box &amp; add-ons / Delivery** rows; total reflects all extras.

### Phase 3 — Personalised box designer — Feb 2026
- [x] **Full HTML5 canvas designer** (`<BoxDesigner />`) using **react-konva + konva**: drag/drop, multi-select with rotation + corner-handle resize, multiple text layers, multi-photo upload.
- [x] **Six luxury fonts** (Cormorant, Inter, Playfair, Dancing Script, Courier, Georgia) selectable per text layer.
- [x] **Text + background colour pickers** (8 swatches each), live font-size slider (14–160 px), undo, delete.
- [x] **Photo upload** — backend `POST /api/uploads/image` accepts JPG/PNG/WEBP/GIF (max 6 MB), saves under `/app/backend/uploads`, served via static-mounted `/api/uploads/<file>`.
- [x] **Save flow** — Konva stage exported to JPEG via `toDataURL()`, uploaded, returns a public URL. Preview stored in `send_flow.box_design.preview_url` and shown on Step 4 + Step 6 (Review).
- [x] **+£9.99 pricing** — automatically added when "Personalised box" is selected. Step 4 blocks Continue until a design has been saved.
- [x] Pre-existing `box_design_url` field on `OrderCreate` will receive the design URL at checkout.

### Phase 2 — Bloom & Wild product pages — Feb 2026
- [x] **Extended `Product` model** with `media: List[{type, url, thumbnail?, source?}]` (image / video — direct, YouTube or Vimeo) and `is_bouquet: bool` flag.
- [x] **Sticky media gallery** (`<MediaGallery />`) — left thumbnail rail (4–5 items) + main viewer; supports image, direct video, YouTube/Vimeo embeds; falls back to legacy `images` array.
- [x] **B&W-style ProductDetailPage rewrite** — split layout with sticky gallery left + product info right (title, price, description, "Earliest delivery" callout, "Send this bouquet" CTA, inline WhatsApp link).
- [x] **6-step Send Flow modal** (`<SendFlow />`): Pick card → write message → pick delivery date (uses `/api/delivery/options`) → choose box (kraft / glass vase +£12 / personalised +£9.99 — Designer placeholder for Phase 3) → optional add-ons (Treats, Candles, Jewellery boxes) → Review with itemised total. Adds a single line item to cart with the entire send-flow payload attached as metadata.
- [x] **Cards collection** (`/api/cards`, admin CRUD `/api/admin/cards`). Seeded 10 default cards.
- [x] **Add-ons collection** (`/api/addons[?sub_type=]`, admin CRUD `/api/admin/addons`) with three sub-types: `treat` (8 seeded — teddies + chocolates + drinks), `candle` (20 seeded — Atelier No. 01–20 fragrance line), `jewellery_box` (6 seeded). Idempotent seed at `POST /api/seed/cards-addons`.
- [x] **Admin tabs**: new `Cards` and `Add-ons` tabs in `/admin` with grid CRUD, sub-type filter pills, image preview, active/hidden toggle, sort order, edit-modal.
- [x] **OrderCreate extended** with `card_id`, `card_message`, `box_choice`, `box_design_url` (for Phase 3 designer), `addon_ids`.
- [x] Pixel `InitiateCheckout` and `AddToCart` events fired from the send flow.

### Phase 1 — SEO + Pixels + Delivery rules — Feb 2026
- [x] **Per-page SEO** — `seo_pages` Mongo collection + `GET /api/seo?path=` (public, with merged defaults), `GET/PUT/DELETE /api/admin/seo`. Frontend uses **react-helmet-async** via new `<SEOHead />` component (mounts on every route change, fetches & caches per-path meta, emits title/description/keywords/canonical/OG/Twitter cards/JSON-LD).
- [x] **Admin SEO tab** in `/admin` — table of all 14 preset routes (Home, Collection, Weddings, Traveller W/F, Faith, Sympathy, Corporate, House Installs, Shop Front, In-Shop, Film/TV, Portfolio, Consultation), edit dialog with title/description/keywords/OG image/canonical/robots fields + char counters.
- [x] **SEO defaults** in Settings (site name + default title/description/OG image) applied as fallback when a route isn't individually customised.
- [x] **Tracking pixels** — Meta Pixel, GA4 and (optional) GTM IDs editable in Admin → Settings. New `<Pixels />` component injects scripts after consent and fires `PageView`/`page_view` on every SPA route change. Helper `trackEvent(name, params)` exported for custom events.
- [x] **UK GDPR cookie consent banner** (`<CookieConsent />`) — Accept all / Essential only, persisted in localStorage; pixels held until accepted when `cookie_consent_required` is on.
- [x] **Delivery calendar admin** — `delivery_min_lead_days` (default 4), `delivery_blocked_weekdays` (Mon–Sun toggle, default Sun), `delivery_blocked_dates` (one-off date list e.g. 25/26 Dec), `delivery_window_days` (default 28). Both `GET /api/delivery/options` and `POST /api/orders` validate against these rules.
- [x] Static `<title>`/`<meta description>` removed from `public/index.html` so Helmet has full control (no duplicates).
- [x] New `/privacy` route with UK-GDPR-compliant copy referenced by the cookie banner.

### Site Settings (CMS-lite) — Feb 2026
- [x] `site_settings` Mongo collection (singleton). `GET /api/settings` (public), `PUT /api/settings` (admin).
- [x] Header utility bar: removed hardcoded delivery copy; admin-editable text + show/hide toggle.
- [x] Floating WhatsApp button on every public page; admin-controlled number, message, visibility.

### Light-Luxury Overhaul — Feb 2026
- [x] Complete theme pivot: dark → light luxury (global CSS, all pages, Header, Footer, ProductCard)
- [x] New typography stack: Cormorant Garamond + Montserrat
- [x] Editorial asymmetric hero on Homepage, Weddings, Sympathy, Corporate, House Installs
- [x] Three **new** pages: `/corporate`, `/house-installs`, `/portfolio`
- [x] Bespoke Portfolio gallery — masonry layout, category filters (All/Weddings/Sympathy/Corporate/House/Window), lightbox dialog with "Enquire a similar piece" CTA
- [x] Consultation form now posts to `POST /api/inquiries`, supports prefill via `?service=&portfolio_item_id=&ref_title=`
- [x] Shadcn Calendar + Popover used for Event Date picker (brand-consistent)
- [x] Header nav expanded to 6 sections: Shop / Weddings / Sympathy / Corporate / House Installs / Portfolio
- [x] Admin dashboard got new **Inquiries** tab

### Backend (Feb 2026)
- [x] New collection `portfolio` with 9 seeded items across 5 categories
- [x] New collection `inquiries`
- [x] New endpoints: `GET /api/portfolio` (+ `category` filter), `GET /api/portfolio/{id}`, `POST /api/inquiries`, `GET /api/admin/inquiries`
- [x] Versioned seed (`v2-light-luxury`) — idempotent, supports `?reset=true`
- [x] Re-seeded catalog with £80+ light-aesthetic imagery and products (8 products)

### Retained from v1
- [x] Box personalization (colour, ribbon, 50-char message)
- [x] Delivery date logic: min 2 days, no Sunday, Saturday £8.99 / standard £5.99, free over £50
- [x] Stripe checkout + webhook
- [x] JWT auth, admin dashboard
- [x] Categories (+ product_count), product CRUD (admin), order management

## Products (all £80+)
- The Mayfair — £185 (up to £325)
- Eternal Ivory — £125 (up to £235)
- The Belgravia Bride — £245 (up to £340)
- Quiet Grace — £165 (up to £310)
- Rose Couture 100 Stem — £345 (50 / 100 / 150 stem)
- Phalaenopsis Atelier — £195 (up to £355)
- Jardin de Provence — £135 (up to £195)
- Celebration Blush — £115 (up to £225)

## Portfolio Items (9 seeded)
Weddings · Sympathy · Corporate · House · Shop-window — with image, description, location, price_from, tags.

## API — Key Endpoints
- `GET /api/settings` (public) — returns utility_bar_text, utility_bar_enabled, whatsapp_number, whatsapp_enabled, whatsapp_default_message
- `PUT /api/settings` (admin) — update site settings
- `POST /api/seed?reset=true` — force re-seed to v2-light-luxury
- `GET /api/portfolio[?category=wedding|sympathy|corporate|house|shop]`
- `POST /api/inquiries`
- `GET /api/admin/inquiries` (admin only)
- `GET /api/delivery/options` — returns valid dates + box personalization options
- `POST /api/orders` — validates delivery date, applies Saturday premium

## Test Credentials
- **Admin**: admin@petalsatelier.com / admin123

## Testing
- `iteration_5.json` — 26/26 pytest backend + 100% critical frontend flows
- Pytest at `/app/backend/tests/backend_test.py`

## Next Tasks (P1)
1. **Cart / checkout / order rendering** — surface the new send-flow payload (card preview, message, addons list, box design preview) in the cart row, order confirmation page and admin order detail. Currently flowing through `box_personalization.send_flow` metadata but not yet displayed downstream.
2. **Product media editor in admin** — currently media is added via API; surface a UI inside the existing Products tab to add/reorder media items and toggle `is_bouquet`.
3. CMS layer extension: make service-page wording &amp; tier pricing admin-editable via `page_content` collection.
4. Admin UI for Portfolio item CRUD.
5. Replace legacy stock imagery on service pages with commissioned photography.
6. **Workshop reminder email** — 48h before workshop send Resend/SendGrid email with studio address + parking.

## Backlog (P2)
1. Instagram feed integration
2. Customer testimonials with photos
3. Blog / Inspiration section
4. Typed `DeliveryAddress` sub-model in backend
5. Break `server.py` (now 2,700+ lines) into routers (auth, products, portfolio, orders, workshops, admin)
6. Pet Sympathy / Memorial vertical pages
7. Memorial Anniversaries (recurring annual commissions)
8. Seasonal pre-order drops (Valentine's, Mother's Day)

## Changelog
### 2026-06-24 (later) — Workshop booking modes: direct vs enquire (+ venue partners)
- **`booking_mode` flag on workshops**: `"direct"` (current Stripe deposit/full flow) or `"enquire"` (WhatsApp + lead form, no Stripe, no sessions).
- **Care Homes** workshop migrated to `enquire` mode (bespoke pricing per resident).
- **New programme** "Flower Workshop Nights for Pubs & Social Clubs" — `enquire` mode, with a venue sales pitch (per-head fee to us, venue keeps 100% of bar/food/door, midweek footfall, free socials promotion). Commercial bullets + venue-types are admin-editable.
- **Workshops page redesign**: cards now split into "Book a date" (direct) and "Host at your venue" (enquire), with a 4-tile Why-host strip (Per head / Bar / Midweek / Promotion) and a venue-types row.
- **WorkshopEnquireModal** — WhatsApp deep link (pre-filled per workshop) + lead form POSTing to `/api/inquiries` with `service_type="workshop_host"`. Captures venue name, target date and expected guests beyond the standard contact fields.
- **WorkshopDetailPage** branches by mode — enquire variant hides session list, swaps the price for "Bespoke", and ends with a dark WhatsApp + Send-a-brief CTA strip.
- **Admin** — new `booking_mode` radio with conditionally-rendered enquire fields (pitch, commercial bullets, venue list, WhatsApp pre-filled message).
- Tested: pytest 26/26 + frontend Playwright (`iteration_7.json`).

### 2026-06-24 — Workshops Booking Funnel + Box Designer UX
- **Workshops** (Phase 4): admin-managed `workshops` (programmes) + dated `workshop_sessions` collections; customer hybrid layout (`/workshops` list + `/workshops/:slug` detail). 2-step booking modal (date → details + payment).
  - Payment options via Stripe: **deposit** or **pay-in-full with 5% off**. Cancellation policy: deposits non-refundable; balance collected on the day (not via Stripe).
  - Customer fields collected: name, email, phone, guests, dietary_requirements, notes.
  - Spots-booked counter increments on Stripe-paid (status endpoint + webhook).
  - New endpoints: `GET /api/workshops`, `GET /api/workshops/{slug}`, `GET /api/workshops/{slug}/sessions`, `POST /api/workshop-bookings`, `POST /api/workshop-checkout/session`, `GET /api/workshop-checkout/status/{session_id}`, full admin CRUD under `/api/admin/workshops*`, `POST /api/seed/workshops`.
  - Seeded programmes: Christmas Door Wreath (£95), Halloween Wreath (£75), Care-Home Bouquet sessions (£18/resident).
  - Admin: new Workshops tab with Programmes/Sessions/Bookings sub-tabs.
- **Box Designer**: (1) double-click any text layer (or tap "Edit on canvas") to rewrite it via an inline textarea overlay; (2) layer-arrange controls in the inspector — Bring to Front / Forward / Backward / Send to Back.
- Tested: pytest 21/21 + frontend Playwright e2e (`iteration_6.json`).

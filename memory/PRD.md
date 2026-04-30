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
1. Replace legacy stock imagery on some pages with commissioned photography
2. Seed a paid demo order so Admin Revenue shows non-zero
3. Admin UI to manage portfolio items (currently seed-only)

## Backlog (P2)
1. Instagram feed integration
2. Customer testimonials with photos
3. Blog / Inspiration section
4. Typed `DeliveryAddress` sub-model in backend
5. Break `server.py` (1,100+ lines) into routers (auth, products, portfolio, orders, admin)

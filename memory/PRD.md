# Petals Atelier - Luxury Floristry PRD

## Original Problem Statement
Pivot from budget florist to premium luxury floristry brand targeting:
1. **Wedding Floristry** - Bridal bouquets, venue decoration, full wedding packages
2. **Sympathy & Funeral Tributes** - Elegant funeral arrangements and wreaths
3. **Luxury Gift Bouquets** - Premium arrangements £80+ for spoiling recipients

NOT targeting cheap budget flowers - "people who want cheap can go to supermarkets"
Inspired by https://www.thegravesendflorist.co.uk/ - award-winning, bespoke service

## User Personas
1. **Wedding Couples** - Planning luxury weddings, want bespoke floristry
2. **Bereaved Families** - Need dignified, beautiful funeral tributes
3. **Gift Givers** - Want to truly spoil someone with premium arrangements (not cheap supermarket flowers)
4. **Corporate Clients** - Events and regular luxury floral displays

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS
- **Design**: Dark luxury theme (#0B0C0B), Gold accents (#C5A059), Playfair Display typography
- **Payment**: Stripe integration

## What's Been Implemented (April 8, 2026)

### Complete Rebrand
- [x] New brand identity: "Petals Atelier"
- [x] Dark luxury theme with gold (#C5A059) accents
- [x] Playfair Display (headings) + Manrope (body) typography
- [x] Full-screen hero with dramatic floral imagery

### New Pages
- [x] **Homepage** - Luxury hero, services showcase, testimonials
- [x] **Collection** - Premium products with category filtering
- [x] **Weddings** - Wedding services, process steps, consultation CTA
- [x] **Sympathy** - Funeral tributes, compassionate approach, tribute types
- [x] **Consultation** - Inquiry form for bespoke orders

### Products (All £80+)
- The Grand Gesture - £185 (up to £305)
- Eternal Elegance - £125 (up to £210)
- Bridal Dreams Bouquet - £195 (up to £270)
- Peaceful Remembrance - £145 (up to £240)
- Centenary Rose Collection - £295 (50-150 roses)
- Orchid Majesty - £165 (up to £285)
- Midnight Garden - £135 (up to £190)
- Celebration Luxe - £95 (up to £185)

### Retained Features
- [x] Box personalization (color, ribbon, message)
- [x] Delivery date selection (min 2 days, no Sundays)
- [x] Saturday premium delivery (£8.99 vs £5.99)
- [x] Shopping cart and Stripe checkout
- [x] User accounts and order history
- [x] Admin dashboard

## Test Credentials
- **Admin**: admin@petalsatelier.com / admin123

## Next Tasks
1. Add gallery of past work (weddings, events)
2. Integrate inquiry emails for consultation requests
3. Add blog/inspiration section
4. Customer testimonials with photos

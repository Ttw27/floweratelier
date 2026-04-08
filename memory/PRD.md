# Petals Online - Florist E-Commerce Platform PRD

## Original Problem Statement
Build an online florist website inspired by Bloom & Wild, Bunches, and Prestige Flowers with:
- Product catalog with flower arrangements
- Shopping cart & checkout
- Delivery date selection
- User accounts/order history
- Subscription/recurring flower deliveries
- Gift messages with orders
- Occasion-based categories (Birthday, Anniversary, Sympathy, etc.)
- Admin functionality to manage products/orders
- Stripe payment integration

## Architecture

### Backend (FastAPI + MongoDB)
- **Authentication**: JWT-based with bcrypt password hashing
- **Database Collections**: users, products, categories, carts, orders, subscriptions, payment_transactions
- **Payment**: Stripe integration via emergentintegrations library

### Frontend (React + Tailwind CSS)
- **UI Components**: Shadcn UI with custom styling
- **State Management**: React Context (Auth, Cart)
- **Routing**: React Router DOM

## User Personas
1. **Customer**: Browse products, add to cart, checkout, manage orders
2. **Subscriber**: Set up recurring flower deliveries
3. **Admin**: Manage products, view/update orders, see dashboard stats

## Core Requirements (Static)
- Product catalog with categories and filters
- Shopping cart with quantity management
- Checkout with delivery date picker
- User authentication (register/login)
- Order history for logged-in users
- Subscription management
- Admin dashboard

## What's Been Implemented (April 8, 2026)

### Backend
- [x] User authentication (register, login, JWT tokens)
- [x] Product CRUD endpoints
- [x] Category management
- [x] Cart management (add, update, remove, gift message)
- [x] Order creation and management
- [x] Subscription plans and management
- [x] Stripe checkout integration
- [x] Admin stats and order management endpoints
- [x] Seed data for initial products/categories
- [x] **NEW: Delivery date restrictions (min 2 days, no Sundays)**
- [x] **NEW: Saturday premium delivery (£8.99 vs £5.99 standard)**
- [x] **NEW: Box personalization options API**

### Frontend
- [x] Homepage with hero, categories, featured products
- [x] Product catalog with category filters and sorting
- [x] Product detail page with size selection
- [x] Shopping cart with quantity controls and gift message
- [x] Checkout with delivery date picker (calendar)
- [x] Order success page with payment verification
- [x] User registration and login
- [x] Account page with order history
- [x] Subscription plans page
- [x] Admin dashboard with orders and products management
- [x] **NEW: Delivery date selector showing available dates (no Sundays, min 2 days)**
- [x] **NEW: Saturday delivery with premium pricing badge**
- [x] **NEW: Box personalization UI (color, ribbon, message)**

### Design
- Custom color palette (earthy tones with terracotta accents)
- Cormorant Garamond (headings) + Manrope (body) fonts
- Elegant product cards with hover effects
- Responsive design for all screen sizes

## Prioritized Backlog

### P0 (Critical) - DONE
- Product catalog ✓
- Cart functionality ✓
- Checkout with payment ✓
- User authentication ✓

### P1 (High Priority)
- Email notifications for orders
- Order tracking/status updates
- Inventory management

### P2 (Medium Priority)
- Reviews and ratings
- Wishlist functionality
- Discount codes/coupons
- Search functionality with autocomplete

### P3 (Nice to Have)
- Social login (Google)
- Product recommendations
- Recently viewed products
- Blog/content section

## Test Credentials
- **Admin**: admin@petals.com / admin123

## Next Tasks
1. Implement email notifications for order confirmations
2. Add product search functionality
3. Implement discount/coupon codes
4. Add customer reviews feature

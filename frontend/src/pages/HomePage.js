import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Truck, Award, Leaf, Gift, Calendar, Mail, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IMG = {
  hero: "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png",
  category1: "https://images.pexels.com/photos/33886749/pexels-photo-33886749.png",
  category2: "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1200",
  category3: "https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1200",
  category4: "https://images.unsplash.com/photo-1768508949823-26255327c264?w=1200",
  subscription: "https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=1400",
  bespoke: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400",
};

const OCCASIONS = [
  { name: "Birthday", slug: "birthday" },
  { name: "Anniversary", slug: "anniversary" },
  { name: "Thank You", slug: "thank-you" },
  { name: "Congratulations", slug: "congratulations" },
  { name: "Just Because", slug: "celebration" },
  { name: "New Home", slug: "celebration" },
  { name: "Sympathy", slug: "sympathy" },
  { name: "Wedding", slug: "wedding" },
];

const PRESS = ["Vogue", "Tatler", "House & Garden", "Condé Nast Traveller", "Country Living", "FT — How To Spend It"];

const TESTIMONIALS = [
  { quote: "They understood, without being told, the exact quiet I wanted my wedding to feel.", author: "Eloise & Felix", location: "Kensington · June 2025" },
  { quote: "The bouquet arrived more beautiful than I could have imagined. My mother wept.", author: "Mrs. C. Hartley", location: "Mayfair · 2025" },
  { quote: "Our weekly installs have completely lifted the energy of the entire club. Impeccable.", author: "Private Members' Club", location: "Mayfair" },
];

function ProductCardLuxe({ product, onAdd }) {
  return (
    <div className="group" data-testid={`home-product-${product.id}`}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-[#F2EFEB] image-hover-container relative">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          {product.featured && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] font-body uppercase tracking-[0.22em] px-3 py-1.5">
              Signature
            </span>
          )}
        </div>
        <div className="pt-5">
          <p className="accent-label mb-1.5">{product.category_name}</p>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-2 group-hover:italic transition-all">
            {product.name}
          </h3>
          <p className="font-body text-sm text-[#7A7A7A]">
            from <span className="text-[#1A1A1A]">£{product.price.toFixed(0)}</span>
          </p>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); onAdd(product); }}
        className="mt-4 w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] py-3 font-body text-[11px] uppercase tracking-[0.22em] hover:bg-[#1A1A1A] hover:text-white transition-all"
        data-testid={`home-add-${product.id}`}
      >
        Add to Basket
      </button>
    </div>
  );
}

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.post(`${API_URL}/api/seed`).catch(() => {});
        const res = await axios.get(`${API_URL}/api/products`);
        setProducts(res.data);
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.slice(0, 4);

  const handleQuickAdd = async (product) => {
    try {
      const firstSize = product.sizes?.[0]?.name || null;
      await addToCart(product.id, 1, firstSize, null);
      toast.success(`${product.name} added`);
    } catch { toast.error("Could not add"); }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Welcome to the atelier list");
    setEmail("");
  };

  return (
    <div data-testid="home-page">
      {/* ── HERO — Bloom & Wild style: large promotional image + clear CTA ── */}
      <section className="relative bg-[#F2EFEB]" data-testid="hero-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[70vh]">
          <div className="flex items-center px-6 md:px-12 lg:px-20 py-14 lg:py-16 order-2 lg:order-1">
            <div className="max-w-lg animate-fade-in-up">
              <p className="accent-label mb-5"><span className="thin-rule" />New · Spring Collection 2026</p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.95] text-[#1A1A1A] mb-6 tracking-tight" data-testid="hero-title">
                Flowers,<br />
                <em className="text-[#B3A89B]">artfully</em><br />
                composed.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-8 max-w-md">
                Editorial bouquets hand-tied in our Mayfair atelier — delivered across London
                tomorrow, with bespoke services UK-wide.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/collection" data-testid="hero-shop-btn">
                  <button className="btn-dark w-full sm:w-auto inline-flex items-center justify-center gap-3">
                    Shop the Collection <ArrowRight size={14} strokeWidth={1.3} />
                  </button>
                </Link>
                <Link to="/consultation" data-testid="hero-consultation-btn">
                  <button className="btn-outline-dark w-full sm:w-auto">Bespoke Enquiry</button>
                </Link>
              </div>
              {/* Trust micro-row */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-7 border-t border-[#E5E5E5]">
                <div><Truck size={16} strokeWidth={1.3} className="text-[#1A1A1A] mb-2" /><p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#7A7A7A]">Next-day London</p></div>
                <div><Award size={16} strokeWidth={1.3} className="text-[#1A1A1A] mb-2" /><p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#7A7A7A]">Mayfair atelier</p></div>
                <div><Leaf size={16} strokeWidth={1.3} className="text-[#1A1A1A] mb-2" /><p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#7A7A7A]">7-day freshness</p></div>
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2 h-[45vh] lg:h-auto overflow-hidden">
            <img src={IMG.hero} alt="Signature bouquet" className="w-full h-full object-cover" />
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-5 py-3 hidden md:block">
              <p className="accent-label text-[#1A1A1A]">The Mayfair · from £185</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY TILES — 4-up, Bloom & Wild's primary navigation moment ── */}
      <section className="py-20 md:py-24 px-6 md:px-12 bg-white" data-testid="category-tiles-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
            <div>
              <p className="accent-label mb-4"><span className="thin-rule" />Shop the Atelier</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight">
                Where shall<br /><em>we begin?</em>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Signature Bouquets", desc: "Hand-tied · from £80", image: IMG.category1, to: "/collection", testid: "tile-bouquets" },
              { name: "Weddings", desc: "Bridal couture & ceremonial", image: IMG.category2, to: "/weddings", testid: "tile-weddings" },
              { name: "Sympathy", desc: "Bespoke tributes, with care", image: IMG.category3, to: "/sympathy", testid: "tile-sympathy" },
              { name: "Bespoke Portfolio", desc: "Commissioned works, by hand", image: IMG.category4, to: "/portfolio", testid: "tile-portfolio" },
            ].map((tile) => (
              <Link key={tile.name} to={tile.to} className="group block" data-testid={tile.testid}>
                <div className="aspect-[3/4] overflow-hidden bg-[#F2EFEB] image-hover-container relative">
                  <img src={tile.image} alt={tile.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/55 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className="font-heading text-2xl md:text-3xl font-light text-white mb-1 group-hover:italic transition-all">{tile.name}</h3>
                    <p className="font-body text-[11px] uppercase tracking-[0.22em] text-white/90">{tile.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS — Bloom & Wild's 4-up product grid with prices visible ── */}
      <section className="py-20 md:py-28 px-6 md:px-12 paper-accent" data-testid="bestsellers-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
            <div>
              <p className="accent-label mb-4"><span className="thin-rule" />The Signature Edit</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight">
                Best-loved<br /><em>bouquets.</em>
              </h2>
            </div>
            <Link to="/collection" className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1" data-testid="view-all-bouquets">
              View all bouquets →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-[#EFE9E1]" />
                  <div className="pt-5 space-y-2">
                    <div className="h-3 bg-[#EFE9E1] w-1/3" />
                    <div className="h-6 bg-[#EFE9E1] w-2/3" />
                    <div className="h-4 bg-[#EFE9E1] w-1/4" />
                    <div className="h-10 bg-[#EFE9E1] mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {(featured.length >= 4 ? featured : bestSellers).map((product) => (
                <ProductCardLuxe key={product.id} product={product} onAdd={handleQuickAdd} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SHOP BY OCCASION — Bloom & Wild's occasion-led navigation ── */}
      <section className="py-20 md:py-24 px-6 md:px-12 bg-white" data-testid="occasions-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="accent-label mb-4">Shop by Occasion</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Find <em>the moment.</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {OCCASIONS.map((occ) => (
              <Link
                key={occ.name}
                to={`/collection`}
                className="bg-white py-10 px-4 text-center hover:bg-[#F2EFEB] transition-colors group"
                data-testid={`occasion-${occ.slug}`}
              >
                <Gift size={20} strokeWidth={1.3} className="mx-auto text-[#B3A89B] group-hover:text-[#1A1A1A] mb-3 transition-colors" />
                <p className="font-heading text-xl font-light text-[#1A1A1A] group-hover:italic transition-all">{occ.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION BANNER — Bloom & Wild's flower club ── */}
      <section className="relative" data-testid="subscription-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] lg:min-h-[70vh]">
          <div className="h-[55vh] lg:h-auto overflow-hidden">
            <img src={IMG.subscription} alt="The Atelier subscription" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center bg-[#1A1A1A] text-[#FAFAF7] px-6 md:px-12 lg:px-20 py-16 lg:py-0">
            <div className="max-w-lg">
              <p className="accent-label !text-[#B3A89B] mb-6"><span className="thin-rule !bg-[#B3A89B]" />The Atelier Subscription</p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light leading-[1] mb-8 tracking-tight">
                A new<br />composition,<br /><em className="text-[#B3A89B]">every month.</em>
              </h2>
              <p className="font-body text-base text-[#FAFAF7]/75 leading-relaxed mb-10">
                A curated bouquet hand-tied by the lead florist and delivered to your door —
                or a gift recipient — on the same date each month. Pause or cancel at any time.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  "Seasonal selection by our lead florist",
                  "Complimentary delivery, always",
                  "Member-only access to limited editions",
                  "Pause, skip or cancel — no questions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-[#FAFAF7]/85">
                    <span className="w-1 h-1 rounded-full bg-[#B3A89B] mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/consultation?service=other" data-testid="subscription-cta">
                  <button className="bg-[#FAFAF7] text-[#1A1A1A] px-8 py-4 font-body text-xs uppercase tracking-[0.22em] hover:bg-[#B3A89B] transition-colors w-full sm:w-auto">
                    Join — from £85/month
                  </button>
                </Link>
                <Link to="/consultation?service=other" className="self-center font-body text-[11px] uppercase tracking-[0.22em] text-[#FAFAF7]/70 hover:text-[#FAFAF7] transition-colors">
                  Gift a subscription →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BESPOKE PORTFOLIO TEASER ── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white" data-testid="bespoke-teaser-section">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="lg:order-2">
            <img src={IMG.bespoke} alt="Bespoke commission" className="w-full aspect-[5/6] object-cover" />
          </div>
          <div className="lg:order-1">
            <p className="accent-label mb-5"><span className="thin-rule" />Bespoke Commissions</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#1A1A1A] leading-[1] mb-8 tracking-tight">
              Something rare,<br /><em>made for you.</em>
            </h2>
            <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-6">
              From a single statement piece to a complete house installation programme —
              the atelier accepts a small number of bespoke commissions each season.
            </p>
            <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
              Begin with a complimentary consultation, in person at the atelier or by video.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/portfolio" data-testid="bespoke-portfolio-cta">
                <button className="btn-dark w-full sm:w-auto inline-flex items-center justify-center gap-3">
                  View the Portfolio <ArrowRight size={14} />
                </button>
              </Link>
              <Link to="/consultation" data-testid="bespoke-consultation-cta">
                <button className="btn-outline-dark w-full sm:w-auto">Begin a Consultation</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — Trust signal, Bloom & Wild does this with Trustpilot ── */}
      <section className="py-20 md:py-28 px-6 md:px-12 paper-accent" data-testid="testimonials-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-1 mb-5">
              {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="#1A1A1A" stroke="none" />)}
            </div>
            <p className="accent-label mb-4">4.9 · From 400+ private clients</p>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-[#1A1A1A] tracking-tight">
              What clients <em>say.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-[#E5E5E5] p-8 md:p-10" data-testid={`testimonial-${i}`}>
                <div className="flex gap-0.5 mb-5">{[1,2,3,4,5].map((s) => <Star key={s} size={11} fill="#1A1A1A" stroke="none" />)}</div>
                <blockquote className="font-heading text-xl md:text-2xl font-light italic text-[#1A1A1A] leading-snug mb-8">
                  "{t.quote}"
                </blockquote>
                <p className="font-body text-sm text-[#1A1A1A]">{t.author}</p>
                <p className="accent-label mt-1">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESS LOGOS ── */}
      <section className="py-12 md:py-16 px-6 md:px-12 bg-white border-t border-[#E5E5E5]" data-testid="press-section">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label text-center mb-8">As featured in</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-5">
            {PRESS.map((name) => (
              <span key={name} className="font-heading text-xl md:text-2xl font-light italic text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES SECONDARY NAV — Quick links to specialist verticals ── */}
      <section className="py-20 md:py-24 px-6 md:px-12 bg-[#F2EFEB]" data-testid="services-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <p className="accent-label mb-4">Beyond Bouquets</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A]">
              Specialist <em>services.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Corporate Programmes", desc: "Weekly installs, launches, gala events", to: "/corporate", testid: "service-corporate" },
              { name: "House Floral Installs", desc: "Private residence programmes, fortnightly", to: "/house-installs", testid: "service-house" },
              { name: "Wedding Couture", desc: "Bridal, ceremonial & reception floristry", to: "/weddings", testid: "service-weddings" },
            ].map((s) => (
              <Link key={s.name} to={s.to} className="group bg-white border border-[#E5E5E5] p-8 md:p-10 hover:border-[#1A1A1A] transition-all" data-testid={s.testid}>
                <Calendar size={20} strokeWidth={1.3} className="text-[#B3A89B] group-hover:text-[#1A1A1A] mb-5 transition-colors" />
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-2 group-hover:italic transition-all">{s.name}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-5">{s.desc}</p>
                <span className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] inline-flex items-center gap-2">
                  Discover <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white" data-testid="newsletter-section">
        <div className="max-w-2xl mx-auto text-center">
          <Mail size={22} strokeWidth={1.3} className="mx-auto text-[#1A1A1A] mb-6" />
          <p className="accent-label mb-5"><span className="thin-rule" />The Atelier Letter</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight mb-6">
            Seasonal editions,<br /><em>in your inbox.</em>
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10 max-w-md mx-auto">
            New drops, behind-the-atelier dispatches, and members-only early access — quietly,
            once a month.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" data-testid="newsletter-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-transparent border border-[#E5E5E5] px-5 py-3 font-body text-sm text-[#1A1A1A] placeholder:text-[#B3A89B] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              data-testid="newsletter-email"
            />
            <button type="submit" className="btn-dark px-8" data-testid="newsletter-submit">Subscribe</button>
          </form>
          <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#B3A89B] mt-5">
            No spam · unsubscribe with a single click
          </p>
        </div>
      </section>
    </div>
  );
}

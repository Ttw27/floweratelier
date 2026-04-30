import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HERO_IMAGE = "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png";
const EDITORIAL_1 = "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1400";
const EDITORIAL_2 = "https://images.unsplash.com/photo-1768508949823-26255327c264?w=1400";
const EDITORIAL_3 = "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400";
const STUDIO_IMAGE = "https://images.unsplash.com/photo-1575081838238-d06e716afa28?w=1200";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.post(`${API_URL}/api/seed`).catch(() => {});
        const response = await axios.get(`${API_URL}/api/products`, { params: { featured: true } });
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero — editorial, asymmetric */}
      <section className="relative pt-20" data-testid="hero-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-5rem)]">
          {/* Left — Copy */}
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 lg:order-1">
            <div className="max-w-lg animate-fade-in-up">
              <p className="accent-label mb-8"><span className="thin-rule" />Floral Couture · London</p>
              <h1
                className="font-heading text-5xl sm:text-6xl lg:text-[5.5rem] font-light leading-[0.95] text-[#1A1A1A] mb-10 tracking-tight"
                data-testid="hero-title"
              >
                The language<br />
                of <span className="italic text-[#B3A89B]">flowers,</span><br />
                rewritten.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-12 max-w-md">
                A Mayfair atelier crafting bespoke floral works for weddings,
                sympathy tributes, corporate programmes and private residences.
                From £80.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/collection" data-testid="view-collection-btn">
                  <button className="btn-dark w-full sm:w-auto inline-flex items-center justify-center gap-3">
                    Shop the Collection
                    <ArrowRight size={14} strokeWidth={1.3} />
                  </button>
                </Link>
                <Link to="/consultation" data-testid="book-consultation-btn">
                  <button className="btn-outline-dark w-full sm:w-auto">
                    Enquire — Bespoke
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right — Full-bleed editorial image */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 h-[55vh] lg:h-auto">
            <img src={HERO_IMAGE} alt="Petals Atelier signature bouquet" className="w-full h-full object-cover" />
            <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md px-5 py-3 hidden md:block">
              <p className="accent-label text-[#1A1A1A]">Signature — The Mayfair · from £185</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Houses — services grid (asymmetric) */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="services-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="accent-label mb-5"><span className="thin-rule" />The Atelier</p>
            <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05]">
              Five disciplines.<br />
              <span className="italic">One atelier.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <Link to="/weddings" className="md:col-span-7 group" data-testid="service-weddings">
              <div className="aspect-[16/10] image-hover-container mb-5 bg-[#F2EFEB]">
                <img src={EDITORIAL_1} alt="Weddings" className="w-full h-full object-cover" />
              </div>
              <p className="accent-label mb-2">01 — Weddings</p>
              <h3 className="font-heading text-3xl font-light text-[#1A1A1A] group-hover:italic transition-all">Couture bridal & ceremonial design</h3>
            </Link>

            <Link to="/corporate" className="md:col-span-5 group" data-testid="service-corporate">
              <div className="aspect-[16/10] image-hover-container mb-5 bg-[#F2EFEB]">
                <img src={EDITORIAL_2} alt="Corporate" className="w-full h-full object-cover" />
              </div>
              <p className="accent-label mb-2">02 — Corporate</p>
              <h3 className="font-heading text-3xl font-light text-[#1A1A1A] group-hover:italic transition-all">Events, launches & weekly programmes</h3>
            </Link>

            <Link to="/house-installs" className="md:col-span-5 group" data-testid="service-house">
              <div className="aspect-[16/10] image-hover-container mb-5 bg-[#F2EFEB]">
                <img src={EDITORIAL_3} alt="House Installs" className="w-full h-full object-cover" />
              </div>
              <p className="accent-label mb-2">03 — House Installs</p>
              <h3 className="font-heading text-3xl font-light text-[#1A1A1A] group-hover:italic transition-all">Private residence floral programmes</h3>
            </Link>

            <Link to="/sympathy" className="md:col-span-4 group" data-testid="service-sympathy">
              <div className="aspect-[16/10] image-hover-container mb-5 bg-[#F2EFEB]">
                <img src="https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1200" alt="Sympathy" className="w-full h-full object-cover" />
              </div>
              <p className="accent-label mb-2">04 — Sympathy</p>
              <h3 className="font-heading text-3xl font-light text-[#1A1A1A] group-hover:italic transition-all">Bespoke tributes & memorial works</h3>
            </Link>

            <Link to="/portfolio" className="md:col-span-3 group" data-testid="service-portfolio">
              <div className="aspect-[16/10] image-hover-container mb-5 bg-[#F2EFEB]">
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200" alt="Portfolio" className="w-full h-full object-cover" />
              </div>
              <p className="accent-label mb-2">05 — Portfolio</p>
              <h3 className="font-heading text-3xl font-light text-[#1A1A1A] group-hover:italic transition-all">Past bespoke works</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Collection */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent" data-testid="featured-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
            <div>
              <p className="accent-label mb-5"><span className="thin-rule" />The Signature Edit</p>
              <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05]">
                Hand-tied<br /><span className="italic">bouquets.</span>
              </h2>
            </div>
            <Link to="/collection" className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1" data-testid="view-all-collection">
              View full collection →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-[#EFE9E1]" />
                  <div className="pt-5 space-y-2">
                    <div className="h-3 bg-[#EFE9E1] w-2/3" />
                    <div className="h-6 bg-[#EFE9E1] w-4/5" />
                    <div className="h-4 bg-[#EFE9E1] w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group block"
                  data-testid={`featured-product-${product.id}`}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-white image-hover-container">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-5">
                    <p className="accent-label mb-1.5">{product.category_name}</p>
                    <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-1.5 group-hover:italic transition-all">
                      {product.name}
                    </h3>
                    <p className="font-body text-sm text-[#7A7A7A]">
                      from <span className="text-[#1A1A1A]">£{product.price.toFixed(0)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Manifesto — editorial split */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="manifesto-section">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-5">
            <img src={STUDIO_IMAGE} alt="Our atelier" className="w-full aspect-[4/5] object-cover" />
          </div>
          <div className="lg:col-span-7">
            <p className="accent-label mb-6"><span className="thin-rule" />The Manifesto</p>
            <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-10">
              We don't arrange<br /><span className="italic">flowers.</span><br />
              We <span className="italic">compose</span> them.
            </h2>
            <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-6 max-w-xl">
              Every piece leaves the atelier signed in spirit — sourced daily from Covent Garden
              and direct-from-grower partnerships in the Netherlands and Kenya. No supermarket
              stems. No shortcuts. No compromise.
            </p>
            <p className="font-body text-base text-[#7A7A7A] leading-relaxed max-w-xl">
              If it isn't the finest bloom of the week, it doesn't leave the studio.
            </p>

            <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-[#E5E5E5]">
              <div>
                <p className="font-heading text-5xl font-light text-[#1A1A1A] mb-2">15<span className="text-[#B3A89B]">+</span></p>
                <p className="accent-label">Years</p>
              </div>
              <div>
                <p className="font-heading text-5xl font-light text-[#1A1A1A] mb-2">400<span className="text-[#B3A89B]">+</span></p>
                <p className="accent-label">Weddings</p>
              </div>
              <div>
                <p className="font-heading text-5xl font-light text-[#1A1A1A] mb-2">24<span className="text-[#B3A89B]">h</span></p>
                <p className="accent-label">Response</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial — quiet, generous */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent" data-testid="testimonial-section">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8">— Private Client, Kensington —</p>
          <blockquote className="font-heading text-3xl md:text-5xl font-light italic text-[#1A1A1A] leading-[1.15] mb-10">
            "They understood, without being told, the exact quiet I wanted my wedding to feel."
          </blockquote>
          <p className="accent-label">Eloise &amp; Felix · June 2025</p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-28 md:py-40 px-6 md:px-12" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-7xl font-light text-[#1A1A1A] leading-[1] mb-12">
            Let's compose<br /><span className="italic">something rare.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/consultation" data-testid="cta-consultation-btn">
              <button className="btn-dark w-full sm:w-auto">Begin a Consultation</button>
            </Link>
            <Link to="/collection" data-testid="cta-shop-btn">
              <button className="btn-outline-dark w-full sm:w-auto">Shop Bouquets</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

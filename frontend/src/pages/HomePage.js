import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Award, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.post(`${API_URL}/api/seed`).catch(() => {});
        const response = await axios.get(`${API_URL}/api/products`, { params: { featured: true } });
        setFeaturedProducts(response.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#0B0C0B]" data-testid="home-page">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center"
        data-testid="hero-section"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/18c3dcb9dbd05cb6efcfadb79429357816a868d87bf9d53dabd71b73756e5bac.png)`
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full pt-32">
          <div className="max-w-3xl animate-fade-in-up">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-6">
              Bespoke Luxury Floristry
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-[#F4F0E6] mb-8 leading-[1.1] hero-text-shadow" data-testid="hero-title">
              Artistry in <br />
              <span className="italic">Every Petal</span>
            </h1>
            <p className="font-body text-lg text-[#F4F0E6]/80 mb-10 max-w-xl leading-relaxed">
              Exquisite floral designs for weddings, celebrations, and life's 
              most meaningful moments. Each arrangement crafted with passion 
              and uncompromising attention to detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/collection">
                <Button className="btn-gold text-base" data-testid="view-collection-btn">
                  View Collection
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/consultation">
                <Button className="btn-outline-gold text-base" data-testid="book-consultation-btn">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border border-[#F4F0E6]/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#C5A059] rounded-full" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
              Our Expertise
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6]">
              Bespoke Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wedding Service */}
            <Link to="/weddings" className="group luxury-card overflow-hidden" data-testid="service-weddings">
              <div className="aspect-[3/4] image-hover-container">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/12a142ed2b28feae7d2b9e1bd97279a7c9bf8aaf7fae184fe9d56aa279456ed3.png"
                  alt="Wedding Floristry"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl text-[#F4F0E6] mb-2 group-hover:text-[#C5A059] transition-colors">
                  Weddings
                </h3>
                <p className="font-body text-sm text-[#A3A6A1] mb-4">
                  Bridal bouquets, venue styling, and complete wedding floristry packages
                </p>
                <span className="font-body text-sm text-[#C5A059] flex items-center">
                  Explore <ArrowRight size={14} className="ml-2" />
                </span>
              </div>
            </Link>

            {/* Sympathy Service */}
            <Link to="/sympathy" className="group luxury-card overflow-hidden" data-testid="service-sympathy">
              <div className="aspect-[3/4] image-hover-container">
                <img
                  src="https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=600"
                  alt="Sympathy Tributes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl text-[#F4F0E6] mb-2 group-hover:text-[#C5A059] transition-colors">
                  Sympathy & Funerals
                </h3>
                <p className="font-body text-sm text-[#A3A6A1] mb-4">
                  Thoughtful tributes and bespoke funeral arrangements with care
                </p>
                <span className="font-body text-sm text-[#C5A059] flex items-center">
                  Explore <ArrowRight size={14} className="ml-2" />
                </span>
              </div>
            </Link>

            {/* Luxury Gifts */}
            <Link to="/collection" className="group luxury-card overflow-hidden" data-testid="service-luxury">
              <div className="aspect-[3/4] image-hover-container">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/f27037e690ea606fe6fdfcd8e721d768249ffa5685c08d3c2b65680492c5a13e.png"
                  alt="Luxury Bouquets"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl text-[#F4F0E6] mb-2 group-hover:text-[#C5A059] transition-colors">
                  Luxury Bouquets
                </h3>
                <p className="font-body text-sm text-[#A3A6A1] mb-4">
                  Premium arrangements from £80, perfect for spoiling someone special
                </p>
                <span className="font-body text-sm text-[#C5A059] flex items-center">
                  Shop Now <ArrowRight size={14} className="ml-2" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#121413]" data-testid="featured-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
                Premium Selection
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6]">
                Featured Arrangements
              </h2>
            </div>
            <Link 
              to="/collection" 
              className="mt-6 md:mt-0 font-body text-sm text-[#C5A059] hover:text-[#DFBB73] flex items-center transition-colors"
              data-testid="view-all-collection"
            >
              View Full Collection
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="luxury-card animate-pulse">
                  <div className="aspect-[4/5] bg-[#252825]" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-[#252825] w-2/3" />
                    <div className="h-6 bg-[#252825] w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group luxury-card overflow-hidden"
                  data-testid={`featured-product-${product.id}`}
                >
                  <div className="aspect-[4/5] image-hover-container">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="font-body text-xs uppercase tracking-wider text-[#A3A6A1] mb-2">
                      {product.category_name}
                    </p>
                    <h3 className="font-heading text-xl text-[#F4F0E6] mb-3 group-hover:text-[#C5A059] transition-colors">
                      {product.name}
                    </h3>
                    <p className="font-body text-sm text-[#A3A6A1]">
                      from <span className="text-[#F4F0E6] font-heading text-xl">£{product.price.toFixed(0)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
                The Petals Atelier Difference
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6] mb-8">
                Luxury Floristry,<br />
                <span className="italic">Crafted with Care</span>
              </h2>
              <p className="font-body text-[#A3A6A1] leading-relaxed mb-8">
                We believe that flowers should be an experience, not just a purchase. 
                Each arrangement is thoughtfully designed and hand-crafted by our expert 
                florists using only the finest seasonal blooms sourced from trusted growers.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#161A18] border border-[#252825] flex items-center justify-center flex-shrink-0">
                    <Award size={18} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg text-[#F4F0E6] mb-1">Award-Winning Design</h4>
                    <p className="font-body text-sm text-[#A3A6A1]">Recognised for excellence in floral artistry</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#161A18] border border-[#252825] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg text-[#F4F0E6] mb-1">Premium Quality</h4>
                    <p className="font-body text-sm text-[#A3A6A1]">Only the finest, freshest blooms make it into our studio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#161A18] border border-[#252825] flex items-center justify-center flex-shrink-0">
                    <Heart size={18} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg text-[#F4F0E6] mb-1">Personal Touch</h4>
                    <p className="font-body text-sm text-[#A3A6A1]">Every order receives our utmost care and attention</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1575081838238-d06e716afa28?w=800"
                alt="Our Studio"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-[#161A18] border border-[#252825] p-8 max-w-[280px] hidden md:block">
                <p className="font-heading text-4xl text-[#C5A059] mb-2">15+</p>
                <p className="font-body text-sm text-[#A3A6A1]">Years of creating unforgettable floral experiences</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#121413]" data-testid="testimonial-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-8">
            Client Testimonial
          </p>
          <blockquote className="testimonial-quote mb-8">
            "The flowers for our wedding were absolutely breathtaking. The team understood 
            our vision perfectly and created arrangements that exceeded all expectations. 
            Truly an artisan experience."
          </blockquote>
          <p className="font-body text-sm text-[#A3A6A1]">
            — Sarah & James, Wedding Client
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="cta-section">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative min-h-[400px] flex items-center justify-center text-center"
            style={{
              backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/f27037e690ea606fe6fdfcd8e721d768249ffa5685c08d3c2b65680492c5a13e.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 px-6">
              <h2 className="font-heading text-3xl md:text-5xl font-light text-[#F4F0E6] mb-6">
                Ready to Create Something Beautiful?
              </h2>
              <p className="font-body text-[#F4F0E6]/80 mb-8 max-w-lg mx-auto">
                Whether it's a wedding, special occasion, or simply to brighten someone's day, 
                let's craft the perfect arrangement together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/collection">
                  <Button className="btn-gold text-base" data-testid="cta-shop-btn">
                    Shop Collection
                  </Button>
                </Link>
                <Link to="/consultation">
                  <Button className="btn-outline-gold text-base" data-testid="cta-consultation-btn">
                    Book a Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

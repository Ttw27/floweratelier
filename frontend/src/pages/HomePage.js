import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Truck, Gift, Leaf, Star } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Seed data first
        await axios.post(`${API_URL}/api/seed`).catch(() => {});
        
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { params: { featured: true } }),
          axios.get(`${API_URL}/api/categories`)
        ]);
        setFeaturedProducts(productsRes.data.slice(0, 4));
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Truck, title: "Free Delivery", description: "On orders over £50" },
    { icon: Gift, title: "Gift Wrapping", description: "Beautifully presented" },
    { icon: Leaf, title: "Fresh Flowers", description: "7-day freshness guarantee" },
    { icon: Star, title: "5-Star Reviews", description: "Trusted by thousands" }
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] min-h-[600px] flex items-center"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/a4d1e9ab6b2b8addbe3535569ddca8a3431d60bfbb52e5d0caffc28093e2def0.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-white/80 mb-4">
              Fresh flowers, delivered with love
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 hero-text-shadow" data-testid="hero-title">
              Beautiful Blooms for Every Occasion
            </h1>
            <p className="font-body text-lg text-white/90 mb-8 max-w-lg">
              Hand-tied bouquets crafted with care and delivered fresh to your doorstep across the UK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/flowers">
                <Button className="bg-[#C07A65] hover:bg-[#a86856] text-white px-8 py-6 text-base font-body" data-testid="shop-now-btn">
                  Shop Now
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/subscriptions">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#233520] px-8 py-6 text-base font-body" data-testid="subscribe-btn">
                  Subscribe & Save
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#E8ECE1] py-8" data-testid="features-section">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3" data-testid={`feature-${idx}`}>
                <feature.icon className="text-[#C07A65]" size={24} />
                <div>
                  <p className="font-body font-semibold text-[#233520] text-sm">{feature.title}</p>
                  <p className="font-body text-[#788275] text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Occasion */}
      <section className="py-20 md:py-32" data-testid="categories-section">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
              Find the perfect gift
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[#233520]">
              Shop by Occasion
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.slice(0, 6).map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/flowers/${cat.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-[#F0F0EA]"
                data-testid={`category-card-${cat.slug}`}
              >
                <img
                  src={cat.image || "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400"}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-heading text-lg text-white">{cat.name}</h3>
                  <p className="font-body text-xs text-white/70">{cat.product_count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 bg-[#F0F0EA]" data-testid="featured-products-section">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
                Hand-picked for you
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[#233520]">
                Featured Bouquets
              </h2>
            </div>
            <Link 
              to="/flowers" 
              className="mt-4 md:mt-0 font-body text-[#C07A65] hover:text-[#a86856] flex items-center transition-colors"
              data-testid="view-all-products"
            >
              View all
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white animate-pulse">
                  <div className="aspect-[4/5] bg-[#E3E5DF]" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-[#E3E5DF] w-1/3" />
                    <div className="h-5 bg-[#E3E5DF] w-2/3" />
                    <div className="h-4 bg-[#E3E5DF] w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-20 md:py-32" data-testid="subscription-cta-section">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
                Never miss a moment
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[#233520] mb-6">
                Fresh Flowers, Delivered Regularly
              </h2>
              <p className="font-body text-[#788275] leading-relaxed mb-8">
                Subscribe to our flower delivery service and enjoy beautiful, hand-tied bouquets 
                delivered straight to your door. Choose weekly, bi-weekly, or monthly deliveries 
                and save up to 20% on every order.
              </p>
              <ul className="space-y-3 mb-8">
                {["Flexible delivery schedules", "Skip or pause anytime", "Exclusive subscriber discounts", "Free delivery on all subscriptions"].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-[#C07A65] rounded-full" />
                    <span className="font-body text-[#233520]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/subscriptions">
                <Button className="bg-[#C07A65] hover:bg-[#a86856] text-white px-8 py-6 text-base font-body" data-testid="explore-subscriptions-btn">
                  Explore Subscriptions
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.pexels.com/photos/5414006/pexels-photo-5414006.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Florist arranging flowers"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-[#E8ECE1]" data-testid="trust-section">
        <div className="px-4 md:px-8 max-w-7xl mx-auto text-center">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
            Trusted by thousands
          </p>
          <h3 className="font-heading text-2xl sm:text-3xl font-light text-[#233520] mb-8">
            "The most beautiful flowers I've ever received. Absolutely stunning quality!"
          </h3>
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#C07A65] text-[#C07A65]" />
            ))}
          </div>
          <p className="font-body text-[#788275] text-sm">
            4.9/5 from over 10,000 reviews
          </p>
        </div>
      </section>
    </div>
  );
}

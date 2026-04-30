import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Heart } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SympathyPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`, { params: { category: "sympathy" } });
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const tributeTypes = [
    { name: "Traditional Wreaths", desc: "Classic circular tributes symbolising eternal love" },
    { name: "Standing Sprays", desc: "Elegant displays for the service" },
    { name: "Casket Arrangements", desc: "Dignified arrangements to honour your loved one" },
    { name: "Sympathy Bouquets", desc: "Hand-tied arrangements for the family" },
    { name: "Letter Tributes", desc: "Floral letters spelling meaningful words" },
    { name: "Bespoke Designs", desc: "Custom tributes reflecting personality and passions" }
  ];

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20" data-testid="sympathy-page">
      {/* Hero */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#252825]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
                Sympathy & Funeral Flowers
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#F4F0E6] mb-6" data-testid="sympathy-title">
                Honouring Lives<br />
                <span className="italic">with Grace</span>
              </h1>
              <p className="font-body text-[#A3A6A1] leading-relaxed mb-8">
                During life's most difficult moments, we understand the importance of 
                expressing love and respect through beautiful flowers. Our sympathy 
                arrangements are crafted with the utmost care, dignity, and attention 
                to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="tel:+441234567890">
                  <Button className="btn-gold text-base" data-testid="call-sympathy">
                    <Phone size={18} className="mr-2" />
                    Call to Discuss
                  </Button>
                </a>
                <Link to="/consultation">
                  <Button className="btn-outline-gold text-base" data-testid="consultation-sympathy">
                    Request Consultation
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=800"
                alt="Sympathy Flowers"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#121413]">
        <div className="max-w-4xl mx-auto text-center">
          <Heart size={32} className="text-[#C5A059] mx-auto mb-6" />
          <h2 className="font-heading text-3xl md:text-4xl font-light text-[#F4F0E6] mb-6">
            Our Compassionate Approach
          </h2>
          <p className="font-body text-[#A3A6A1] leading-relaxed mb-6">
            We understand that arranging funeral flowers can be overwhelming during 
            a time of grief. Our experienced team is here to guide you through the 
            process with patience and sensitivity, helping you create a fitting 
            tribute that celebrates your loved one's life.
          </p>
          <p className="font-body text-[#A3A6A1] leading-relaxed">
            We work closely with funeral directors and families to ensure seamless 
            delivery and setup, allowing you to focus on what matters most.
          </p>
        </div>
      </section>

      {/* Tribute Types */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
              Tribute Options
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6]">
              Types of Arrangements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tributeTypes.map((type, idx) => (
              <div key={idx} className="luxury-card p-8" data-testid={`tribute-type-${idx}`}>
                <h3 className="font-heading text-xl text-[#F4F0E6] mb-3">{type.name}</h3>
                <p className="font-body text-sm text-[#A3A6A1]">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      {!loading && products.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 bg-[#121413]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
                  Sympathy Collection
                </p>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6]">
                  Featured Tributes
                </h2>
              </div>
              <Link to="/collection/sympathy" className="mt-4 md:mt-0 font-body text-sm text-[#C5A059] hover:text-[#DFBB73] flex items-center transition-colors">
                View All
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group luxury-card overflow-hidden"
                  data-testid={`sympathy-product-${product.id}`}
                >
                  <div className="aspect-[4/5] image-hover-container">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
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
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
            We're Here to Help
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-light text-[#F4F0E6] mb-6">
            Need Guidance?
          </h2>
          <p className="font-body text-[#A3A6A1] mb-8">
            Our team is available to discuss your requirements with care and discretion. 
            Call us directly or submit an enquiry and we'll be in touch promptly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+441234567890">
              <Button className="btn-gold text-base">
                <Phone size={18} className="mr-2" />
                01234 567 890
              </Button>
            </a>
            <Link to="/consultation">
              <Button className="btn-outline-gold text-base">
                Send Enquiry
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

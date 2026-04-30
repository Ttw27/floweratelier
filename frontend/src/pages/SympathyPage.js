import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SympathyPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`, { params: { category: "sympathy" } });
        setProducts(response.data);
      } catch {} finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const tributeTypes = [
    { name: "Casket & Coffin Tributes", desc: "Hand-tied sprays for the service" },
    { name: "Standing Arrangements", desc: "Elegant pedestal and easel tributes" },
    { name: "Traditional Wreaths", desc: "Classic circular forms, quietly composed" },
    { name: "Letter Tributes", desc: "Meaningful words in bloom" },
    { name: "Sympathy Bouquets", desc: "For the family, with care" },
    { name: "Bespoke Commissions", desc: "Reflecting a life lived" },
  ];

  return (
    <div className="pt-20" data-testid="sympathy-page">
      {/* Quiet hero */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-6">
            <p className="accent-label mb-8"><span className="thin-rule" />Sympathy & Funeral</p>
            <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8" data-testid="sympathy-title">
              Honouring lives,<br /><span className="italic text-[#B3A89B]">with grace.</span>
            </h1>
            <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10 max-w-lg">
              Dignified, bespoke tributes crafted with the utmost care — we work closely with
              funeral directors across London and the Home Counties to ensure seamless, quiet
              delivery on your most difficult day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="tel:+442071234567" data-testid="call-sympathy">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3">
                  <Phone size={14} /> 020 7123 4567
                </Button>
              </a>
              <Link to="/consultation" data-testid="consultation-sympathy">
                <Button className="btn-outline-dark rounded-none">Request a consultation</Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <img src="https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1400" alt="Sympathy floristry" className="w-full aspect-[4/5] object-cover" />
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Our Approach</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.1] mb-10">
            Quietly, with<br /><span className="italic">patience.</span>
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed">
            We take the weight of choice away — guiding each conversation with sensitivity.
            Our team liaises directly with your funeral director and travels to ensure each
            piece arrives in immaculate condition.
          </p>
        </div>
      </section>

      {/* Tribute Types */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Tributes</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Forms of<br /><span className="italic">remembrance.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {tributeTypes.map((type, idx) => (
              <div key={idx} className="bg-[#FAFAF7] p-10" data-testid={`tribute-type-${idx}`}>
                <p className="font-heading text-3xl font-light text-[#B3A89B] mb-3">{String(idx + 1).padStart(2, "0")}</p>
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-3">{type.name}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      {!loading && products.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-14 gap-6">
              <div>
                <p className="accent-label mb-5"><span className="thin-rule" />From the Collection</p>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A]">Signature tributes</h2>
              </div>
              <Link to="/collection/sympathy" className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.slice(0, 3).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block" data-testid={`sympathy-product-${product.id}`}>
                  <div className="aspect-[4/5] overflow-hidden bg-[#F2EFEB] image-hover-container">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-5">
                    <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-1 group-hover:italic transition-all">{product.name}</h3>
                    <p className="font-body text-sm text-[#7A7A7A]">from <span className="text-[#1A1A1A]">£{product.price.toFixed(0)}</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />We are here</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-10">
            When you need us,<br /><span className="italic">quietly.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+442071234567"><Button className="btn-dark rounded-none inline-flex items-center gap-3"><Phone size={14} />020 7123 4567</Button></a>
            <Link to="/consultation"><Button className="btn-outline-dark rounded-none inline-flex items-center gap-3">Send an enquiry <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

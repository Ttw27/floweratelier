import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HERO = "https://images.unsplash.com/photo-1768508949823-26255327c264?w=1800";

export default function CorporatePage() {
  const [portfolioItems, setPortfolioItems] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/portfolio`, { params: { category: "corporate" } })
      .then((res) => setPortfolioItems(res.data))
      .catch(() => {});
  }, []);

  const offerings = [
    { title: "Weekly Install Programmes", desc: "Rotating seasonal arrangements for hotels, clubs, offices and showrooms — delivered weekly with account-managed continuity.", price: "from £1,200 / month" },
    { title: "Product Launches & Openings", desc: "Statement floral architecture — arches, pedestals, installations and press-wall floral detailing.", price: "from £3,500" },
    { title: "Gala Dinners & Award Events", desc: "Tablescape design, room decoration and guest floral gifts.", price: "from £2,500" },
    { title: "Executive & Client Gifting", desc: "Curated gift programmes for VIPs, clients and executives — delivered nationally.", price: "from £95 per piece" },
  ];

  return (
    <div className="pt-28" data-testid="corporate-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto">
            <img src={HERO} alt="Corporate floristry" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Corporate &amp; Events</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10" data-testid="corporate-title">
                Brands <br />in <span className="italic text-[#B3A89B]">bloom.</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Weekly programmes for Mayfair hotels and private members' clubs. Launch arches
                for the Bond Street houses. Gala tablescapes across the City. We partner quietly,
                and deliver impeccably.
              </p>
              <Link to="/consultation?service=corporate">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="corporate-enquire">
                  Request a proposal <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Offerings</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Programmes &amp;<br /><span className="italic">productions.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {offerings.map((item, idx) => (
              <div key={idx} className="pb-10 border-b border-[#E5E5E5]" data-testid={`corporate-offering-${idx}`}>
                <p className="font-heading text-5xl font-light text-[#B3A89B] mb-4">{String(idx + 1).padStart(2, "0")}</p>
                <h3 className="font-heading text-3xl font-light text-[#1A1A1A] mb-4">{item.title}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-4">{item.desc}</p>
                <p className="accent-label text-[#1A1A1A]">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past work */}
      {portfolioItems.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-14 gap-6">
              <div>
                <p className="accent-label mb-5"><span className="thin-rule" />Past works</p>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A]">Selected corporate projects</h2>
              </div>
              <Link to="/portfolio" className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">
                Full portfolio →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {portfolioItems.slice(0, 2).map((item) => (
                <Link key={item.id} to={`/consultation?service=corporate&portfolio_item_id=${item.id}&ref_title=${encodeURIComponent(item.title)}`} className="group block" data-testid={`corporate-project-${item.id}`}>
                  <div className="aspect-[4/3] image-hover-container mb-5 bg-white">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="accent-label mb-2">{item.location}</p>
                  <h3 className="font-heading text-2xl font-light text-[#1A1A1A] group-hover:italic transition-all">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Partner</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Let's elevate<br /><span className="italic">your brand.</span>
          </h2>
          <Link to="/consultation?service=corporate"><Button className="btn-dark rounded-none">Request a proposal</Button></Link>
        </div>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";

const HERO = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800";

export default function InShopDisplaysPage() {
  const offerings = [
    { name: "Counter & POS Florals", desc: "Beauty counter florals, checkout displays and product-launch styling — colour-coded to your brand palette.", price: "from £450 / visit" },
    { name: "Showroom & Plinth Florals", desc: "Sculptural arrangements on display plinths for jewellery, watch and luxury showrooms.", price: "from £680 / visit" },
    { name: "Bespoke Brand Activations", desc: "Floral takeovers of concept stores, capsule collections and product launches — designed end-to-end.", price: "from £4,400" },
    { name: "Daily Café & Patisserie", desc: "Delicate florals on cake stands, counter tops and tableware — refreshed twice weekly.", price: "from £180 / visit" },
    { name: "Fitting Room Posies", desc: "Small considered posies in every fitting room — for bridal, boutique and luxury retail.", price: "from £55 each" },
    { name: "Permanent Programmes", desc: "Ongoing weekly or fortnightly programmes — single point of contact, fixed monthly retainer.", price: "from £1,800 / month" },
  ];

  return (
    <div className="pt-28" data-testid="in-shop-display-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 lg:order-1 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />In-Shop Bespoke Displays</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8" data-testid="in-shop-title">
                Inside the<br /><span className="italic text-[#B3A89B]">moment</span> of purchase.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Considered floral displays for the retail floor — beauty counters, jewellery plinths,
                showroom receptions, fitting rooms and brand activations.
              </p>
              <Link to="/consultation?service=in_shop_display">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="in-shop-enquire">
                  Discuss your store <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 h-[50vh] lg:h-auto">
            <img src={HERO} alt="In-shop bespoke display" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Offerings</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Six core<br /><span className="italic">programmes.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {offerings.map((item, idx) => (
              <div key={idx} className="pb-10 border-b border-[#E5E5E5]" data-testid={`in-shop-offering-${idx}`}>
                <p className="font-heading text-5xl font-light text-[#B3A89B] mb-4">{String(idx + 1).padStart(2, "0")}</p>
                <h3 className="font-heading text-3xl font-light text-[#1A1A1A] mb-4">{item.name}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-4">{item.desc}</p>
                <p className="accent-label text-[#1A1A1A]">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Why us</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.1] mb-10">
            Discreet, on-brand,<br /><span className="italic">never noticed by your team.</span>
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-6">
            Our retail florals are designed to integrate seamlessly into your store. We deliver
            before opening hours, replace fading stems mid-week, and remove old florals discreetly —
            so your team simply finds fresh, immaculate displays each morning.
          </p>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed italic">
            One point of contact. One account manager. Predictable monthly invoicing.
          </p>
        </div>
      </section>

      {/* Mini Portfolio */}
      <MiniPortfolio
        category="in_shop_display"
        title={<>Recent <em>in-shop</em> works.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Let&rsquo;s style<br /><span className="italic">your store.</span>
          </h2>
          <Link to="/consultation?service=in_shop_display"><Button className="btn-dark rounded-none">Discuss your store</Button></Link>
        </div>
      </section>
    </div>
  );
}

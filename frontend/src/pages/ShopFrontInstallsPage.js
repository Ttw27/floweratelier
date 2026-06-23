import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Star, Building2 } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";

const HERO = "https://images.unsplash.com/photo-1575081838238-d06e716afa28?w=1800";

export default function ShopFrontInstallsPage() {
  const programmes = [
    { name: "Seasonal Quarterly", freq: "Four installs / year", desc: "A fresh full-window install at the turn of each season — Spring, Summer, Autumn and the all-important Christmas edit.", price: "from £2,200 / install" },
    { name: "Monthly Refresh", freq: "Twelve installs / year", desc: "Higher footfall storefronts kept evergreen with monthly redesigns — perfect for fashion, beauty and jewellery flagships.", price: "from £1,650 / install" },
    { name: "Campaign-Led", freq: "Per campaign", desc: "Bespoke window installs aligned to product launches, capsule drops and brand campaigns.", price: "from £3,800" },
  ];

  const idealFor = [
    { type: "Fashion Flagships", icon: Star },
    { type: "Jewellery Houses", icon: Star },
    { type: "Beauty Halls & Counters", icon: Star },
    { type: "Bridal Boutiques", icon: Star },
    { type: "Patisseries & Restaurants", icon: Star },
    { type: "Interiors & Lifestyle Stores", icon: Star },
  ];

  return (
    <div className="pt-28" data-testid="shop-front-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[50vh] lg:h-auto">
            <img src={HERO} alt="Shop front floral installation" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Shop Front Installs</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8" data-testid="shop-front-title">
                A window<br />that <span className="italic text-[#B3A89B]">stops</span> the street.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Bespoke storefront floral installations for fashion houses, beauty halls,
                jewellery flagships and lifestyle stores across London — quarterly, monthly
                or campaign-led.
              </p>
              <Link to="/consultation?service=shop_front">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="shop-front-enquire">
                  Request a proposal <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Programmes</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Three cadences.<br /><span className="italic">One standard.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {programmes.map((p, idx) => (
              <div key={idx} className="bg-white border border-[#E5E5E5] p-10" data-testid={`shop-front-programme-${idx}`}>
                <p className="accent-label mb-4 text-[#B3A89B]">{p.freq}</p>
                <h3 className="font-heading text-3xl font-light text-[#1A1A1A] mb-4">{p.name}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-6">{p.desc}</p>
                <p className="accent-label text-[#1A1A1A]">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal for */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
            <div className="lg:col-span-6">
              <p className="accent-label mb-5"><span className="thin-rule" />Ideal For</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05]">
                Brands who treat<br /><span className="italic">the street</span> as their first showroom.
              </h2>
            </div>
            <div className="lg:col-span-6 flex items-center">
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed">
                We work directly with visual-merchandising teams, store managers and creative
                directors to design installs that align with your brand, campaign and season.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {idealFor.map((i, idx) => {
              const Icon = i.icon;
              return (
                <div key={idx} className="bg-white p-6 text-center" data-testid={`shop-front-ideal-${idx}`}>
                  <Icon size={16} strokeWidth={1.3} className="mx-auto text-[#B3A89B] mb-3" />
                  <p className="font-heading text-lg font-light text-[#1A1A1A]">{i.type}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Process</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            From mood-board<br /><span className="italic">to launch.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
              { step: "01", title: "Brief", desc: "Aligning to your brand, campaign and seasonal calendar." },
              { step: "02", title: "Mood-board", desc: "Visual concepts, palette and stem selection signed off." },
              { step: "03", title: "Build", desc: "Pre-assembly in our atelier and discreet overnight install." },
              { step: "04", title: "Refresh", desc: "Scheduled maintenance visits and seasonal swap-outs." },
            ].map((s) => (
              <div key={s.step}>
                <p className="font-heading text-6xl font-light text-[#B3A89B] mb-4">{s.step}</p>
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-3">{s.title}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Portfolio */}
      <MiniPortfolio
        category="shop_front"
        title={<>Recent <em>shop-front</em> works.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Let&rsquo;s design<br /><span className="italic">your window.</span>
          </h2>
          <Link to="/consultation?service=shop_front"><Button className="btn-dark rounded-none">Request a proposal</Button></Link>
        </div>
      </section>
    </div>
  );
}

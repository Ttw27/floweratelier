import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800";

export default function HotelsHospitalityPage() {
  const { content } = usePageContent("hotels-hospitality");

  const defaultTiers = [
    {
      title: "Lobby & Reception Programmes",
      description: "Statement floral installations for hotel lobbies, reception desks and guest arrival spaces — refreshed weekly or fortnightly. Account-managed with seasonal rotations.",
      price_label: "from £1,400 / month",
      image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200",
    },
    {
      title: "Restaurant & Dining Room Florals",
      description: "Table centrepieces, bar displays and private dining room installations. Designed to complement your interior, refreshed to maintain impeccable standards.",
      price_label: "from £800 / month",
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
    },
    {
      title: "Events & Private Dining",
      description: "Full floral dressing for weddings, gala dinners, product launches and private events hosted at your venue. Tablescapes, arches, room installations and guest gifts.",
      price_label: "from £2,500 per event",
      image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    },
    {
      title: "Gifting & Guest Experience",
      description: "Curated floral gifts for VIP guests, honeymoon arrivals, anniversary packages and corporate gifting programmes — delivered directly to rooms or reception.",
      price_label: "from £85 per piece",
      image_url: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200",
    },
  ];

  return (
    <div className="pt-28" data-testid="hotels-hospitality-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto">
            <img src={content?.hero_image_url || HERO} alt="Hotel floristry" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Hotels &amp; Hospitality</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10" data-testid="hotels-title">
                {content?.hero_heading ? (
                  <span dangerouslySetInnerHTML={{ __html: content.hero_heading }} />
                ) : (
                  <>Spaces that <br /><span className="italic text-[#B3A89B]">breathe.</span></>
                )}
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                {content?.hero_subheading || "Weekly lobby programmes, restaurant table florals and event dressing for Midlands hotels, boutique properties and private members' clubs. Discreet, dependable, impeccable."}
              </p>
              <Link to="/consultation?service=hotels-hospitality">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="hotels-enquire">
                  Request a proposal <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <ServiceTiers
        content={content}
        defaultTiers={defaultTiers}
        eyebrow="Programmes"
        heading={<>Every space,<br /><span className="italic">considered.</span></>}
        testId="hotels-tiers"
      />

      {/* Why us */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#1A1A1A]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { title: "Account-managed", body: "A dedicated contact who understands your property, your guests and your standards. No briefing from scratch each visit." },
            { title: "Keyholder trusted", body: "We work with your team to access spaces early — before guests arrive, before service begins. Discretion guaranteed." },
            { title: "Seasonally curated", body: "Every rotation is designed around the season, your interiors and any upcoming events on your calendar." },
          ].map((item) => (
            <div key={item.title}>
              <p className="font-heading text-xl font-light text-white mb-4">{item.title}</p>
              <p className="font-body text-sm text-[#B3A89B] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <MiniPortfolio
        category="corporate"
        title={<>Selected <em>hospitality</em> projects.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Partner with us</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Elevate your<br /><span className="italic">guest experience.</span>
          </h2>
          <Link to="/consultation?service=hotels-hospitality">
            <Button className="btn-dark rounded-none">Request a proposal</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

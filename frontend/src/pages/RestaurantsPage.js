import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800";

export default function RestaurantsPage() {
  const { content } = usePageContent("restaurants");

  const defaultTiers = [
    {
      title: "Table Centrepiece Programmes",
      description: "Weekly or fortnightly centrepieces for every table — designed to your colour palette and interior scheme. Consistent, fresh, seasonally evolving.",
      price_label: "from £600 / month",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
    },
    {
      title: "Bar & Reception Displays",
      description: "Statement arrangements for bar tops, host stands and entrance areas. The first and last impression your guests carry with them.",
      price_label: "from £350 / month",
      image_url: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
    },
    {
      title: "Private Members' Club Programmes",
      description: "Full-property floral programmes for private clubs — reading rooms, dining rooms, bars, entrance halls and event spaces. Discreet access, impeccable delivery.",
      price_label: "from £1,800 / month",
      image_url: "https://images.unsplash.com/photo-1606293926249-ed24cb1f7b97?w=1200",
    },
    {
      title: "Seasonal & Event Dressing",
      description: "Tasting menus, chef's table evenings, launch nights and private hire — full floral dressing designed around your event brief.",
      price_label: "from £1,200 per event",
      image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    },
  ];

  return (
    <div className="pt-28" data-testid="restaurants-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto">
            {(content?.hero_image || !loading) && <img src={content?.hero_image || HERO} alt="Restaurant floristry" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Restaurants &amp; Members' Clubs</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10" data-testid="restaurants-title">
                {content?.hero_heading ? (
                  <span dangerouslySetInnerHTML={{ __html: content.hero_heading }} />
                ) : (
                  <>Atmosphere,<br /><span className="italic text-[#B3A89B]">by hand.</span></>
                )}
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                {content?.hero_subheading || "Table centrepieces, bar displays and full-property programmes for Leicester's finest restaurants and private members' clubs. Weekly delivery, seasonal design, zero compromise."}
              </p>
              <Link to="/consultation?service=restaurants">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="restaurants-enquire">
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
        heading={<>The table,<br /><span className="italic">set beautifully.</span></>}
        testId="restaurants-tiers"
      />

      {/* Why us */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F2EFEB]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="accent-label mb-6"><span className="thin-rule" />How it works</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-8">
              Simple, reliable,<br /><span className="italic">beautiful.</span>
            </h2>
            <div className="space-y-6">
              {[
                { n: "01", t: "Consultation", b: "We visit your space, understand your aesthetic and design a programme tailored to your interior." },
                { n: "02", t: "Ongoing delivery", b: "Your florals arrive before service — fresh, arranged, ready. The same reliable team every visit." },
                { n: "03", t: "Seasonal evolution", b: "We evolve the designs quarterly to reflect the season and any menu or interior changes." },
              ].map((s) => (
                <div key={s.n} className="flex gap-6">
                  <span className="font-body text-xs text-[#B3A89B] tracking-widest mt-1">{s.n}</span>
                  <div>
                    <p className="font-heading text-lg font-light text-[#1A1A1A] mb-1">{s.t}</p>
                    <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{s.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200"
              alt="Restaurant table setting"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <MiniPortfolio
        category="restaurants"
        title={<>Selected <em>restaurant</em> projects.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Make every table<br /><span className="italic">unforgettable.</span>
          </h2>
          <Link to="/consultation?service=restaurants">
            <Button className="btn-dark rounded-none">Request a proposal</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

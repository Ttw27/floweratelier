import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1768508949823-26255327c264?w=1800";

export default function CorporatePage() {
  const { content, loading } = usePageContent("corporate");
  const defaultTiers = [
    { title: "Weekly Install Programmes", description: "Rotating seasonal arrangements for hotels, clubs, offices and showrooms — delivered weekly with account-managed continuity.", price_label: "from £1,200 / month", image_url: "https://images.unsplash.com/photo-1606293926249-ed24cb1f7b97?w=1200" },
    { title: "Product Launches & Openings", description: "Statement floral architecture — arches, pedestals, installations and press-wall floral detailing.", price_label: "from £3,500", image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200" },
    { title: "Gala Dinners & Award Events", description: "Tablescape design, room decoration and guest floral gifts.", price_label: "from £2,500", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200" },
    { title: "Executive & Client Gifting", description: "Curated gift programmes for VIPs, clients and executives — delivered nationally.", price_label: "from £95 per piece", image_url: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200" },
  ];

  return (
    <div className="pt-28" data-testid="corporate-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto">
            {(content?.hero_image || !loading) && <img src={content?.hero_image || HERO} alt="Corporate floristry" className="w-full h-full object-cover" />}
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Corporate &amp; Events</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10" data-testid="corporate-title">
                Brands <br />in <span className="italic text-[#B3A89B]">bloom.</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Weekly programmes for Midlands hotels and private members' clubs. Launch arches
                for the Highcross houses. Gala tablescapes across the city. We partner quietly,
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

      {/* Offerings — pricing editable in admin / Page Content */}
      <ServiceTiers
        content={content}
        defaultTiers={defaultTiers}
        eyebrow="Offerings"
        heading={<>Programmes &amp;<br /><span className="italic">productions.</span></>}
        testId="corporate-tiers"
      />

      {/* Mini Portfolio — Corporate projects */}
      <MiniPortfolio
        category="corporate"
        title={<>Selected <em>corporate</em> projects.</>}
      />

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

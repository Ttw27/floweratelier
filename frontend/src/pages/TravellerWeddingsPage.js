import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ReadyCollectionCTA from "../components/ReadyCollectionCTA";
import BespokeConsultationCTA from "../components/BespokeConsultationCTA";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800";

export default function TravellerWeddingsPage() {
  const { content } = usePageContent("traveller-weddings");
  const defaultTiers = [
    { title: "Floral Light-Up Letters", description: "4ft custom-built letters spelling family names — hand-finished with roses, hydrangea and trailing greenery.", price_label: "from £3,200", image_url: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1200" },
    { title: "Castle & Carriage Backdrops", description: "Fairytale-castle ceremony backdrops, Cinderella carriages and statement entrance arches.", price_label: "from £8,500", image_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200" },
    { title: "Cake Walls & Statement Florals", description: "8ft floral cake walls, oversized hanging chandeliers and entrance-arch installations.", price_label: "from £3,800", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200" },
    { title: "Top Table & Hall Florals", description: "30ft top-table runners, hall ceiling florals and full reception design.", price_label: "from £4,800", image_url: "https://images.pexels.com/photos/33886749/pexels-photo-33886749.png" },
    { title: "Horse-Drawn Carriage Florals", description: "Full floral drapes for the bridal horse and carriage on arrival.", price_label: "from £1,650", image_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200" },
    { title: "Bridal Party Bouquets", description: "Bridal bouquet, bridesmaids, flower girls, page boys, mothers and groomsmen.", price_label: "from £85 each", image_url: "https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=1200" },
  ];

  return (
    <div className="pt-28" data-testid="traveller-weddings-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-6 xl:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 lg:order-1 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Traveller Weddings</p>
              <h1 className="font-heading text-[2.25rem] sm:text-5xl xl:text-6xl 2xl:text-7xl font-light text-[#1A1A1A] leading-[1.05] tracking-tight mb-8 break-words" data-testid="traveller-weddings-title">
                A wedding<br />worth the <span className="italic text-[#B3A89B]">whole town</span><br />seeing.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                We&rsquo;ve been entrusted with traveller weddings across the UK and Ireland —
                grand-scale florals built to match the size of the celebration.
                Discreet, proud, generous, and never anything less than exceptional.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/consultation?service=traveller_wedding">
                  <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="traveller-wedding-consultation">
                    Book a consultation <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2 h-[55vh] lg:h-auto">
            <img src={content?.hero_image || HERO} alt="Traveller wedding floristry" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* What we understand */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Our Promise</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.1] mb-10">
            We understand<br /><span className="italic">what the day means.</span>
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-6">
            We&rsquo;ve built statement florals for traveller weddings from 200 to 800+ guests.
            We know how big it needs to be, how much it needs to mean, and how to talk to families
            with the respect, pride and generosity the day deserves.
          </p>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed italic">
            We listen, never assume, and never compromise on the scale or impact of the work.
          </p>
        </div>
      </section>

      {/* Signature Pieces — editable in admin / Page Content */}
      <ServiceTiers
        content={content}
        defaultTiers={defaultTiers}
        eyebrow="Signature Pieces"
        heading={<>What we<br /><span className="italic">specialise in.</span></>}
        testId="traveller-wedding-tiers"
      />

      {/* Budget Guide */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1A1A] text-[#FAFAF7]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-14">
            <div className="lg:col-span-7">
              <p className="accent-label !text-[#B3A89B] mb-5"><span className="thin-rule !bg-[#B3A89B]" />Investment</p>
              <h2 className="font-heading text-4xl md:text-6xl font-light leading-[1.05]">
                A guide to<br /><span className="italic text-[#B3A89B]">scale.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="font-body text-base text-[#FAFAF7]/75 leading-relaxed">
                Every wedding is fully bespoke and quoted on consultation —
                but here&rsquo;s a guide so we can have an open, honest conversation
                from the start.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { tier: "Intimate", range: "£8,000 – £15,000", desc: "Bridal florals, key installations and ceremony backdrop." },
              { tier: "Signature", range: "£15,000 – £25,000", desc: "Full ceremony & reception design, including statement letters and arches." },
              { tier: "Full Experience", range: "£25,000 – £40,000+", desc: "End-to-end design — castle backdrop, carriage florals, cake wall, letters & full reception." },
            ].map((b, i) => (
              <div key={i} className="border border-[#FAFAF7]/15 p-8" data-testid={`traveller-budget-${i}`}>
                <p className="accent-label !text-[#B3A89B] mb-3">{b.tier}</p>
                <p className="font-heading text-3xl font-light mb-4">{b.range}</p>
                <p className="font-body text-sm text-[#FAFAF7]/75 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bespoke Consultation — primary path, ties to the budget tiers above */}
      <BespokeConsultationCTA
        service="traveller_wedding"
        heading={<>We bring your wedding<br />to life — <em className="text-[#B3A89B]">at a budget that fits.</em></>}
        subheading="Whether it's £8,000 or £40,000+ — tell us your dream, your venue, your guest count and your scale. We design and quote a bespoke proposal that lands exactly on the budget that's right for you. No surprises, no compromise."
      />

      {/* Ready Collection — buy direct */}
      <ReadyCollectionCTA
        occasion="traveller_wedding"
        heading={<>Posies &amp; buttonholes,<br /><em>order direct.</em></>}
        subheading="For the wedding party — bridesmaid posies, mothers' posies and buttonholes available in standard sizes, ready to dispatch. Larger statement pieces &amp; full wedding installs remain bespoke and consultation-led."
        examples={["Bridesmaid Posy · £85", "Buttonhole · £25", "Ready Bridal Posy · £245"]}
      />

      {/* Mini Portfolio */}
      <MiniPortfolio
        category="traveller_wedding"
        title={<>Recent <em>traveller wedding</em> works.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1] mb-12">
            Let&rsquo;s plan<br /><span className="italic">your day.</span>
          </h2>
          <Link to="/consultation?service=traveller_wedding">
            <Button className="btn-dark rounded-none">Begin a consultation</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

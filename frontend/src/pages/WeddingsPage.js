import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MiniPortfolio from "../components/MiniPortfolio";
import ReadyCollectionCTA from "../components/ReadyCollectionCTA";
import BespokeConsultationCTA from "../components/BespokeConsultationCTA";
import ServiceHero from "../components/ServiceHero";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

const DEFAULT_HERO = {
  hero_eyebrow: "Weddings",
  hero_title_line1: "Your day,", hero_title_line2: "in", hero_title_italic: "bloom.",
  hero_subheading: "From intimate ceremonies to destination weddings across the UK and Europe — we design, install and dismantle entirely in-house. One florist. One vision. Impeccably executed.",
  hero_image: "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1800",
  hero_cta_label: "Book a wedding consultation", hero_cta_url: "/consultation?service=wedding",
};

const DEFAULT_TIERS = [
  { title: "Bridal Couture Bouquet", description: "The crowning composition — garden roses, ranunculus and sweet peas, hand-tied with silk.", price_label: "from £245", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200" },
  { title: "Bridesmaids & Attendants", description: "Coordinated miniature editions for the wedding party.", price_label: "from £95 each", image_url: "https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=1200" },
  { title: "Ceremony Installations", description: "Altars, arches, chuppahs and statement pedestals.", price_label: "from £2,500", image_url: "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png" },
  { title: "Reception Tablescapes", description: "Low runners, elevated centrepieces and candlescape design.", price_label: "from £1,800", image_url: "https://images.pexels.com/photos/33886749/pexels-photo-33886749.png" },
];

export default function WeddingsPage() {
  const { content, loading } = usePageContent("weddings");
  const heroDefaults = DEFAULT_HERO;

  return (
    <div className="pt-28" data-testid="weddings-page">
      <ServiceHero content={content} defaults={heroDefaults} loading={loading} testId="weddings-hero" titleTestId="weddings-title" />

      {/* Process — kept static */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />The Process</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Four deliberate<br /><span className="italic">stages.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14">
            {[
              { step: "01", title: "Consultation", desc: "A quiet conversation — your venue, your style, your season." },
              { step: "02", title: "Design", desc: "A bespoke mood-board and transparent, fixed-fee proposal." },
              { step: "03", title: "Creation", desc: "Hand-tied in our atelier the evening before your day." },
              { step: "04", title: "Installation", desc: "We install, style, photograph and break down." },
            ].map((step) => (
              <div key={step.step}>
                <p className="font-heading text-6xl font-light text-[#B3A89B] mb-4">{step.step}</p>
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-3">{step.title}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceTiers
        content={content}
        defaultTiers={DEFAULT_TIERS}
        eyebrow="Services"
        heading={<>Complete wedding<br /><span className="italic">floristry.</span></>}
        testId="weddings-tiers"
      />

      <BespokeConsultationCTA
        service="wedding"
        heading={<>We bring your wedding<br />to life — <em className="text-[#B3A89B]">at a budget that fits.</em></>}
        subheading="Tell us about your venue, your colours, your guest count and your dream. From £8,000 intimate ceremonies to full destination weddings, we design and quote a bespoke proposal entirely around the budget that's right for you."
      />

      <ReadyCollectionCTA
        occasion="wedding"
        eyebrow="The Ready Collection"
        heading={<>Bridesmaids &amp; buttonholes,<br /><em>ready to order.</em></>}
        subheading="For intimate weddings, registry days and the wedding party — we hold a small edit of ready bridal posies, standard bridesmaid posies and buttonholes. No consultation required."
        examples={["Ready Bridal Posy · £245", "Bridesmaid Posy · £85", "Buttonhole · £25"]}
      />

      <MiniPortfolio category="wedding" title={<>Recent <em>wedding</em> works.</>} />

      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1] mb-12">
            Your wedding,<br /><span className="italic">our hands.</span>
          </h2>
          <Link to="/consultation">
            <Button className="btn-dark rounded-none" data-testid="cta-wedding-consultation">Begin a consultation</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

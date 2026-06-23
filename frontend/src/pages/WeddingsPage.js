import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ReadyCollectionCTA from "../components/ReadyCollectionCTA";

const HERO = "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1800";
const IMG_1 = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200";
const IMG_2 = "https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=1200";

export default function WeddingsPage() {
  const services = [
    { title: "Bridal Couture Bouquet", description: "The crowning composition — garden roses, ranunculus and sweet peas, hand-tied with silk.", price: "from £245", image: IMG_1 },
    { title: "Bridesmaids & Attendants", description: "Coordinated miniature editions for the wedding party.", price: "from £95 each", image: IMG_2 },
    { title: "Ceremony Installations", description: "Altars, arches, chuppahs and statement pedestals.", price: "from £2,500", image: "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png" },
    { title: "Reception Tablescapes", description: "Low runners, elevated centrepieces and candlescape design.", price: "from £1,800", image: "https://images.pexels.com/photos/33886749/pexels-photo-33886749.png" },
  ];

  return (
    <div className="pt-28" data-testid="weddings-page">
      {/* Editorial hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 lg:order-1 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Weddings</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10" data-testid="weddings-title">
                Your day, <br />in <span className="italic text-[#B3A89B]">bloom.</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                From intimate ceremonies to destination weddings across the UK and Europe —
                we design, install and dismantle entirely in-house. One florist. One vision.
                Impeccably executed.
              </p>
              <Link to="/consultation">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="book-wedding-consultation">
                  Book a wedding consultation <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 h-[55vh] lg:h-auto">
            <img src={HERO} alt="Wedding floristry" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Process */}
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

      {/* Services */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Services</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Complete wedding<br /><span className="italic">floristry.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {services.map((service, idx) => (
              <div key={idx} className="group" data-testid={`wedding-service-${idx}`}>
                <div className="aspect-[4/3] image-hover-container mb-6 bg-white">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-heading text-3xl font-light text-[#1A1A1A] mb-3 group-hover:italic transition-all">{service.title}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-3">{service.description}</p>
                <p className="accent-label text-[#1A1A1A]">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready Collection — buy direct */}
      <ReadyCollectionCTA
        occasion="wedding"
        eyebrow="The Ready Collection"
        heading={<>Bridesmaids &amp; buttonholes,<br /><em>ready to order.</em></>}
        subheading="For intimate weddings, registry days and the wedding party — we hold a small edit of ready bridal posies, standard bridesmaid posies and buttonholes. No consultation required."
        examples={["Ready Bridal Posy · £245", "Bridesmaid Posy · £85", "Buttonhole · £25"]}
      />

      {/* Mini Portfolio — Wedding works */}
      <MiniPortfolio
        category="wedding"
        title={<>Recent <em>wedding</em> works.</>}
      />

      {/* CTA */}
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

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ReadyCollectionCTA from "../components/ReadyCollectionCTA";
import BespokeConsultationCTA from "../components/BespokeConsultationCTA";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

export default function SympathyPage() {
  const { content } = usePageContent("sympathy");
  const defaultTiers = [
    { title: "Casket & Coffin Tributes", description: "Hand-tied sprays for the service.", price_label: "from £180", image_url: "https://images.unsplash.com/photo-1593019776922-e6ad79c69947?w=1200" },
    { title: "Standing Arrangements", description: "Elegant pedestal and easel tributes.", price_label: "from £220", image_url: "https://images.unsplash.com/photo-1486818203489-37b06f23a3a8?w=1200" },
    { title: "Letter Tributes", description: "Meaningful words in bloom — DAD, MUM, NAN.", price_label: "from £240", image_url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200" },
    { title: "Sympathy Bouquets", description: "For the family, with care.", price_label: "from £85", image_url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200" },
  ];

  return (
    <div className="pt-28" data-testid="sympathy-page">
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
              funeral directors across Leicester and the Midlands to ensure seamless, quiet
              delivery on your most difficult day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Tributes — pricing editable in admin / Page Content */}
      <ServiceTiers
        content={content}
        defaultTiers={defaultTiers}
        eyebrow="Tributes"
        heading={<>Forms of<br /><span className="italic">remembrance.</span></>}
        testId="sympathy-tiers"
      />

      {/* Bespoke Consultation — primary path */}
      <BespokeConsultationCTA
        service="sympathy"
        heading={<>We bring your tribute<br />to life — <em className="text-[#B3A89B]">at a budget that fits.</em></>}
        subheading="Tell us about your loved one — their life, their colours, the symbols that mattered. We'll design and quote a bespoke tribute that honours them perfectly, within the budget that's right for you."
        tone="white"
      />

      {/* Ready Collection — buy direct */}
      <ReadyCollectionCTA
        occasion="sympathy"
        heading={<>Standard tributes,<br /><em>ready to order.</em></>}
        subheading="When time allows, we hold a curated edit of classic standard-size pieces — wreaths, hearts, casket sprays and sympathy bouquets — built to order in our atelier with a 4-day lead time. Fresh stems sourced direct from Holland and Colombia."
        examples={["Classic White Wreath · £165", "Sympathy Casket Spray · £275", "Classic Heart Tribute · £220", "Quiet Lily Tribute · £140"]}
      />

      {/* Mini Portfolio — Sympathy works */}
      <MiniPortfolio
        category="sympathy"
        title={<>Recent <em>sympathy</em> works.</>}
        tone="white"
      />

      {/* Contact */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />We are here</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-10">
            When you need us,<br /><span className="italic">quietly.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/consultation"><Button className="btn-dark rounded-none inline-flex items-center gap-3">Send an enquiry <ArrowRight size={14} /></Button></Link>
            <Link to="/consultation"><Button className="btn-outline-dark rounded-none inline-flex items-center gap-3">Request a callback <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

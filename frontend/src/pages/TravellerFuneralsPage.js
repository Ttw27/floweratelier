import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Heart } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ReadyCollectionCTA from "../components/ReadyCollectionCTA";
import BespokeConsultationCTA from "../components/BespokeConsultationCTA";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1800";

const DEFAULT_LETTER_TRIBUTES = [
  { size: "1ft Letters", price: "from £180", desc: "Single letters or short names — \u2018DAD\u2019, \u2018MUM\u2019, \u2018NAN\u2019" },
  { size: "2ft Letters", price: "from £320", desc: "Larger letters with a sturdy bespoke timber frame and full backing" },
  { size: "3ft Letters", price: "from £650", desc: "Statement letters — visible the length of the service, fully framed" },
  { size: "Oversized & Bespoke", price: "from £950", desc: "Multi-letter phrases, custom names and oversized commissions" },
];

const DEFAULT_BESPOKE_BUILDS = [
  { name: "Floral Cars", desc: "Full-size 3D floral car tributes — Bentley, Rolls Royce, Mercedes, classic British models — finished with detailed grille, badge and number plate.", price: "from £4,200" },
  { name: "Floral Caravans", desc: "Six-foot 3D caravan tributes — fully built on steel frame with personalised registration plate and door details.", price: "from £2,800" },
  { name: "Floral Horses", desc: "Life-size floral horse tributes — for the lifelong horseman, with floral mane and detailed bridle work.", price: "from £3,500" },
  { name: "Floral Hearses", desc: "Carriage and hearse tributes — fully sculpted in floral, with horses where requested.", price: "from £5,800" },
  { name: "Personal Items", desc: "Pint glasses, steering wheels, snooker cues, lurchers, fishing rods — anything that meant something. We work from photographs.", price: "from £580" },
  { name: "Football Crests", desc: "Hand-built crest tributes in full club colours on bespoke timber frame.", price: "from £720" },
];

const DEFAULT_CLASSIC_TRIBUTES = [
  "Gates of Heaven (1ft–6ft)", "Open Bibles & Open Books", "Crosses (1ft–6ft)",
  "Open & Closed Hearts", "Pillows & Cushions", "Casket Sprays", "Full Coffin Sprays",
  "Hearse Top-Pieces", "Horse-Drawn Carriage Sprays", "Wreaths & Standing Easels",
  "Phrases — \u2018Gone but not forgotten\u2019, \u2018With the angels now\u2019, \u2018Rest easy\u2019",
  "Birthdate & age numerals",
];

export default function TravellerFuneralsPage() {
  const { content, loading } = usePageContent("traveller-funerals");
  const letterTributes  = (content?.extra?.letter_tributes  && content.extra.letter_tributes.length  > 0) ? content.extra.letter_tributes  : DEFAULT_LETTER_TRIBUTES;
  const bespokeBuilds   = (content?.extra?.bespoke_builds   && content.extra.bespoke_builds.length   > 0) ? content.extra.bespoke_builds   : DEFAULT_BESPOKE_BUILDS;
  const classicTributes = (content?.extra?.classic_tributes && content.extra.classic_tributes.length > 0) ? content.extra.classic_tributes : DEFAULT_CLASSIC_TRIBUTES;

  return (
    <div className="pt-28" data-testid="traveller-funerals-page">
      {/* Hero — quiet, dignified */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-6">
            <p className="accent-label mb-8"><span className="thin-rule" />{content?.hero_eyebrow || "Traveller Funerals"}</p>
            <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8" data-testid="traveller-funerals-title">
              {content?.hero_title_line1 || "A final tribute"}<br /><span className="italic text-[#B3A89B]">{content?.hero_title_italic || "worthy"}</span>{content ? (content.hero_title_line2 ? <> {content.hero_title_line2}</> : null) : <> of the life.</>}
            </h1>
            <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-6 max-w-lg">
              {content?.hero_subheading || "We've crafted bespoke floral tributes for traveller funerals across the UK — letter tributes from 1ft to 3ft+, full 3D floral builds, and classic pieces that honour the loved one's life in the truest possible way."}
            </p>
            <p className="font-body text-base text-[#1A1A1A] leading-relaxed mb-10 max-w-lg italic">
              Proud, generous, dignified — and built to be seen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={content?.hero_cta_url || "/consultation?service=traveller_funeral"} data-testid="traveller-funerals-consultation">
                <Button className="btn-outline-dark rounded-none inline-flex items-center gap-3">
                  {content?.hero_cta_label || "Request a callback"} <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            {(content?.hero_image || !loading) && <img src={content?.hero_image || HERO} alt="Traveller funeral tribute" className="w-full aspect-[4/5] object-cover" />}
          </div>
        </div>
      </section>

      {/* Letter Tributes */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-7">
              <p className="accent-label mb-5"><span className="thin-rule" />Letter Tributes</p>
              <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05]">
                Names &amp; words,<br /><span className="italic">in bloom.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed">
                From 1ft single letters to 3ft+ commissions, every letter tribute is hand-built
                in our atelier on a sturdy bespoke timber frame, designed to travel and stand
                throughout the service.
              </p>
              <p className="font-body text-sm text-[#1A1A1A] mt-4 italic">
                DAD · MUM · NAN · GRANDAD · SON · DAUGHTER · BROTHER · SISTER · UNCLE · AUNT · POPS — and full names on request.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {letterTributes.map((t, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10" data-testid={`letter-tribute-${idx}`}>
                <p className="font-heading text-5xl font-light text-[#B3A89B] mb-4">{String(idx + 1).padStart(2, "0")}</p>
                <h3 className="font-heading text-xl font-light text-[#1A1A1A] mb-3">{t.size}</h3>
                <p className="font-body text-xs text-[#7A7A7A] leading-relaxed mb-5">{t.desc}</p>
                <p className="accent-label text-[#1A1A1A]">{t.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Bespoke Builds */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Bespoke Builds</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Full 3D<br /><span className="italic">floral commissions.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {bespokeBuilds.map((b, idx) => (
              <div key={idx} className="bg-white border border-[#E5E5E5] p-8 md:p-10 hover:border-[#1A1A1A] transition-all" data-testid={`bespoke-build-${idx}`}>
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-4">{b.name}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-5">{b.desc}</p>
                <p className="accent-label text-[#1A1A1A]">{b.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classic Tributes */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <p className="accent-label mb-5"><span className="thin-rule" />Classic Tributes</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05]">
                Timeless<br /><span className="italic">forms.</span>
              </h2>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mt-6 mb-8">
                Alongside our bespoke commissions, we craft all of the traditional tribute
                forms — from heart sprays to full coffin pieces.
              </p>
              <p className="accent-label text-[#1A1A1A]">from £180</p>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {classicTributes.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-3 border-b border-[#E5E5E5]" data-testid={`classic-tribute-${idx}`}>
                    <Heart size={14} strokeWidth={1.3} className="text-[#B3A89B] flex-shrink-0" />
                    <span className="font-body text-sm text-[#1A1A1A]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* National Delivery banner */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#1A1A1A] text-[#FAFAF7]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label !text-[#B3A89B] mb-6">National Coverage</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.05] mb-8">
            Wherever the service is held,<br /><span className="italic text-[#B3A89B]">we&rsquo;ll be there.</span>
          </h2>
          <p className="font-body text-base text-[#FAFAF7]/75 leading-relaxed mb-10 max-w-xl mx-auto">
            We deliver across the UK and Ireland. Urgent and same-day commissions accommodated
            wherever possible — please call directly to discuss.
          </p>
          <Link to="/consultation?service=traveller_funeral">
            <Button className="bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#B3A89B] px-8 py-4 rounded-none inline-flex items-center gap-3 font-body text-xs uppercase tracking-[0.22em]" data-testid="traveller-funeral-call-banner">
              Send an enquiry <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Bespoke Consultation — primary path */}
      <BespokeConsultationCTA
        service="traveller_funeral"
        heading={<>We bring their tribute<br />to life — <em className="text-[#B3A89B]">at a budget that fits.</em></>}
        subheading="Whatever you have in mind — a 3ft letter tribute, a floral car, a horse, a caravan, or something else entirely — tell us their story and your vision. We'll design and quote a bespoke piece that fits the budget that's right for you."
      />

      {/* Ready Collection — buy direct, no consultation needed */}
      <ReadyCollectionCTA
        occasion="traveller_funeral"
        heading={<>Standard sizes,<br /><em>order direct.</em></>}
        subheading="A curated edit of standard letter tributes and classic pieces, built to order in our atelier with a 4-day lead time. Fresh stems sourced direct from Holland and Colombia — no consultation required."
        examples={["1ft 'DAD' Letter · £180", "1ft 'MUM' Letter · £180", "1ft 'NAN' Letter · £180", "2ft Cross · £280", "2ft Gates of Heaven · £380", "Classic Heart · £220"]}
        tone="dark"
      />

      {/* Mini Portfolio */}
      <MiniPortfolio
        category="traveller_funeral"
        title={<>Recent <em>traveller funeral</em> works.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />We are here</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            With you,<br /><span className="italic">at every step.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/consultation?service=traveller_funeral"><Button className="btn-dark rounded-none inline-flex items-center gap-3">Send an enquiry <ArrowRight size={14} /></Button></Link>
            <Link to="/consultation?service=traveller_funeral"><Button className="btn-outline-dark rounded-none inline-flex items-center gap-3">Request a callback <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

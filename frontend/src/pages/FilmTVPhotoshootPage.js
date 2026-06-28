import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Film, Image } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import ServiceTiers from "../components/ServiceTiers";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1800";

export default function FilmTVPhotoshootPage() {
  const { content } = usePageContent("film-tv-photoshoot");
  const defaultTiers = [
    { title: "Editorial & Beauty Shoots", description: "Set florals for magazine editorials, beauty campaigns and skincare hero shots — colour-graded to the creative brief.", price_label: "from £1,450 / day", image_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200" },
    { title: "Fashion Lookbooks", description: "Wild, garden or sculptural florals styled into lookbook and e-commerce shoots.", price_label: "from £1,850 / day", image_url: "https://images.unsplash.com/photo-1583336663277-620dc1996580?w=1200" },
    { title: "Music Videos", description: "Hero floral builds for music video productions — petal baths, floor florals, floral architecture.", price_label: "from £3,200", image_url: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=1200" },
    { title: "Film & TV Set Florals", description: "Period-accurate or contemporary floral set dressing — for series, features and commercials.", price_label: "from £2,800 / day", image_url: "https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?w=1200" },
    { title: "Brand Campaign Florals", description: "Hero stems, custom builds and bespoke florals shot for global advertising.", price_label: "from £1,200", image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200" },
    { title: "Daily Studio Programmes", description: "Talk-show, news and breakfast-TV studio florals delivered daily on a long-term retainer.", price_label: "from £680 / day", image_url: "https://images.unsplash.com/photo-1606293926249-ed24cb1f7b97?w=1200" },
  ];

  const credits = ["Vogue", "Tatler", "British GQ", "Harper's Bazaar", "Netflix", "BBC", "Burberry", "Charlotte Tilbury"];

  return (
    <div className="pt-28" data-testid="film-tv-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[50vh] lg:h-auto">
            {(content?.hero_image || !loading) && <img src={content?.hero_image || HERO} alt="Film and photoshoot florals" className="w-full h-full object-cover" />}
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Film, TV &amp; Photoshoot</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8" data-testid="film-tv-title">
                Florals,<br />for the <span className="italic text-[#B3A89B]">camera.</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Set florals and bespoke commissions for editorials, music videos, film, television
                and brand campaigns. Reliable, fast, on-brief — and built for the lens.
              </p>
              <Link to="/consultation?service=film_tv">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="film-tv-enquire">
                  Brief us — same day reply <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Credits strip */}
      <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#E5E5E5] bg-[#FAFAF7]" data-testid="film-tv-credits">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label text-center mb-6">Selected Credits</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-14 gap-y-3">
            {credits.map((c) => (
              <span key={c} className="font-heading text-xl md:text-2xl font-light italic text-[#7A7A7A]">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services — editable in admin / Page Content */}
      <ServiceTiers
        content={content}
        defaultTiers={defaultTiers}
        eyebrow="Services"
        heading={<>Built for<br /><span className="italic">production.</span></>}
        testId="film-tv-tiers"
      />

      {/* Logistics */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1A1A] text-[#FAFAF7]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="accent-label !text-[#B3A89B] mb-6"><span className="thin-rule !bg-[#B3A89B]" />Why us</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.05]">
              Same-day briefs,<br /><span className="italic text-[#B3A89B]">on set.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { title: "Fast turnarounds", desc: "Same-day quotes; flexible scheduling on set across the Midlands and the UK." },
              { title: "On-set styling", desc: "Our team comes to set to dress, restyle and reset between takes." },
              { title: "Continuity care", desc: "Hero stems preserved, swapped and replaced as the shoot progresses." },
              { title: "Production-friendly", desc: "We invoice through your production company, work to call-sheets, and disappear when the camera's rolling." },
            ].map((p, i) => (
              <div key={i} className="border-l border-[#FAFAF7]/15 pl-5">
                <p className="accent-label !text-[#B3A89B] mb-2">{p.title}</p>
                <p className="font-body text-sm text-[#FAFAF7]/75 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Portfolio */}
      <MiniPortfolio
        category="film_tv"
        title={<>Recent <em>film &amp; photoshoot</em> works.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Brief us,<br /><span className="italic">we&rsquo;re ready.</span>
          </h2>
          <Link to="/consultation?service=film_tv"><Button className="btn-dark rounded-none">Brief us</Button></Link>
        </div>
      </section>
    </div>
  );
}

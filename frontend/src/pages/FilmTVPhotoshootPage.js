import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Film, Image } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";

const HERO = "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1800";

export default function FilmTVPhotoshootPage() {
  const services = [
    { icon: Camera, name: "Editorial & Beauty Shoots", desc: "Set florals for magazine editorials, beauty campaigns and skincare hero shots — colour-graded to the creative brief.", price: "from £1,450 / day" },
    { icon: Image, name: "Fashion Lookbooks", desc: "Wild, garden or sculptural florals styled into lookbook and e-commerce shoots.", price: "from £1,850 / day" },
    { icon: Film, name: "Music Videos", desc: "Hero floral builds for music video productions — petal baths, floor florals, floral architecture.", price: "from £3,200" },
    { icon: Film, name: "Film & TV Set Florals", desc: "Period-accurate or contemporary floral set dressing — for series, features and commercials.", price: "from £2,800 / day" },
    { icon: Camera, name: "Brand Campaign Florals", desc: "Hero stems, custom builds and bespoke florals shot for global advertising.", price: "from £1,200" },
    { icon: Film, name: "Daily Studio Programmes", desc: "Talk-show, news and breakfast-TV studio florals delivered daily on a long-term retainer.", price: "from £680 / day" },
  ];

  const credits = ["Vogue", "Tatler", "British GQ", "Harper's Bazaar", "Netflix", "BBC", "Burberry", "Charlotte Tilbury"];

  return (
    <div className="pt-28" data-testid="film-tv-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[50vh] lg:h-auto">
            <img src={HERO} alt="Film and photoshoot florals" className="w-full h-full object-cover" />
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

      {/* Services */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Services</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Built for<br /><span className="italic">production.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-white p-10" data-testid={`film-tv-service-${idx}`}>
                  <Icon size={20} strokeWidth={1.3} className="text-[#B3A89B] mb-5" />
                  <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-3">{s.name}</h3>
                  <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-5">{s.desc}</p>
                  <p className="accent-label text-[#1A1A1A]">{s.price}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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

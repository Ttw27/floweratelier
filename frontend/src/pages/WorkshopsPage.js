import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Heart, Sparkles, Leaf } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";

const HERO = "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1800&q=80";

export default function WorkshopsPage() {
  const workshops = [
    {
      tag: "Christmas",
      icon: Sparkles,
      name: "Christmas Door Wreath Workshop",
      season: "Late November · December",
      duration: "2.5 hours",
      groupSize: "Up to 14 guests",
      price: "from £95 per guest",
      desc: "An evening of mulled wine, foraged foliage and gilded ribbons. Each guest leaves with a 14&Prime; door wreath built on a moss base — eucalyptus, blue spruce, dried oranges and your choice of velvet ribbon.",
      includes: ["All materials, secateurs & wire", "Mulled wine, cheese and mince pies", "A take-home wreath box for the journey"],
    },
    {
      tag: "Halloween",
      icon: Leaf,
      name: "Halloween Wreath Workshop",
      season: "October",
      duration: "2 hours",
      groupSize: "Up to 14 guests",
      price: "from £75 per guest",
      desc: "Moody, painterly autumnal wreaths in oxblood, copper and bronze — dried hydrangea, blackberry, dyed grasses and small pumpkins. A favourite for hen-dos, friend-groups and corporate teams in the run-up to half-term.",
      includes: ["All materials, base, wire & secateurs", "Spiced cider & seasonal grazing board", "Studio photography of your finished piece"],
    },
    {
      tag: "Care Homes",
      icon: Heart,
      name: "Bouquet Workshops for Care Homes",
      season: "Year-round · weekly or monthly",
      duration: "60–90 minutes",
      groupSize: "Up to 20 residents",
      price: "from £18 per resident",
      desc: "A gentle, seated workshop designed with care-home activity coordinators. Residents arrange a small hand-tied posy from soft-stemmed seasonal blooms — dementia-friendly facilitation, fully sanitised tools, no thorns, and a vase to take back to their room.",
      includes: ["Florist-led, fully insured facilitator", "All flowers, vases & sanitised tools", "Pre-event consult with your activity team"],
    },
  ];

  return (
    <div className="pt-28" data-testid="workshops-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[50vh] lg:h-auto">
            <img src={HERO} alt="Florist workshop in progress" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Workshops</p>
              <h1 className="font-heading text-[2.5rem] sm:text-5xl xl:text-6xl 2xl:text-7xl font-light text-[#1A1A1A] leading-[1.05] tracking-tight mb-8 break-words" data-testid="workshops-title">
                An evening<br />by the <span className="italic text-[#B3A89B]">studio bench</span>.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Hosted at the atelier, in your office, or in your care community. Seasonal wreath
                workshops at Halloween &amp; Christmas, and dementia-friendly bouquet sessions
                designed with activity coordinators — every guest leaves with something hand-made.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/consultation">
                  <Button className="btn-dark py-6 px-8 rounded-none w-full sm:w-auto" data-testid="workshops-cta-enquire">
                    Book a workshop <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
                  </Button>
                </Link>
                <Link to="/portfolio?category=workshop">
                  <Button variant="outline" className="rounded-none py-6 px-8 w-full sm:w-auto" data-testid="workshops-cta-portfolio">
                    See past workshops
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="accent-label mb-4"><span className="thin-rule" />Three formats</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#1A1A1A] tracking-tight leading-[1.05]">
              Built around the season &mdash; and around the room.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {workshops.map((w) => (
              <article key={w.name} className="bg-[#FAFAF7] border border-[#E5E5E5] p-8 flex flex-col" data-testid={`workshop-card-${w.tag.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-center gap-3 mb-5">
                  <w.icon size={18} strokeWidth={1.3} className="text-[#1A1A1A]" />
                  <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A]">{w.tag}</span>
                </div>
                <h3 className="font-heading text-2xl text-[#1A1A1A] font-light mb-3 leading-snug">{w.name}</h3>
                <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#B3A89B] mb-5">{w.season}</p>
                <p className="font-body text-sm text-[#5A5A5A] leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: w.desc }} />

                <ul className="space-y-2 mb-6 flex-1">
                  {w.includes.map((line) => (
                    <li key={line} className="flex gap-2 text-sm text-[#1A1A1A]">
                      <span className="text-[#B3A89B] mt-1">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-5 border-t border-[#E5E5E5] flex items-center justify-between gap-3">
                  <div className="text-xs text-[#7A7A7A] uppercase tracking-wider">
                    <p>{w.duration}</p>
                    <p>{w.groupSize}</p>
                  </div>
                  <p className="font-heading text-base text-[#1A1A1A]">{w.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Who hosts */}
      <section className="py-20 md:py-28 px-6 md:px-12 paper-accent border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="accent-label mb-4"><span className="thin-rule" />Where we host</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight leading-[1.05] mb-6">
              At the atelier, your office, or a community room.
            </h2>
            <p className="font-body text-base text-[#5A5A5A] leading-relaxed mb-4">
              The atelier in Mayfair seats up to 14 around a single bench &mdash; perfect for hen-dos,
              friend groups and small corporate teams. For larger groups, care homes and offices, we
              travel to you with the whole studio in hand.
            </p>
            <p className="font-body text-base text-[#5A5A5A] leading-relaxed">
              All workshops are run by a senior florist with full public liability insurance.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <Stat label="Hosted to date" value="120+" />
            <Stat label="Guests welcomed" value="1,400+" />
            <Stat label="Care homes partnered" value="11" />
            <Stat label="Avg. group rating" value="4.9 / 5" />
          </div>
        </div>
      </section>

      {/* Mini portfolio */}
      <MiniPortfolio
        category="workshop"
        title={<>Recent <em>workshop</em> moments.</>}
      />

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#1A1A1A] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label text-white/70 mb-6"><span className="thin-rule bg-white/40" />Hosting one this season?</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight leading-[1.05] mb-8">
            Tell us your date &mdash; we&rsquo;ll build the bench around it.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/consultation">
              <Button className="bg-white text-[#1A1A1A] hover:bg-[#FAFAF7] py-6 px-8 rounded-none w-full sm:w-auto" data-testid="workshops-bottom-cta">
                Enquire about a workshop <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
              </Button>
            </Link>
            <a href="https://wa.me/447123456789?text=Hello%20Petals%20Atelier%20%E2%80%94%20I%20would%20like%20to%20book%20a%20workshop" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white hover:text-[#1A1A1A] rounded-none py-6 px-8 w-full sm:w-auto">
                WhatsApp the studio
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-[#E5E5E5] p-6">
      <p className="font-heading text-3xl text-[#1A1A1A] font-light mb-1">{value}</p>
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A]">{label}</p>
    </div>
  );
}

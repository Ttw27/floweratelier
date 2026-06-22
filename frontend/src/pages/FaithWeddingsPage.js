import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";

const HERO = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1800";

const TRADITIONS = [
  {
    id: "sikh",
    name: "Sikh — Anand Karaj",
    intro: "Gurdwara floral programmes designed with deep respect for tradition.",
    details: [
      "Marigold and rose garlands for the gurdwara entrance",
      "Palki canopy floral decoration",
      "Mala — exchange garlands for groom and bride",
      "Sukhmani sahib pathi venue florals",
    ],
    palette: ["#FFA500", "#E63946", "#FFE5B4", "#FFFFFF"],
    price: "from £4,200",
    image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=1200",
  },
  {
    id: "hindu",
    name: "Hindu — Mandap",
    intro: "Mandap installations and ceremony florals — vibrant, sacred, generous.",
    details: [
      "Four-pillar floral mandap installation",
      "Marigold thoran for the entrance",
      "Varmala garlands for the exchange",
      "Kalash decoration and pheras florals",
      "Sangeet and Mehndi event florals on request",
    ],
    palette: ["#FF6B35", "#E63946", "#FFA500", "#F4A261"],
    price: "from £6,800",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200",
  },
  {
    id: "jewish",
    name: "Jewish — Chuppah",
    intro: "Chuppah canopies and reception florals — quiet, elegant, dignified.",
    details: [
      "Floral chuppah canopy construction",
      "Ketubah signing table arrangement",
      "Bedeken room florals",
      "Reception centrepieces and aisle styling",
    ],
    palette: ["#FFFFFF", "#F5F5F2", "#E8D8D0", "#C4CFC0"],
    price: "from £5,400",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200",
  },
  {
    id: "muslim",
    name: "Muslim — Nikah & Mehndi",
    intro: "Ceremony décor designed with cultural sensitivity — from quiet Nikahs to vibrant Mehndis.",
    details: [
      "Nikah ceremony backdrop in cream and gold",
      "Walima reception design",
      "Mehndi event florals — vibrant and joyful",
      "Stage installations and bridal seating florals",
    ],
    palette: ["#FFFFF0", "#D4AF37", "#FFC4D7", "#FAFAF7"],
    price: "from £5,800",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200",
  },
  {
    id: "greek",
    name: "Greek Orthodox — Stephana",
    intro: "Church florals and crown stephana for traditional Greek Orthodox ceremonies.",
    details: [
      "Crown stephana for groom and bride",
      "Church entrance floral arch",
      "Lambada candle decoration",
      "Reception florals in white, ivory and gold",
    ],
    palette: ["#FFFFFF", "#D4AF37", "#F5E9D7", "#E8D8D0"],
    price: "from £3,200",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200",
  },
  {
    id: "chinese",
    name: "Chinese — Tea Ceremony",
    intro: "Tea ceremony installations honouring double-happiness and traditional symbolism.",
    details: [
      "Tea ceremony stage florals in red and gold",
      "Double-happiness floral installations",
      "Traditional peony arrangements",
      "Banquet table florals",
    ],
    palette: ["#C8232C", "#D4AF37", "#FFC4D7", "#FFE5B4"],
    price: "from £2,800",
    image: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1200",
  },
];

export default function FaithWeddingsPage() {
  const [active, setActive] = useState("sikh");
  const current = TRADITIONS.find((t) => t.id === active);

  return (
    <div className="pt-28" data-testid="faith-weddings-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto">
            <img src={HERO} alt="Faith and cultural weddings" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Faith &amp; Cultural Weddings</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8" data-testid="faith-weddings-title">
                Every <span className="italic text-[#B3A89B]">tradition,</span><br />honoured by hand.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Sikh, Hindu, Jewish, Muslim, Greek Orthodox, Chinese — we design floral
                programmes with deep respect for tradition, working closely with families,
                priests and faith leaders.
              </p>
              <Link to="/consultation?service=faith_wedding">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="faith-wedding-consultation">
                  Begin a consultation <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tradition Selector */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="accent-label mb-5"><span className="thin-rule" />The Traditions</p>
            <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05]">
              Choose a<br /><span className="italic">tradition.</span>
            </h2>
          </div>

          {/* Tradition tabs */}
          <div className="flex flex-wrap gap-6 mb-12 border-b border-[#E5E5E5] pb-1">
            {TRADITIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`nav-link font-body text-[11px] uppercase tracking-[0.22em] transition-colors pb-3 ${active === t.id ? "text-[#1A1A1A] active" : "text-[#7A7A7A] hover:text-[#1A1A1A]"}`}
                data-testid={`faith-tab-${t.id}`}
              >
                {t.name.split(" — ")[0]}
              </button>
            ))}
          </div>

          {/* Active tradition */}
          {current && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start" data-testid={`faith-content-${current.id}`}>
              <div className="lg:col-span-6">
                <img src={current.image} alt={current.name} className="w-full aspect-[4/5] object-cover" />
                <div className="flex gap-2 mt-5">
                  {current.palette.map((c) => (
                    <span key={c} title={c} className="block w-8 h-8 border border-[#E5E5E5]" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="accent-label mb-4">{current.name}</p>
                <h3 className="font-heading text-3xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-6">{current.intro}</h3>
                <ul className="space-y-3 mb-10">
                  {current.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-base text-[#7A7A7A] leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-[#1A1A1A] mt-3 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="accent-label text-[#1A1A1A] mb-8">{current.price}</p>
                <Link to={`/consultation?service=faith_wedding&ref_title=${encodeURIComponent(current.name)}`}>
                  <Button className="btn-dark rounded-none inline-flex items-center gap-3">
                    Enquire — {current.name.split(" — ")[0]} <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What we promise */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Our promise</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.1] mb-10">
            We listen first.<br /><span className="italic">Always.</span>
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-6">
            Every tradition holds meanings that the wrong supplier can quietly miss. We begin every
            consultation by listening — to families, to priests, to mothers and grandmothers —
            because the symbolism of every flower in your ceremony matters.
          </p>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed italic">
            If your tradition isn&rsquo;t listed above, please still get in touch — we work across every faith.
          </p>
        </div>
      </section>

      {/* Mini Portfolio */}
      <MiniPortfolio
        category="faith_wedding"
        title={<>Recent <em>faith &amp; cultural</em> works.</>}
      />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Begin</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1] mb-12">
            Tell us about<br /><span className="italic">your tradition.</span>
          </h2>
          <Link to="/consultation?service=faith_wedding">
            <Button className="btn-dark rounded-none">Begin a consultation</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HERO_IMG = "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png";
const HERO_IMG_2 = "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1200";

/**
 * Eight distinct directions. Each is a self-contained "scene" — palette,
 * typography, and layout — showing the same hero content rendered differently.
 */
const themes = [
  {
    id: "mayfair",
    name: "Mayfair Atelier",
    tag: "Current direction",
    description: "Editorial light luxury, Cormorant + Montserrat, ivory base, restrained taupe accents.",
    fonts: "Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;500",
    palette: ["#FAFAF7", "#1A1A1A", "#B3A89B", "#E8D8D0", "#C4CFC0"],
    render: () => (
      <div style={{ background: "#FAFAF7", color: "#1A1A1A", fontFamily: "'Montserrat', sans-serif" }} className="grid grid-cols-5 h-full">
        <div className="col-span-2 p-7 flex flex-col justify-center">
          <p style={{ letterSpacing: "0.3em", fontSize: 9 }} className="uppercase font-medium text-[#7A7A7A] mb-4">— Floral Couture</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 38, lineHeight: 0.95, letterSpacing: "-0.01em" }}>
            The language<br />
            of <em style={{ color: "#B3A89B" }}>flowers,</em><br />
            rewritten.
          </h2>
          <button style={{ background: "#1A1A1A", color: "#fff", letterSpacing: "0.22em" }} className="mt-5 px-4 py-2 text-[10px] uppercase w-fit">Shop Collection</button>
        </div>
        <div className="col-span-3 relative overflow-hidden">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    ),
  },
  {
    id: "vogue",
    name: "Vogue Editorial",
    tag: "Magazine",
    description: "Tabloid magazine impact — huge Bodoni italic, pure white, all-caps trackers, columned layout.",
    fonts: "Bodoni+Moda:ital,wght@0,400;1,500&family=Inter:wght@300;500",
    palette: ["#FFFFFF", "#0A0A0A", "#A8A39C", "#F5F5F2"],
    render: () => (
      <div style={{ background: "#FFFFFF", color: "#0A0A0A", fontFamily: "'Inter', sans-serif" }} className="h-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-3 border-b border-black/10">
          <p style={{ letterSpacing: "0.5em", fontSize: 9 }} className="uppercase">Issue No. 04 · London</p>
          <p style={{ letterSpacing: "0.5em", fontSize: 9 }} className="uppercase">February 2026</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-px bg-black/10">
          <div className="bg-white p-7 flex flex-col justify-center">
            <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 500, fontSize: 56, lineHeight: 0.85, letterSpacing: "-0.02em" }}>
              Petals<br />Atelier.
            </h2>
            <p style={{ letterSpacing: "0.3em", fontSize: 9 }} className="uppercase mt-5 text-black/50">Couture floristry · From £80</p>
            <p style={{ fontSize: 11 }} className="mt-3 text-black/70 leading-relaxed">A Mayfair atelier composing flowers as one would a sentence — quietly, deliberately, with intent.</p>
          </div>
          <div className="bg-[#F5F5F2] relative overflow-hidden">
            <img src={HERO_IMG} alt="" className="w-full h-full object-cover grayscale-[20%]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "apothecary",
    name: "Botanical Apothecary",
    tag: "Heritage",
    description: "Herbarium plate aesthetic — bone paper, small-caps serif, sage and clay accents, antique line ornaments.",
    fonts: "Cormorant+SC:wght@300;500&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Lora:wght@400;500",
    palette: ["#F4EFE6", "#3A3A2E", "#7B8A6B", "#B89478", "#D9D2C0"],
    render: () => (
      <div style={{ background: "#F4EFE6", color: "#3A3A2E", fontFamily: "'Lora', serif" }} className="h-full p-6 flex flex-col items-center justify-center text-center relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-px bg-[#7B8A6B]" />
        <p style={{ fontFamily: "'Cormorant SC', serif", letterSpacing: "0.4em", fontSize: 10 }} className="text-[#7B8A6B] mb-3">Established · Mayfair · 2008</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 44, lineHeight: 1, letterSpacing: "-0.01em" }}>
          Petals Atelier
        </h2>
        <div className="flex items-center gap-2 my-3">
          <span className="w-8 h-px bg-[#3A3A2E]/40" />
          <span style={{ fontFamily: "'Cormorant SC', serif", letterSpacing: "0.2em", fontSize: 11 }} className="text-[#B89478]">A study of bloom &amp; balance</span>
          <span className="w-8 h-px bg-[#3A3A2E]/40" />
        </div>
        <p style={{ fontSize: 11 }} className="max-w-xs mt-2 text-[#3A3A2E]/75 leading-relaxed">Herbarium-grade arrangements, hand-foraged blooms, and bespoke compositions for life's most considered occasions.</p>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="w-6 h-px bg-[#7B8A6B]" />
          <span style={{ fontFamily: "'Cormorant SC', serif", letterSpacing: "0.4em", fontSize: 9 }} className="text-[#7B8A6B]">No. 04</span>
          <span className="w-6 h-px bg-[#7B8A6B]" />
        </div>
      </div>
    ),
  },
  {
    id: "parisian-noir",
    name: "Parisian Noir",
    tag: "Couture",
    description: "Black-on-cream couture house — Playfair italic, gold rules, ultra-luxe and reductive.",
    fonts: "Playfair+Display:ital,wght@0,400;1,400;1,500&family=Cormorant+Garamond:wght@300&family=Inter:wght@300;500",
    palette: ["#0E0E0E", "#F5E9D7", "#C8A968", "#3A3A3A"],
    render: () => (
      <div style={{ background: "#0E0E0E", color: "#F5E9D7", fontFamily: "'Inter', sans-serif" }} className="h-full p-6 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-50">
          <img src={HERO_IMG_2} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0E0E0E 0%, transparent 100%)" }} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[#C8A968]" />
            <p style={{ letterSpacing: "0.4em", fontSize: 9 }} className="uppercase text-[#C8A968]">Maison · Paris &amp; London</p>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400, fontSize: 50, lineHeight: 0.9, letterSpacing: "-0.01em" }}>
            <em>The art</em> of<br />
            <em>arranging.</em>
          </h2>
          <p style={{ fontSize: 11 }} className="mt-4 text-[#F5E9D7]/70 max-w-[18rem] leading-relaxed">Couture floristry, by hand. Weddings · Sympathy · Houses · Maisons.</p>
          <button style={{ borderColor: "#C8A968", color: "#C8A968", letterSpacing: "0.3em", fontSize: 9 }} className="mt-5 border px-4 py-2 uppercase w-fit">Discover</button>
        </div>
      </div>
    ),
  },
  {
    id: "soft-romance",
    name: "Soft Romance",
    tag: "Romantic",
    description: "Blush + ivory dreamscape — DM Serif italic with handwritten signature accent. Wedding-led.",
    fonts: "DM+Serif+Display:ital@0;1&family=Caveat:wght@500&family=Inter:wght@300;500",
    palette: ["#FBF1F1", "#3D2A2A", "#C97B79", "#E8D8D0", "#F2DAD7"],
    render: () => (
      <div style={{ background: "#FBF1F1", color: "#3D2A2A", fontFamily: "'Inter', sans-serif" }} className="h-full grid grid-cols-2">
        <div className="p-6 flex flex-col justify-center">
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "#C97B79" }} className="mb-1">Hand-tied with love.</p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontWeight: 400, fontSize: 44, lineHeight: 0.95 }}>
            Petals Atelier
          </h2>
          <p style={{ fontSize: 11 }} className="mt-3 text-[#3D2A2A]/70 leading-relaxed">Romantic, considered floristry for weddings, anniversaries and the gestures that matter most.</p>
          <button style={{ background: "#C97B79", color: "#FBF1F1", borderRadius: 999, letterSpacing: "0.18em", fontSize: 9 }} className="mt-5 px-5 py-2.5 uppercase w-fit">Begin Your Story</button>
        </div>
        <div className="relative overflow-hidden">
          <div style={{ background: "#E8D8D0" }} className="absolute -top-6 -right-6 w-32 h-32 rounded-full" />
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover relative" />
        </div>
      </div>
    ),
  },
  {
    id: "japandi",
    name: "Japandi Calm",
    tag: "Quiet",
    description: "Warm beige, vast negative space, Noto Serif Display, sumi-ink type. Quiet, meditative.",
    fonts: "Noto+Serif+Display:ital@0;1&family=DM+Sans:wght@300;500",
    palette: ["#EFE9DD", "#1C1A17", "#A89A7E", "#D9CFB6"],
    render: () => (
      <div style={{ background: "#EFE9DD", color: "#1C1A17", fontFamily: "'DM Sans', sans-serif" }} className="h-full p-8 flex flex-col justify-between">
        <div className="flex justify-between items-baseline">
          <p style={{ fontFamily: "'Noto Serif Display', serif", fontSize: 13, letterSpacing: "0.05em" }}>Petals Atelier</p>
          <p style={{ fontSize: 9, letterSpacing: "0.3em" }} className="uppercase text-[#A89A7E]">緑 · No.04</p>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Noto Serif Display', serif", fontWeight: 300, fontSize: 38, lineHeight: 1.1, letterSpacing: "0.02em" }}>
            Less,<br />
            <em style={{ color: "#A89A7E", fontStyle: "italic" }}>arranged precisely.</em>
          </h2>
          <p style={{ fontSize: 11 }} className="mt-3 text-[#1C1A17]/65 leading-relaxed max-w-[20rem]">A floristry of restraint. One stem. One vessel. One moment.</p>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 9, letterSpacing: "0.3em" }} className="uppercase">Begin →</span>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1C1A17]" />
            <span className="w-2 h-2 rounded-full bg-[#A89A7E]" />
            <span className="w-2 h-2 rounded-full bg-[#D9CFB6]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "swiss",
    name: "Modern Swiss",
    tag: "Architectural",
    description: "Pure white grid, heavy Inter sans, monochrome, sharp dividers. Cool, contemporary, gallery-like.",
    fonts: "Inter:wght@200;500;800",
    palette: ["#FFFFFF", "#000000", "#E5E5E5"],
    render: () => (
      <div style={{ background: "#FFFFFF", color: "#000000", fontFamily: "'Inter', sans-serif" }} className="h-full grid grid-cols-12 grid-rows-6">
        <div className="col-span-12 row-span-1 border-b border-black/15 px-6 flex items-center justify-between">
          <p style={{ fontWeight: 800, fontSize: 11, letterSpacing: "-0.02em" }}>PETALS ATELIER</p>
          <p style={{ fontWeight: 500, fontSize: 9, letterSpacing: "0.15em" }}>SHOP — WEDDINGS — STUDIO</p>
        </div>
        <div className="col-span-7 row-span-5 px-6 flex flex-col justify-center">
          <h2 style={{ fontWeight: 200, fontSize: 64, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            Floral<br />works.
          </h2>
          <p style={{ fontWeight: 500, fontSize: 10, letterSpacing: "0.05em" }} className="mt-4 max-w-[18rem]">London-based. Object-led. Intentional. Established 2008.</p>
        </div>
        <div className="col-span-5 row-span-5 border-l border-black/15 relative overflow-hidden">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover grayscale" />
        </div>
      </div>
    ),
  },
  {
    id: "garden",
    name: "Garden Romanticist",
    tag: "Antique",
    description: "Aged paper, very thin Italiana display + Marcellus body, antique-green accents and ornaments.",
    fonts: "Italiana:wght@400&family=Marcellus:wght@400&family=Cormorant+Garamond:ital@0;1",
    palette: ["#F0EDE4", "#2E3A2C", "#9E8C5C", "#C2B596"],
    render: () => (
      <div style={{ background: "#F0EDE4", color: "#2E3A2C", fontFamily: "'Marcellus', serif" }} className="h-full p-6 flex flex-col justify-center relative overflow-hidden text-center">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#9E8C5C]">
          <span className="w-6 h-px bg-current" /><span style={{ fontSize: 14 }}>❦</span><span className="w-6 h-px bg-current" />
        </div>
        <h2 style={{ fontFamily: "'Italiana', serif", fontWeight: 400, fontSize: 64, lineHeight: 0.85, letterSpacing: "0.02em" }}>
          Petals<br /><em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, color: "#9E8C5C" }}>Atelier</em>
        </h2>
        <p style={{ fontSize: 11, fontStyle: "italic" }} className="mt-3 text-[#2E3A2C]/70">— A modest garden, brought indoors —</p>
        <p style={{ fontSize: 10 }} className="mt-3 max-w-xs mx-auto leading-relaxed text-[#2E3A2C]/65">Wild, untamed compositions of garden roses, foxglove, ranunculus &amp; sweet pea — gathered as nature intended.</p>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#9E8C5C]">
          <span className="w-6 h-px bg-current" /><span style={{ fontSize: 14 }}>❦</span><span className="w-6 h-px bg-current" />
        </div>
      </div>
    ),
  },
];

function ThemeCard({ theme }) {
  return (
    <div className="group" data-testid={`theme-card-${theme.id}`}>
      <div className="aspect-[4/3] border border-[#E5E5E5] overflow-hidden bg-white shadow-sm group-hover:shadow-xl transition-all duration-500">
        {theme.render()}
      </div>
      <div className="pt-5 flex items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#B3A89B] mb-1.5">{theme.tag}</p>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">{theme.name}</h3>
          <p className="font-body text-xs text-[#7A7A7A] mt-1.5 leading-relaxed max-w-md">{theme.description}</p>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          {theme.palette.map((c) => (
            <span key={c} title={c} className="block w-5 h-5 border border-[#E5E5E5]" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThemePreviewPage() {
  // Inject all the Google fonts used by the previews so each card renders authentically
  useEffect(() => {
    const families = themes.map((t) => `family=${t.fonts}`).join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.id = "theme-preview-fonts";
    document.head.appendChild(link);
    return () => { document.getElementById("theme-preview-fonts")?.remove(); };
  }, []);

  return (
    <div className="min-h-screen pt-20" data-testid="theme-preview-page">
      {/* Hero */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-6"><span className="thin-rule" />Direction Lab</p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8 max-w-5xl">
            Eight directions.<br />
            One <em className="text-[#B3A89B]">atelier.</em>
          </h1>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed max-w-2xl mb-4">
            Same content, eight aesthetic territories. Each card below is a fully-rendered
            preview using its own typography &amp; palette. Pick the one that feels right
            and the entire site can be re-skinned to match.
          </p>
          <p className="font-body text-xs uppercase tracking-[0.22em] text-[#B3A89B]">
            Currently live · Mayfair Atelier (No. 01)
          </p>
        </div>
      </section>

      {/* Grid of 8 */}
      <section className="py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {themes.map((theme, idx) => (
            <div key={theme.id}>
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-[#B3A89B] mb-3">No. 0{idx + 1}</p>
              <ThemeCard theme={theme} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-6"><span className="thin-rule" />Decide</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-8">
            Which one feels<br /><em>most like the atelier</em>?
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10 max-w-xl mx-auto">
            Reply with the number (e.g. "Apply No. 03 — Botanical Apothecary"), or mix
            &amp; match — "I love No. 02's typography but No. 06's palette" — and the
            entire site will be rebuilt in that direction.
          </p>
          <Link to="/" className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 inline-flex items-center gap-2">
            Return to current site <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

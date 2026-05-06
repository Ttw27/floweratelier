import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Calendar } from "lucide-react";

const IMG = {
  blush: "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png",
  arch: "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=900",
  pink: "https://images.pexels.com/photos/33886749/pexels-photo-33886749.png",
  rose: "https://images.unsplash.com/photo-1760373071711-960143464e34?w=900",
  studio: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900",
  table: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
  white: "https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=900",
  party: "https://images.unsplash.com/photo-1768508949823-26255327c264?w=900",
  bouquet: "https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=900",
};

/* ─────────── 8 DIRECTIONS ─────────── */
const themes = [
  /* 01 ───────── MAYFAIR ATELIER (current) ───────── */
  {
    id: "mayfair",
    name: "Mayfair Atelier",
    tag: "Currently live",
    description: "Editorial light luxury. Cormorant + Montserrat, ivory base, taupe accents. Quiet, refined, Mayfair townhouse.",
    fonts: "Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;500",
    palette: ["#FAFAF7", "#1A1A1A", "#B3A89B", "#E8D8D0", "#C4CFC0"],
    render: () => (
      <div style={{ background: "#FAFAF7", color: "#1A1A1A", fontFamily: "'Montserrat', sans-serif" }} className="h-full flex flex-col">
        <div className="flex justify-between items-center px-5 py-3 border-b border-black/8">
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-base">Petals</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#B3A89B" }} className="text-base">Atelier</span>
          </div>
          <div style={{ fontSize: 8, letterSpacing: "0.22em" }} className="uppercase flex gap-3 text-[#7A7A7A]">
            <span>Shop</span><span>Weddings</span><span>Portfolio</span><span>Enquire</span>
          </div>
        </div>
        <div className="grid grid-cols-5 flex-1">
          <div className="col-span-2 p-5 flex flex-col justify-center">
            <p style={{ fontSize: 7, letterSpacing: "0.3em" }} className="uppercase text-[#7A7A7A] mb-2">— Floral Couture · London</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 30, lineHeight: 0.95, letterSpacing: "-0.01em" }}>
              The language<br />of <em style={{ color: "#B3A89B" }}>flowers,</em><br />rewritten.
            </h2>
            <button style={{ background: "#1A1A1A", color: "#fff", letterSpacing: "0.22em", fontSize: 7 }} className="mt-3 px-3 py-1.5 uppercase w-fit">Shop Collection</button>
          </div>
          <div className="col-span-3 overflow-hidden"><img src={IMG.blush} alt="" className="w-full h-full object-cover" /></div>
        </div>
        <div className="px-5 py-3 grid grid-cols-3 gap-2 bg-[#F2EFEB]">
          {[IMG.rose, IMG.arch, IMG.bouquet].map((src, i) => (
            <div key={i}>
              <div className="aspect-[4/5] overflow-hidden mb-1"><img src={src} alt="" className="w-full h-full object-cover" /></div>
              <p style={{ fontSize: 7, letterSpacing: "0.2em" }} className="uppercase text-[#7A7A7A]">{["Mayfair","Bridal","Garden"][i]}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[10px] text-[#1A1A1A]">from £{[185,245,135][i]}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* 02 ───────── BLOOM FESTIVAL ───────── */
  {
    id: "bloom-festival",
    name: "Bloom Festival",
    tag: "Event-led · Vibrant",
    description: "Joyful, summer-festival energy. Bold flame orange + bubblegum, Fraunces Black headlines, sticker-tape graphics. Built around events, parties, weekly drops.",
    fonts: "Fraunces:opsz,wght@9..144,300;9..144,900&family=DM+Mono:wght@400;500",
    palette: ["#FFE7C7", "#FF5933", "#1A1A1A", "#FFC4D7", "#FFD93D"],
    render: () => (
      <div style={{ background: "#FFE7C7", color: "#1A1A1A", fontFamily: "'DM Mono', monospace" }} className="h-full flex flex-col relative overflow-hidden">
        <div style={{ background: "#1A1A1A", color: "#FFD93D" }} className="px-5 py-1.5 flex items-center justify-between">
          <span style={{ fontSize: 8, letterSpacing: "0.18em" }}>★ FREE LONDON DELIVERY OVER £50 ★ NEW DROP FRIDAY ★</span>
          <span style={{ fontSize: 8 }}>EST · 2008</span>
        </div>
        <div className="flex justify-between items-center px-5 py-3" style={{ background: "#FFE7C7" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 18, letterSpacing: "-0.04em" }}>petals.</span>
          <div className="flex gap-2">
            {["Shop","Events","Workshops"].map((n) => (
              <span key={n} style={{ background: "#1A1A1A", color: "#FFE7C7", fontSize: 7, letterSpacing: "0.15em" }} className="uppercase px-2 py-1 rounded-full">{n}</span>
            ))}
          </div>
        </div>
        <div className="flex-1 px-5 py-3 relative">
          <div className="relative">
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 52, lineHeight: 0.85, letterSpacing: "-0.04em", color: "#FF5933" }}>
              Bloom<br />out<span style={{ color: "#1A1A1A" }}>!</span>
            </h2>
            <span style={{ background: "#FFD93D", fontSize: 8, letterSpacing: "0.15em", transform: "rotate(-6deg)" }} className="inline-block uppercase px-2 py-0.5 absolute top-1 right-2 border-2 border-[#1A1A1A]">★ NEW SS26 ★</span>
            <p style={{ fontSize: 9 }} className="mt-2 max-w-[18rem]">Loud bouquets, party flowers &amp; weekly workshop drops. Built for celebrations that don't whisper.</p>
            <div className="flex gap-2 mt-3">
              <button style={{ background: "#FF5933", color: "#FFE7C7", fontSize: 8, letterSpacing: "0.18em" }} className="px-3 py-1.5 uppercase rounded-full">Shop the drop →</button>
              <button style={{ background: "#1A1A1A", color: "#FFE7C7", fontSize: 8, letterSpacing: "0.18em" }} className="px-3 py-1.5 uppercase rounded-full">Book event</button>
            </div>
          </div>
        </div>
        <div style={{ background: "#FF5933" }} className="px-5 py-2 grid grid-cols-4 gap-2">
          {["Bouquets","Parties","Workshops","Subs"].map((c, i) => (
            <div key={c} style={{ background: ["#FFD93D","#FFC4D7","#FFE7C7","#1A1A1A"][i], color: i === 3 ? "#FFD93D" : "#1A1A1A" }} className="aspect-square flex items-center justify-center text-center p-1 rounded-xl">
              <div>
                <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 12 }}>0{i+1}</p>
                <p style={{ fontSize: 7, letterSpacing: "0.15em" }} className="uppercase">{c}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* 03 ───────── BRUTALIST BOTANIC ───────── */
  {
    id: "brutalist",
    name: "Brutalist Botanic",
    tag: "Raw · Conceptual",
    description: "Anti-luxury, art-school energy. Raw paper background, oversized Space Grotesk, acid-green shock color, mono captions, exposed grid.",
    fonts: "Space+Grotesk:wght@400;700&family=JetBrains+Mono:wght@400;500",
    palette: ["#E5E1D6", "#0A0A0A", "#D4FF3D", "#FFFFFF"],
    render: () => (
      <div style={{ background: "#E5E1D6", color: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace" }} className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 border-b-2 border-black">
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12 }}>PETALS/ATELIER®</span>
          <div className="flex gap-3">
            {["[01]SHOP","[02]EVENTS","[03]INDEX","[04]→"].map((n) => <span key={n} style={{ fontSize: 8 }} className="font-medium">{n}</span>)}
          </div>
        </div>
        <div className="flex-1 grid grid-cols-12 grid-rows-6 border-b-2 border-black">
          <div className="col-span-7 row-span-6 border-r-2 border-black p-4 flex flex-col justify-between">
            <p style={{ fontSize: 8 }}>FILE_004 · LONDON · 51.5074°N</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 60, lineHeight: 0.85, letterSpacing: "-0.05em" }}>
              FLOWERS,<br />UNFILTER&shy;ED.
            </h2>
            <div>
              <span style={{ background: "#D4FF3D", fontSize: 8, fontWeight: 700 }} className="px-2 py-0.5 inline-block">▍ DROP_004 LIVE</span>
              <p style={{ fontSize: 9 }} className="mt-2 max-w-[20rem]">Object-led floristry. No softeners, no filters. Each piece signed &amp; numbered by the maker.</p>
            </div>
          </div>
          <div className="col-span-5 row-span-4 border-b-2 border-black overflow-hidden relative">
            <img src={IMG.rose} alt="" className="w-full h-full object-cover grayscale" />
            <span style={{ background: "#D4FF3D", fontSize: 7 }} className="absolute top-1 left-1 px-1 font-mono">REF/01</span>
          </div>
          <div className="col-span-5 row-span-2 grid grid-cols-2">
            <div className="border-r-2 border-black p-2 flex flex-col justify-end">
              <p style={{ fontSize: 8 }}>£185</p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 10, lineHeight: 1 }}>SPECIMEN/01</p>
            </div>
            <div className="p-2 flex flex-col justify-end">
              <p style={{ fontSize: 8 }}>£245</p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 10, lineHeight: 1 }}>SPECIMEN/02</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center px-4 py-1.5" style={{ background: "#0A0A0A", color: "#D4FF3D" }}>
          <span style={{ fontSize: 8 }}>▍▍▍ NEXT_DROP / 14:00 GMT FRIDAY</span>
          <span style={{ fontSize: 8 }}>©2026/PA</span>
        </div>
      </div>
    ),
  },

  /* 04 ───────── COTTAGECORE GARDEN SHOP ───────── */
  {
    id: "cottagecore",
    name: "Cottagecore Garden Shop",
    tag: "Warm · Hand-drawn",
    description: "Village garden-shop charm. Butter cream paper, deep moss, warm brick. Caveat handwritten + Lora body. Approachable, joyful, neighbourhood feel.",
    fonts: "Caveat:wght@500;700&family=Lora:ital,wght@0,400;0,500;1,500&family=Cormorant+SC:wght@500",
    palette: ["#F5EFD9", "#3D5022", "#C8654E", "#8B6F3D", "#E8D5A8"],
    render: () => (
      <div style={{ background: "#F5EFD9", color: "#3D5022", fontFamily: "'Lora', serif" }} className="h-full flex flex-col">
        <div className="flex justify-between items-center px-5 py-3 border-b border-dashed border-[#8B6F3D]">
          <div>
            <p style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: "#C8654E", lineHeight: 0.9 }}>Petals</p>
            <p style={{ fontFamily: "'Cormorant SC', serif", fontSize: 8, letterSpacing: "0.3em" }}>—— GARDEN ATELIER ——</p>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14 }} className="flex gap-3">
            <span>shop</span><span>events</span><span>journal</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 relative">
          <div className="p-5 flex flex-col justify-center">
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "#C8654E" }}>~ this week's bloom ~</p>
            <h2 style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontWeight: 500, fontSize: 30, lineHeight: 1, color: "#3D5022" }} className="mt-1">
              Wild English<br />garden flowers.
            </h2>
            <p style={{ fontSize: 9 }} className="mt-2 leading-relaxed text-[#3D5022]/80">Hand-tied with foraged foliage. Delivered Tuesday &amp; Friday across SE London.</p>
            <button style={{ background: "#3D5022", color: "#F5EFD9", fontFamily: "'Cormorant SC', serif", fontSize: 9, letterSpacing: "0.3em" }} className="mt-3 px-3 py-1.5 uppercase w-fit rounded-full">Order Bouquet</button>
          </div>
          <div className="overflow-hidden relative">
            <img src={IMG.bouquet} alt="" className="w-full h-full object-cover" />
            <div style={{ background: "#F5EFD9", color: "#C8654E", fontFamily: "'Caveat', cursive", fontSize: 11, transform: "rotate(-4deg)" }} className="absolute bottom-2 left-2 px-2 py-0.5 border border-[#C8654E]">£42 · this week</div>
          </div>
        </div>
        <div style={{ background: "#E8D5A8" }} className="px-5 py-2 grid grid-cols-4 gap-2 border-t border-dashed border-[#8B6F3D]">
          {[
            { label: "weekly bouquet", v: "£42" },
            { label: "wedding posies", v: "£85+" },
            { label: "workshops", v: "£65" },
            { label: "subs", v: "£35/mo" },
          ].map((c, i) => (
            <div key={i} className="text-center">
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "#C8654E" }}>{c.v}</p>
              <p style={{ fontFamily: "'Cormorant SC', serif", fontSize: 7, letterSpacing: "0.2em" }} className="uppercase">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* 05 ───────── Y2K BOUTIQUE ───────── */
  {
    id: "y2k-boutique",
    name: "Y2K Boutique",
    tag: "Playful · Retro-pop",
    description: "Pastel candy world. Mint + cotton-candy + sky, glossy gradients, fat retro display, sparkle accents. Built for Gen-Z gifting & subscriptions.",
    fonts: "Outfit:wght@300;800;900&family=Plus+Jakarta+Sans:wght@400;700",
    palette: ["#E8F4D9", "#FFD8E4", "#A8DDF6", "#1A1A1A", "#FFE5B4"],
    render: () => (
      <div style={{ background: "linear-gradient(135deg, #FFD8E4 0%, #A8DDF6 50%, #E8F4D9 100%)", color: "#1A1A1A", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="h-full flex flex-col relative overflow-hidden">
        {/* Floating shapes */}
        <div style={{ background: "#FFE5B4" }} className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-60" />
        <div style={{ background: "#FFD8E4" }} className="absolute bottom-12 -left-6 w-24 h-24 rounded-full opacity-50" />

        <div className="flex justify-between items-center px-5 py-2.5 relative">
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>petals★atelier</span>
          <div className="flex gap-1">
            {["shop","gifts","clubs"].map((n) => (
              <span key={n} style={{ background: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700 }} className="px-2 py-1 rounded-full backdrop-blur">{n}</span>
            ))}
          </div>
        </div>
        <div className="flex-1 px-5 flex flex-col justify-center relative">
          <span style={{ background: "#1A1A1A", color: "#E8F4D9", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em" }} className="px-2 py-0.5 rounded-full w-fit mb-2">★ flower club &nbsp;NEW</span>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 56, lineHeight: 0.85, letterSpacing: "-0.05em" }}>
            flowers,<br />but <em style={{ color: "#1A1A1A", fontStyle: "italic" }}>fun</em>.
          </h2>
          <p style={{ fontSize: 10 }} className="mt-2 max-w-[18rem] font-medium">Get hand-tied bouquets delivered every fortnight. Cancel any time. From £24 a drop.</p>
          <div className="flex gap-2 mt-3">
            <button style={{ background: "#1A1A1A", color: "#fff", fontSize: 9, fontWeight: 700 }} className="px-4 py-2 rounded-full">Join the club →</button>
            <button style={{ background: "#fff", color: "#1A1A1A", fontSize: 9, fontWeight: 700 }} className="px-4 py-2 rounded-full">Send a one-off</button>
          </div>
        </div>
        <div className="px-5 pb-3 grid grid-cols-3 gap-2 relative">
          {[
            { label: "the daisy", price: "£24", bg: "#FFD8E4" },
            { label: "the bloom", price: "£38", bg: "#A8DDF6" },
            { label: "the meadow", price: "£58", bg: "#E8F4D9" },
          ].map((c) => (
            <div key={c.label} style={{ background: c.bg }} className="rounded-2xl p-2 text-center border-2 border-white/70">
              <div className="aspect-square rounded-xl bg-white/40 mb-1 flex items-center justify-center">
                <Star size={14} fill="#1A1A1A" stroke="none" />
              </div>
              <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.05em" }}>{c.label}</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 11 }}>{c.price}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* 06 ───────── GALLERY CATALOG ───────── */
  {
    id: "gallery",
    name: "Gallery Catalog",
    tag: "Museum · Exhibition",
    description: "Tate-Modern catalogue energy. Cream walls, exhibit numbers, museum labels, Cormorant + Inter Light. Treats every piece as a work in a collection.",
    fonts: "Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Inter:wght@200;300;500",
    palette: ["#F4F1E9", "#1A1A1A", "#929386", "#E5E2D6"],
    render: () => (
      <div style={{ background: "#F4F1E9", color: "#1A1A1A", fontFamily: "'Inter', sans-serif" }} className="h-full flex flex-col">
        <div className="flex justify-between items-baseline px-6 py-4 border-b border-black/15">
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16 }}>Petals Atelier</span>
          <span style={{ fontWeight: 200, fontSize: 8, letterSpacing: "0.4em" }} className="uppercase text-[#929386]">— Catalogue · Vol. IV</span>
        </div>
        <div className="flex-1 grid grid-cols-12 gap-px">
          <div className="col-span-5 p-5 flex flex-col justify-between">
            <div>
              <p style={{ fontWeight: 200, fontSize: 8, letterSpacing: "0.4em" }} className="uppercase text-[#929386] mb-2">Exhibition I — Bloom</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 48, lineHeight: 0.95, letterSpacing: "-0.01em" }}>
                A study of<br /><em>arrangement</em>,<br />in twelve parts.
              </h2>
            </div>
            <div>
              <p style={{ fontWeight: 200, fontSize: 8, letterSpacing: "0.3em" }} className="uppercase text-[#929386]">Curated by Mira Fenwick</p>
              <p style={{ fontWeight: 300, fontSize: 9 }} className="mt-1 leading-relaxed text-[#1A1A1A]/80 max-w-[18rem]">An ongoing series of botanical compositions. Each piece signed, dated, and accompanied by its catalogue entry.</p>
            </div>
          </div>
          <div className="col-span-7 grid grid-cols-3 grid-rows-2 gap-px">
            {[IMG.blush, IMG.rose, IMG.arch, IMG.white, IMG.bouquet, IMG.party].map((src, i) => (
              <div key={i} className="relative bg-[#E5E2D6] overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <div style={{ background: "#F4F1E9" }} className="absolute bottom-1 left-1 px-1 py-0.5">
                  <p style={{ fontWeight: 500, fontSize: 6, letterSpacing: "0.2em" }} className="uppercase">No.0{i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-2 border-t border-black/15 flex justify-between">
          <p style={{ fontWeight: 300, fontSize: 8, letterSpacing: "0.2em" }} className="uppercase text-[#929386]">All works available by appointment</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 9 }}>View catalogue →</p>
        </div>
      </div>
    ),
  },

  /* 07 ───────── WEDDING CONCIERGE ───────── */
  {
    id: "wedding-concierge",
    name: "Wedding Concierge",
    tag: "Bridal-led",
    description: "Pivots the brand around weddings + celebration planning. Warm sand + olive + brass, romantic-but-organised. Calendars, planners, real-bride quotes.",
    fonts: "Cormorant+Garamond:ital,wght@0,400;1,400;1,500&family=Inter:wght@300;500&family=Caveat:wght@500",
    palette: ["#F2EBE2", "#5A5135", "#A57C57", "#D8C8B5", "#FFFFFF"],
    render: () => (
      <div style={{ background: "#F2EBE2", color: "#5A5135", fontFamily: "'Inter', sans-serif" }} className="h-full flex flex-col">
        <div className="flex justify-between items-center px-5 py-3 border-b border-[#A57C57]/30">
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, lineHeight: 1, color: "#5A5135" }}>Petals &amp; Co.</p>
            <p style={{ fontWeight: 300, fontSize: 7, letterSpacing: "0.4em" }} className="uppercase text-[#A57C57]">— Wedding Concierge</p>
          </div>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", fontWeight: 500 }} className="uppercase flex gap-3 text-[#5A5135]">
            <span>Packages</span><span>Real Weddings</span><span>Book Date</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 p-5">
          <div className="flex flex-col justify-center">
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "#A57C57" }}>Spring 2026 dates open</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 38, lineHeight: 0.95, color: "#5A5135" }}>
              Your wedding,<br />beautifully<br />composed.
            </h2>
            <p style={{ fontSize: 9, fontWeight: 300 }} className="mt-2 leading-relaxed text-[#5A5135]/80">Florals, styling, hire &amp; install — managed end-to-end by your dedicated concierge.</p>
            <div className="flex gap-2 mt-3">
              <button style={{ background: "#5A5135", color: "#F2EBE2", fontSize: 8, letterSpacing: "0.2em", fontWeight: 500 }} className="px-3 py-1.5 uppercase">Check our diary</button>
              <button style={{ background: "transparent", color: "#5A5135", border: "1px solid #5A5135", fontSize: 8, letterSpacing: "0.2em", fontWeight: 500 }} className="px-3 py-1.5 uppercase">Real weddings</button>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2">
            <div className="overflow-hidden relative">
              <img src={IMG.arch} alt="" className="w-full h-full object-cover" />
              <div style={{ background: "rgba(242,235,226,0.92)" }} className="absolute bottom-1 left-1 px-2 py-1">
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 10, color: "#A57C57", lineHeight: 0.9 }}>Eloise &amp; Felix</p>
                <p style={{ fontSize: 6, letterSpacing: "0.18em", fontWeight: 500 }} className="uppercase">— June '25 · Kensington</p>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #A57C57" }} className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar size={11} className="text-[#A57C57]" strokeWidth={1.5} />
                <p style={{ fontSize: 7, letterSpacing: "0.25em", fontWeight: 500 }} className="uppercase text-[#A57C57]">Concierge timeline</p>
              </div>
              {[
                { m: "9 mo", t: "First consultation" },
                { m: "6 mo", t: "Mood-board signed" },
                { m: "1 mo", t: "Final flower walk-through" },
                { m: "Day", t: "We install. You celebrate." },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 mb-0.5">
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 11, color: "#A57C57" }} className="w-10">{s.m}</span>
                  <span style={{ fontSize: 8, fontWeight: 300 }} className="text-[#5A5135]">{s.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },

  /* 08 ───────── STREETWEAR DROP ───────── */
  {
    id: "streetwear",
    name: "Streetwear Drop",
    tag: "Hyped · Limited",
    description: "Floral as hype-product. Black + shock-orange + white, Inter Black caps, drop-numbering, embossed labels. Built for limited weekly drops & subscribers-first releases.",
    fonts: "Inter:wght@200;500;900&family=JetBrains+Mono:wght@400;700",
    palette: ["#0F0F0F", "#FF3D00", "#FFFFFF", "#1A1A1A"],
    render: () => (
      <div style={{ background: "#0F0F0F", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }} className="h-full flex flex-col">
        <div style={{ background: "#FF3D00", color: "#0F0F0F" }} className="px-3 py-1 flex items-center justify-between">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em" }}>▲ DROP_004 LIVE — 18:00 GMT FRIDAY · MEMBERS 24H EARLY ▲</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700 }}>▶</span>
        </div>
        <div className="flex justify-between items-center px-5 py-3 border-b border-white/15">
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>PETALS / ATELIER</span>
          <div style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.18em" }} className="uppercase flex gap-3">
            <span>Drops</span><span>Members</span><span>Index</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-12">
          <div className="col-span-7 p-5 flex flex-col justify-between border-r border-white/15">
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#FF3D00" }}>DROP / 004 / SS26</p>
              <h2 style={{ fontWeight: 900, fontSize: 70, lineHeight: 0.85, letterSpacing: "-0.06em" }} className="mt-2">
                FLORAL.<br /><span style={{ color: "#FF3D00" }}>UTILITY.</span>
              </h2>
              <p style={{ fontWeight: 300, fontSize: 10 }} className="mt-2 max-w-[20rem] text-white/80">Limited weekly floral drops. Numbered. Members-first. No restocks.</p>
            </div>
            <div className="flex items-center gap-3">
              <button style={{ background: "#FF3D00", color: "#0F0F0F", fontWeight: 900, fontSize: 9, letterSpacing: "0.2em" }} className="px-4 py-2 uppercase">▲ Reserve drop</button>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }} className="text-white/50">42 / 100 remaining</span>
            </div>
          </div>
          <div className="col-span-5 grid grid-rows-2">
            <div className="relative overflow-hidden border-b border-white/15">
              <img src={IMG.rose} alt="" className="w-full h-full object-cover" />
              <span style={{ background: "#FF3D00", color: "#0F0F0F", fontFamily: "'JetBrains Mono', monospace", fontSize: 7, fontWeight: 700 }} className="absolute top-1 left-1 px-1.5 py-0.5">001/100</span>
            </div>
            <div className="relative overflow-hidden">
              <img src={IMG.arch} alt="" className="w-full h-full object-cover" />
              <span style={{ background: "#FF3D00", color: "#0F0F0F", fontFamily: "'JetBrains Mono', monospace", fontSize: 7, fontWeight: 700 }} className="absolute top-1 left-1 px-1.5 py-0.5">002/100</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-1.5 flex justify-between items-center border-t border-white/15" style={{ background: "#0F0F0F" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }} className="text-white/50">▍ NEXT_DROP / 14:23:09 ⟶</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }} className="text-white/50">©2026 PETALS/ATELIER</span>
        </div>
      </div>
    ),
  },
];

function ThemeCard({ theme, idx }) {
  return (
    <div className="group" data-testid={`theme-card-${theme.id}`}>
      <div className="flex items-baseline justify-between mb-4">
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-[#B3A89B]">No. 0{idx + 1}</p>
        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A]">{theme.tag}</p>
      </div>

      <div className="aspect-[4/3] border border-[#E5E5E5] overflow-hidden bg-white shadow-sm group-hover:shadow-2xl transition-all duration-500">
        {theme.render()}
      </div>

      <div className="pt-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-heading text-3xl font-light text-[#1A1A1A] mb-2 group-hover:italic transition-all">{theme.name}</h3>
          <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{theme.description}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {theme.palette.map((c) => (
            <span key={c} title={c} className="block w-6 h-6 border border-[#E5E5E5]" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThemePreviewPage() {
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
      <section className="py-16 md:py-24 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1500px] mx-auto">
          <p className="accent-label mb-6"><span className="thin-rule" />Direction Lab · v2</p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8 max-w-5xl">
            Eight worlds.<br />
            <em className="text-[#B3A89B]">Pick yours.</em>
          </h1>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed max-w-2xl mb-3">
            From quiet luxury to streetwear hype, gallery catalogue to garden-shop cottagecore —
            each card below shows the brand fully rendered as a small webpage with nav, hero, and product strip.
            We've gone deliberately wide so you can feel the edges.
          </p>
          <p className="font-body text-xs uppercase tracking-[0.22em] text-[#B3A89B]">
            Currently live · No. 01 · Mayfair Atelier
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 md:gap-20">
          {themes.map((theme, idx) => <ThemeCard key={theme.id} theme={theme} idx={idx} />)}
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-6"><span className="thin-rule" />Decide</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-8">
            Which one feels<br /><em>most like the brand</em>?
          </h2>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10 max-w-xl mx-auto">
            Reply with the number — e.g. <em>"Apply No. 02 — Bloom Festival"</em> — and the entire site
            (every page, button, form, product card) will be rebuilt in that direction.
            You can also mix: <em>"02's energy with 06's typography"</em>.
          </p>
          <Link to="/" className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 inline-flex items-center gap-2">
            Return to current site <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

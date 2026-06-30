import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Beer, TrendingUp, Users, Camera, MessageCircle, CheckCircle } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import { useSettings } from "../context/SettingsContext";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1800";

const DEFAULT = {
  heading: "Fill a quiet midweek night — we'll bring the room to life.",
  subheading: "A zero-cost, zero-risk workshop night for pubs, gastropubs, members' clubs and hotels. Your guests pay us, you keep every penny on the bar.",
  cta_eyebrow: "Ready to book a night?",
  cta_heading: "Tell us your date — we'll build the bench around it.",
};

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-heading text-5xl font-light text-[#1A1A1A]">{value}</p>
      <p className="font-body text-sm text-[#7A7A7A] mt-2 max-w-[140px] mx-auto leading-snug">{label}</p>
    </div>
  );
}

function Why({ icon: Icon, title, body }) {
  return (
    <div className="bg-white border border-[#E5E5E5] p-6">
      <Icon size={20} strokeWidth={1.3} className="text-[#B3A89B] mb-4" />
      <p className="font-heading text-lg font-light text-[#1A1A1A] mb-2">{title}</p>
      <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{body}</p>
    </div>
  );
}

export default function WorkshopsPubsPage() {
  const { settings } = useSettings();
  const { content, loading } = usePageContent("workshops-pubs");

  const waNumber = (settings?.whatsapp_number || "447123456789").replace(/\D/g, "");
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Flower Atelier — I'd like to host a workshop night at our venue.")}`;

  return (
    <div className="pt-28" data-testid="workshops-pubs-page">

      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto bg-[#F2EFEB]">
            {(content?.hero_image || !loading) && (
              <img src={content?.hero_image || HERO} alt="Workshop night at a pub" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Pubs &amp; Venues</p>
              <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10">
                {content?.hero_title_line1 || "A night your"}<br />
                <span className="italic text-[#B3A89B]">{content?.hero_title_italic || "regulars will talk about."}</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                {content?.hero_subheading || DEFAULT.subheading}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <Button className="btn-dark rounded-none inline-flex items-center gap-3">
                    <MessageCircle size={14} /> WhatsApp us a date
                  </Button>
                </a>
                <Link to="/consultation?service=workshops-pubs">
                  <Button variant="outline" className="rounded-none inline-flex items-center gap-3">
                    Send a brief <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 md:px-12 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="£0" label="Cost to your venue — zero hire fee, ever" />
          <Stat value="£45" label="Per head, paid directly to us by guests" />
          <Stat value="+£20" label="Average extra bar spend per guest" />
          <Stat value="~20" label="Social tags per night — free promotion" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="accent-label mb-4"><span className="thin-rule" />How it works</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-14">
            Simple for you.<br /><span className="italic">Unforgettable for them.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Why icon={Users} title="You give us a date" body="We do the rest — promote it on our socials, handle all bookings and payments." />
            <Why icon={Beer} title="We bring everything" body="Flowers, tools, dust sheets, a senior florist and a full evening's entertainment." />
            <Why icon={TrendingUp} title="Guests pay us" body="Typically £45 per head all-in. Your venue keeps 100% of bar, food and door." />
            <Why icon={Camera} title="We tag your venue" body="14–20 posts tagging your venue. Real, organic reach to a new audience." />
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F2EFEB]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="accent-label mb-6"><span className="thin-rule" />What we bring</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-8">
              Truly<br /><span className="italic">turnkey.</span>
            </h2>
            <div className="space-y-3">
              {[
                "Seasonal flowers & foliage for every guest",
                "All tools — snips, wire, tape, twine",
                "Dust sheets & table covers",
                "Senior florist to lead the session",
                "Step-by-step tuition for all abilities",
                "Social media content shot on the night",
                "Promotion to our mailing list & socials",
                "Handling of all bookings & payments",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} strokeWidth={1.3} className="text-[#B3A89B] mt-0.5 flex-shrink-0" />
                  <p className="font-body text-sm text-[#1A1A1A]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="accent-label mb-6"><span className="thin-rule" />Best for</p>
            <div className="space-y-3">
              {[
                "Pubs & gastropubs",
                "Members' clubs",
                "Hotels & boutique stays",
                "Community halls",
                "Hen-do venues",
                "Wedding venues (off-peak nights)",
                "Corporate entertainment spaces",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B3A89B] flex-shrink-0" />
                  <p className="font-body text-sm text-[#1A1A1A]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <MiniPortfolio category="workshop" title={<>Nights we&rsquo;ve <em>hosted.</em></>} />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label text-white/70 mb-8"><span className="thin-rule bg-white/40" />{content?.extra?.cta_eyebrow || DEFAULT.cta_eyebrow}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-white leading-[1.05] mb-12">
            {content?.extra?.cta_heading || DEFAULT.cta_heading}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none inline-flex items-center gap-3 px-8 py-4 h-auto">
                <MessageCircle size={14} /> WhatsApp the studio
              </Button>
            </a>
            <Link to="/consultation?service=workshops-pubs">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white hover:text-[#1A1A1A] rounded-none inline-flex items-center gap-3 px-8 py-4 h-auto">
                Send a full brief <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

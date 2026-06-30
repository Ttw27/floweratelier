import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Smile, Users, Leaf, MessageCircle, CheckCircle } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import { useSettings } from "../context/SettingsContext";
import { usePageContent } from "../hooks/usePageContent";

const HERO = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800";

const DEFAULT = {
  subheading: "Dementia-friendly floristry sessions designed around your residents. We bring everything — flowers, tools and a gentle, experienced florist. No mess, no pressure, just joy.",
  cta_heading: "Let's arrange a trial session — no commitment needed.",
};

function Benefit({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-5">
      <div className="w-10 h-10 bg-[#F2EFEB] flex items-center justify-center flex-shrink-0">
        <Icon size={18} strokeWidth={1.3} className="text-[#B3A89B]" />
      </div>
      <div>
        <p className="font-heading text-lg font-light text-[#1A1A1A] mb-1">{title}</p>
        <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function WorkshopsCareHomesPage() {
  const { settings } = useSettings();
  const { content, loading } = usePageContent("workshops-care-homes");

  const waNumber = (settings?.whatsapp_number || "447123456789").replace(/\D/g, "");
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Flower Atelier — I'd like to arrange a floristry session for our residents.")}`;

  return (
    <div className="pt-28" data-testid="workshops-care-homes-page">

      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[55vh] lg:h-auto bg-[#F2EFEB]">
            {(content?.hero_image || !loading) && (
              <img src={content?.hero_image || HERO} alt="Floristry session for care home residents" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Care Homes &amp; Hospices</p>
              <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10">
                {content?.hero_title_line1 || "Flowers bring"}<br />
                <span className="italic text-[#B3A89B]">{content?.hero_title_italic || "everyone home."}</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                {content?.hero_subheading || DEFAULT.subheading}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <Button className="btn-dark rounded-none inline-flex items-center gap-3">
                    <MessageCircle size={14} /> WhatsApp us
                  </Button>
                </a>
                <Link to="/consultation?service=workshops-care-homes">
                  <Button variant="outline" className="rounded-none inline-flex items-center gap-3">
                    Book a trial session <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethos */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="accent-label mb-4"><span className="thin-rule" />Our approach</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-14">
            Gentle, meaningful,<br /><span className="italic">completely at their pace.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <Benefit icon={Heart} title="Dementia-friendly" body="Our sessions are designed around ability not outcome. Every resident engages at their own pace — there's no right or wrong way to arrange flowers." />
            <Benefit icon={Smile} title="Sensory & therapeutic" body="The scent, texture and colour of fresh flowers are deeply stimulating. Many residents reconnect with long-held memories through flowers." />
            <Benefit icon={Users} title="Staff & family welcome" body="We actively encourage staff and visiting family to join in. The sessions work best when everyone is involved together." />
            <Benefit icon={Leaf} title="Seasonal & fresh" body="We use seasonal British flowers wherever possible — nothing artificial. Each resident takes their arrangement home to their room." />
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F2EFEB]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="accent-label mb-6"><span className="thin-rule" />What we provide</p>
            <h2 className="font-heading text-4xl font-light text-[#1A1A1A] leading-[1.05] mb-8">
              Everything.<br /><span className="italic">You provide the smiles.</span>
            </h2>
            <div className="space-y-3">
              {(content?.extra?.included_list || [
                "Fresh seasonal flowers for every resident",
                "All tools — snips, wire, oasis — pre-cut for safety",
                "Protective table coverings & dust sheets",
                "Experienced, DBS-checked florist",
                "Adapted techniques for limited mobility",
                "Each resident takes their arrangement home",
                "Photo documentation for care plans & families",
                "Flexible session length — typically 60–90 mins",
              ]).map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} strokeWidth={1.3} className="text-[#B3A89B] mt-0.5 flex-shrink-0" />
                  <p className="font-body text-sm text-[#1A1A1A]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="accent-label mb-6"><span className="thin-rule" />We work with</p>
            <div className="space-y-3">
              {(content?.extra?.work_with_list || [
                "Residential care homes",
                "Dementia & memory care units",
                "Hospices",
                "Retirement villages",
                "Sheltered housing communities",
                "Day centres",
                "NHS rehabilitation wards",
              ]).map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B3A89B] flex-shrink-0" />
                  <p className="font-body text-sm text-[#1A1A1A]">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-white border border-[#E5E5E5] p-6">
              <p className="font-heading text-lg font-light text-[#1A1A1A] mb-2">Pricing</p>
              <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{content?.extra?.pricing_note || (<>Sessions are priced per resident with a minimum group size. We offer a <strong className="text-[#1A1A1A] font-medium">free trial session</strong> for new care home partners so you can see the impact before committing.</>)}</p>
              <Link to="/consultation?service=workshops-care-homes" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.18em] text-[#1A1A1A] underline mt-4">
                Get a quote <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <MiniPortfolio category="workshop" title={<>Recent <em>sessions.</em></>} />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label text-white/70 mb-8"><span className="thin-rule bg-white/40" />{content?.extra?.cta_eyebrow || "Begin with a free trial"}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-white leading-[1.05] mb-12">
            {content?.extra?.cta_heading || DEFAULT.cta_heading}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none inline-flex items-center gap-3 px-8 py-4 h-auto">
                <MessageCircle size={14} /> WhatsApp the studio
              </Button>
            </a>
            <Link to="/consultation?service=workshops-care-homes">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white hover:text-[#1A1A1A] rounded-none inline-flex items-center gap-3 px-8 py-4 h-auto">
                Book a trial session <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Heart, Beer, Building2, Users, TrendingUp, Camera, MessageCircle } from "lucide-react";
import MiniPortfolio from "../components/MiniPortfolio";
import WorkshopBookingModal from "../components/WorkshopBookingModal";
import WorkshopEnquireModal from "../components/WorkshopEnquireModal";
import { useSettings } from "../context/SettingsContext";
import { usePageContent } from "../hooks/usePageContent";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const HERO = "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1800&q=80";

const TAG_ICONS = { Christmas: Sparkles, Halloween: Leaf, "Care Homes": Heart, "Venue Partners": Beer };

export default function WorkshopsPage() {
  const { settings } = useSettings();
  const { content, loading } = usePageContent("workshops");
  const [workshops, setWorkshops] = useState([]);
  const [bookingFor, setBookingFor] = useState(null);
  const [enquireFor, setEnquireFor] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/workshops`).then((r) => setWorkshops(r.data || [])).catch(() => {});
  }, []);

  const directWorkshops  = useMemo(() => workshops.filter((w) => w.booking_mode !== "enquire"), [workshops]);
  const enquireWorkshops = useMemo(() => workshops.filter((w) => w.booking_mode === "enquire"), [workshops]);

  const openCTA = (w) => (w.booking_mode === "enquire" ? setEnquireFor(w) : setBookingFor(w));

  const waNumber = (settings?.whatsapp_number || "447123456789").replace(/\D/g, "");
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Flower Atelier — I'd like to host a workshop at our venue.")}`;

  return (
    <div className="pt-28" data-testid="workshops-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
          <div className="lg:col-span-7 order-1 h-[50vh] lg:h-auto">
            {(content?.hero_image || !loading) && <img src={content?.hero_image || HERO} alt="Florist workshop in progress" className="w-full h-full object-cover" />}
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />Workshops</p>
              <h1 className="font-heading text-[2.5rem] sm:text-5xl xl:text-6xl 2xl:text-7xl font-light text-[#1A1A1A] leading-[1.05] tracking-tight mb-8 break-words" data-testid="workshops-title">
                An evening<br />by the <span className="italic text-[#B3A89B]">studio bench</span>.
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Hosted at the atelier, in your office, in your pub or in your care community. Seasonal
                wreath nights at Halloween &amp; Christmas, bespoke workshop nights for pubs &amp;
                clubs, and dementia-friendly bouquet sessions for care homes &amp; hospices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#programmes">
                  <Button className="btn-dark py-6 px-8 rounded-none w-full sm:w-auto" data-testid="workshops-cta-book">
                    See dates &amp; book <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
                  </Button>
                </a>
                <a href="#host">
                  <Button variant="outline" className="rounded-none py-6 px-8 w-full sm:w-auto" data-testid="workshops-cta-host">
                    Host at your venue
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct-book Programmes */}
      <section id="programmes" className="py-20 md:py-28 px-6 md:px-12 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="accent-label mb-4"><span className="thin-rule" />Book a date</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#1A1A1A] tracking-tight leading-[1.05]">
              Open workshops at the atelier.
            </h2>
          </div>

          {directWorkshops.length === 0 ? (
            <p className="font-body text-sm text-[#7A7A7A]">No open workshops at the moment — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              {directWorkshops.map((w) => <WorkshopCard key={w.id} w={w} onCTA={() => openCTA(w)} />)}
            </div>
          )}
        </div>
      </section>

      {/* Host at your venue — the sales pitch */}
      <section id="host" className="py-20 md:py-28 px-6 md:px-12 paper-accent border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-14">
            <div className="lg:col-span-7">
              <p className="accent-label mb-4"><span className="thin-rule" />{content?.extra?.host_eyebrow || "Host at your venue"}</p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#1A1A1A] tracking-tight leading-[1.05]">
                {content?.extra?.host_heading || "Fill a quiet midweek night — we'll bring the room to life."}
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="font-body text-base text-[#5A5A5A] leading-relaxed">
                {content?.extra?.host_body || "A turnkey workshop night for pubs, members' clubs, community halls, hotels, care homes & hospices. We arrive with everything — flowers, tools, dust sheets and a senior florist. Your guests pay us per head, and you keep every penny on the bar, food and door. We promote the night on our socials and tag your venue."}
              </p>
            </div>
          </div>

          {/* Why-host strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
            {(content?.extra?.why_cards || [
              { title: "Per head, all-in", body: "Guests pay us directly — typically £45 a head. No hire fee for the venue." },
              { title: "You keep the bar", body: "Every penny of bar, food and door spend stays with the venue. Avg. +£15–£25 per guest." },
              { title: "Midweek footfall", body: "Tues–Thurs is our sweet spot — fills the room when you need it most." },
              { title: "Free promotion", body: "We share the night on our socials and tag the venue — 14–20 new tags per workshop." },
            ]).map((card, i) => (
              <Why key={i} icon={[Users, Beer, TrendingUp, Camera][i] || Users} title={card.title} body={card.body} />
            ))}
          </div>

          {/* Enquire workshop cards */}
          {enquireWorkshops.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {enquireWorkshops.map((w) => <WorkshopCard key={w.id} w={w} onCTA={() => openCTA(w)} large />)}
            </div>
          )}

          {/* Venue list strip */}
          <div className="bg-white border border-[#E5E5E5] p-6 md:p-8">
            <p className="accent-label mb-3"><span className="thin-rule" />We come to</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-body text-sm text-[#1A1A1A]">
              {(content?.extra?.venue_list || ["Pubs & gastropubs", "Members' clubs", "Community halls", "Hotels", "Care homes", "Hospices", "Retirement villages", "PTAs & schools", "Hen-do venues", "Corporate offices"]).map((v) => (
                <span key={v} className="inline-flex items-center gap-2"><Building2 size={11} strokeWidth={1.3} className="text-[#B3A89B]" /> {v}</span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-[#E5E5E5]">
              <Link to="/workshops/pubs-venues" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.18em] text-[#1A1A1A] underline">
                Pubs &amp; venues — learn more <ArrowRight size={12} />
              </Link>
              <Link to="/workshops/care-homes" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.18em] text-[#1A1A1A] underline">
                Care homes &amp; hospices — learn more <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MiniPortfolio category="workshop" title={<>Recent <em>workshop</em> moments.</>} />

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#1A1A1A] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label text-white/70 mb-6"><span className="thin-rule bg-white/40" />{content?.extra?.cta_eyebrow || "Hosting one this season?"}</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight leading-[1.05] mb-8">
            {content?.extra?.cta_heading || "Tell us your date — we'll build the bench around it."}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white py-6 px-8 rounded-none w-full sm:w-auto" data-testid="workshops-bottom-whatsapp">
                <MessageCircle size={14} className="mr-2" /> WhatsApp the studio
              </Button>
            </a>
            <Link to="/consultation?service=workshop">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white hover:text-[#1A1A1A] rounded-none py-6 px-8 w-full sm:w-auto">
                Send a full brief <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <WorkshopBookingModal open={!!bookingFor} workshop={bookingFor} onClose={() => setBookingFor(null)} />
      <WorkshopEnquireModal open={!!enquireFor} workshop={enquireFor} onClose={() => setEnquireFor(null)} />
    </div>
  );
}

function WorkshopCard({ w, onCTA, large = false }) {
  const Icon = TAG_ICONS[w.tag] || Sparkles;
  const isEnquire = w.booking_mode === "enquire";
  return (
    <article className={`bg-[#FAFAF7] border border-[#E5E5E5] flex flex-col overflow-hidden ${large ? "lg:flex-row" : ""}`} data-testid={`workshop-card-${w.slug}`}>
      {large && (
        <div className="lg:w-2/5 h-64 lg:h-auto bg-[#F2EFEB] shrink-0">
          {w.image_url && <img src={w.image_url} alt={w.name} className="w-full h-full object-cover" />}
        </div>
      )}
      <div className={`p-8 flex flex-col ${large ? "lg:w-3/5" : ""}`}>
        <div className="flex items-center gap-3 mb-5">
          <Icon size={18} strokeWidth={1.3} className="text-[#1A1A1A]" />
          <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A]">{w.tag}</span>
          {isEnquire && (
            <span className="ml-auto font-body text-[9px] uppercase tracking-[0.22em] text-[#B3A89B] border border-[#B3A89B] px-2 py-0.5">By enquiry</span>
          )}
        </div>
        <h3 className="font-heading text-2xl text-[#1A1A1A] font-light mb-3 leading-snug">{w.name}</h3>
        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#B3A89B] mb-5">{w.season}</p>
        <p className="font-body text-sm text-[#5A5A5A] leading-relaxed mb-6">{w.short_description || w.description}</p>

        <ul className="space-y-2 mb-6 flex-1">
          {(isEnquire ? w.enquire_bullets : w.includes)?.slice(0, large ? 5 : 3).map((line) => (
            <li key={line} className="flex gap-2 text-sm text-[#1A1A1A]">
              <span className="text-[#B3A89B] mt-1">·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="pt-5 border-t border-[#E5E5E5] flex items-center justify-between gap-3 mb-4">
          <div className="text-xs text-[#7A7A7A] uppercase tracking-wider">
            <p>{w.duration}</p>
            <p>{w.group_size}</p>
          </div>
          <p className="font-heading text-base text-[#1A1A1A]">{isEnquire ? "Bespoke pricing" : `from £${Number(w.price_per_guest).toFixed(0)}`}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {isEnquire ? (
            <>
              <Button onClick={onCTA} className="btn-dark rounded-none flex-1" data-testid={`workshop-enquire-${w.slug}`}>
                <MessageCircle size={14} className="mr-2" /> Enquire
              </Button>
              <Link to={`/workshops/${w.slug}`} className="flex-1">
                <Button variant="outline" className="rounded-none w-full" data-testid={`workshop-details-${w.slug}`}>Details</Button>
              </Link>
            </>
          ) : (
            <>
              <Button onClick={onCTA} className="btn-dark rounded-none flex-1" data-testid={`workshop-book-${w.slug}`}>Book a date</Button>
              <Link to={`/workshops/${w.slug}`} className="flex-1">
                <Button variant="outline" className="rounded-none w-full" data-testid={`workshop-details-${w.slug}`}>Details</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function Why({ icon: Icon, title, body }) {
  return (
    <div className="bg-white border border-[#E5E5E5] p-5">
      <Icon size={18} strokeWidth={1.3} className="text-[#1A1A1A] mb-3" />
      <p className="font-heading text-base text-[#1A1A1A] mb-1">{title}</p>
      <p className="font-body text-[12px] text-[#7A7A7A] leading-relaxed">{body}</p>
    </div>
  );
}

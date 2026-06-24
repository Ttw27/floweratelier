import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, MapPin, Clock, MessageCircle, Building2 } from "lucide-react";
import WorkshopBookingModal from "../components/WorkshopBookingModal";
import WorkshopEnquireModal from "../components/WorkshopEnquireModal";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP_NUMBER = "447123456789";

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
};

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    (async () => {
      try {
        const w = await axios.get(`${API_URL}/api/workshops/${slug}`);
        if (!alive) return;
        setWorkshop(w.data);
        if (w.data.booking_mode !== "enquire") {
          const s = await axios.get(`${API_URL}/api/workshops/${slug}/sessions`);
          if (alive) setSessions(s.data || []);
        }
      } catch (err) {
        if (!alive) return;
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  if (loading) return <div className="pt-28 min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  if (notFound || !workshop) {
    return (
      <div className="pt-32 min-h-screen px-6 text-center">
        <h1 className="font-heading text-4xl text-[#1A1A1A] mb-4">Workshop not found</h1>
        <Link to="/workshops" className="text-[#1A1A1A] underline font-body text-sm">Back to workshops</Link>
      </div>
    );
  }

  const isEnquire = workshop.booking_mode === "enquire";
  const upcoming = sessions.filter((s) => (s.capacity || 0) - (s.spots_booked || 0) > 0);
  const whatsappMsg = encodeURIComponent(workshop.whatsapp_message || `Hello Petals Atelier — I'd like to enquire about ${workshop.name}.`);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  const primaryCTA = () => isEnquire ? setEnquireOpen(true) : setBookingOpen(true);

  return (
    <div className="pt-28" data-testid="workshop-detail-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[55vh] lg:min-h-[65vh]">
          <div className="lg:col-span-7 order-1 h-[45vh] lg:h-auto">
            <img src={workshop.image_url} alt={workshop.name} className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 order-2 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />{workshop.tag || "Workshop"}{isEnquire && <span className="ml-3 text-[#B3A89B]">· By enquiry</span>}</p>
              <h1 className="font-heading text-[2.25rem] sm:text-5xl xl:text-6xl font-light text-[#1A1A1A] leading-[1.05] tracking-tight mb-6 break-words" data-testid="workshop-detail-title">
                {workshop.name}
              </h1>
              <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[#B3A89B] mb-6">{workshop.season}</p>
              <p className="font-body text-base text-[#5A5A5A] leading-relaxed mb-8">{workshop.short_description || workshop.description}</p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8 text-[12px] text-[#7A7A7A]">
                {workshop.duration && <span className="inline-flex items-center gap-1"><Clock size={11} /> {workshop.duration}</span>}
                {workshop.group_size && <span className="inline-flex items-center gap-1"><Users size={11} /> {workshop.group_size}</span>}
                {workshop.location_default && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {workshop.location_default}</span>}
              </div>

              <div className="flex items-end gap-4 mb-8">
                <p className="font-heading text-3xl text-[#1A1A1A]">{isEnquire ? "Bespoke" : `£${Number(workshop.price_per_guest).toFixed(0)}`}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7A7A7A] pb-2">{isEnquire ? "pricing" : "per guest"}</p>
              </div>

              {isEnquire ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-testid="workshop-detail-whatsapp">
                    <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none py-6 px-8 w-full sm:w-auto">
                      <MessageCircle size={14} className="mr-2" /> WhatsApp
                    </Button>
                  </a>
                  <Button onClick={primaryCTA} className="btn-dark rounded-none py-6 px-8" data-testid="workshop-detail-enquire-cta">
                    Send a brief <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
                  </Button>
                </div>
              ) : upcoming.length === 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-testid="workshop-detail-whatsapp">
                    <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none py-6 px-8 w-full sm:w-auto">
                      <MessageCircle size={14} className="mr-2" /> WhatsApp the studio
                    </Button>
                  </a>
                  <Link to={`/consultation?service=workshop&workshop=${workshop.slug}`}>
                    <Button variant="outline" className="rounded-none py-6 px-8" data-testid="workshop-detail-nodates-cta">
                      Arrange a date <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button onClick={primaryCTA} className="btn-dark rounded-none py-6 px-8" data-testid="workshop-detail-book-cta">
                  Book a workshop <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description + includes */}
      <section className="py-20 md:py-24 px-6 md:px-12 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <p className="accent-label mb-4"><span className="thin-rule" />The session</p>
            <p className="font-body text-base text-[#1A1A1A] leading-relaxed whitespace-pre-line">{workshop.description}</p>
            {isEnquire && workshop.enquire_pitch && (
              <p className="font-body text-base text-[#5A5A5A] leading-relaxed mt-5">{workshop.enquire_pitch}</p>
            )}
          </div>
          <aside className="lg:col-span-5 bg-[#FAFAF7] border border-[#E5E5E5] p-6 md:p-8">
            <p className="accent-label mb-4"><span className="thin-rule" />{isEnquire ? "Why host us" : "What's included"}</p>
            <ul className="space-y-2">
              {((isEnquire ? workshop.enquire_bullets : workshop.includes) || []).map((line) => (
                <li key={line} className="flex gap-2 font-body text-sm text-[#1A1A1A]">
                  <span className="text-[#B3A89B] mt-1">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {!isEnquire && (
              <>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#B3A89B] mt-6 mb-2">Cancellation</p>
                <p className="font-body text-xs text-[#7A7A7A] leading-relaxed">{workshop.cancellation_policy}</p>
              </>
            )}
            {isEnquire && workshop.enquire_venues?.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#B3A89B] mt-6 mb-3">We come to</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[#1A1A1A]">
                  {workshop.enquire_venues.map((v) => (
                    <span key={v} className="inline-flex items-center gap-1"><Building2 size={10} strokeWidth={1.3} className="text-[#B3A89B]" />{v}</span>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>

      {/* Upcoming dates — only for direct mode */}
      {!isEnquire && (
        <section className="py-20 md:py-24 px-6 md:px-12 paper-accent border-t border-[#E5E5E5]" id="dates">
          <div className="max-w-[1100px] mx-auto">
            <div className="mb-10">
              <p className="accent-label mb-4"><span className="thin-rule" />Upcoming dates</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight leading-[1.05]">Pick an evening &mdash; we&rsquo;ll save you a seat.</h2>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-white border border-[#E5E5E5] p-8 md:p-10 text-center" data-testid="workshop-detail-no-dates">
                <p className="accent-label justify-center mb-4"><span className="thin-rule" />No dates booked in yet</p>
                <h3 className="font-heading text-2xl md:text-3xl font-light text-[#1A1A1A] mb-3">Wish to arrange a date &mdash; or host it at your own venue?</h3>
                <p className="font-body text-sm text-[#5A5A5A] mb-6 max-w-xl mx-auto leading-relaxed">
                  Please get in touch and we&rsquo;ll come back to you with the next available slots, or organise a private workshop around your room and your date.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none py-5 px-6 w-full sm:w-auto">
                      <MessageCircle size={14} className="mr-2" /> WhatsApp the studio
                    </Button>
                  </a>
                  <Link to={`/consultation?service=workshop&workshop=${workshop.slug}`}>
                    <Button variant="outline" className="rounded-none py-5 px-6 w-full sm:w-auto">Send a brief</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.map((s) => {
                  const remaining = Math.max(0, (s.capacity || 0) - (s.spots_booked || 0));
                  const soldOut = remaining <= 0;
                  return (
                    <div key={s.id} className="bg-white border border-[#E5E5E5] p-5" data-testid={`workshop-detail-session-${s.id}`}>
                      <p className="font-heading text-xl text-[#1A1A1A]"><Calendar size={14} strokeWidth={1.3} className="inline mr-2 text-[#B3A89B]" />{fmtDate(s.date)}</p>
                      <div className="text-[12px] text-[#7A7A7A] mt-2 space-y-1">
                        {s.start_time && <p><Clock size={11} className="inline mr-1" /> {s.start_time}{s.end_time ? `–${s.end_time}` : ""}</p>}
                        <p><MapPin size={11} className="inline mr-1" /> {s.location || workshop.location_default}</p>
                        <p><Users size={11} className="inline mr-1" /> {soldOut ? "Sold out" : `${remaining} spot${remaining === 1 ? "" : "s"} remaining`}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-heading text-xl text-[#1A1A1A]">£{Number(s.price_per_guest ?? workshop.price_per_guest).toFixed(0)}<span className="text-[11px] text-[#7A7A7A] ml-1">/ guest</span></p>
                        <Button size="sm" onClick={primaryCTA} disabled={soldOut} className="btn-dark rounded-none" data-testid={`workshop-detail-book-${s.id}`}>
                          {soldOut ? "Sold out" : "Book"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Enquiry CTA strip — only for enquire mode */}
      {isEnquire && (
        <section className="py-16 md:py-20 px-6 md:px-12 bg-[#1A1A1A] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight leading-[1.05] mb-6">Let&rsquo;s talk about your room.</h2>
            <p className="font-body text-base text-white/70 mb-8 leading-relaxed">Tell us your venue, your audience and a rough date — we&rsquo;ll come back within a working day with pricing and the next available slot.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white py-6 px-8 rounded-none w-full sm:w-auto">
                  <MessageCircle size={14} className="mr-2" /> WhatsApp the studio
                </Button>
              </a>
              <Button onClick={primaryCTA} className="bg-white text-[#1A1A1A] hover:bg-[#FAFAF7] py-6 px-8 rounded-none w-full sm:w-auto" data-testid="workshop-detail-enquire-bottom">
                Send a brief <ArrowRight size={14} className="ml-2" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </section>
      )}

      <WorkshopBookingModal open={bookingOpen} workshop={workshop} onClose={() => setBookingOpen(false)} />
      <WorkshopEnquireModal open={enquireOpen} workshop={workshop} onClose={() => setEnquireOpen(false)} />
    </div>
  );
}

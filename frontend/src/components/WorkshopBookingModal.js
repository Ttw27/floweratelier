import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Calendar, Clock, MapPin, Users, MessageCircle } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
};

export default function WorkshopBookingModal({ open, workshop, onClose }) {
  const { settings } = useSettings();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [step, setStep] = useState(1); // 1 = pick session, 2 = details + payment
  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: 1, dietary_requirements: "", notes: "" });
  const [paymentChoice, setPaymentChoice] = useState("deposit");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !workshop) return;
    setStep(1);
    setSelectedSessionId("");
    setForm({ name: "", email: "", phone: "", guests: 1, dietary_requirements: "", notes: "" });
    setPaymentChoice("deposit");
    setLoadingSessions(true);
    axios.get(`${API_URL}/api/workshops/${workshop.slug}/sessions`)
      .then((r) => setSessions(r.data || []))
      .catch(() => toast.error("Could not load dates"))
      .finally(() => setLoadingSessions(false));
  }, [open, workshop]);

  const selectedSession = useMemo(() => sessions.find((s) => s.id === selectedSessionId), [sessions, selectedSessionId]);

  const pricePerGuest = useMemo(() => {
    if (!workshop) return 0;
    return Number(selectedSession?.price_per_guest ?? workshop.price_per_guest ?? 0);
  }, [workshop, selectedSession]);

  const depositPerGuest = useMemo(() => {
    if (!workshop) return 0;
    const explicit = selectedSession?.deposit_amount ?? workshop.deposit_amount;
    if (explicit && Number(explicit) > 0) return Number(explicit);
    return Math.round((pricePerGuest * 0.5) * 100) / 100;
  }, [workshop, selectedSession, pricePerGuest]);

  const subtotal = useMemo(() => +(pricePerGuest * Math.max(1, form.guests)).toFixed(2), [pricePerGuest, form.guests]);

  const discountPct = Number(workshop?.full_payment_discount_pct ?? 0);
  const discountAmount = useMemo(() => paymentChoice === "full" ? +(subtotal * discountPct / 100).toFixed(2) : 0, [subtotal, discountPct, paymentChoice]);
  const amountDueNow = useMemo(() => paymentChoice === "full" ? +(subtotal - discountAmount).toFixed(2) : +(depositPerGuest * Math.max(1, form.guests)).toFixed(2), [paymentChoice, subtotal, discountAmount, depositPerGuest, form.guests]);
  const balanceOnDay = useMemo(() => +(subtotal - amountDueNow).toFixed(2), [subtotal, amountDueNow]);

  const spotsRemaining = (s) => Math.max(0, (s.capacity || 0) - (s.spots_booked || 0));

  const handleNext = () => {
    if (!selectedSessionId) { toast.error("Pick a date first"); return; }
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error("Name, email & phone are required"); return; }
    if (!selectedSession) { toast.error("Pick a date"); return; }
    const remaining = spotsRemaining(selectedSession);
    if (form.guests > remaining) { toast.error(`Only ${remaining} spot(s) left`); return; }
    setSubmitting(true);
    try {
      const r = await axios.post(`${API_URL}/api/workshop-bookings`, {
        session_id: selectedSession.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        guests: parseInt(form.guests, 10) || 1,
        dietary_requirements: form.dietary_requirements,
        notes: form.notes,
        payment_choice: paymentChoice,
      });
      const bookingId = r.data.id;
      const c = await axios.post(`${API_URL}/api/workshop-checkout/session`, {
        booking_id: bookingId,
        origin_url: window.location.origin,
      });
      window.location.href = c.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Booking failed");
      setSubmitting(false);
    }
  };

  if (!open || !workshop) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto" onClick={onClose} data-testid="workshop-booking-modal">
      <div className="bg-[#FAFAF7] w-full md:max-w-[820px] md:max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-[#E5E5E5] bg-white">
          <div>
            <p className="accent-label text-[10px]"><span className="thin-rule" />{workshop.tag || "Workshop"}</p>
            <h3 className="font-heading text-lg md:text-2xl text-[#1A1A1A]">{workshop.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid="workshop-booking-close">
            <X size={20} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-5 md:px-7 py-3 bg-white border-b border-[#E5E5E5] flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A]">
          <span className={step >= 1 ? "text-[#1A1A1A]" : ""}>1 · Date</span>
          <span>—</span>
          <span className={step >= 2 ? "text-[#1A1A1A]" : ""}>2 · Your details</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          {step === 1 && (
            <div data-testid="workshop-booking-step-date">
              <p className="font-body text-sm text-[#5A5A5A] leading-relaxed mb-6">{workshop.short_description || workshop.description}</p>

              {loadingSessions ? (
                <p className="text-sm text-[#7A7A7A]">Loading dates…</p>
              ) : sessions.length === 0 ? (
                <NoDatesCard workshop={workshop} settings={settings} onClose={onClose} />
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => {
                    const remaining = spotsRemaining(s);
                    const isSelected = s.id === selectedSessionId;
                    const isSoldOut = remaining <= 0;
                    const sessionPrice = Number(s.price_per_guest ?? workshop.price_per_guest ?? 0);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => setSelectedSessionId(s.id)}
                        className={`w-full text-left bg-white border p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 transition-colors ${isSelected ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"} ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                        data-testid={`workshop-session-${s.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-lg text-[#1A1A1A] flex items-center gap-2">
                            <Calendar size={14} strokeWidth={1.3} className="text-[#B3A89B]" />
                            {fmtDate(s.date)}
                          </p>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1 text-[12px] text-[#7A7A7A]">
                            {s.start_time && <span className="inline-flex items-center gap-1"><Clock size={11} /> {s.start_time}{s.end_time ? `–${s.end_time}` : ""}</span>}
                            <span className="inline-flex items-center gap-1"><MapPin size={11} /> {s.location || workshop.location_default}</span>
                            <span className="inline-flex items-center gap-1"><Users size={11} /> {isSoldOut ? "Sold out" : `${remaining} spot${remaining === 1 ? "" : "s"} left`}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-heading text-xl text-[#1A1A1A]">£{sessionPrice.toFixed(0)}</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#B3A89B]">per guest</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} disabled={!selectedSessionId} className="btn-dark rounded-none" data-testid="workshop-booking-next">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedSession && (
            <form onSubmit={submit} className="space-y-5" data-testid="workshop-booking-step-details">
              <div className="bg-white border border-[#E5E5E5] p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#B3A89B]">Selected date</p>
                <p className="font-heading text-lg text-[#1A1A1A]">{fmtDate(selectedSession.date)}{selectedSession.start_time ? ` · ${selectedSession.start_time}` : ""}</p>
                <p className="text-xs text-[#7A7A7A]">{selectedSession.location || workshop.location_default}</p>
                <button type="button" onClick={() => setStep(1)} className="text-[11px] uppercase tracking-[0.18em] text-[#1A1A1A] underline mt-2" data-testid="workshop-booking-change-date">Change date</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Full name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-booking-name" />
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-booking-email" />
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Phone *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-booking-phone" />
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Number of guests *</Label>
                  <Input type="number" min={1} max={Math.max(1, spotsRemaining(selectedSession))} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-booking-guests" />
                  <p className="text-[11px] text-[#7A7A7A] mt-1">{spotsRemaining(selectedSession)} spot(s) available</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-[#1A1A1A]">Dietary requirements <span className="text-[#7A7A7A] text-xs">(food &amp; drink is served)</span></Label>
                <Textarea rows={2} value={form.dietary_requirements} onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })} className="light-input rounded-none mt-2" placeholder="e.g. gluten-free, vegan, nut allergy" data-testid="workshop-booking-dietary" />
              </div>

              <div>
                <Label className="text-sm text-[#1A1A1A]">Anything else? <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="light-input rounded-none mt-2" placeholder="Booking for a hen-do? Tell us a little about the occasion." data-testid="workshop-booking-notes" />
              </div>

              {/* Payment choice */}
              <div className="border-t border-[#E5E5E5] pt-5">
                <p className="accent-label mb-3"><span className="thin-rule" />Payment</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("deposit")}
                    className={`text-left bg-white border p-4 ${paymentChoice === "deposit" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                    data-testid="workshop-payment-deposit"
                  >
                    <p className="font-heading text-base text-[#1A1A1A]">Pay deposit</p>
                    <p className="text-[11px] text-[#7A7A7A] mt-1">Secure your spot with a deposit. Balance collected on the day (cash or card).</p>
                    <p className="font-heading text-lg text-[#1A1A1A] mt-2">£{(depositPerGuest * Math.max(1, form.guests)).toFixed(2)}<span className="text-[11px] text-[#7A7A7A] font-body ml-2">now</span></p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("full")}
                    className={`text-left bg-white border p-4 relative ${paymentChoice === "full" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                    data-testid="workshop-payment-full"
                  >
                    {discountPct > 0 && (
                      <span className="absolute top-3 right-3 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.2em] px-2 py-0.5">{discountPct}% off</span>
                    )}
                    <p className="font-heading text-base text-[#1A1A1A]">Pay in full</p>
                    <p className="text-[11px] text-[#7A7A7A] mt-1">Pay everything now and save {discountPct}%.</p>
                    <p className="font-heading text-lg text-[#1A1A1A] mt-2">£{(subtotal - +(subtotal * discountPct / 100).toFixed(2)).toFixed(2)}<span className="text-[11px] text-[#7A7A7A] font-body ml-2">now</span></p>
                  </button>
                </div>

                {/* Breakdown */}
                <div className="bg-white border border-[#E5E5E5] p-4 mt-4 text-sm" data-testid="workshop-booking-summary">
                  <Row label={`${form.guests || 1} × guest @ £${pricePerGuest.toFixed(2)}`} value={`£${subtotal.toFixed(2)}`} />
                  {discountAmount > 0 && <Row label={`Full-payment discount (${discountPct}%)`} value={`–£${discountAmount.toFixed(2)}`} />}
                  <div className="border-t border-[#E5E5E5] mt-2 pt-2">
                    <Row label="Pay now (Stripe)" value={`£${amountDueNow.toFixed(2)}`} bold />
                    {balanceOnDay > 0 && <Row label="Balance — collected on the day" value={`£${balanceOnDay.toFixed(2)}`} />}
                  </div>
                </div>

                <p className="text-[11px] text-[#7A7A7A] mt-3 leading-relaxed" data-testid="workshop-cancellation-policy">
                  <strong className="text-[#1A1A1A]">Cancellation policy:</strong> {workshop.cancellation_policy || "Deposits are non-refundable. Balance is collected on the day."}
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-3 border-t border-[#E5E5E5]">
                <Button type="button" variant="outline" className="rounded-none" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" disabled={submitting} className="btn-dark rounded-none" data-testid="workshop-booking-submit">
                  {submitting ? "Redirecting to Stripe…" : `Pay £${amountDueNow.toFixed(2)} & book`}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }) {
  return (
    <div className={`flex justify-between items-center py-1 ${bold ? "font-heading text-base text-[#1A1A1A]" : "text-[13px] text-[#5A5A5A]"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function NoDatesCard({ workshop, settings, onClose }) {
  const waNumber = (settings?.whatsapp_number || "447123456789").replace(/\D/g, "");
  const waMsg = encodeURIComponent(
    `Hello Petals Atelier — I'd like to arrange a date for the ${workshop.name} workshop (or host it at our own venue). Could you let me know what's available?`
  );
  const waHref = `https://wa.me/${waNumber}?text=${waMsg}`;
  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 text-center" data-testid="workshop-booking-no-dates">
      <p className="accent-label justify-center mb-4"><span className="thin-rule" />No dates booked in yet</p>
      <h4 className="font-heading text-2xl text-[#1A1A1A] mb-3 font-light">Wish to arrange a date — or host it at your own venue?</h4>
      <p className="font-body text-sm text-[#5A5A5A] leading-relaxed mb-6 max-w-md mx-auto">
        Please get in touch and we&rsquo;ll come back to you with the next available slots, or organise a private workshop around your room and your date.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={waHref} target="_blank" rel="noopener noreferrer" data-testid="workshop-booking-no-dates-whatsapp">
          <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none py-5 px-6 w-full sm:w-auto">
            <MessageCircle size={14} className="mr-2" /> WhatsApp the studio
          </Button>
        </a>
        <a href={`/consultation?service=workshop&workshop=${workshop.slug}`} onClick={onClose} data-testid="workshop-booking-no-dates-enquire">
          <Button variant="outline" className="rounded-none py-5 px-6 w-full sm:w-auto">
            Send a brief
          </Button>
        </a>
      </div>
    </div>
  );
}

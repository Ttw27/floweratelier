import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, CheckCircle2, Copy } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
};

function Row({ label, value, bold = false }) {
  return (
    <div className={`flex justify-between items-center py-1 ${bold ? "font-heading text-base text-[#1A1A1A]" : "text-[13px] text-[#5A5A5A]"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function PrivateWorkshopBookingPage() {
  const { sessionId } = useParams();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [session, setSession] = useState(null);
  const [workshop, setWorkshop] = useState(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: 1, dietary_requirements: "", notes: "" });
  const [paymentChoice, setPaymentChoice] = useState("deposit");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [cardEnabled, setCardEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/payment-methods`)
      .then((r) => setCardEnabled(!!r.data.card_enabled))
      .catch(() => setCardEnabled(true)); // fail open — don't block booking on a status-check error
  }, []);

  // If card payment isn't available, always fall back to bank transfer
  useEffect(() => {
    if (!cardEnabled) setPaymentMethod("bank_transfer");
  }, [cardEnabled]);

  useEffect(() => {
    if (!sessionId) return;
    axios.get(`${API_URL}/api/workshop-sessions/${sessionId}`)
      .then((r) => { setSession(r.data.session); setWorkshop(r.data.workshop); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const spotsRemaining = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, (session.capacity || 0) - (session.spots_booked || 0));
  }, [session]);

  const pricePerGuest = useMemo(() => {
    if (!workshop) return 0;
    return Number(session?.price_per_guest ?? workshop.price_per_guest ?? 0);
  }, [workshop, session]);

  const depositPerGuest = useMemo(() => {
    if (!workshop) return 0;
    const explicit = session?.deposit_amount ?? workshop.deposit_amount;
    if (explicit && Number(explicit) > 0) return Number(explicit);
    return Math.round((pricePerGuest * 0.5) * 100) / 100;
  }, [workshop, session, pricePerGuest]);

  const subtotal = useMemo(() => +(pricePerGuest * Math.max(1, form.guests)).toFixed(2), [pricePerGuest, form.guests]);
  const discountPct = Number(workshop?.full_payment_discount_pct ?? 0);
  const discountAmount = useMemo(() => paymentChoice === "full" ? +(subtotal * discountPct / 100).toFixed(2) : 0, [subtotal, discountPct, paymentChoice]);
  const amountDueNow = useMemo(() => paymentChoice === "full" ? +(subtotal - discountAmount).toFixed(2) : +(depositPerGuest * Math.max(1, form.guests)).toFixed(2), [paymentChoice, subtotal, discountAmount, depositPerGuest, form.guests]);
  const balanceOnDay = useMemo(() => +(subtotal - amountDueNow).toFixed(2), [subtotal, amountDueNow]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error("Name, email & phone are required"); return; }
    if (form.guests > spotsRemaining) { toast.error(`Only ${spotsRemaining} spot(s) left`); return; }
    setSubmitting(true);
    try {
      const r = await axios.post(`${API_URL}/api/workshop-bookings`, {
        session_id: sessionId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        guests: parseInt(form.guests, 10) || 1,
        dietary_requirements: form.dietary_requirements,
        notes: form.notes,
        payment_choice: paymentChoice,
        payment_method: paymentMethod,
      });

      if (paymentMethod === "bank_transfer") {
        // No Stripe redirect — show bank details & reference right here
        setConfirmedBooking(r.data);
        setSubmitting(false);
        return;
      }

      const c = await axios.post(`${API_URL}/api/workshop-checkout/session`, {
        booking_id: r.data.id,
        origin_url: window.location.origin,
      });
      window.location.href = c.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Booking failed");
      setSubmitting(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied`))
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !session || !workshop) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen bg-[#FAFAF7]">
        <div className="max-w-xl mx-auto bg-white border border-[#E5E5E5] p-8 md:p-12 text-center">
          <h1 className="font-heading text-3xl text-[#1A1A1A] mb-3">Booking link not found</h1>
          <p className="font-body text-sm text-[#7A7A7A] mb-6">This link may have expired or the session has been removed. Please contact the studio for a new link.</p>
          <Link to="/workshops"><Button variant="outline" className="rounded-none">Back to workshops</Button></Link>
        </div>
      </div>
    );
  }

  // ---- Bank transfer confirmation screen ----
  if (confirmedBooking) {
    const b = confirmedBooking;
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen bg-[#FAFAF7]" data-testid="private-booking-bacs-confirmation">
        <div className="max-w-2xl mx-auto bg-white border border-[#E5E5E5] p-8 md:p-12">
          <CheckCircle2 size={40} strokeWidth={1.2} className="mx-auto text-[#5C7A3F] mb-6" />
          <p className="accent-label justify-center mb-4 text-center"><span className="thin-rule" />Booking held</p>
          <h1 className="font-heading text-3xl md:text-4xl text-[#1A1A1A] mb-3 text-center">Almost there.</h1>
          <p className="font-body text-sm text-[#5A5A5A] mb-4 text-center">
            Your spot is <strong className="text-[#1A1A1A]">held provisionally</strong> for <strong className="text-[#1A1A1A]">{workshop.name}</strong>. Please transfer <strong className="text-[#1A1A1A]">£{Number(b.amount_due_now).toFixed(2)}</strong> using the details below, quoting the reference — we&rsquo;ll confirm as soon as it lands.
          </p>
          <div className="bg-[#FBF3E7] border border-[#E9C46A] p-3 mb-6">
            <p className="text-[12px] text-[#6B4E00] leading-relaxed text-center">
              <strong>This date is not secured until your deposit is received.</strong> Please transfer as soon as possible to avoid losing it to another booking.
            </p>
          </div>

          <div className="bg-[#FAFAF7] border border-[#E5E5E5] p-6 mb-6 space-y-3">
            <Row label="Account name" value={settings?.bank_account_name || "—"} />
            <Row label="Bank" value={settings?.bank_name || "—"} />
            <Row label="Sort code" value={settings?.bank_sort_code || "—"} />
            <Row label="Account number" value={settings?.bank_account_number || "—"} />
            <div className="border-t border-[#E5E5E5] mt-3 pt-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#B3A89B]">Reference — please quote this</p>
                <p className="font-heading text-xl text-[#1A1A1A]">{b.bank_reference}</p>
              </div>
              <button type="button" onClick={() => copyText(b.bank_reference, "Reference")} className="text-[#7A7A7A] hover:text-[#1A1A1A]">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-4 mb-8 text-sm">
            <Row label={`${b.guests} × guest @ £${Number(b.price_per_guest).toFixed(2)}`} value={`£${Number(b.subtotal).toFixed(2)}`} />
            <div className="border-t border-[#E5E5E5] mt-2 pt-2">
              <Row label="Transfer now" value={`£${Number(b.amount_due_now).toFixed(2)}`} bold />
              {b.balance_due_on_day > 0 && <Row label="Balance — collected on the day" value={`£${Number(b.balance_due_on_day).toFixed(2)}`} />}
            </div>
          </div>

          <p className="font-body text-xs text-[#7A7A7A] text-center">A confirmation has been sent to <strong className="text-[#1A1A1A]">{b.email}</strong>. If you have any questions, just reply to that email or contact the studio.</p>
        </div>
      </div>
    );
  }

  // ---- Booking form ----
  return (
    <div className="pt-28 pb-24 px-6 min-h-screen bg-[#FAFAF7]" data-testid="private-workshop-booking-page">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
          <p className="accent-label mb-2"><span className="thin-rule" />{workshop.tag || "Private workshop"}</p>
          <h1 className="font-heading text-3xl md:text-4xl text-[#1A1A1A] mb-4">{workshop.name}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5A5A5A]">
            <span className="inline-flex items-center gap-2"><Calendar size={14} className="text-[#B3A89B]" /> {fmtDate(session.date)}</span>
            {session.start_time && <span className="inline-flex items-center gap-2"><Clock size={14} className="text-[#B3A89B]" /> {session.start_time}{session.end_time ? `–${session.end_time}` : ""}</span>}
            <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-[#B3A89B]" /> {session.location || workshop.location_default}</span>
            <span className="inline-flex items-center gap-2"><Users size={14} className="text-[#B3A89B]" /> {spotsRemaining} spot{spotsRemaining === 1 ? "" : "s"} available</span>
          </div>
          {session.notes && <p className="font-body text-sm text-[#7A7A7A] mt-4">{session.notes}</p>}
        </div>

        {spotsRemaining <= 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-8 text-center">
            <p className="font-heading text-xl text-[#1A1A1A] mb-2">This session is fully booked</p>
            <p className="font-body text-sm text-[#7A7A7A]">Please contact the studio to arrange an alternative date.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white border border-[#E5E5E5] p-6 md:p-8 space-y-5" data-testid="private-booking-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-[#1A1A1A]">Contact / company name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="light-input rounded-none mt-2" data-testid="private-booking-name" />
              </div>
              <div>
                <Label className="text-sm text-[#1A1A1A]">Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="light-input rounded-none mt-2" data-testid="private-booking-email" />
              </div>
              <div>
                <Label className="text-sm text-[#1A1A1A]">Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="light-input rounded-none mt-2" data-testid="private-booking-phone" />
              </div>
              <div>
                <Label className="text-sm text-[#1A1A1A]">Number of guests *</Label>
                <Input type="number" min={1} max={Math.max(1, spotsRemaining)} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className="light-input rounded-none mt-2" data-testid="private-booking-guests" />
                <p className="text-[11px] text-[#7A7A7A] mt-1">{spotsRemaining} spot(s) available</p>
              </div>
            </div>

            <div>
              <Label className="text-sm text-[#1A1A1A]">Dietary requirements <span className="text-[#7A7A7A] text-xs">(food &amp; drink is served)</span></Label>
              <Textarea rows={2} value={form.dietary_requirements} onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })} className="light-input rounded-none mt-2" placeholder="e.g. gluten-free, vegan, nut allergy" />
            </div>

            <div>
              <Label className="text-sm text-[#1A1A1A]">Any specific requests for this booking? <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="light-input rounded-none mt-2" placeholder="e.g. a particular colour palette, a theme, arrival time preferences, anything you'd like us to know" />
            </div>

            {/* Deposit vs full */}
            <div className="border-t border-[#E5E5E5] pt-5">
              <p className="accent-label mb-3"><span className="thin-rule" />How much to pay now</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentChoice("deposit")} className={`text-left bg-white border p-4 ${paymentChoice === "deposit" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`} data-testid="private-payment-deposit">
                  <p className="font-heading text-base text-[#1A1A1A]">Pay deposit</p>
                  <p className="text-[11px] text-[#7A7A7A] mt-1">Secure the booking with a deposit. Balance collected on the day.</p>
                  <p className="font-heading text-lg text-[#1A1A1A] mt-2">£{(depositPerGuest * Math.max(1, form.guests)).toFixed(2)}<span className="text-[11px] text-[#7A7A7A] font-body ml-2">now</span></p>
                </button>
                <button type="button" onClick={() => setPaymentChoice("full")} className={`text-left bg-white border p-4 relative ${paymentChoice === "full" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`} data-testid="private-payment-full">
                  {discountPct > 0 && <span className="absolute top-3 right-3 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.2em] px-2 py-0.5">{discountPct}% off</span>}
                  <p className="font-heading text-base text-[#1A1A1A]">Pay in full</p>
                  <p className="text-[11px] text-[#7A7A7A] mt-1">Pay everything now{discountPct > 0 ? ` and save ${discountPct}%` : ""}.</p>
                  <p className="font-heading text-lg text-[#1A1A1A] mt-2">£{(subtotal - +(subtotal * discountPct / 100).toFixed(2)).toFixed(2)}<span className="text-[11px] text-[#7A7A7A] font-body ml-2">now</span></p>
                </button>
              </div>
            </div>

            {/* Payment method */}
            <div className="border-t border-[#E5E5E5] pt-5">
              <p className="accent-label mb-3"><span className="thin-rule" />How to pay</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!cardEnabled}
                  onClick={() => cardEnabled && setPaymentMethod("stripe")}
                  className={`text-left border p-4 ${!cardEnabled ? "bg-[#F2EFEB] border-[#E5E5E5] opacity-60 cursor-not-allowed" : paymentMethod === "stripe" ? "bg-white border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "bg-white border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                  data-testid="private-payment-method-stripe"
                >
                  <p className="font-heading text-base text-[#1A1A1A]">Pay by card</p>
                  {cardEnabled ? (
                    <p className="text-[11px] text-[#7A7A7A] mt-1">Secure card payment via Stripe — instant confirmation.</p>
                  ) : (
                    <p className="text-[11px] text-[#7A7A7A] mt-1">
                      Not available online right now. To pay by card, please call{" "}
                      <a href={`tel:${(settings?.phone_number || "").replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()} className="underline text-[#1A1A1A]">{settings?.phone_number || "the studio"}</a>.
                    </p>
                  )}
                </button>
                <button type="button" onClick={() => setPaymentMethod("bank_transfer")} className={`text-left bg-white border p-4 ${paymentMethod === "bank_transfer" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`} data-testid="private-payment-method-bacs">
                  <p className="font-heading text-base text-[#1A1A1A]">Bank transfer (BACS)</p>
                  <p className="text-[11px] text-[#7A7A7A] mt-1">We'll show our bank details and a reference — we confirm once received.</p>
                </button>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="bg-[#FBF3E7] border border-[#E9C46A] p-3 mt-3">
                  <p className="text-[12px] text-[#6B4E00] leading-relaxed">
                    <strong>Please note:</strong> this date is only held provisionally. Your booking is not secured until we've received your bank transfer — please send payment as soon as possible to avoid losing this date to another booking.
                  </p>
                </div>
              )}

              <div className="bg-white border border-[#E5E5E5] p-4 mt-4 text-sm" data-testid="private-booking-summary">
                <Row label={`${form.guests || 1} × guest @ £${pricePerGuest.toFixed(2)}`} value={`£${subtotal.toFixed(2)}`} />
                {discountAmount > 0 && <Row label={`Full-payment discount (${discountPct}%)`} value={`–£${discountAmount.toFixed(2)}`} />}
                <div className="border-t border-[#E5E5E5] mt-2 pt-2">
                  <Row label={paymentMethod === "bank_transfer" ? "Due now (bank transfer)" : "Pay now (card)"} value={`£${amountDueNow.toFixed(2)}`} bold />
                  {balanceOnDay > 0 && <Row label="Balance — collected on the day" value={`£${balanceOnDay.toFixed(2)}`} />}
                </div>
              </div>

              {workshop.cancellation_policy && (
                <p className="text-[11px] text-[#7A7A7A] mt-3 leading-relaxed">
                  <strong className="text-[#1A1A1A]">Cancellation policy:</strong> {workshop.cancellation_policy}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5E5]">
              <Button type="submit" disabled={submitting} className="btn-dark rounded-none" data-testid="private-booking-submit">
                {submitting ? "Please wait…" : paymentMethod === "bank_transfer" ? `Confirm booking — £${amountDueNow.toFixed(2)} by bank transfer` : `Pay £${amountDueNow.toFixed(2)} & book`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

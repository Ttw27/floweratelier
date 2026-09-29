import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import BankDetails, { pickBankDetails } from "../components/BankDetails";
import { getContact, whatsappHref } from "../lib/contact";
import { calcWorkshopAmounts, isSessionPast, fmtWorkshopDate as fmtDate } from "../lib/workshopPricing";

const API_URL = process.env.REACT_APP_BACKEND_URL;

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

  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: 1, dietary_requirements: "", notes: "",
    // Private / corporate booking details
    organisation_name: "", billing_address: "", po_number: "",
    venue_name: "", venue_address: "", venue_postcode: "", arrival_time: "", access_notes: "", setup_notes: "",
    onsite_contact_name: "", onsite_contact_phone: "",
    occasion: "", accessibility_needs: "", group_notes: "", theme_preferences: "",
    photo_consent: "", heard_about: "",
  });
  const [forOrganisation, setForOrganisation] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const [paymentChoice, setPaymentChoice] = useState("deposit");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [cardEnabled, setCardEnabled] = useState(true);
  const [bankEnabled, setBankEnabled] = useState(false);
  const [bankFromApi, setBankFromApi] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/payment-methods`)
      .then((r) => {
        setCardEnabled(!!r.data?.card_enabled);
        setBankEnabled(!!r.data?.bank_transfer_enabled);
        setBankFromApi(r.data?.bank_details || null);
      })
      .catch(() => { setCardEnabled(true); setBankEnabled(false); }); // fail open for card — don't block booking on a status-check error
  }, []);

  // Pick a payment method that is actually available
  useEffect(() => {
    if (!cardEnabled && bankEnabled) setPaymentMethod("bank_transfer");
    else if (cardEnabled) setPaymentMethod("stripe");
  }, [cardEnabled, bankEnabled]);

  const bankDetails = pickBankDetails(confirmedBooking?.bank_details, bankFromApi, settings);
  const noPaymentMethod = !cardEnabled && !bankEnabled;
  const contact = getContact(settings);

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

  const amounts = useMemo(
    () => calcWorkshopAmounts(workshop, session, form.guests, paymentChoice),
    [workshop, session, form.guests, paymentChoice]
  );
  const { pricePerGuest, discountPct, subtotal, fullAmount, depositAmount, depositAvailable, effectiveChoice, discountAmount, amountDueNow, balanceOnDay } = amounts;
  const sessionPast = isSessionPast(session);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error("Name, email & phone are required"); return; }
    if (sessionPast) { toast.error("This session date has passed"); return; }
    if (noPaymentMethod) { toast.error("Online booking is unavailable — please call or WhatsApp the studio"); return; }
    if (form.guests > spotsRemaining) { toast.error(`Only ${spotsRemaining} spot(s) left`); return; }
    if (session?.at_customer_venue && (!form.venue_address.trim() || !form.venue_postcode.trim())) {
      toast.error("Please add the venue address and postcode"); return;
    }
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
        ...(forOrganisation ? {
          organisation_name: form.organisation_name, billing_address: form.billing_address, po_number: form.po_number,
        } : {}),
        ...(session?.at_customer_venue ? {
          venue_name: form.venue_name, venue_address: form.venue_address, venue_postcode: form.venue_postcode,
          arrival_time: form.arrival_time, access_notes: form.access_notes, setup_notes: form.setup_notes,
          onsite_contact_name: form.onsite_contact_name, onsite_contact_phone: form.onsite_contact_phone,
        } : {}),
        occasion: form.occasion,
        accessibility_needs: form.accessibility_needs,
        group_notes: form.group_notes,
        theme_preferences: form.theme_preferences,
        photo_consent: form.photo_consent,
        heard_about: form.heard_about,
        payment_choice: effectiveChoice,
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

          <div className="mb-6">
            {bankDetails ? (
              <BankDetails details={bankDetails} reference={b.bank_reference} />
            ) : (
              <p className="text-[12px] text-[#5A5A5A] bg-white border border-[#E5E5E5] p-5">We&rsquo;ll email you our bank details shortly — your reference is <strong className="text-[#1A1A1A]">{b.bank_reference}</strong>. Any questions? Call <a href={contact.telHref} className="underline text-[#1A1A1A]">{contact.phone}</a>.</p>
            )}
          </div>

          <div className="bg-white border border-[#E5E5E5] p-4 mb-8 text-sm">
            <Row label={`${b.guests} × guest @ £${Number(b.price_per_guest).toFixed(2)}`} value={`£${Number(b.subtotal).toFixed(2)}`} />
            <div className="border-t border-[#E5E5E5] mt-2 pt-2">
              <Row label="Transfer now" value={`£${Number(b.amount_due_now).toFixed(2)}`} bold />
              {Number(b.balance_due_on_day) > 0 && <Row label="Balance — collected on the day" value={`£${Number(b.balance_due_on_day).toFixed(2)}`} />}
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
            <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-[#B3A89B]" /> {session.at_customer_venue ? "At your venue — we come to you" : (session.location || workshop.location_default)}</span>
            <span className="inline-flex items-center gap-2"><Users size={14} className="text-[#B3A89B]" /> {spotsRemaining} spot{spotsRemaining === 1 ? "" : "s"} available</span>
          </div>
          {session.notes && <p className="font-body text-sm text-[#7A7A7A] mt-4">{session.notes}</p>}
        </div>

        {sessionPast || spotsRemaining <= 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-8 text-center" data-testid="private-booking-unavailable">
            <p className="font-heading text-xl text-[#1A1A1A] mb-2">{sessionPast ? "This session date has passed" : "This session is fully booked"}</p>
            <p className="font-body text-sm text-[#7A7A7A]">
              Please contact the studio to arrange an alternative date — call{" "}
              <a href={contact.telHref} className="underline text-[#1A1A1A]">{contact.phone}</a> or email{" "}
              <a href={`mailto:${contact.email}`} className="underline text-[#1A1A1A]">{contact.email}</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white border border-[#E5E5E5] p-6 md:p-8 space-y-5" data-testid="private-booking-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-[#1A1A1A]">Your name *</Label>
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

            {/* Organisation & invoicing */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" checked={forOrganisation} onChange={(e) => setForOrganisation(e.target.checked)} data-testid="private-booking-for-org" />
              <span className="font-body text-sm text-[#1A1A1A]">This booking is for a business or organisation <span className="text-[#7A7A7A] text-xs block">e.g. a company, pub, care home or club — so we can invoice correctly</span></span>
            </label>
            {forOrganisation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-2 border-[#E5E5E5] pl-4" data-testid="private-booking-org-section">
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Organisation name</Label>
                  <Input value={form.organisation_name} onChange={set("organisation_name")} className="light-input rounded-none mt-2" data-testid="private-booking-org-name" />
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">PO / reference number <span className="text-[#7A7A7A] text-xs">(if needed)</span></Label>
                  <Input value={form.po_number} onChange={set("po_number")} className="light-input rounded-none mt-2" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#1A1A1A]">Billing address <span className="text-[#7A7A7A] text-xs">(for the invoice)</span></Label>
                  <Textarea rows={2} value={form.billing_address} onChange={set("billing_address")} className="light-input rounded-none mt-2" />
                </div>
              </div>
            )}

            {/* Venue & logistics — only when we travel to the customer */}
            {session?.at_customer_venue && (
              <div className="border-t border-[#E5E5E5] pt-5 space-y-4" data-testid="private-booking-venue-section">
                <p className="accent-label"><span className="thin-rule" />Your venue</p>
                <p className="font-body text-xs text-[#7A7A7A] -mt-2">We'll bring everything to you — tell us where and how to get set up.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Venue name</Label>
                    <Input value={form.venue_name} onChange={set("venue_name")} placeholder="e.g. The Red Lion" className="light-input rounded-none mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Postcode *</Label>
                    <Input value={form.venue_postcode} onChange={set("venue_postcode")} className="light-input rounded-none mt-2" data-testid="private-booking-venue-postcode" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-[#1A1A1A]">Venue address *</Label>
                    <Textarea rows={2} value={form.venue_address} onChange={set("venue_address")} className="light-input rounded-none mt-2" data-testid="private-booking-venue-address" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Earliest time we can arrive to set up</Label>
                    <Input value={form.arrival_time} onChange={set("arrival_time")} placeholder="e.g. 5:30pm" className="light-input rounded-none mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Contact on the day</Label>
                    <Input value={form.onsite_contact_name} onChange={set("onsite_contact_name")} placeholder="Name" className="light-input rounded-none mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Their mobile</Label>
                    <Input value={form.onsite_contact_phone} onChange={set("onsite_contact_phone")} className="light-input rounded-none mt-2" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-[#1A1A1A]">Parking &amp; access</Label>
                    <Textarea rows={2} value={form.access_notes} onChange={set("access_notes")} placeholder="e.g. car park at the rear, room is upstairs with no lift, use side entrance" className="light-input rounded-none mt-2" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-[#1A1A1A]">Room &amp; tables</Label>
                    <Textarea rows={2} value={form.setup_notes} onChange={set("setup_notes")} placeholder="e.g. function room with 4 long tables, we'll need tables provided / can you bring cloths?" className="light-input rounded-none mt-2" />
                  </div>
                </div>
              </div>
            )}

            {/* About the group */}
            <div className="border-t border-[#E5E5E5] pt-5 space-y-4">
              <p className="accent-label"><span className="thin-rule" />About your group</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-[#1A1A1A]">What's the occasion?</Label>
                  <select value={form.occasion} onChange={set("occasion")} className="light-input rounded-none mt-2 w-full h-10 px-3 bg-white border border-[#E5E5E5] font-body text-sm" data-testid="private-booking-occasion">
                    <option value="">Select…</option>
                    <option>Team social / staff event</option>
                    <option>Client or corporate event</option>
                    <option>Hen party</option>
                    <option>Birthday</option>
                    <option>Baby or bridal shower</option>
                    <option>Residents' activity (care home)</option>
                    <option>Pub / venue event</option>
                    <option>Friends get-together</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Colours or theme <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
                  <Input value={form.theme_preferences} onChange={set("theme_preferences")} placeholder="e.g. brand colours, pastels, autumnal" className="light-input rounded-none mt-2" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#1A1A1A]">Accessibility or mobility needs <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
                  <Textarea rows={2} value={form.accessibility_needs} onChange={set("accessibility_needs")} placeholder="e.g. wheelchair users, limited hand strength, seated throughout" className="light-input rounded-none mt-2" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#1A1A1A]">Anything about the group we should know? <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
                  <Textarea rows={2} value={form.group_notes} onChange={set("group_notes")} placeholder="e.g. age range, complete beginners, some guests have dementia, children attending" className="light-input rounded-none mt-2" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-[#1A1A1A]">Dietary requirements <span className="text-[#7A7A7A] text-xs">(only if food &amp; drink has been arranged with us — extra charges apply)</span></Label>
              <Textarea rows={2} value={form.dietary_requirements} onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })} className="light-input rounded-none mt-2" placeholder="e.g. gluten-free, vegan, nut allergy" />
            </div>

            <div>
              <Label className="text-sm text-[#1A1A1A]">Any specific requests for this booking? <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="light-input rounded-none mt-2" placeholder="e.g. a particular colour palette, a theme, arrival time preferences, anything you'd like us to know" />
            </div>

            {/* Photos & marketing */}
            <div className="border-t border-[#E5E5E5] pt-5 space-y-4">
              <p className="accent-label"><span className="thin-rule" />Photos</p>
              <div>
                <Label className="text-sm text-[#1A1A1A]">Can we take photos on the day to share on our website and social media?</Label>
                <div className="mt-2 space-y-2" role="radiogroup">
                  {[
                    ["yes", "Yes — photos of the group and the creations"],
                    ["creations_only", "Creations only — no faces please"],
                    ["no", "No photos please"],
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 font-body text-sm text-[#1A1A1A] cursor-pointer">
                      <input type="radio" name="photo_consent" value={val} checked={form.photo_consent === val} onChange={set("photo_consent")} data-testid={`private-booking-photo-${val}`} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="max-w-sm">
                <Label className="text-sm text-[#1A1A1A]">How did you hear about us? <span className="text-[#7A7A7A] text-xs">(optional)</span></Label>
                <select value={form.heard_about} onChange={set("heard_about")} className="light-input rounded-none mt-2 w-full h-10 px-3 bg-white border border-[#E5E5E5] font-body text-sm">
                  <option value="">Select…</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>Google</option>
                  <option>Recommendation</option>
                  <option>Been to a workshop before</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Deposit vs full */}
            <div className="border-t border-[#E5E5E5] pt-5">
              <p className="accent-label mb-3"><span className="thin-rule" />How much to pay now</p>
              <div className={`grid grid-cols-1 ${depositAvailable ? "md:grid-cols-2" : ""} gap-3`}>
                {depositAvailable && (
                <button type="button" onClick={() => setPaymentChoice("deposit")} className={`text-left bg-white border p-4 ${effectiveChoice === "deposit" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`} data-testid="private-payment-deposit">
                  <p className="font-heading text-base text-[#1A1A1A]">Pay deposit</p>
                  <p className="text-[11px] text-[#7A7A7A] mt-1">Secure the booking with a deposit. Balance collected on the day.</p>
                  <p className="font-heading text-lg text-[#1A1A1A] mt-2">£{depositAmount.toFixed(2)}<span className="text-[11px] text-[#7A7A7A] font-body ml-2">now</span></p>
                </button>
                )}
                <button type="button" onClick={() => setPaymentChoice("full")} className={`text-left bg-white border p-4 relative ${effectiveChoice === "full" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`} data-testid="private-payment-full">
                  {discountPct > 0 && <span className="absolute top-3 right-3 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.2em] px-2 py-0.5">{discountPct}% off</span>}
                  <p className="font-heading text-base text-[#1A1A1A]">Pay in full</p>
                  <p className="text-[11px] text-[#7A7A7A] mt-1">Pay everything now{discountPct > 0 ? ` and save ${discountPct}%` : ""}.</p>
                  <p className="font-heading text-lg text-[#1A1A1A] mt-2">£{fullAmount.toFixed(2)}<span className="text-[11px] text-[#7A7A7A] font-body ml-2">now</span></p>
                </button>
              </div>
            </div>

            {/* Payment method */}
            <div className="border-t border-[#E5E5E5] pt-5">
              <p className="accent-label mb-3"><span className="thin-rule" />How to pay</p>
              {noPaymentMethod ? (
                <div className="bg-[#FBF3E7] border border-[#E9C46A] p-4" data-testid="private-booking-contact-to-book">
                  <p className="font-heading text-base text-[#1A1A1A] mb-1">Book by phone or WhatsApp</p>
                  <p className="text-[12px] text-[#6B4E00] leading-relaxed mb-4">Online payment isn&rsquo;t available right now. Call or message the studio and we&rsquo;ll secure this booking personally.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={contact.telHref}>
                      <Button type="button" variant="outline" className="rounded-none w-full sm:w-auto"><Phone size={14} className="mr-2" /> Call {contact.phone}</Button>
                    </a>
                    <a href={whatsappHref(settings, `Hello Flower Atelier — I'd like to book ${workshop.name} on ${fmtDate(session.date)}.`)} target="_blank" rel="noopener noreferrer">
                      <Button type="button" className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none w-full sm:w-auto"><MessageCircle size={14} className="mr-2" /> WhatsApp the studio</Button>
                    </a>
                  </div>
                </div>
              ) : (
              <div className={`grid grid-cols-1 ${cardEnabled && bankEnabled ? "md:grid-cols-2" : ""} gap-3`}>
                {cardEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`text-left border p-4 ${paymentMethod === "stripe" ? "bg-white border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "bg-white border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                    data-testid="private-payment-method-stripe"
                  >
                    <p className="font-heading text-base text-[#1A1A1A]">Pay by card</p>
                    <p className="text-[11px] text-[#7A7A7A] mt-1">Secure card payment via Stripe — instant confirmation.</p>
                  </button>
                )}
                {bankEnabled && (
                  <button type="button" onClick={() => setPaymentMethod("bank_transfer")} className={`text-left bg-white border p-4 ${paymentMethod === "bank_transfer" ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`} data-testid="private-payment-method-bacs">
                    <p className="font-heading text-base text-[#1A1A1A]">Bank transfer (BACS)</p>
                    <p className="text-[11px] text-[#7A7A7A] mt-1">We'll show our bank details and a reference — we confirm once received.</p>
                  </button>
                )}
              </div>
              )}

              {!noPaymentMethod && !cardEnabled && (
                <p className="text-[11px] text-[#7A7A7A] mt-2">
                  Card payment isn&rsquo;t available online right now. To pay by card, please call{" "}
                  <a href={contact.telHref} className="underline text-[#1A1A1A]">{contact.phone}</a>.
                </p>
              )}

              {!noPaymentMethod && paymentMethod === "bank_transfer" && (
                <div className="mt-3 space-y-3">
                  <div className="bg-[#FBF3E7] border border-[#E9C46A] p-3">
                    <p className="text-[12px] text-[#6B4E00] leading-relaxed">
                      <strong>Please note:</strong> this date is only held provisionally. Your booking is not secured until we've received your bank transfer — please send payment as soon as possible to avoid losing this date to another booking. You&rsquo;ll get your payment reference on the next screen and by email.
                    </p>
                  </div>
                  {bankDetails && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#B3A89B] mb-2">Our bank details</p>
                      <BankDetails details={bankDetails} compact />
                    </div>
                  )}
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
              {!noPaymentMethod && <Button type="submit" disabled={submitting} className="btn-dark rounded-none" data-testid="private-booking-submit">
                {submitting ? "Please wait…" : paymentMethod === "bank_transfer" ? `Confirm booking — £${amountDueNow.toFixed(2)} by bank transfer` : `Pay £${amountDueNow.toFixed(2)} & book`}
              </Button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

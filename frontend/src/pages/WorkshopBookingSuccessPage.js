import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Mail, MapPin, Clock } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { getContact } from "../lib/contact";
import { fmtWorkshopDate as fmtDate } from "../lib/workshopPricing";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function WorkshopBookingSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("polling");
  const [booking, setBooking] = useState(null);
  const { settings } = useSettings();
  const contact = getContact(settings);

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    let attempts = 0;
    let timer;
    const poll = async () => {
      attempts += 1;
      try {
        const r = await axios.get(`${API_URL}/api/workshop-checkout/status/${sessionId}`);
        setBooking(r.data.booking || null);
        if (r.data.payment_status === "paid") {
          setStatus("paid");
        } else if (r.data.status === "expired") {
          setStatus("expired");
        } else if (attempts >= 10) {
          setStatus("timeout");
        } else {
          timer = setTimeout(poll, 2000);
        }
      } catch {
        if (attempts >= 5) setStatus("error");
        else timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => { if (timer) clearTimeout(timer); };
  }, [sessionId]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-[#FAFAF7]" data-testid="workshop-success-page">
      <div className="max-w-2xl mx-auto bg-white border border-[#E5E5E5] p-8 md:p-12">
        {status === "polling" && (
          <div className="text-center">
            <div className="spinner mx-auto mb-6" />
            <h1 className="font-heading text-3xl text-[#1A1A1A] mb-3">Confirming your booking…</h1>
            <p className="font-body text-sm text-[#7A7A7A]">One moment — Stripe is talking to our studio.</p>
          </div>
        )}
        {status === "paid" && (
          <div className="text-center">
            <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto text-[#5C7A3F] mb-6" />
            <p className="accent-label justify-center mb-4"><span className="thin-rule" />Booked</p>
            <h1 className="font-heading text-4xl text-[#1A1A1A] mb-3" data-testid="workshop-success-title">You&rsquo;re in.</h1>
            <p className="font-body text-base text-[#5A5A5A] mb-8">A confirmation is on its way{booking?.email ? <> to <strong className="text-[#1A1A1A]">{booking.email}</strong></> : null}.</p>

            {booking && <div className="text-left bg-[#FAFAF7] border border-[#E5E5E5] p-6 mb-6">
              {(booking.workshop_title || booking.workshop_name) && (
                <p className="font-heading text-xl text-[#1A1A1A] mb-4" data-testid="workshop-success-workshop-title">{booking.workshop_title || booking.workshop_name}</p>
              )}
              <div className="space-y-2 text-sm text-[#1A1A1A]">
                {booking.session_date && (
                  <p data-testid="workshop-success-date"><Calendar size={14} className="inline mr-2 text-[#B3A89B]" />{fmtDate(booking.session_date)}</p>
                )}
                {booking.session_start_time && (
                  <p data-testid="workshop-success-time"><Clock size={14} className="inline mr-2 text-[#B3A89B]" />{booking.session_start_time}{booking.session_end_time ? `–${booking.session_end_time}` : ""}</p>
                )}
                {booking.session_location && (
                  <p data-testid="workshop-success-location"><MapPin size={14} className="inline mr-2 text-[#B3A89B]" />{booking.session_location}</p>
                )}
                <p className="text-[#7A7A7A]">{booking.guests} guest(s) · paid £{Number(booking.amount_paid || 0).toFixed(2)}{Number(booking.balance_due_on_day) > 0 ? ` · balance £${Number(booking.balance_due_on_day).toFixed(2)} on the day` : ""}</p>
              </div>
            </div>}

            <p className="text-[12px] text-[#7A7A7A] mb-6"><Mail size={11} className="inline mr-1" /> Any questions before the day? Call <a href={contact.telHref} className="underline text-[#1A1A1A]">{contact.phone}</a> or email <a href={`mailto:${contact.email}`} className="underline text-[#1A1A1A]">{contact.email}</a>.</p>
            <Link to="/workshops"><Button variant="outline" className="rounded-none">Back to workshops</Button></Link>
          </div>
        )}
        {(status === "expired" || status === "timeout" || status === "error") && (
          <div className="text-center">
            <h1 className="font-heading text-3xl text-[#1A1A1A] mb-3">Booking not confirmed</h1>
            <p className="font-body text-sm text-[#7A7A7A] mb-6">
              {status === "expired" ? "Your Stripe session expired before payment was completed." : "We couldn’t confirm payment in time. If you were charged, please contact the studio with this reference."}
            </p>
            {sessionId && <p className="font-body text-xs text-[#7A7A7A] mb-2 break-all">Reference: {sessionId}</p>}
            <p className="font-body text-xs text-[#7A7A7A] mb-6">
              <a href={contact.telHref} className="underline text-[#1A1A1A]">{contact.phone}</a> · <a href={`mailto:${contact.email}`} className="underline text-[#1A1A1A]">{contact.email}</a>
            </p>
            <Link to="/workshops"><Button className="btn-dark rounded-none">Try again</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Mail, MapPin } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const fmtDate = (iso) => {
  if (!iso) return "";
  try { return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
  catch { return iso; }
};

export default function WorkshopBookingSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("polling");
  const [booking, setBooking] = useState(null);

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
        {status === "paid" && booking && (
          <div className="text-center">
            <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto text-[#5C7A3F] mb-6" />
            <p className="accent-label justify-center mb-4"><span className="thin-rule" />Booked</p>
            <h1 className="font-heading text-4xl text-[#1A1A1A] mb-3" data-testid="workshop-success-title">You&rsquo;re in.</h1>
            <p className="font-body text-base text-[#5A5A5A] mb-8">A confirmation is on its way to <strong className="text-[#1A1A1A]">{booking.email}</strong>.</p>

            <div className="text-left bg-[#FAFAF7] border border-[#E5E5E5] p-6 mb-6">
              <p className="font-heading text-xl text-[#1A1A1A] mb-4">{booking.workshop_name}</p>
              <div className="space-y-2 text-sm text-[#1A1A1A]">
                <p><Calendar size={14} className="inline mr-2 text-[#B3A89B]" />{fmtDate(booking.session_date || "")}{booking.session_start_time ? ` · ${booking.session_start_time}` : ""}</p>
                <p><MapPin size={14} className="inline mr-2 text-[#B3A89B]" />{booking.session_location || "—"}</p>
                <p className="text-[#7A7A7A]">{booking.guests} guest(s) · paid £{Number(booking.amount_paid).toFixed(2)}{booking.balance_due_on_day > 0 ? ` · balance £${Number(booking.balance_due_on_day).toFixed(2)} on the day` : ""}</p>
              </div>
            </div>

            <p className="text-[12px] text-[#7A7A7A] mb-6"><Mail size={11} className="inline mr-1" /> We&rsquo;ll send a reminder 48 hours before with the studio address and parking notes.</p>
            <Link to="/workshops"><Button variant="outline" className="rounded-none">Back to workshops</Button></Link>
          </div>
        )}
        {(status === "expired" || status === "timeout" || status === "error") && (
          <div className="text-center">
            <h1 className="font-heading text-3xl text-[#1A1A1A] mb-3">Booking not confirmed</h1>
            <p className="font-body text-sm text-[#7A7A7A] mb-6">
              {status === "expired" ? "Your Stripe session expired before payment was completed." : "We couldn&rsquo;t confirm payment in time. If you were charged, please email the studio with this reference."}
            </p>
            <p className="font-body text-xs text-[#7A7A7A] mb-6">Reference: {sessionId}</p>
            <Link to="/workshops"><Button className="btn-dark rounded-none">Try again</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}

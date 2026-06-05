import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Package, Truck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const check = async () => {
      if (!sessionId) { setStatus("error"); return; }
      let attempts = 0;
      const poll = async () => {
        if (attempts >= 5) { setStatus("timeout"); return; }
        try {
          const response = await axios.get(`${API_URL}/api/checkout/status/${sessionId}`);
          if (response.data.payment_status === "paid") { setStatus("success"); clearCart(); return; }
          if (response.data.status === "expired") { setStatus("expired"); return; }
          attempts++; setTimeout(poll, 2000);
        } catch { attempts++; setTimeout(poll, 2000); }
      };
      poll();
    };
    check();
  }, [sessionId, clearCart]);

  if (status === "checking") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 pt-32" data-testid="checking-status">
        <div className="spinner mb-6" />
        <p className="font-body text-sm text-[#7A7A7A] uppercase tracking-wider">Verifying payment…</p>
      </div>
    );
  }

  if (status === "error" || status === "expired" || status === "timeout") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 pt-32" data-testid="payment-error">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-3xl font-light text-[#1A1A1A] mb-4">
            {status === "expired" ? "Payment expired" : "Could not verify payment"}
          </h1>
          <p className="font-body text-[#7A7A7A] mb-8">Please try again or contact us.</p>
          <Link to="/cart"><Button className="btn-dark rounded-none">Return to basket</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 py-16" data-testid="order-success-page">
      <div className="px-6 max-w-2xl mx-auto text-center py-8">
        <div className="w-20 h-20 border border-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-10">
          <CheckCircle size={36} strokeWidth={1.3} className="text-[#1A1A1A]" />
        </div>
        <p className="accent-label mb-6">Thank you</p>
        <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] mb-6 tracking-tight leading-[1.05]" data-testid="success-title">
          Your order has<br /><span className="italic">been received.</span>
        </h1>
        <p className="font-body text-[#7A7A7A] mb-12 leading-relaxed">
          We've sent confirmation to your inbox. Our atelier will prepare each piece by hand
          and dispatch for your selected delivery date.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="border border-[#E5E5E5] p-6 bg-white">
            <Package className="w-6 h-6 text-[#1A1A1A] mx-auto mb-3" strokeWidth={1.3} />
            <p className="accent-label mb-1">Order</p>
            <p className="font-heading text-lg text-[#1A1A1A]">Confirmed</p>
          </div>
          <div className="border border-[#E5E5E5] p-6 bg-white">
            <Truck className="w-6 h-6 text-[#1A1A1A] mx-auto mb-3" strokeWidth={1.3} />
            <p className="accent-label mb-1">Delivery</p>
            <p className="font-heading text-lg text-[#1A1A1A]">Scheduled</p>
          </div>
          <div className="border border-[#E5E5E5] p-6 bg-white">
            <Gift className="w-6 h-6 text-[#1A1A1A] mx-auto mb-3" strokeWidth={1.3} />
            <p className="accent-label mb-1">Message</p>
            <p className="font-heading text-lg text-[#1A1A1A]">Included</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account"><Button className="btn-outline-dark rounded-none" data-testid="view-orders-btn">View my orders</Button></Link>
          <Link to="/collection"><Button className="btn-dark rounded-none" data-testid="continue-shopping-btn">Continue shopping</Button></Link>
        </div>
      </div>
    </div>
  );
}

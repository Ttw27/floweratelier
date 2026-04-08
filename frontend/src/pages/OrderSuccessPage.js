import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Package, Truck, Calendar, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [status, setStatus] = useState("checking");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = 2000;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setStatus("timeout");
          return;
        }

        try {
          const response = await axios.get(`${API_URL}/api/checkout/status/${sessionId}`);
          
          if (response.data.payment_status === "paid") {
            setStatus("success");
            clearCart();
            return;
          } else if (response.data.status === "expired") {
            setStatus("expired");
            return;
          }

          attempts++;
          setTimeout(poll, pollInterval);
        } catch (error) {
          console.error("Error checking payment status:", error);
          attempts++;
          setTimeout(poll, pollInterval);
        }
      };

      poll();
    };

    checkPaymentStatus();
  }, [sessionId, clearCart]);

  if (status === "checking") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20" data-testid="checking-status">
        <div className="spinner mb-6" />
        <p className="font-body text-[#788275]">Verifying your payment...</p>
      </div>
    );
  }

  if (status === "error" || status === "expired" || status === "timeout") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4" data-testid="payment-error">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl text-[#233520] mb-4">
            {status === "expired" ? "Payment Expired" : "Payment Verification Failed"}
          </h1>
          <p className="font-body text-[#788275] mb-8">
            {status === "expired" 
              ? "Your payment session has expired. Please try again."
              : "We couldn't verify your payment. If you believe this is an error, please contact support."}
          </p>
          <Link to="/cart">
            <Button className="bg-[#C07A65] hover:bg-[#a86856] text-white px-8 py-4 font-body">
              Return to Cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-20" data-testid="order-success-page">
      <div className="px-4 md:px-8 max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#E8ECE1] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} className="text-[#233520]" />
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#233520] mb-4" data-testid="success-title">
          Thank You for Your Order!
        </h1>
        <p className="font-body text-[#788275] text-lg mb-8">
          Your beautiful flowers are on their way! We've sent a confirmation email with all the details.
        </p>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#F0F0EA] p-6">
            <Package className="w-8 h-8 text-[#C07A65] mx-auto mb-3" />
            <p className="font-body text-sm text-[#788275]">Order Confirmed</p>
            <p className="font-heading text-lg text-[#233520]">Processing</p>
          </div>
          <div className="bg-[#F0F0EA] p-6">
            <Truck className="w-8 h-8 text-[#C07A65] mx-auto mb-3" />
            <p className="font-body text-sm text-[#788275]">Delivery</p>
            <p className="font-heading text-lg text-[#233520]">As Selected</p>
          </div>
          <div className="bg-[#F0F0EA] p-6">
            <Gift className="w-8 h-8 text-[#C07A65] mx-auto mb-3" />
            <p className="font-body text-sm text-[#788275]">Gift Message</p>
            <p className="font-heading text-lg text-[#233520]">Included</p>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white border border-[#E3E5DF] p-8 text-left mb-8">
          <h2 className="font-heading text-xl text-[#233520] mb-4">What happens next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#C07A65] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
              <span className="font-body text-[#788275]">Our florists will carefully prepare your bouquet using the freshest blooms</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#C07A65] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
              <span className="font-body text-[#788275]">Your order will be dispatched for delivery on your selected date</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#C07A65] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
              <span className="font-body text-[#788275]">The recipient will receive your beautiful flowers along with your gift message</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/account">
            <Button variant="outline" className="border-[#233520] text-[#233520] hover:bg-[#233520] hover:text-white px-8 py-4 font-body" data-testid="view-orders-btn">
              View My Orders
            </Button>
          </Link>
          <Link to="/flowers">
            <Button className="bg-[#C07A65] hover:bg-[#a86856] text-white px-8 py-4 font-body" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

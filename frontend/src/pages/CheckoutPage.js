import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { CalendarIcon, Truck, Gift, ShieldCheck } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, sessionId, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(addDays(new Date(), 2));
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postcode: "",
    gift_message: cart.gift_message || ""
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate("/cart");
    }
  }, [cart.items, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isDateDisabled = (date) => {
    return isBefore(date, addDays(startOfToday(), 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.recipient_name || !formData.recipient_phone || !formData.address_line1 || !formData.city || !formData.postcode) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await axios.post(`${API_URL}/api/orders`, {
        delivery_date: format(deliveryDate, "yyyy-MM-dd"),
        delivery_address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          city: formData.city,
          postcode: formData.postcode
        },
        gift_message: formData.gift_message,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone
      }, { params: { session_id: sessionId } });

      const order = orderResponse.data;

      // Create checkout session
      const checkoutResponse = await axios.post(`${API_URL}/api/checkout/session`, {
        order_id: order.id,
        origin_url: window.location.origin
      });

      // Redirect to Stripe
      window.location.href = checkoutResponse.data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.detail || "Failed to process checkout");
      setLoading(false);
    }
  };

  const deliveryFee = cart.subtotal >= 50 ? 0 : 5.99;
  const total = cart.subtotal + deliveryFee;

  return (
    <div className="min-h-screen py-8 md:py-12 bg-[#FAFAF7]" data-testid="checkout-page">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#233520] mb-8" data-testid="checkout-title">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Date */}
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF]" data-testid="delivery-date-section">
                <h2 className="font-heading text-xl text-[#233520] mb-6 flex items-center gap-2">
                  <Truck size={20} className="text-[#C07A65]" />
                  Delivery Date
                </h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-body border-[#E3E5DF]"
                      data-testid="delivery-date-trigger"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#C07A65]" />
                      {format(deliveryDate, "EEEE, MMMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(date) => date && setDeliveryDate(date)}
                      disabled={isDateDisabled}
                      initialFocus
                      data-testid="delivery-calendar"
                    />
                  </PopoverContent>
                </Popover>
                <p className="font-body text-sm text-[#788275] mt-2">
                  Select your preferred delivery date (next day delivery available)
                </p>
              </div>

              {/* Recipient Details */}
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF]" data-testid="recipient-section">
                <h2 className="font-heading text-xl text-[#233520] mb-6">Recipient Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-[#233520]">Full Name *</Label>
                    <Input
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleChange}
                      className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                      placeholder="John Smith"
                      required
                      data-testid="recipient-name-input"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-[#233520]">Phone Number *</Label>
                    <Input
                      name="recipient_phone"
                      value={formData.recipient_phone}
                      onChange={handleChange}
                      className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                      placeholder="07123 456789"
                      required
                      data-testid="recipient-phone-input"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF]" data-testid="address-section">
                <h2 className="font-heading text-xl text-[#233520] mb-6">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="font-body text-[#233520]">Address Line 1 *</Label>
                    <Input
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                      placeholder="123 High Street"
                      required
                      data-testid="address-line1-input"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-[#233520]">Address Line 2</Label>
                    <Input
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                      placeholder="Apartment, suite, etc. (optional)"
                      data-testid="address-line2-input"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-[#233520]">City *</Label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                        placeholder="London"
                        required
                        data-testid="city-input"
                      />
                    </div>
                    <div>
                      <Label className="font-body text-[#233520]">Postcode *</Label>
                      <Input
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                        placeholder="SW1A 1AA"
                        required
                        data-testid="postcode-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gift Message */}
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF]" data-testid="gift-message-section">
                <h2 className="font-heading text-xl text-[#233520] mb-6 flex items-center gap-2">
                  <Gift size={20} className="text-[#C07A65]" />
                  Gift Message (Optional)
                </h2>
                <Textarea
                  name="gift_message"
                  value={formData.gift_message}
                  onChange={handleChange}
                  className="min-h-[100px] border-[#E3E5DF] focus:border-[#C07A65] font-body"
                  placeholder="Add a personal message to include with your flowers..."
                  data-testid="checkout-gift-message"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF] sticky top-32" data-testid="checkout-summary">
                <h2 className="font-heading text-xl text-[#233520] mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-3">
                      <div className="w-16 h-20 bg-[#F0F0EA] flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-body text-sm text-[#233520]">{item.name}</p>
                        <p className="font-body text-xs text-[#788275]">Qty: {item.quantity}</p>
                        <p className="font-body text-sm font-semibold text-[#233520]">£{item.item_total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-[#E3E5DF] pt-4 space-y-3 mb-6">
                  <div className="flex justify-between font-body text-[#233520]">
                    <span>Subtotal</span>
                    <span>£{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-body text-[#233520]">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? "Free" : `£${deliveryFee.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="border-t border-[#E3E5DF] pt-4 mb-6">
                  <div className="flex justify-between font-heading text-lg text-[#233520]">
                    <span>Total</span>
                    <span data-testid="checkout-total">£{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C07A65] hover:bg-[#a86856] text-white py-6 text-base font-body"
                  data-testid="place-order-button"
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-[#788275]">
                  <ShieldCheck size={16} />
                  <span className="font-body text-xs">Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

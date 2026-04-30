import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Truck, Gift, ShieldCheck, Package, Check } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, sessionId } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [boxPersonalization, setBoxPersonalization] = useState({ box_color: null, ribbon_color: null, box_message: "" });
  const [showBoxCustomization, setShowBoxCustomization] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postcode: "",
    gift_message: cart.gift_message || "",
  });

  useEffect(() => {
    if (cart.items.length === 0) navigate("/cart");
    fetchDeliveryOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.items]);

  const fetchDeliveryOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery/options`);
      setDeliveryOptions(response.data);
      if (response.data.available_dates.length > 0) setSelectedDate(response.data.available_dates[0]);
    } catch { toast.error("Failed to load delivery options"); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recipient_name || !formData.recipient_phone || !formData.address_line1 || !formData.city || !formData.postcode) {
      toast.error("Please complete all required fields"); return;
    }
    if (!selectedDate) { toast.error("Please select a delivery date"); return; }

    setLoading(true);
    try {
      const boxData = showBoxCustomization && (boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message)
        ? { ...boxPersonalization } : null;

      const orderResponse = await axios.post(`${API_URL}/api/orders`, {
        delivery_date: selectedDate.date,
        delivery_address: { line1: formData.address_line1, line2: formData.address_line2, city: formData.city, postcode: formData.postcode },
        gift_message: formData.gift_message,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        box_personalization: boxData,
      }, { params: { session_id: sessionId } });

      const order = orderResponse.data;

      const checkoutResponse = await axios.post(`${API_URL}/api/checkout/session`, {
        order_id: order.id,
        origin_url: window.location.origin,
      });

      window.location.href = checkoutResponse.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Checkout failed");
      setLoading(false);
    }
  };

  const getDeliveryFee = () => {
    if (!selectedDate) return 5.99;
    if (cart.subtotal >= (deliveryOptions?.delivery_fees?.free_threshold || 50)) return 0;
    return selectedDate.delivery_fee;
  };

  const deliveryFee = getDeliveryFee();
  const total = cart.subtotal + deliveryFee;

  if (!deliveryOptions) {
    return <div className="min-h-[60vh] flex items-center justify-center pt-20"><div className="spinner" /></div>;
  }

  return (
    <div className="min-h-screen pt-20 pb-16" data-testid="checkout-page">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-12">
        <p className="accent-label mb-5"><span className="thin-rule" />Checkout</p>
        <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] mb-16 tracking-tight" data-testid="checkout-title">Complete your order</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Date */}
              <div className="bg-white border border-[#E5E5E5] p-8" data-testid="delivery-date-section">
                <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-2 flex items-center gap-3">
                  <Truck size={18} strokeWidth={1.3} /> Delivery date
                </h2>
                <p className="font-body text-sm text-[#7A7A7A] mb-6">Minimum 2 days' notice · No Sunday delivery</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="delivery-dates-grid">
                  {deliveryOptions.available_dates.slice(0, 8).map((dateOption) => (
                    <button
                      key={dateOption.date}
                      type="button"
                      onClick={() => setSelectedDate(dateOption)}
                      className={`p-4 border text-left transition-all ${
                        selectedDate?.date === dateOption.date
                          ? "border-[#1A1A1A] bg-[#F2EFEB]"
                          : "border-[#E5E5E5] hover:border-[#1A1A1A]"
                      }`}
                      data-testid={`delivery-date-${dateOption.date}`}
                    >
                      <p className="font-body text-xs uppercase tracking-[0.15em] text-[#1A1A1A]">{dateOption.day_name}</p>
                      <p className="font-heading text-xl font-light text-[#1A1A1A] mt-1">{format(new Date(dateOption.date), "MMM d")}</p>
                      <p className={`font-body text-[11px] mt-1 ${dateOption.is_saturday ? "text-[#1A1A1A] font-medium" : "text-[#7A7A7A]"}`}>
                        {cart.subtotal >= deliveryOptions.delivery_fees.free_threshold ? "Complimentary" : `£${dateOption.delivery_fee.toFixed(2)}`}
                      </p>
                      {dateOption.is_saturday && (
                        <span className="inline-block mt-2 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.5">Saturday</span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedDate?.is_saturday && cart.subtotal < deliveryOptions.delivery_fees.free_threshold && (
                  <p className="mt-5 font-body text-xs text-[#7A7A7A] bg-[#F2EFEB] p-3 italic">
                    Saturday delivery incurs a premium fee of £{deliveryOptions.delivery_fees.saturday.toFixed(2)}.
                  </p>
                )}
              </div>

              {/* Box Personalization */}
              <div className="bg-white border border-[#E5E5E5] p-8" data-testid="box-personalization-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-2xl font-light text-[#1A1A1A] flex items-center gap-3">
                    <Package size={18} strokeWidth={1.3} /> Presentation
                  </h2>
                  <button type="button" onClick={() => setShowBoxCustomization(!showBoxCustomization)} className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] underline" data-testid="toggle-box-customization">
                    {showBoxCustomization ? "Skip" : "Personalise"}
                  </button>
                </div>
                {!showBoxCustomization ? (
                  <p className="font-body text-sm text-[#7A7A7A]">Your piece will arrive in our signature ivory atelier box.</p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] mb-3 block">Box colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.box_colors.map((color) => (
                          <button key={color.id} type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, box_color: color.id })}
                            className={`relative w-12 h-12 rounded-full border transition-all ${boxPersonalization.box_color === color.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A] ring-offset-2" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`box-color-${color.id}`}
                          >
                            {boxPersonalization.box_color === color.id && (<Check size={16} className={`absolute inset-0 m-auto ${color.hex === "#FFFFFF" ? "text-[#1A1A1A]" : "text-white"}`} />)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] mb-3 block">Ribbon colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.ribbon_colors.map((color) => (
                          <button key={color.id} type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, ribbon_color: color.id })}
                            className={`relative w-12 h-12 rounded-full border transition-all ${boxPersonalization.ribbon_color === color.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A] ring-offset-2" : "border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`ribbon-color-${color.id}`}
                          >
                            {boxPersonalization.ribbon_color === color.id && (<Check size={16} className={`absolute inset-0 m-auto ${["#FFFFFF","#FFFFF0","#C0C0C0"].includes(color.hex) ? "text-[#1A1A1A]" : "text-white"}`} />)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] mb-3 block">Message on box</Label>
                      <Input
                        value={boxPersonalization.box_message}
                        onChange={(e) => { if (e.target.value.length <= deliveryOptions.box_personalization.max_box_message_length) setBoxPersonalization({ ...boxPersonalization, box_message: e.target.value }); }}
                        className="light-input rounded-none"
                        placeholder="With love, for you."
                        data-testid="box-message-input"
                      />
                      <p className="font-body text-[11px] text-[#B3A89B] mt-1">{boxPersonalization.box_message.length}/{deliveryOptions.box_personalization.max_box_message_length}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipient */}
              <div className="bg-white border border-[#E5E5E5] p-8" data-testid="recipient-section">
                <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-6">Recipient</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Full name *</Label>
                    <Input name="recipient_name" value={formData.recipient_name} onChange={handleChange} className="mt-2 light-input rounded-none" placeholder="J. Smith" required data-testid="recipient-name-input" />
                  </div>
                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Phone *</Label>
                    <Input name="recipient_phone" value={formData.recipient_phone} onChange={handleChange} className="mt-2 light-input rounded-none" placeholder="07123 456789" required data-testid="recipient-phone-input" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white border border-[#E5E5E5] p-8" data-testid="address-section">
                <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-6">Delivery address</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Address line 1 *</Label>
                    <Input name="address_line1" value={formData.address_line1} onChange={handleChange} className="mt-2 light-input rounded-none" required data-testid="address-line1-input" />
                  </div>
                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Address line 2</Label>
                    <Input name="address_line2" value={formData.address_line2} onChange={handleChange} className="mt-2 light-input rounded-none" data-testid="address-line2-input" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label className="accent-label text-[#1A1A1A]">City *</Label>
                      <Input name="city" value={formData.city} onChange={handleChange} className="mt-2 light-input rounded-none" required data-testid="city-input" />
                    </div>
                    <div>
                      <Label className="accent-label text-[#1A1A1A]">Postcode *</Label>
                      <Input name="postcode" value={formData.postcode} onChange={handleChange} className="mt-2 light-input rounded-none" required data-testid="postcode-input" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gift Message */}
              <div className="bg-white border border-[#E5E5E5] p-8" data-testid="gift-message-section">
                <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <Gift size={18} strokeWidth={1.3} /> Gift message
                </h2>
                <Textarea name="gift_message" value={formData.gift_message} onChange={handleChange} className="min-h-[100px] light-input rounded-none" placeholder="Your personal message, printed on our hand-finished card…" data-testid="checkout-gift-message" />
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E5E5E5] p-8 lg:sticky lg:top-28" data-testid="checkout-summary">
                <p className="accent-label mb-6 text-[#1A1A1A]">Your Order</p>
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-3">
                      <div className="w-16 h-20 bg-[#F2EFEB] flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-heading text-base text-[#1A1A1A]">{item.name}</p>
                        <p className="font-body text-xs text-[#7A7A7A]">Qty · {item.quantity}</p>
                        <p className="font-body text-sm text-[#1A1A1A]">£{item.item_total.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <div className="bg-[#F2EFEB] p-4 mb-4">
                    <p className="accent-label text-[#1A1A1A] mb-1">Delivery</p>
                    <p className="font-body text-sm text-[#1A1A1A]">{selectedDate.day_name}, {format(new Date(selectedDate.date), "MMMM d")}</p>
                    {selectedDate.is_saturday && <p className="font-body text-xs text-[#7A7A7A] italic mt-1">Saturday premium</p>}
                  </div>
                )}

                <div className="border-t border-[#E5E5E5] pt-5 space-y-3 mb-6">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#7A7A7A]">Subtotal</span>
                    <span className="text-[#1A1A1A]">£{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#7A7A7A]">Delivery{selectedDate?.is_saturday && deliveryFee > 0 && " (Sat)"}</span>
                    <span className="text-[#1A1A1A]">{deliveryFee === 0 ? "Complimentary" : `£${deliveryFee.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="border-t border-[#E5E5E5] pt-5 mb-7">
                  <div className="flex justify-between items-baseline">
                    <span className="accent-label text-[#1A1A1A]">Total</span>
                    <span className="font-heading text-3xl font-light text-[#1A1A1A]" data-testid="checkout-total">£{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" disabled={loading || !selectedDate} className="btn-dark w-full py-6 rounded-none" data-testid="place-order-button">
                  {loading ? "Processing…" : "Continue to Payment"}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-4 text-[#B3A89B]">
                  <ShieldCheck size={14} strokeWidth={1.3} />
                  <span className="font-body text-[11px] uppercase tracking-wider">Secure — Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

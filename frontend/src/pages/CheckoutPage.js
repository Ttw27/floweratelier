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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { Truck, Gift, ShieldCheck, Package, Check } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, sessionId, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [boxPersonalization, setBoxPersonalization] = useState({
    box_color: null,
    ribbon_color: null,
    box_message: ""
  });
  const [showBoxCustomization, setShowBoxCustomization] = useState(false);
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
    fetchDeliveryOptions();
  }, [cart.items, navigate]);

  const fetchDeliveryOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery/options`);
      setDeliveryOptions(response.data);
      // Auto-select first available date
      if (response.data.available_dates.length > 0) {
        setSelectedDate(response.data.available_dates[0]);
      }
    } catch (error) {
      console.error("Failed to fetch delivery options:", error);
      toast.error("Failed to load delivery options");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.recipient_name || !formData.recipient_phone || !formData.address_line1 || !formData.city || !formData.postcode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a delivery date");
      return;
    }

    setLoading(true);
    try {
      // Prepare box personalization if customized
      const boxData = showBoxCustomization && (boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message) 
        ? {
            box_color: boxPersonalization.box_color,
            ribbon_color: boxPersonalization.ribbon_color,
            box_message: boxPersonalization.box_message
          }
        : null;

      // Create order
      const orderResponse = await axios.post(`${API_URL}/api/orders`, {
        delivery_date: selectedDate.date,
        delivery_address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          city: formData.city,
          postcode: formData.postcode
        },
        gift_message: formData.gift_message,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        box_personalization: boxData
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

  // Calculate totals
  const getDeliveryFee = () => {
    if (!selectedDate) return 5.99;
    if (cart.subtotal >= (deliveryOptions?.delivery_fees?.free_threshold || 50)) return 0;
    return selectedDate.delivery_fee;
  };

  const deliveryFee = getDeliveryFee();
  const total = cart.subtotal + deliveryFee;

  if (!deliveryOptions) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

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
              {/* Delivery Date Selection */}
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF]" data-testid="delivery-date-section">
                <h2 className="font-heading text-xl text-[#233520] mb-2 flex items-center gap-2">
                  <Truck size={20} className="text-[#C07A65]" />
                  Select Delivery Date
                </h2>
                <p className="font-body text-sm text-[#788275] mb-6">
                  Choose from available dates (minimum 2 days from today, no Sunday delivery)
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="delivery-dates-grid">
                  {deliveryOptions.available_dates.slice(0, 8).map((dateOption) => (
                    <button
                      key={dateOption.date}
                      type="button"
                      onClick={() => setSelectedDate(dateOption)}
                      className={`p-3 border text-left transition-all ${
                        selectedDate?.date === dateOption.date
                          ? "border-[#C07A65] bg-[#F2CFC0]/20"
                          : "border-[#E3E5DF] hover:border-[#788275]"
                      }`}
                      data-testid={`delivery-date-${dateOption.date}`}
                    >
                      <p className="font-body text-sm font-semibold text-[#233520]">
                        {dateOption.day_name}
                      </p>
                      <p className="font-body text-xs text-[#788275]">
                        {format(new Date(dateOption.date), "MMM d")}
                      </p>
                      <p className={`font-body text-xs mt-1 ${dateOption.is_saturday ? "text-[#C07A65] font-semibold" : "text-[#788275]"}`}>
                        {cart.subtotal >= deliveryOptions.delivery_fees.free_threshold 
                          ? "Free" 
                          : `£${dateOption.delivery_fee.toFixed(2)}`}
                      </p>
                      {dateOption.is_saturday && (
                        <span className="inline-block mt-1 bg-[#C07A65] text-white text-[10px] px-1.5 py-0.5">
                          SAT
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {selectedDate?.is_saturday && cart.subtotal < deliveryOptions.delivery_fees.free_threshold && (
                  <p className="mt-4 font-body text-sm text-[#C07A65] bg-[#F2CFC0]/30 p-3">
                    Saturday delivery has a premium fee of £{SATURDAY_DELIVERY_FEE || 8.99}. 
                    Spend £{(deliveryOptions.delivery_fees.free_threshold - cart.subtotal).toFixed(2)} more for free delivery!
                  </p>
                )}
              </div>

              {/* Box Personalization */}
              <div className="bg-white p-6 md:p-8 border border-[#E3E5DF]" data-testid="box-personalization-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl text-[#233520] flex items-center gap-2">
                    <Package size={20} className="text-[#C07A65]" />
                    Personalize Your Box
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowBoxCustomization(!showBoxCustomization)}
                    className="font-body text-sm text-[#C07A65] hover:text-[#a86856]"
                    data-testid="toggle-box-customization"
                  >
                    {showBoxCustomization ? "Skip Customization" : "Customize Box"}
                  </button>
                </div>
                
                {!showBoxCustomization ? (
                  <p className="font-body text-sm text-[#788275]">
                    Your flowers will arrive in our classic white presentation box. Click "Customize Box" to personalize it!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Box Color */}
                    <div>
                      <Label className="font-body text-[#233520] mb-3 block">Box Color</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.box_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, box_color: color.id })}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                              boxPersonalization.box_color === color.id
                                ? "border-[#C07A65] ring-2 ring-[#C07A65] ring-offset-2"
                                : "border-[#E3E5DF] hover:border-[#788275]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`box-color-${color.id}`}
                          >
                            {boxPersonalization.box_color === color.id && (
                              <Check size={16} className="absolute inset-0 m-auto text-[#233520]" />
                            )}
                          </button>
                        ))}
                      </div>
                      {boxPersonalization.box_color && (
                        <p className="font-body text-xs text-[#788275] mt-2">
                          Selected: {deliveryOptions.box_personalization.box_colors.find(c => c.id === boxPersonalization.box_color)?.name}
                        </p>
                      )}
                    </div>

                    {/* Ribbon Color */}
                    <div>
                      <Label className="font-body text-[#233520] mb-3 block">Ribbon Color</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.ribbon_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, ribbon_color: color.id })}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                              boxPersonalization.ribbon_color === color.id
                                ? "border-[#C07A65] ring-2 ring-[#C07A65] ring-offset-2"
                                : "border-[#E3E5DF] hover:border-[#788275]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`ribbon-color-${color.id}`}
                          >
                            {boxPersonalization.ribbon_color === color.id && (
                              <Check size={16} className={`absolute inset-0 m-auto ${color.hex === '#FFFFFF' || color.hex === '#FFFFF0' || color.hex === '#C0C0C0' ? 'text-[#233520]' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                      {boxPersonalization.ribbon_color && (
                        <p className="font-body text-xs text-[#788275] mt-2">
                          Selected: {deliveryOptions.box_personalization.ribbon_colors.find(c => c.id === boxPersonalization.ribbon_color)?.name}
                        </p>
                      )}
                    </div>

                    {/* Box Message */}
                    <div>
                      <Label className="font-body text-[#233520] mb-2 block">
                        Message on Box (max {deliveryOptions.box_personalization.max_box_message_length} characters)
                      </Label>
                      <Input
                        value={boxPersonalization.box_message}
                        onChange={(e) => {
                          if (e.target.value.length <= deliveryOptions.box_personalization.max_box_message_length) {
                            setBoxPersonalization({ ...boxPersonalization, box_message: e.target.value });
                          }
                        }}
                        className="border-[#E3E5DF] focus:border-[#C07A65]"
                        placeholder="e.g., Happy Birthday!"
                        data-testid="box-message-input"
                      />
                      <p className="font-body text-xs text-[#788275] mt-1">
                        {boxPersonalization.box_message.length}/{deliveryOptions.box_personalization.max_box_message_length} characters
                      </p>
                    </div>
                  </div>
                )}
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
                <p className="font-body text-xs text-[#788275] mt-2">
                  This message will be printed on a card inside the box
                </p>
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

                {/* Delivery Date */}
                {selectedDate && (
                  <div className="bg-[#E8ECE1] p-3 mb-4">
                    <p className="font-body text-xs text-[#788275]">Delivery Date</p>
                    <p className="font-body text-sm font-semibold text-[#233520]">
                      {selectedDate.day_name}, {format(new Date(selectedDate.date), "MMMM d, yyyy")}
                    </p>
                    {selectedDate.is_saturday && (
                      <p className="font-body text-xs text-[#C07A65]">Saturday Premium Delivery</p>
                    )}
                  </div>
                )}

                {/* Box Customization Summary */}
                {showBoxCustomization && (boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message) && (
                  <div className="bg-[#F2CFC0]/20 p-3 mb-4">
                    <p className="font-body text-xs text-[#788275] mb-1">Box Personalization</p>
                    {boxPersonalization.box_color && (
                      <p className="font-body text-xs text-[#233520]">
                        Box: {deliveryOptions.box_personalization.box_colors.find(c => c.id === boxPersonalization.box_color)?.name}
                      </p>
                    )}
                    {boxPersonalization.ribbon_color && (
                      <p className="font-body text-xs text-[#233520]">
                        Ribbon: {deliveryOptions.box_personalization.ribbon_colors.find(c => c.id === boxPersonalization.ribbon_color)?.name}
                      </p>
                    )}
                    {boxPersonalization.box_message && (
                      <p className="font-body text-xs text-[#233520]">
                        Message: "{boxPersonalization.box_message}"
                      </p>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-[#E3E5DF] pt-4 space-y-3 mb-6">
                  <div className="flex justify-between font-body text-[#233520]">
                    <span>Subtotal</span>
                    <span>£{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-body text-[#233520]">
                    <span>
                      Delivery
                      {selectedDate?.is_saturday && deliveryFee > 0 && (
                        <span className="text-xs text-[#C07A65] ml-1">(Saturday)</span>
                      )}
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "Free" : `£${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {deliveryFee > 0 && cart.subtotal < (deliveryOptions?.delivery_fees?.free_threshold || 50) && (
                    <p className="font-body text-xs text-[#788275]">
                      Free delivery on orders over £{deliveryOptions?.delivery_fees?.free_threshold || 50}
                    </p>
                  )}
                </div>

                <div className="border-t border-[#E3E5DF] pt-4 mb-6">
                  <div className="flex justify-between font-heading text-lg text-[#233520]">
                    <span>Total</span>
                    <span data-testid="checkout-total">£{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !selectedDate}
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

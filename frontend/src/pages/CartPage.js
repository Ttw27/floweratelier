import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus, Gift, ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, updateGiftMessage, loading } = useCart();
  const [giftMessage, setGiftMessage] = useState(cart.gift_message || "");
  const [showGiftMessage, setShowGiftMessage] = useState(!!cart.gift_message);
  const [updatingGift, setUpdatingGift] = useState(false);

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateQuantity(productId, newQty);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleSaveGiftMessage = async () => {
    setUpdatingGift(true);
    try {
      await updateGiftMessage(giftMessage);
      toast.success("Gift message saved!");
    } catch (error) {
      toast.error("Failed to save gift message");
    } finally {
      setUpdatingGift(false);
    }
  };

  const deliveryFee = cart.subtotal >= 50 ? 0 : 5.99;
  const saturdayDeliveryFee = 8.99;
  const total = cart.subtotal + deliveryFee;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20" data-testid="empty-cart">
        <ShoppingBag size={64} className="text-[#E3E5DF] mb-6" />
        <h1 className="font-heading text-2xl text-[#233520] mb-4">Your basket is empty</h1>
        <p className="font-body text-[#788275] mb-8">Add some beautiful blooms to get started</p>
        <Link to="/flowers">
          <Button className="bg-[#C07A65] hover:bg-[#a86856] text-white px-8 py-4 font-body" data-testid="continue-shopping-btn">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12" data-testid="cart-page">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#233520] mb-8" data-testid="cart-title">
          Your Basket
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6" data-testid="cart-items">
            {cart.items.map((item, index) => (
              <div key={`${item.product_id}-${item.size}-${index}`} className="flex gap-4 md:gap-6 pb-6 border-b border-[#E3E5DF]" data-testid={`cart-item-${item.product_id}`}>
                {/* Image */}
                <div className="w-24 h-32 md:w-32 md:h-40 bg-[#F0F0EA] flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-heading text-lg text-[#233520]">{item.name}</h3>
                      {item.size && (
                        <p className="font-body text-sm text-[#788275]">Size: {item.size}</p>
                      )}
                      {/* Box Personalization */}
                      {item.box_personalization && (
                        <div className="mt-2 bg-[#F2CFC0]/20 p-2 rounded" data-testid={`cart-item-box-${item.product_id}`}>
                          <p className="font-body text-xs text-[#C07A65] font-semibold mb-1">Personalized Box:</p>
                          {item.box_personalization.box_color && (
                            <p className="font-body text-xs text-[#788275]">Box: {item.box_personalization.box_color.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          )}
                          {item.box_personalization.ribbon_color && (
                            <p className="font-body text-xs text-[#788275]">Ribbon: {item.box_personalization.ribbon_color.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          )}
                          {item.box_personalization.box_message && (
                            <p className="font-body text-xs text-[#788275]">Message: "{item.box_personalization.box_message}"</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="text-[#788275] hover:text-[#C07A65] transition-colors"
                      data-testid={`remove-item-${item.product_id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                        className="w-8 h-8 border border-[#E3E5DF] flex items-center justify-center hover:border-[#233520] transition-colors"
                        data-testid={`decrease-qty-${item.product_id}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                        className="w-8 h-8 border border-[#E3E5DF] flex items-center justify-center hover:border-[#233520] transition-colors"
                        data-testid={`increase-qty-${item.product_id}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <p className="font-body font-semibold text-[#233520]">
                      £{item.item_total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift Message */}
            <div className="pt-4">
              <button
                onClick={() => setShowGiftMessage(!showGiftMessage)}
                className="flex items-center gap-2 font-body text-[#233520] hover:text-[#C07A65] transition-colors"
                data-testid="toggle-gift-message"
              >
                <Gift size={18} />
                <span>{showGiftMessage ? "Hide" : "Add"} gift message</span>
              </button>

              {showGiftMessage && (
                <div className="mt-4 space-y-4" data-testid="gift-message-section">
                  <Textarea
                    placeholder="Write your gift message here..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="min-h-[100px] border-[#E3E5DF] focus:border-[#C07A65] font-body"
                    data-testid="gift-message-input"
                  />
                  <Button
                    onClick={handleSaveGiftMessage}
                    disabled={updatingGift}
                    variant="outline"
                    className="border-[#233520] text-[#233520] hover:bg-[#233520] hover:text-white font-body"
                    data-testid="save-gift-message"
                  >
                    {updatingGift ? "Saving..." : "Save Message"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F0F0EA] p-6 md:p-8 sticky top-32" data-testid="order-summary">
              <h2 className="font-heading text-xl text-[#233520] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-[#233520]">
                  <span>Subtotal</span>
                  <span data-testid="subtotal">£{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-[#233520]">
                  <span>Delivery (Standard)</span>
                  <span data-testid="delivery-fee">
                    {deliveryFee === 0 ? "Free" : `from £${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <>
                    <p className="font-body text-xs text-[#788275]">
                      Free delivery on orders over £50
                    </p>
                    <p className="font-body text-xs text-[#C07A65]">
                      Saturday delivery: £{saturdayDeliveryFee.toFixed(2)}
                    </p>
                  </>
                )}
              </div>

              <div className="border-t border-[#E3E5DF] pt-4 mb-6">
                <div className="flex justify-between font-heading text-lg text-[#233520]">
                  <span>Total</span>
                  <span data-testid="total">£{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate("/checkout")}
                className="w-full bg-[#C07A65] hover:bg-[#a86856] text-white py-6 text-base font-body"
                data-testid="checkout-button"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2" size={18} />
              </Button>

              <Link to="/flowers" className="block text-center mt-4">
                <span className="font-body text-sm text-[#788275] hover:text-[#233520] transition-colors">
                  Continue Shopping
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

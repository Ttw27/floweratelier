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
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleSaveGiftMessage = async () => {
    setUpdatingGift(true);
    try {
      await updateGiftMessage(giftMessage);
      toast.success("Gift message saved");
    } catch (error) {
      toast.error("Failed to save gift message");
    } finally {
      setUpdatingGift(false);
    }
  };

  const deliveryFee = cart.subtotal >= 100 ? 0 : 9.99;
  const total = cart.subtotal + deliveryFee;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0C0B] pt-20 flex flex-col items-center justify-center" data-testid="empty-cart">
        <ShoppingBag size={64} className="text-[#252825] mb-6" />
        <h1 className="font-heading text-2xl text-[#F4F0E6] mb-4">Your basket is empty</h1>
        <p className="font-body text-[#A3A6A1] mb-8">Discover our luxury collection</p>
        <Link to="/collection">
          <Button className="btn-gold" data-testid="continue-shopping-btn">
            View Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20" data-testid="cart-page">
      <div className="px-6 md:px-12 max-w-7xl mx-auto py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-light text-[#F4F0E6] mb-10" data-testid="cart-title">
          Your Basket
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6" data-testid="cart-items">
            {cart.items.map((item, index) => (
              <div key={`${item.product_id}-${item.size}-${index}`} className="flex gap-6 pb-6 border-b border-[#252825]" data-testid={`cart-item-${item.product_id}`}>
                <div className="w-28 h-36 bg-[#121413] flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-heading text-lg text-[#F4F0E6]">{item.name}</h3>
                      {item.size && (
                        <p className="font-body text-sm text-[#A3A6A1]">{item.size}</p>
                      )}
                      {item.box_personalization && (
                        <div className="mt-2 bg-[#161A18] border border-[#252825] p-2" data-testid={`cart-item-box-${item.product_id}`}>
                          <p className="font-body text-xs text-[#C5A059] mb-1">Personalised Box:</p>
                          {item.box_personalization.box_color && (
                            <p className="font-body text-xs text-[#A3A6A1]">Box: {item.box_personalization.box_color.replace(/-/g, ' ')}</p>
                          )}
                          {item.box_personalization.ribbon_color && (
                            <p className="font-body text-xs text-[#A3A6A1]">Ribbon: {item.box_personalization.ribbon_color.replace(/-/g, ' ')}</p>
                          )}
                          {item.box_personalization.box_message && (
                            <p className="font-body text-xs text-[#A3A6A1]">"{item.box_personalization.box_message}"</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="text-[#A3A6A1] hover:text-[#C5A059] transition-colors"
                      data-testid={`remove-item-${item.product_id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                        className="w-8 h-8 border border-[#252825] flex items-center justify-center hover:border-[#C5A059] transition-colors text-[#F4F0E6]"
                        data-testid={`decrease-qty-${item.product_id}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-sm w-6 text-center text-[#F4F0E6]">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                        className="w-8 h-8 border border-[#252825] flex items-center justify-center hover:border-[#C5A059] transition-colors text-[#F4F0E6]"
                        data-testid={`increase-qty-${item.product_id}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="font-heading text-lg text-[#F4F0E6]">
                      £{item.item_total.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift Message */}
            <div className="pt-4">
              <button
                onClick={() => setShowGiftMessage(!showGiftMessage)}
                className="flex items-center gap-2 font-body text-[#F4F0E6] hover:text-[#C5A059] transition-colors"
                data-testid="toggle-gift-message"
              >
                <Gift size={18} />
                <span>{showGiftMessage ? "Hide" : "Add"} gift message</span>
              </button>

              {showGiftMessage && (
                <div className="mt-4 space-y-4" data-testid="gift-message-section">
                  <Textarea
                    placeholder="Your personal message..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="min-h-[100px] dark-input"
                    data-testid="gift-message-input"
                  />
                  <Button
                    onClick={handleSaveGiftMessage}
                    disabled={updatingGift}
                    className="btn-outline-gold"
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
            <div className="bg-[#121413] border border-[#252825] p-8 sticky top-32" data-testid="order-summary">
              <h2 className="font-heading text-xl text-[#F4F0E6] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-[#A3A6A1]">
                  <span>Subtotal</span>
                  <span className="text-[#F4F0E6]" data-testid="subtotal">£{cart.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-body text-[#A3A6A1]">
                  <span>Delivery</span>
                  <span className="text-[#F4F0E6]" data-testid="delivery-fee">
                    {deliveryFee === 0 ? "Complimentary" : `£${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="font-body text-xs text-[#A3A6A1]">
                    Free delivery on orders over £100
                  </p>
                )}
              </div>

              <div className="border-t border-[#252825] pt-4 mb-6">
                <div className="flex justify-between font-heading text-xl text-[#F4F0E6]">
                  <span>Total</span>
                  <span data-testid="total">£{total.toFixed(0)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate("/checkout")}
                className="w-full btn-gold py-6"
                data-testid="checkout-button"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2" size={18} />
              </Button>

              <Link to="/collection" className="block text-center mt-4">
                <span className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
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

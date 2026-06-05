import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus, Gift, ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, updateGiftMessage } = useCart();
  const [giftMessage, setGiftMessage] = useState(cart.gift_message || "");
  const [showGiftMessage, setShowGiftMessage] = useState(!!cart.gift_message);
  const [updatingGift, setUpdatingGift] = useState(false);

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try { await updateQuantity(productId, newQty); } catch { toast.error("Failed to update"); }
  };

  const handleRemove = async (productId) => {
    try { await removeFromCart(productId); toast.success("Removed"); } catch { toast.error("Failed"); }
  };

  const handleSaveGiftMessage = async () => {
    setUpdatingGift(true);
    try { await updateGiftMessage(giftMessage); toast.success("Message saved"); }
    catch { toast.error("Failed to save"); }
    finally { setUpdatingGift(false); }
  };

  const deliveryFee = cart.subtotal >= 100 ? 0 : 9.99;
  const total = cart.subtotal + deliveryFee;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center px-6" data-testid="empty-cart">
        <ShoppingBag size={56} strokeWidth={1} className="text-[#B3A89B] mb-8" />
        <h1 className="font-heading text-3xl font-light text-[#1A1A1A] mb-4">Your basket is empty</h1>
        <p className="font-body text-[#7A7A7A] mb-10">Discover the collection.</p>
        <Link to="/collection">
          <Button className="btn-dark rounded-none" data-testid="continue-shopping-btn">Shop the Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28" data-testid="cart-page">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-16">
        <p className="accent-label mb-5"><span className="thin-rule" />Your Basket</p>
        <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] mb-16 tracking-tight" data-testid="cart-title">
          Basket
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8" data-testid="cart-items">
            {cart.items.map((item, index) => (
              <div
                key={`${item.product_id}-${item.size}-${index}`}
                className="flex gap-6 pb-8 border-b border-[#E5E5E5]"
                data-testid={`cart-item-${item.product_id}`}
              >
                <div className="w-28 h-36 bg-[#F2EFEB] flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-xl font-light text-[#1A1A1A]">{item.name}</h3>
                      {item.size && <p className="font-body text-xs uppercase tracking-wider text-[#B3A89B] mt-1">{item.size}</p>}
                      {item.box_personalization && (
                        <div className="mt-3 bg-[#F2EFEB] p-3" data-testid={`cart-item-box-${item.product_id}`}>
                          <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#1A1A1A] mb-1.5">Personalised Box</p>
                          {item.box_personalization.box_color && <p className="font-body text-xs text-[#7A7A7A]">Box · {item.box_personalization.box_color.replace(/-/g, " ")}</p>}
                          {item.box_personalization.ribbon_color && <p className="font-body text-xs text-[#7A7A7A]">Ribbon · {item.box_personalization.ribbon_color.replace(/-/g, " ")}</p>}
                          {item.box_personalization.box_message && <p className="font-body text-xs italic text-[#7A7A7A] mt-1">"{item.box_personalization.box_message}"</p>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex-shrink-0"
                      data-testid={`remove-item-${item.product_id}`}
                    >
                      <Trash2 size={16} strokeWidth={1.3} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                        className="w-9 h-9 border border-[#E5E5E5] flex items-center justify-center hover:border-[#1A1A1A] transition-colors text-[#1A1A1A]"
                        data-testid={`decrease-qty-${item.product_id}`}
                      ><Minus size={12} /></button>
                      <span className="font-body text-sm w-6 text-center text-[#1A1A1A]">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                        className="w-9 h-9 border border-[#E5E5E5] flex items-center justify-center hover:border-[#1A1A1A] transition-colors text-[#1A1A1A]"
                        data-testid={`increase-qty-${item.product_id}`}
                      ><Plus size={12} /></button>
                    </div>
                    <p className="font-heading text-xl font-light text-[#1A1A1A]">£{item.item_total.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift Message */}
            <div className="pt-4">
              <button
                onClick={() => setShowGiftMessage(!showGiftMessage)}
                className="flex items-center gap-2 font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] hover:text-[#B3A89B] transition-colors"
                data-testid="toggle-gift-message"
              >
                <Gift size={15} strokeWidth={1.3} />
                {showGiftMessage ? "Hide" : "Add"} a gift message
              </button>

              {showGiftMessage && (
                <div className="mt-5 space-y-4" data-testid="gift-message-section">
                  <Textarea
                    placeholder="Your hand-written message…"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="min-h-[100px] light-input rounded-none"
                    data-testid="gift-message-input"
                  />
                  <Button onClick={handleSaveGiftMessage} disabled={updatingGift} className="btn-outline-dark rounded-none" data-testid="save-gift-message">
                    {updatingGift ? "Saving…" : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E5E5] p-8 lg:sticky lg:top-28" data-testid="order-summary">
              <p className="accent-label mb-6 text-[#1A1A1A]">Order Summary</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-sm text-[#7A7A7A]">
                  <span>Subtotal</span>
                  <span className="text-[#1A1A1A]" data-testid="subtotal">£{cart.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-[#7A7A7A]">
                  <span>Delivery</span>
                  <span className="text-[#1A1A1A]" data-testid="delivery-fee">{deliveryFee === 0 ? "Complimentary" : `£${deliveryFee.toFixed(2)}`}</span>
                </div>
                {deliveryFee > 0 && <p className="font-body text-xs text-[#B3A89B] italic">Complimentary delivery over £100</p>}
              </div>

              <div className="border-t border-[#E5E5E5] pt-5 mb-7">
                <div className="flex justify-between items-baseline">
                  <span className="accent-label text-[#1A1A1A]">Total</span>
                  <span className="font-heading text-3xl font-light text-[#1A1A1A]" data-testid="total">£{total.toFixed(0)}</span>
                </div>
              </div>

              <Button onClick={() => navigate("/checkout")} className="btn-dark w-full py-6 rounded-none" data-testid="checkout-button">
                <span className="flex items-center gap-3">Proceed to Checkout <ArrowRight size={14} /></span>
              </Button>

              <Link to="/collection" className="block text-center mt-5">
                <span className="font-body text-xs uppercase tracking-[0.22em] text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

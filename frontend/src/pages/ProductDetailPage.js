import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Truck, Leaf, Gift, Award, MessageCircle } from "lucide-react";
import MediaGallery from "../components/MediaGallery";
import SendFlow from "../components/SendFlow";
import { useSettings } from "../context/SettingsContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState(null);
  const [sendOpen, setSendOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, d] = await Promise.all([
          axios.get(`${API_URL}/api/products/${productId}`),
          axios.get(`${API_URL}/api/delivery/options`),
        ]);
        setProduct(p.data);
        setDelivery(d.data);
      } catch {
        toast.error("Product not found");
        navigate("/collection");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, navigate]);

  const earliest = delivery?.available_dates?.[0];
  const isBouquet = product?.is_bouquet !== false; // default true
  const waNumber = (settings?.whatsapp_number || "").replace(/\D/g, "");
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi Petals Atelier — I have a question about "${product?.name || "this bouquet"}".`)}`
    : null;

  const handleQuickAdd = async () => {
    try {
      await addToCart(product.id, 1, null, null);
      toast.success("Added to your basket");
    } catch {
      toast.error("Could not add to basket");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="min-h-screen pt-28" data-testid="product-detail-page">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#7A7A7A] hover:text-[#1A1A1A] mb-8 font-body text-xs uppercase tracking-[0.22em] transition-colors"
          data-testid="back-button"
        >
          <ChevronLeft size={14} className="mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <MediaGallery
              media={product.media}
              fallbackImages={product.images}
              productName={product.name}
            />
          </div>

          {/* Details column */}
          <div className="lg:col-span-5 py-1">
            <p className="accent-label mb-5"><span className="thin-rule" />{product.category_name}</p>
            <h1 className="font-heading text-3xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-6 tracking-tight" data-testid="product-detail-name">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-[#E5E5E5]">
              <span className="accent-label">From</span>
              <span className="font-heading text-3xl text-[#1A1A1A] font-light" data-testid="product-detail-price">
                £{product.price.toFixed(0)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="font-body text-sm text-[#B3A89B] line-through ml-1">£{product.original_price.toFixed(0)}</span>
              )}
            </div>

            <p className="font-body text-[15px] text-[#5A5A5A] leading-relaxed mb-8" data-testid="product-detail-description">
              {product.description}
            </p>

            {earliest && (
              <div className="mb-8 p-4 bg-[#F2EFEB] border-l-2 border-[#1A1A1A]" data-testid="earliest-delivery">
                <p className="accent-label text-[10px] mb-1">Earliest delivery</p>
                <p className="font-heading text-base text-[#1A1A1A]">
                  {new Date(earliest.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="font-body text-[11px] text-[#7A7A7A] mt-1">
                  {delivery?.rules?.min_lead_days ?? 4}-day craftsmanship lead time. Pick a different day inside the send flow.
                </p>
              </div>
            )}

            {/* Primary CTA */}
            {isBouquet ? (
              <Button
                onClick={() => setSendOpen(true)}
                disabled={!product.in_stock}
                className="btn-dark w-full py-6 text-xs rounded-none"
                data-testid="send-flow-open-btn"
              >
                {product.in_stock ? "Send this bouquet →" : "Currently unavailable"}
              </Button>
            ) : (
              <Button
                onClick={handleQuickAdd}
                disabled={!product.in_stock}
                className="btn-dark w-full py-6 text-xs rounded-none"
                data-testid="add-to-cart-button"
              >
                {product.in_stock ? "Add to basket" : "Currently unavailable"}
              </Button>
            )}

            {/* WhatsApp inline (per Phase-1 idea) */}
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 border border-[#E5E5E5] hover:border-[#25D366] hover:text-[#25D366] text-[#1A1A1A] text-xs uppercase tracking-[0.22em] transition-colors"
                data-testid="product-whatsapp-link"
              >
                <MessageCircle size={14} />
                Ask about this bouquet on WhatsApp
              </a>
            )}

            {/* Features */}
            <div className="pt-8 mt-8 border-t border-[#E5E5E5] space-y-4">
              <Feature icon={Award} text="Hand-tied by the atelier's lead florists" />
              <Feature icon={Truck} text={`Complimentary Midlands delivery over £100 · Saturday service available`} />
              <Feature icon={Leaf} text="7-day freshness guarantee" />
              <Feature icon={Gift} text="Presented in our signature ivory atelier box" />
            </div>
          </div>
        </div>
      </div>

      <SendFlow product={product} open={sendOpen} onClose={() => setSendOpen(false)} />
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} strokeWidth={1.3} className="text-[#1A1A1A]" />
      <span className="font-body text-sm text-[#7A7A7A]">{text}</span>
    </div>
  );
}

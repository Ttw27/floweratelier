import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Truck, Leaf, Gift, ChevronLeft, Plus, Minus, Package, Check, ChevronDown, ChevronUp, Award } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [deliveryOptions, setDeliveryOptions] = useState(null);
  const [showBoxCustomization, setShowBoxCustomization] = useState(false);
  const [boxPersonalization, setBoxPersonalization] = useState({
    box_color: null,
    ribbon_color: null,
    box_message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, optionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/${productId}`),
          axios.get(`${API_URL}/api/delivery/options`),
        ]);

        setProduct(productRes.data);
        setDeliveryOptions(optionsRes.data);

        if (productRes.data.sizes && productRes.data.sizes.length > 0) {
          setSelectedSize(productRes.data.sizes[0].name);
        }
      } catch (error) {
        toast.error("Product not found");
        navigate("/collection");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, navigate]);

  const getPrice = () => {
    if (!product) return 0;
    let price = product.price;
    if (selectedSize && product.sizes) {
      const sizeOption = product.sizes.find((s) => s.name === selectedSize);
      if (sizeOption) price += sizeOption.price_modifier;
    }
    return price * quantity;
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const boxData = boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message
        ? { ...boxPersonalization }
        : null;
      await addToCart(product.id, quantity, selectedSize, boxData);
      toast.success("Added to your basket");
    } catch {
      toast.error("Failed to add to basket");
    } finally {
      setAdding(false);
    }
  };

  const getSelectedBoxColorName = () => {
    if (!boxPersonalization.box_color || !deliveryOptions) return null;
    return deliveryOptions.box_personalization.box_colors.find((c) => c.id === boxPersonalization.box_color)?.name;
  };
  const getSelectedRibbonColorName = () => {
    if (!boxPersonalization.ribbon_color || !deliveryOptions) return null;
    return deliveryOptions.box_personalization.ribbon_colors.find((c) => c.id === boxPersonalization.ribbon_color)?.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) return null;
  const hasBoxCustomization = boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message;

  return (
    <div className="min-h-screen pt-28" data-testid="product-detail-page">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#7A7A7A] hover:text-[#1A1A1A] mb-12 font-body text-xs uppercase tracking-[0.22em] transition-colors"
          data-testid="back-button"
        >
          <ChevronLeft size={14} className="mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="aspect-[4/5] bg-[#F2EFEB] overflow-hidden" data-testid="product-image-container">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" data-testid="product-detail-image" />
            </div>
          </div>

          {/* Details */}
          <div className="py-2">
            <p className="accent-label mb-6"><span className="thin-rule" />{product.category_name}</p>
            <h1 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1] mb-8 tracking-tight" data-testid="product-detail-name">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-10 pb-10 border-b border-[#E5E5E5]">
              <span className="accent-label">From</span>
              <span className="font-heading text-4xl text-[#1A1A1A] font-light" data-testid="product-detail-price">
                £{getPrice().toFixed(0)}
              </span>
            </div>

            <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-12" data-testid="product-detail-description">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10 pb-10 border-b border-[#E5E5E5]">
                <h3 className="accent-label mb-5 text-[#1A1A1A]">Select size</h3>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} data-testid="size-selector">
                  <div className="space-y-3">
                    {product.sizes.map((size) => (
                      <label key={size.name} className="flex items-center cursor-pointer border border-[#E5E5E5] p-4 hover:border-[#1A1A1A] transition-colors">
                        <RadioGroupItem value={size.name} id={size.name} className="border-[#1A1A1A] text-[#1A1A1A]" />
                        <span className="ml-4 font-body text-[#1A1A1A] flex-1 flex justify-between">
                          <span>{size.name}</span>
                          <span className="text-[#7A7A7A]">
                            {size.price_modifier > 0 ? `+£${size.price_modifier.toFixed(0)}` : size.price_modifier < 0 ? `-£${Math.abs(size.price_modifier).toFixed(0)}` : ""}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Box Personalization */}
            {deliveryOptions && (
              <div className="mb-10 border border-[#E5E5E5] bg-white" data-testid="box-personalization-section">
                <button
                  onClick={() => setShowBoxCustomization(!showBoxCustomization)}
                  className="w-full p-5 flex items-center justify-between text-left"
                  data-testid="toggle-box-customization"
                >
                  <div className="flex items-center gap-4">
                    <Package size={18} strokeWidth={1.3} className="text-[#1A1A1A]" />
                    <div>
                      <h3 className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A]">Personalise presentation</h3>
                      <p className="font-body text-xs text-[#7A7A7A] mt-1">
                        {hasBoxCustomization
                          ? `${getSelectedBoxColorName() || "Atelier"} box${getSelectedRibbonColorName() ? `, ${getSelectedRibbonColorName()} ribbon` : ""}`
                          : "Box colour, ribbon & hand-written message"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasBoxCustomization && (
                      <span className="bg-[#1A1A1A] text-white text-[10px] px-2 py-1 font-body uppercase tracking-wider">Customised</span>
                    )}
                    {showBoxCustomization ? <ChevronUp size={18} className="text-[#7A7A7A]" /> : <ChevronDown size={18} className="text-[#7A7A7A]" />}
                  </div>
                </button>

                {showBoxCustomization && (
                  <div className="px-5 pb-5 space-y-6 border-t border-[#E5E5E5] pt-6">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] mb-3 block">Box colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.box_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() =>
                              setBoxPersonalization({
                                ...boxPersonalization,
                                box_color: boxPersonalization.box_color === color.id ? null : color.id,
                              })
                            }
                            className={`relative w-11 h-11 rounded-full border transition-all ${
                              boxPersonalization.box_color === color.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-white" : "border-[#E5E5E5] hover:border-[#1A1A1A]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`box-color-${color.id}`}
                          >
                            {boxPersonalization.box_color === color.id && (
                              <Check size={14} className={`absolute inset-0 m-auto ${color.hex === "#FFFFFF" ? "text-[#1A1A1A]" : "text-white"}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] mb-3 block">Ribbon colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.ribbon_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() =>
                              setBoxPersonalization({
                                ...boxPersonalization,
                                ribbon_color: boxPersonalization.ribbon_color === color.id ? null : color.id,
                              })
                            }
                            className={`relative w-11 h-11 rounded-full border transition-all ${
                              boxPersonalization.ribbon_color === color.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-white" : "border-[#E5E5E5] hover:border-[#1A1A1A]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`ribbon-color-${color.id}`}
                          >
                            {boxPersonalization.ribbon_color === color.id && (
                              <Check size={14} className={`absolute inset-0 m-auto ${["#FFFFFF", "#FFFFF0", "#C0C0C0"].includes(color.hex) ? "text-[#1A1A1A]" : "text-white"}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] mb-3 block">
                        Box message <span className="normal-case tracking-normal text-[#B3A89B]">(max {deliveryOptions.box_personalization.max_box_message_length} chars)</span>
                      </Label>
                      <Input
                        value={boxPersonalization.box_message}
                        onChange={(e) => {
                          if (e.target.value.length <= deliveryOptions.box_personalization.max_box_message_length) {
                            setBoxPersonalization({ ...boxPersonalization, box_message: e.target.value });
                          }
                        }}
                        className="light-input rounded-none"
                        placeholder="With love, for you."
                        data-testid="box-message-input"
                      />
                    </div>

                    {hasBoxCustomization && (
                      <button
                        type="button"
                        onClick={() => setBoxPersonalization({ box_color: null, ribbon_color: null, box_message: "" })}
                        className="font-body text-[11px] uppercase tracking-[0.22em] text-[#7A7A7A] hover:text-[#1A1A1A] underline"
                        data-testid="clear-box-customization"
                      >
                        Clear customisation
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-10 pb-10 border-b border-[#E5E5E5]">
              <h3 className="accent-label mb-5 text-[#1A1A1A]">Quantity</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 border border-[#E5E5E5] flex items-center justify-center hover:border-[#1A1A1A] transition-colors text-[#1A1A1A]" data-testid="quantity-decrease">
                  <Minus size={14} />
                </button>
                <span className="font-body text-base w-8 text-center text-[#1A1A1A]" data-testid="quantity-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 border border-[#E5E5E5] flex items-center justify-center hover:border-[#1A1A1A] transition-colors text-[#1A1A1A]" data-testid="quantity-increase">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={adding || !product.in_stock}
              className="btn-dark w-full py-6 text-xs rounded-none"
              data-testid="add-to-cart-button"
            >
              {adding ? "Adding…" : product.in_stock ? "Add to Basket" : "Currently Unavailable"}
            </Button>

            {/* Features */}
            <div className="pt-10 mt-10 border-t border-[#E5E5E5] space-y-4">
              <div className="flex items-center gap-3">
                <Award size={16} strokeWidth={1.3} className="text-[#1A1A1A]" />
                <span className="font-body text-sm text-[#7A7A7A]">Hand-tied by the atelier's lead florists</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={16} strokeWidth={1.3} className="text-[#1A1A1A]" />
                <span className="font-body text-sm text-[#7A7A7A]">Complimentary London delivery over £100 · Saturday service available</span>
              </div>
              <div className="flex items-center gap-3">
                <Leaf size={16} strokeWidth={1.3} className="text-[#1A1A1A]" />
                <span className="font-body text-sm text-[#7A7A7A]">7-day freshness guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <Gift size={16} strokeWidth={1.3} className="text-[#1A1A1A]" />
                <span className="font-body text-sm text-[#7A7A7A]">Presented in our signature ivory atelier box</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

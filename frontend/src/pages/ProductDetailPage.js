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
    box_message: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, optionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/${productId}`),
          axios.get(`${API_URL}/api/delivery/options`)
        ]);
        
        setProduct(productRes.data);
        setDeliveryOptions(optionsRes.data);
        
        if (productRes.data.sizes && productRes.data.sizes.length > 0) {
          setSelectedSize(productRes.data.sizes[0].name);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
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
      const sizeOption = product.sizes.find(s => s.name === selectedSize);
      if (sizeOption) {
        price += sizeOption.price_modifier;
      }
    }
    return price * quantity;
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const boxData = (boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message)
        ? { box_color: boxPersonalization.box_color, ribbon_color: boxPersonalization.ribbon_color, box_message: boxPersonalization.box_message }
        : null;
      
      await addToCart(product.id, quantity, selectedSize, boxData);
      toast.success("Added to basket");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const getSelectedBoxColorName = () => {
    if (!boxPersonalization.box_color || !deliveryOptions) return null;
    return deliveryOptions.box_personalization.box_colors.find(c => c.id === boxPersonalization.box_color)?.name;
  };

  const getSelectedRibbonColorName = () => {
    if (!boxPersonalization.ribbon_color || !deliveryOptions) return null;
    return deliveryOptions.box_personalization.ribbon_colors.find(c => c.id === boxPersonalization.ribbon_color)?.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C0B] flex items-center justify-center pt-20">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) return null;

  const hasBoxCustomization = boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message;

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20" data-testid="product-detail-page">
      <div className="px-6 md:px-12 max-w-7xl mx-auto py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#A3A6A1] hover:text-[#C5A059] mb-10 font-body text-sm transition-colors"
          data-testid="back-button"
        >
          <ChevronLeft size={18} className="mr-1" />
          Back to collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="aspect-[4/5] bg-[#121413] overflow-hidden" data-testid="product-image-container">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-detail-image"
            />
          </div>

          {/* Details */}
          <div className="py-4">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
              {product.category_name}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-[#F4F0E6] mb-6" data-testid="product-detail-name">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mb-8">
              <span className="font-body text-sm uppercase tracking-wider text-[#A3A6A1]">From</span>
              <span className="font-heading text-3xl text-[#F4F0E6]" data-testid="product-detail-price">
                £{getPrice().toFixed(0)}
              </span>
            </div>

            <p className="font-body text-[#A3A6A1] leading-relaxed mb-10" data-testid="product-detail-description">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-body text-sm uppercase tracking-wider text-[#F4F0E6] mb-4">Select Size</h3>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} data-testid="size-selector">
                  <div className="space-y-3">
                    {product.sizes.map((size) => (
                      <div key={size.name} className="flex items-center">
                        <RadioGroupItem value={size.name} id={size.name} className="border-[#C5A059] text-[#C5A059]" />
                        <Label htmlFor={size.name} className="ml-3 font-body text-[#F4F0E6] cursor-pointer flex-1 flex justify-between">
                          <span>{size.name}</span>
                          <span className="text-[#A3A6A1]">
                            {size.price_modifier > 0 ? `+£${size.price_modifier.toFixed(0)}` : 
                             size.price_modifier < 0 ? `-£${Math.abs(size.price_modifier).toFixed(0)}` : ''}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Box Personalization */}
            {deliveryOptions && (
              <div className="mb-8 border border-[#252825] bg-[#121413]" data-testid="box-personalization-section">
                <button
                  onClick={() => setShowBoxCustomization(!showBoxCustomization)}
                  className="w-full p-5 flex items-center justify-between"
                  data-testid="toggle-box-customization"
                >
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-[#C5A059]" />
                    <div className="text-left">
                      <h3 className="font-body text-sm uppercase tracking-wider text-[#F4F0E6]">Personalise Presentation</h3>
                      <p className="font-body text-xs text-[#A3A6A1]">
                        {hasBoxCustomization 
                          ? `${getSelectedBoxColorName() || 'Luxury'} box${getSelectedRibbonColorName() ? `, ${getSelectedRibbonColorName()} ribbon` : ''}`
                          : 'Customise your gift box'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasBoxCustomization && (
                      <span className="bg-[#C5A059] text-[#0B0C0B] text-xs px-2 py-1 font-body uppercase tracking-wider">Customised</span>
                    )}
                    {showBoxCustomization ? <ChevronUp size={20} className="text-[#A3A6A1]" /> : <ChevronDown size={20} className="text-[#A3A6A1]" />}
                  </div>
                </button>
                
                {showBoxCustomization && (
                  <div className="px-5 pb-5 space-y-6 border-t border-[#252825] pt-5">
                    {/* Box Color */}
                    <div>
                      <Label className="font-body text-[#F4F0E6] mb-3 block text-sm">Box Colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.box_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, box_color: boxPersonalization.box_color === color.id ? null : color.id })}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                              boxPersonalization.box_color === color.id
                                ? "border-[#C5A059] ring-2 ring-[#C5A059] ring-offset-2 ring-offset-[#121413]"
                                : "border-[#252825] hover:border-[#A3A6A1]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`box-color-${color.id}`}
                          >
                            {boxPersonalization.box_color === color.id && (
                              <Check size={14} className={`absolute inset-0 m-auto ${color.hex === '#FFFFFF' ? 'text-[#0B0C0B]' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ribbon Color */}
                    <div>
                      <Label className="font-body text-[#F4F0E6] mb-3 block text-sm">Ribbon Colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.ribbon_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, ribbon_color: boxPersonalization.ribbon_color === color.id ? null : color.id })}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                              boxPersonalization.ribbon_color === color.id
                                ? "border-[#C5A059] ring-2 ring-[#C5A059] ring-offset-2 ring-offset-[#121413]"
                                : "border-[#252825] hover:border-[#A3A6A1]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`ribbon-color-${color.id}`}
                          >
                            {boxPersonalization.ribbon_color === color.id && (
                              <Check size={14} className={`absolute inset-0 m-auto ${['#FFFFFF', '#FFFFF0', '#C0C0C0'].includes(color.hex) ? 'text-[#0B0C0B]' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Box Message */}
                    <div>
                      <Label className="font-body text-[#F4F0E6] mb-2 block text-sm">
                        Message on Box <span className="text-[#A3A6A1]">(max {deliveryOptions.box_personalization.max_box_message_length} chars)</span>
                      </Label>
                      <Input
                        value={boxPersonalization.box_message}
                        onChange={(e) => {
                          if (e.target.value.length <= deliveryOptions.box_personalization.max_box_message_length) {
                            setBoxPersonalization({ ...boxPersonalization, box_message: e.target.value });
                          }
                        }}
                        className="dark-input"
                        placeholder="e.g., With Love, Happy Anniversary"
                        data-testid="box-message-input"
                      />
                    </div>

                    {hasBoxCustomization && (
                      <button
                        type="button"
                        onClick={() => setBoxPersonalization({ box_color: null, ribbon_color: null, box_message: "" })}
                        className="font-body text-xs text-[#A3A6A1] hover:text-[#C5A059] underline"
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
            <div className="mb-8">
              <h3 className="font-body text-sm uppercase tracking-wider text-[#F4F0E6] mb-4">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#252825] flex items-center justify-center hover:border-[#C5A059] transition-colors text-[#F4F0E6]"
                  data-testid="quantity-decrease"
                >
                  <Minus size={16} />
                </button>
                <span className="font-body text-lg w-8 text-center text-[#F4F0E6]" data-testid="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-[#252825] flex items-center justify-center hover:border-[#C5A059] transition-colors text-[#F4F0E6]"
                  data-testid="quantity-increase"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={adding || !product.in_stock}
              className="w-full btn-gold py-6 text-base mb-8"
              data-testid="add-to-cart-button"
            >
              {adding ? "Adding..." : product.in_stock ? "Add to Basket" : "Currently Unavailable"}
            </Button>

            {/* Features */}
            <div className="border-t border-[#252825] pt-8 space-y-4">
              <div className="flex items-center space-x-3">
                <Award className="text-[#C5A059]" size={18} />
                <span className="font-body text-sm text-[#A3A6A1]">Hand-crafted by expert florists</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="text-[#C5A059]" size={18} />
                <span className="font-body text-sm text-[#A3A6A1]">Free delivery on orders over £100 | Saturday delivery available</span>
              </div>
              <div className="flex items-center space-x-3">
                <Leaf className="text-[#C5A059]" size={18} />
                <span className="font-body text-sm text-[#A3A6A1]">7-day freshness guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <Gift className="text-[#C5A059]" size={18} />
                <span className="font-body text-sm text-[#A3A6A1]">Luxury gift packaging included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

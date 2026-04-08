import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Truck, Leaf, Gift, ChevronLeft, Plus, Minus, Package, Check, ChevronDown, ChevronUp } from "lucide-react";

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
  
  // Box personalization state
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
        navigate("/flowers");
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
      // Prepare box personalization if any options selected
      const boxData = (boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message)
        ? {
            box_color: boxPersonalization.box_color,
            ribbon_color: boxPersonalization.ribbon_color,
            box_message: boxPersonalization.box_message
          }
        : null;
      
      await addToCart(product.id, quantity, selectedSize, boxData);
      toast.success(
        <div>
          <p className="font-semibold">Added to basket!</p>
          {boxData && <p className="text-sm text-gray-600">With personalized box</p>}
        </div>
      );
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = product.original_price && product.original_price > product.price;
  const hasBoxCustomization = boxPersonalization.box_color || boxPersonalization.ribbon_color || boxPersonalization.box_message;

  return (
    <div className="min-h-screen py-8 md:py-12" data-testid="product-detail-page">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#788275] hover:text-[#233520] mb-8 font-body text-sm transition-colors"
          data-testid="back-button"
        >
          <ChevronLeft size={18} className="mr-1" />
          Back to flowers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Image */}
          <div className="aspect-[4/5] bg-[#F0F0EA] overflow-hidden" data-testid="product-image-container">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-detail-image"
            />
          </div>

          {/* Details */}
          <div className="py-4">
            <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
              {product.category_name}
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[#233520] mb-4" data-testid="product-detail-name">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mb-6">
              <span className="font-heading text-2xl text-[#233520]" data-testid="product-detail-price">
                £{getPrice().toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="font-body text-lg text-[#788275] line-through">
                  £{product.original_price.toFixed(2)}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-[#C07A65] text-white text-xs font-body px-2 py-1">
                  SAVE £{(product.original_price - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <p className="font-body text-[#788275] leading-relaxed mb-8" data-testid="product-detail-description">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading text-lg text-[#233520] mb-4">Select Size</h3>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} data-testid="size-selector">
                  <div className="space-y-3">
                    {product.sizes.map((size) => (
                      <div key={size.name} className="flex items-center">
                        <RadioGroupItem value={size.name} id={size.name} className="border-[#C07A65] text-[#C07A65]" />
                        <Label htmlFor={size.name} className="ml-3 font-body text-[#233520] cursor-pointer flex-1 flex justify-between">
                          <span>{size.name}</span>
                          <span className="text-[#788275]">
                            {size.price_modifier > 0 ? `+£${size.price_modifier.toFixed(2)}` : 'Included'}
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
              <div className="mb-6 border border-[#E3E5DF] bg-[#FAFAF7]" data-testid="box-personalization-section">
                <button
                  onClick={() => setShowBoxCustomization(!showBoxCustomization)}
                  className="w-full p-4 flex items-center justify-between"
                  data-testid="toggle-box-customization"
                >
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-[#C07A65]" />
                    <div className="text-left">
                      <h3 className="font-heading text-lg text-[#233520]">Personalise Your Box</h3>
                      <p className="font-body text-xs text-[#788275]">
                        {hasBoxCustomization 
                          ? `${getSelectedBoxColorName() || 'Classic'} box${getSelectedRibbonColorName() ? ` with ${getSelectedRibbonColorName()} ribbon` : ''}`
                          : 'Customize the presentation box'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasBoxCustomization && (
                      <span className="bg-[#C07A65] text-white text-xs px-2 py-1 font-body">CUSTOMIZED</span>
                    )}
                    {showBoxCustomization ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {showBoxCustomization && (
                  <div className="px-4 pb-4 space-y-6 border-t border-[#E3E5DF] pt-4">
                    {/* Box Color */}
                    <div>
                      <Label className="font-body text-[#233520] mb-3 block text-sm font-semibold">Box Colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.box_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, box_color: boxPersonalization.box_color === color.id ? null : color.id })}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                              boxPersonalization.box_color === color.id
                                ? "border-[#C07A65] ring-2 ring-[#C07A65] ring-offset-2"
                                : "border-[#E3E5DF] hover:border-[#788275]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`box-color-${color.id}`}
                          >
                            {boxPersonalization.box_color === color.id && (
                              <Check size={14} className={`absolute inset-0 m-auto ${color.hex === '#FFFFFF' ? 'text-[#233520]' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                      {boxPersonalization.box_color && (
                        <p className="font-body text-xs text-[#788275] mt-2">
                          Selected: {getSelectedBoxColorName()}
                        </p>
                      )}
                    </div>

                    {/* Ribbon Color */}
                    <div>
                      <Label className="font-body text-[#233520] mb-3 block text-sm font-semibold">Ribbon Colour</Label>
                      <div className="flex flex-wrap gap-3">
                        {deliveryOptions.box_personalization.ribbon_colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setBoxPersonalization({ ...boxPersonalization, ribbon_color: boxPersonalization.ribbon_color === color.id ? null : color.id })}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                              boxPersonalization.ribbon_color === color.id
                                ? "border-[#C07A65] ring-2 ring-[#C07A65] ring-offset-2"
                                : "border-[#E3E5DF] hover:border-[#788275]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            data-testid={`ribbon-color-${color.id}`}
                          >
                            {boxPersonalization.ribbon_color === color.id && (
                              <Check size={14} className={`absolute inset-0 m-auto ${['#FFFFFF', '#FFFFF0', '#C0C0C0'].includes(color.hex) ? 'text-[#233520]' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                      {boxPersonalization.ribbon_color && (
                        <p className="font-body text-xs text-[#788275] mt-2">
                          Selected: {getSelectedRibbonColorName()}
                        </p>
                      )}
                    </div>

                    {/* Box Message */}
                    <div>
                      <Label className="font-body text-[#233520] mb-2 block text-sm font-semibold">
                        Message on Box <span className="font-normal text-[#788275]">(max {deliveryOptions.box_personalization.max_box_message_length} characters)</span>
                      </Label>
                      <Input
                        value={boxPersonalization.box_message}
                        onChange={(e) => {
                          if (e.target.value.length <= deliveryOptions.box_personalization.max_box_message_length) {
                            setBoxPersonalization({ ...boxPersonalization, box_message: e.target.value });
                          }
                        }}
                        className="border-[#E3E5DF] focus:border-[#C07A65]"
                        placeholder="e.g., Happy Birthday!, With Love, Congratulations!"
                        data-testid="box-message-input"
                      />
                      <p className="font-body text-xs text-[#788275] mt-1">
                        {boxPersonalization.box_message.length}/{deliveryOptions.box_personalization.max_box_message_length} characters
                      </p>
                    </div>

                    {/* Clear customization */}
                    {hasBoxCustomization && (
                      <button
                        type="button"
                        onClick={() => setBoxPersonalization({ box_color: null, ribbon_color: null, box_message: "" })}
                        className="font-body text-sm text-[#788275] hover:text-[#C07A65] underline"
                        data-testid="clear-box-customization"
                      >
                        Clear all customizations
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-heading text-lg text-[#233520] mb-4">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#E3E5DF] flex items-center justify-center hover:border-[#233520] transition-colors"
                  data-testid="quantity-decrease"
                >
                  <Minus size={16} />
                </button>
                <span className="font-body text-lg w-8 text-center" data-testid="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-[#E3E5DF] flex items-center justify-center hover:border-[#233520] transition-colors"
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
              className="w-full bg-[#C07A65] hover:bg-[#a86856] text-white py-6 text-base font-body mb-8"
              data-testid="add-to-cart-button"
            >
              {adding ? "Adding..." : product.in_stock ? (hasBoxCustomization ? "Add to Basket with Personalized Box" : "Add to Basket") : "Out of Stock"}
            </Button>

            {/* Features */}
            <div className="border-t border-[#E3E5DF] pt-8 space-y-4">
              <div className="flex items-center space-x-3">
                <Truck className="text-[#C07A65]" size={20} />
                <span className="font-body text-sm text-[#233520]">Free delivery on orders over £50 | Saturday delivery £8.99</span>
              </div>
              <div className="flex items-center space-x-3">
                <Leaf className="text-[#C07A65]" size={20} />
                <span className="font-body text-sm text-[#233520]">7-day freshness guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <Gift className="text-[#C07A65]" size={20} />
                <span className="font-body text-sm text-[#233520]">Add a gift message at checkout</span>
              </div>
            </div>

            {/* Occasion Tags */}
            {product.occasion_tags && product.occasion_tags.length > 0 && (
              <div className="mt-8">
                <p className="font-body text-sm text-[#788275] mb-2">Perfect for:</p>
                <div className="flex flex-wrap gap-2">
                  {product.occasion_tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-[#E8ECE1] text-[#233520] text-xs font-body px-3 py-1 capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

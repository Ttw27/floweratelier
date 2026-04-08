import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card group block"
      data-testid={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden bg-[#F0F0EA] relative product-image-wrapper">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          data-testid={`product-image-${product.id}`}
        />
        {hasDiscount && (
          <span className="sale-badge" data-testid={`product-sale-badge-${product.id}`}>
            Save {discountPercent}%
          </span>
        )}
        {product.featured && !hasDiscount && (
          <span className="absolute top-4 left-4 bg-[#233520] text-white text-xs font-medium px-3 py-1 uppercase tracking-wider">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-body text-xs uppercase tracking-wider text-[#788275] mb-2">
          {product.category_name}
        </p>
        <h3 className="font-heading text-xl text-[#233520] mb-2 group-hover:text-[#C07A65] transition-colors" data-testid={`product-name-${product.id}`}>
          {product.name}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="font-body font-semibold text-[#233520]" data-testid={`product-price-${product.id}`}>
            £{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="font-body text-sm text-[#788275] line-through">
              £{product.original_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

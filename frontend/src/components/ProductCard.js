import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
      data-testid={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden bg-[#F2EFEB] image-hover-container relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          data-testid={`product-image-${product.id}`}
        />
        {product.featured && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] font-body uppercase tracking-[0.22em] px-3 py-1.5">
            Signature
          </span>
        )}
      </div>

      {/* Content */}
      <div className="pt-5">
        <p className="accent-label mb-1.5">{product.category_name}</p>
        <h3
          className="font-heading text-2xl font-light text-[#1A1A1A] leading-tight mb-2 group-hover:italic transition-all"
          data-testid={`product-name-${product.id}`}
        >
          {product.name}
        </h3>
        <p className="font-body text-sm text-[#7A7A7A]" data-testid={`product-price-${product.id}`}>
          from <span className="text-[#1A1A1A]">£{product.price.toFixed(0)}</span>
        </p>
      </div>
    </Link>
  );
}

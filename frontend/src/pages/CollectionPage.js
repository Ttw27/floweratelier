import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OCCASION_LABELS = {
  ready: "The Ready Collection",
  traveller_funeral: "Ready Tributes · Traveller Funerals",
  sympathy: "Ready Tributes · Sympathy",
  traveller_wedding: "Ready Pieces · Traveller Weddings",
  wedding: "Ready Pieces · Weddings",
  faith_wedding: "Ready Pieces · Faith Weddings",
};

export default function CollectionPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const occasion = searchParams.get("occasion");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const categoryData = categories.find((c) => c.slug === category);
  const pageTitle = occasion ? (OCCASION_LABELS[occasion] || "The Ready Collection") : (categoryData?.name || "The Collection");
  const pageDescription = occasion
    ? "Standard-size pieces — order direct, no consultation required. Same- and next-day delivery available across the UK."
    : categoryData?.description;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productParams = {};
        if (category) productParams.category = category;
        if (occasion) productParams.occasion = occasion;

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { params: productParams }),
          axios.get(`${API_URL}/api/categories`),
        ]);

        let sortedProducts = [...productsRes.data];
        switch (sortBy) {
          case "price-low":
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
          case "price-high":
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
          default:
            sortedProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        setProducts(sortedProducts);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, occasion, sortBy]);

  return (
    <div className="min-h-screen pt-28" data-testid="collection-page">
      {/* Header */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-6"><span className="thin-rule" />{occasion ? "The Ready Collection" : (category ? "Category" : "Shop")}</p>
          <h1
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight"
            data-testid="collection-title"
          >
            {pageTitle}
          </h1>
          {pageDescription && (
            <p className="font-body text-base text-[#7A7A7A] mt-8 max-w-xl">{pageDescription}</p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <p className="accent-label" data-testid="product-count">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="flex items-center gap-6">
              <button
                className="lg:hidden flex items-center gap-2 accent-label text-[#1A1A1A]"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="filter-toggle"
              >
                <Filter size={16} />
                Filter
              </button>
              <div className="flex items-center gap-3">
                <span className="accent-label">Sort</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-white border-[#E5E5E5] rounded-none text-[#1A1A1A] font-body text-xs uppercase tracking-wider" data-testid="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E5] rounded-none">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price · Ascending</SelectItem>
                    <SelectItem value="price-high">Price · Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-16">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0" data-testid="filters-sidebar">
              <div className="sticky top-32">
                <h3 className="accent-label mb-6 text-[#1A1A1A]">Categories</h3>
                <ul className="space-y-3.5">
                  <li>
                    <Link
                      to="/collection"
                      className={`font-body text-sm transition-colors ${!category ? "text-[#1A1A1A] italic" : "text-[#7A7A7A] hover:text-[#1A1A1A]"}`}
                      data-testid="filter-category-all"
                    >
                      All pieces
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/collection/${cat.slug}`}
                        className={`font-body text-sm transition-colors ${category === cat.slug ? "text-[#1A1A1A] italic" : "text-[#7A7A7A] hover:text-[#1A1A1A]"}`}
                        data-testid={`filter-category-${cat.slug}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden" data-testid="mobile-filters">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#E5E5E5] p-8 overflow-y-auto">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="accent-label text-[#1A1A1A]">Categories</h2>
                    <button onClick={() => setShowFilters(false)} className="text-[#1A1A1A]">
                      <X size={22} />
                    </button>
                  </div>
                  <ul className="space-y-5">
                    <li>
                      <Link to="/collection" className={`font-body text-sm ${!category ? "text-[#1A1A1A] italic" : "text-[#7A7A7A]"}`} onClick={() => setShowFilters(false)}>
                        All pieces
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link to={`/collection/${cat.slug}`} className={`font-body text-sm ${category === cat.slug ? "text-[#1A1A1A] italic" : "text-[#7A7A7A]"}`} onClick={() => setShowFilters(false)}>
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[4/5] bg-[#EFE9E1]" />
                      <div className="pt-5 space-y-2">
                        <div className="h-3 bg-[#EFE9E1] w-1/3" />
                        <div className="h-6 bg-[#EFE9E1] w-2/3" />
                        <div className="h-4 bg-[#EFE9E1] w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24" data-testid="no-products">
                  <p className="font-body text-[#7A7A7A]">No pieces in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12" data-testid="products-grid">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group block"
                      data-testid={`product-card-${product.id}`}
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-[#F2EFEB] image-hover-container relative">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        {product.featured && (
                          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] font-body uppercase tracking-[0.22em] px-3 py-1.5">
                            Signature
                          </span>
                        )}
                      </div>
                      <div className="pt-5">
                        <p className="accent-label mb-1.5">{product.category_name}</p>
                        <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-1.5 group-hover:italic transition-all">
                          {product.name}
                        </h3>
                        <p className="font-body text-sm text-[#7A7A7A]">
                          from <span className="text-[#1A1A1A]">£{product.price.toFixed(0)}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

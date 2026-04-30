import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CollectionPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const categoryData = categories.find(c => c.slug === category);
  const pageTitle = categoryData?.name || "Luxury Collection";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { params: { category: category || undefined } }),
          axios.get(`${API_URL}/api/categories`)
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
  }, [category, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20" data-testid="collection-page">
      {/* Header */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-b border-[#252825]">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
            {category ? "Category" : "Our Collection"}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#F4F0E6]" data-testid="collection-title">
            {pageTitle}
          </h1>
          {categoryData?.description && (
            <p className="font-body text-[#A3A6A1] mt-4 max-w-2xl">{categoryData.description}</p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <p className="font-body text-[#A3A6A1]" data-testid="product-count">
              {products.length} arrangements
            </p>
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden flex items-center gap-2 font-body text-sm text-[#F4F0E6]"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="filter-toggle"
              >
                <Filter size={18} />
                Categories
              </button>
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-[#A3A6A1]">Sort:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-[#121413] border-[#252825] text-[#F4F0E6]" data-testid="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161A18] border-[#252825]">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-12">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0" data-testid="filters-sidebar">
              <div className="sticky top-32">
                <h3 className="font-heading text-lg text-[#F4F0E6] mb-6">Categories</h3>
                <ul className="space-y-3">
                  <li>
                    <Link 
                      to="/collection" 
                      className={`font-body text-sm ${!category ? 'text-[#C5A059]' : 'text-[#A3A6A1] hover:text-[#F4F0E6]'} transition-colors`}
                      data-testid="filter-category-all"
                    >
                      All Arrangements
                    </Link>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link 
                        to={`/collection/${cat.slug}`}
                        className={`font-body text-sm ${category === cat.slug ? 'text-[#C5A059]' : 'text-[#A3A6A1] hover:text-[#F4F0E6]'} transition-colors`}
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
                <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0B0C0B] border-l border-[#252825] p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-heading text-xl text-[#F4F0E6]">Categories</h2>
                    <button onClick={() => setShowFilters(false)} className="text-[#A3A6A1]">
                      <X size={24} />
                    </button>
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <Link to="/collection" className={`font-body ${!category ? 'text-[#C5A059]' : 'text-[#A3A6A1]'}`} onClick={() => setShowFilters(false)}>
                        All Arrangements
                      </Link>
                    </li>
                    {categories.map(cat => (
                      <li key={cat.id}>
                        <Link to={`/collection/${cat.slug}`} className={`font-body ${category === cat.slug ? 'text-[#C5A059]' : 'text-[#A3A6A1]'}`} onClick={() => setShowFilters(false)}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="luxury-card animate-pulse">
                      <div className="aspect-[4/5] bg-[#252825]" />
                      <div className="p-6 space-y-3">
                        <div className="h-3 bg-[#252825] w-1/3" />
                        <div className="h-5 bg-[#252825] w-2/3" />
                        <div className="h-4 bg-[#252825] w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20" data-testid="no-products">
                  <p className="font-body text-[#A3A6A1]">No arrangements found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group luxury-card overflow-hidden"
                      data-testid={`product-card-${product.id}`}
                    >
                      <div className="aspect-[4/5] image-hover-container relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.featured && (
                          <span className="absolute top-4 left-4 bg-[#C5A059] text-[#0B0C0B] text-xs font-body px-3 py-1 uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <p className="font-body text-xs uppercase tracking-wider text-[#A3A6A1] mb-2">
                          {product.category_name}
                        </p>
                        <h3 className="font-heading text-xl text-[#F4F0E6] mb-3 group-hover:text-[#C5A059] transition-colors">
                          {product.name}
                        </h3>
                        <p className="font-body text-sm text-[#A3A6A1]">
                          from <span className="text-[#F4F0E6] font-heading text-xl">£{product.price.toFixed(0)}</span>
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

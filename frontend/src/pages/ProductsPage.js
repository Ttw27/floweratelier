import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Filter, X } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductsPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const categoryName = categories.find(c => c.slug === category)?.name || "All Flowers";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { 
            params: { 
              category: category || undefined,
              min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
              max_price: priceRange[1] < 100 ? priceRange[1] : undefined
            } 
          }),
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
          case "newest":
            sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
  }, [category, priceRange, sortBy]);

  return (
    <div className="min-h-screen" data-testid="products-page">
      {/* Page Header */}
      <section className="bg-[#E8ECE1] py-12 md:py-20">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
            Our Collection
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-[#233520]" data-testid="products-page-title">
            {categoryName}
          </h1>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <p className="font-body text-[#788275]" data-testid="product-count">
              {products.length} products
            </p>
            <div className="flex items-center gap-4">
              <button 
                className="sm:hidden flex items-center gap-2 font-body text-sm text-[#233520]"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="filter-toggle"
              >
                <Filter size={18} />
                Filters
              </button>
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-[#788275]">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] border-[#E3E5DF] bg-white" data-testid="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0" data-testid="filters-sidebar">
              <div className="sticky top-32 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="font-heading text-lg text-[#233520] mb-4">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="/flowers" 
                        className={`font-body text-sm ${!category ? 'text-[#C07A65]' : 'text-[#788275] hover:text-[#233520]'} transition-colors`}
                        data-testid="filter-category-all"
                      >
                        All Flowers
                      </a>
                    </li>
                    {categories.map(cat => (
                      <li key={cat.id}>
                        <a 
                          href={`/flowers/${cat.slug}`}
                          className={`font-body text-sm ${category === cat.slug ? 'text-[#C07A65]' : 'text-[#788275] hover:text-[#233520]'} transition-colors`}
                          data-testid={`filter-category-${cat.slug}`}
                        >
                          {cat.name} ({cat.product_count})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-heading text-lg text-[#233520] mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    step={5}
                    className="mb-4"
                    data-testid="price-slider"
                  />
                  <div className="flex justify-between font-body text-sm text-[#788275]">
                    <span>£{priceRange[0]}</span>
                    <span>£{priceRange[1]}+</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden" data-testid="mobile-filters">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading text-xl">Filters</h2>
                    <button onClick={() => setShowFilters(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  
                  {/* Categories */}
                  <div className="mb-8">
                    <h3 className="font-heading text-lg text-[#233520] mb-4">Categories</h3>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="/flowers" 
                          className={`font-body text-sm ${!category ? 'text-[#C07A65]' : 'text-[#788275]'}`}
                        >
                          All Flowers
                        </a>
                      </li>
                      {categories.map(cat => (
                        <li key={cat.id}>
                          <a 
                            href={`/flowers/${cat.slug}`}
                            className={`font-body text-sm ${category === cat.slug ? 'text-[#C07A65]' : 'text-[#788275]'}`}
                          >
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-heading text-lg text-[#233520] mb-4">Price Range</h3>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      step={5}
                      className="mb-4"
                    />
                    <div className="flex justify-between font-body text-sm text-[#788275]">
                      <span>£{priceRange[0]}</span>
                      <span>£{priceRange[1]}+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white animate-pulse">
                      <div className="aspect-[4/5] bg-[#E3E5DF]" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-[#E3E5DF] w-1/3" />
                        <div className="h-5 bg-[#E3E5DF] w-2/3" />
                        <div className="h-4 bg-[#E3E5DF] w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20" data-testid="no-products">
                  <p className="font-body text-[#788275]">No products found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
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

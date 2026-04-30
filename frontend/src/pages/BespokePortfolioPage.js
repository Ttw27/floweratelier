import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const FILTERS = [
  { id: "all", name: "All" },
  { id: "wedding", name: "Weddings" },
  { id: "sympathy", name: "Sympathy" },
  { id: "corporate", name: "Corporate" },
  { id: "house", name: "House" },
  { id: "shop", name: "Window" },
];

export default function BespokePortfolioPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/portfolio`)
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  // Masonry pattern via varying aspect ratios
  const getAspect = (idx) => {
    const patterns = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-square"];
    return patterns[idx % patterns.length];
  };

  return (
    <div className="pt-20" data-testid="portfolio-page">
      {/* Hero */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-6"><span className="thin-rule" />Bespoke Portfolio</p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8 max-w-5xl" data-testid="portfolio-title">
            A quiet archive<br />of <span className="italic text-[#B3A89B]">commissioned</span> works.
          </h1>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed max-w-2xl">
            Private weddings, sympathy tributes, corporate programmes and residence installs —
            a considered edit of past works. Drawn to a particular piece? Let's create its twin,
            composed for your moment.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10 px-6 md:px-12 border-b border-[#E5E5E5] sticky top-20 bg-[#FAFAF7]/95 backdrop-blur-md z-30">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-6">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`nav-link font-body text-[11px] uppercase tracking-[0.22em] transition-colors ${filter === f.id ? "text-[#1A1A1A] active" : "text-[#7A7A7A] hover:text-[#1A1A1A]"}`}
              data-testid={`portfolio-filter-${f.id}`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery — Masonry feel via CSS columns */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="mb-6 aspect-[4/5] bg-[#EFE9E1] animate-pulse break-inside-avoid" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-body text-[#7A7A7A]">No works in this category yet.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="block w-full mb-6 md:mb-8 break-inside-avoid group text-left"
                  data-testid={`portfolio-item-${item.id}`}
                >
                  <div className={`${getAspect(idx)} overflow-hidden bg-[#F2EFEB] image-hover-container relative`}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/15 transition-all duration-500 flex items-end p-6">
                      <span className="accent-label text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Enquire similar →
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="accent-label mb-1.5">{FILTERS.find((f) => f.id === item.category)?.name || item.category}</p>
                    <h3 className="font-heading text-xl font-light text-[#1A1A1A] group-hover:italic transition-all">{item.title}</h3>
                    {item.location && <p className="font-body text-xs text-[#7A7A7A] mt-1">{item.location}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox / Detail Dialog */}
      {selected && (
        <div className="fixed inset-0 z-[60] bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10" onClick={() => setSelected(null)} data-testid="portfolio-dialog">
          <div className="bg-[#FAFAF7] max-w-5xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-square md:aspect-auto bg-[#F2EFEB] relative">
              <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-10 md:p-14 relative">
              <button onClick={() => setSelected(null)} className="absolute top-6 right-6 text-[#1A1A1A]" data-testid="portfolio-close">
                <X size={20} strokeWidth={1.3} />
              </button>
              <p className="accent-label mb-5 text-[#1A1A1A]">
                {FILTERS.find((f) => f.id === selected.category)?.name || selected.category}
                {selected.location && <> · {selected.location}</>}
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] leading-[1.05] mb-6 tracking-tight">{selected.title}</h2>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-8">{selected.description}</p>
              {selected.price_from && (
                <p className="mb-8">
                  <span className="accent-label mr-3">From</span>
                  <span className="font-heading text-3xl font-light text-[#1A1A1A]">£{selected.price_from.toFixed(0)}</span>
                </p>
              )}
              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {selected.tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-[#F2EFEB] font-body text-[10px] uppercase tracking-[0.2em] text-[#7A7A7A]">{t}</span>
                  ))}
                </div>
              )}
              <Link
                to={`/consultation?service=${selected.category === "house" ? "house" : selected.category === "corporate" ? "corporate" : selected.category === "wedding" ? "wedding" : selected.category === "sympathy" ? "sympathy" : "bespoke"}&portfolio_item_id=${selected.id}&ref_title=${encodeURIComponent(selected.title)}`}
                data-testid="portfolio-inquire"
              >
                <Button className="btn-dark w-full rounded-none py-6 inline-flex items-center justify-center gap-3">
                  Enquire a similar piece <ArrowRight size={14} />
                </Button>
              </Link>
              <p className="mt-4 font-body text-[11px] uppercase tracking-[0.2em] text-[#B3A89B] text-center">
                All bespoke pieces quoted on consultation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Closing CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Commission</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            Something rare,<br /><span className="italic">made for you.</span>
          </h2>
          <Link to="/consultation?service=bespoke"><Button className="btn-dark rounded-none">Begin a bespoke commission</Button></Link>
        </div>
      </section>
    </div>
  );
}

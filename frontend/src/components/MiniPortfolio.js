import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Reusable mini-portfolio strip.
 * Pulls the latest 6 portfolio items for a given category and links
 * through to the full /portfolio page pre-filtered to that category.
 *
 * Props:
 *   category  — "wedding" | "sympathy" | "corporate" | "house" | "shop"
 *   title     — section heading
 *   subtitle  — small label above the heading (optional)
 *   tone      — "light" (default, paper-accent bg) | "white"
 */
export default function MiniPortfolio({ category, title, subtitle = "From the Portfolio", tone = "light" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/portfolio`, { params: { category } })
      .then((res) => setItems((res.data || []).slice(0, 6)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category]);

  if (!loading && items.length === 0) return null;

  const bg = tone === "white" ? "bg-white" : "paper-accent";

  return (
    <section className={`py-20 md:py-28 px-6 md:px-12 ${bg} border-t border-[#E5E5E5]`} data-testid={`mini-portfolio-${category}`}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <p className="accent-label mb-4"><span className="thin-rule" />{subtitle}</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#1A1A1A] tracking-tight leading-[1.05]">
              {title}
            </h2>
          </div>
          <Link
            to={`/portfolio?category=${category}`}
            className="font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 inline-flex items-center gap-2 self-start md:self-end"
            data-testid={`mini-portfolio-view-all-${category}`}
          >
            View more in our portfolio <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[#EFE9E1] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/consultation?service=${category}&portfolio_item_id=${item.id}&ref_title=${encodeURIComponent(item.title)}`}
                className="group block"
                data-testid={`mini-portfolio-item-${item.id}`}
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#F2EFEB] image-hover-container relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/20 transition-all duration-500 flex items-end p-4">
                    <span className="accent-label text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Enquire similar →
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  {item.location && <p className="accent-label mb-1.5">{item.location}</p>}
                  <h3 className="font-heading text-xl font-light text-[#1A1A1A] group-hover:italic transition-all">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

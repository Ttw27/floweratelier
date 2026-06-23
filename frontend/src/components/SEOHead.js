import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const cache = new Map();

/**
 * Drops the proper <title>, meta tags and OG/Twitter cards on every route change.
 * Per-route data is fetched from /api/seo?path=<pathname> and merged with admin defaults.
 */
export default function SEOHead() {
  const location = useLocation();
  const { settings } = useSettings();
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    const load = async () => {
      if (cache.has(path)) {
        setMeta(cache.get(path));
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/seo`, { params: { path } });
        cache.set(path, res.data);
        setMeta(res.data);
      } catch {
        setMeta({
          title: settings?.seo_default_title || "Petals Atelier",
          description: settings?.seo_default_description || "",
          og_image: settings?.seo_default_og_image || "",
          robots: "index,follow",
          site_name: settings?.seo_site_name || "Petals Atelier",
        });
      }
    };
    load();
  }, [location.pathname, settings]);

  if (!meta) return null;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const canonical = meta.canonical || url;

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description || ""} />
      {meta.keywords ? <meta name="keywords" content={meta.keywords} /> : null}
      <meta name="robots" content={meta.robots || "index,follow"} />
      <link rel="canonical" href={canonical} />
      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description || ""} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {meta.og_image ? <meta property="og:image" content={meta.og_image} /> : null}
      <meta property="og:site_name" content={meta.site_name || "Petals Atelier"} />
      {/* Twitter */}
      <meta name="twitter:card" content={meta.og_image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description || ""} />
      {meta.og_image ? <meta name="twitter:image" content={meta.og_image} /> : null}
      {meta.structured_data ? (
        <script type="application/ld+json">{JSON.stringify(meta.structured_data)}</script>
      ) : null}
    </Helmet>
  );
}

export const clearSEOCache = () => cache.clear();

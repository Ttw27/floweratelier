import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function getCacheKey(slug) { return `page_content_${slug}`; }
export function clearPageCache(slug) { try { sessionStorage.removeItem(getCacheKey(slug)); } catch {} }
export function clearAllPageCache() { 
  try { 
    Object.keys(sessionStorage).filter(k => k.startsWith("page_content_")).forEach(k => sessionStorage.removeItem(k)); 
  } catch {} 
}

export function usePageContent(slug) {
  const cacheKey = getCacheKey(slug);
  const cached = (() => { try { return JSON.parse(sessionStorage.getItem(cacheKey)); } catch { return null; } })();

  const [content, setContent] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    axios
      .get(`${API_URL}/api/page-content/${slug}`)
      .then((r) => {
        if (!alive) return;
        setContent(r.data);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(r.data)); } catch {}
      })
      .catch(() => { if (alive) setContent(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  return { content, loading };
}

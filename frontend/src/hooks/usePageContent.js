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

const readCache = (slug) => {
  if (!slug) return null;
  try { return JSON.parse(sessionStorage.getItem(getCacheKey(slug))); } catch { return null; }
};

export function usePageContent(slug) {
  const [state, setState] = useState(() => {
    const cached = readCache(slug);
    return { slug, content: cached, loading: !!slug && !cached, notFound: false };
  });

  // If the slug changes (e.g. navigating between generic pages), reset from cache for the new slug.
  if (state.slug !== slug) {
    const cached = readCache(slug);
    setState({ slug, content: cached, loading: !!slug && !cached, notFound: false });
  }

  useEffect(() => {
    if (!slug) {
      setState({ slug, content: null, loading: false, notFound: false });
      return;
    }
    let alive = true;
    axios
      .get(`${API_URL}/api/page-content/${slug}`)
      .then((r) => {
        if (!alive) return;
        setState({ slug, content: r.data, loading: false, notFound: false });
        try { sessionStorage.setItem(getCacheKey(slug), JSON.stringify(r.data)); } catch {}
      })
      .catch((err) => {
        if (!alive) return;
        const notFound = err?.response?.status === 404;
        if (notFound) clearPageCache(slug);
        setState({ slug, content: null, loading: false, notFound });
      });
    return () => { alive = false; };
  }, [slug]);

  return { content: state.content, loading: state.loading, notFound: state.notFound };
}

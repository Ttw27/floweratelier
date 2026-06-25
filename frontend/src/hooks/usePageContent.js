import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetches admin-editable page content for a service page.
 * Returns { content, loading }. `content` is null until loaded; pages should
 * keep their hardcoded default JSX as a fallback when content is null.
 */
export function usePageContent(slug) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    axios
      .get(`${API_URL}/api/page-content/${slug}`)
      .then((r) => { if (alive) setContent(r.data); })
      .catch(() => { if (alive) setContent(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  return { content, loading };
}

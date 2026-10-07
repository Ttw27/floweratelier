import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to top when moving to a different page.
 * Filter changes that only update the query string (e.g. ?category=wedding) keep the scroll position.
 * Mount once inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

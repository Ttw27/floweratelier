import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const CONSENT_KEY = "petals_consent_v1";

export const getConsent = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "null"); } catch { return null; }
};

const installPixel = (id) => {
  if (typeof window === "undefined" || !id || window.__metaPixelInstalled) return;
  // Standard Meta Pixel snippet
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq("init", id);
  window.__metaPixelInstalled = true;
};

const installGA4 = (id) => {
  if (typeof window === "undefined" || !id || window.__ga4Installed) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
  window.__ga4Installed = true;
};

const installGTM = (id) => {
  if (typeof window === "undefined" || !id || window.__gtmInstalled) return;
  // Standard GTM snippet
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',id);
  window.__gtmInstalled = true;
};

/**
 * Loads Meta Pixel, GA4 and (optional) GTM once the user has consented.
 * Fires page_view on every SPA route change.
 */
export default function Pixels() {
  const { settings } = useSettings();
  const location = useLocation();
  const installedRef = useRef(false);
  const lastTrackedRef = useRef(null);
  const currentPathRef = useRef("");
  currentPathRef.current = location.pathname + location.search;

  const firePageView = (path) => {
    if (typeof window === "undefined" || lastTrackedRef.current === path) return;
    lastTrackedRef.current = path;
    if (window.fbq) window.fbq("track", "PageView");
    if (window.gtag && settings?.ga4_id) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  };

  // Install scripts once consent is granted (and pixel IDs are present),
  // then fire the first PageView for the page the visitor landed on.
  useEffect(() => {
    if (!settings) return;
    const consent = getConsent();
    const required = settings.cookie_consent_required !== false;
    const accepted = !required || (consent && consent.analytics === true);
    if (!accepted) return;
    if (!settings.meta_pixel_id && !settings.ga4_id && !settings.gtm_id) return;

    if (settings.meta_pixel_id) installPixel(settings.meta_pixel_id);
    if (settings.ga4_id) installGA4(settings.ga4_id);
    if (settings.gtm_id) installGTM(settings.gtm_id);
    installedRef.current = true;
    firePageView(currentPathRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, settings?.meta_pixel_id, settings?.ga4_id, settings?.gtm_id]);

  // Fire page_view on SPA route changes.
  useEffect(() => {
    if (!installedRef.current) return;
    firePageView(location.pathname + location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, settings?.ga4_id]);

  return null;
}

export const trackEvent = (name, params = {}) => {
  if (typeof window === "undefined") return;
  if (window.fbq) window.fbq("track", name, params);
  if (window.gtag) window.gtag("event", name, params);
};

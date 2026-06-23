import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const CONSENT_KEY = "petals_consent_v1";

const setConsent = (val) => {
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...val, ts: Date.now() })); } catch { /* storage unavailable */ }
};

const readConsent = () => {
  try { return JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "null"); } catch { return null; }
};

/**
 * UK GDPR/PECR-compliant cookie consent banner.
 * Holds non-essential cookies (analytics + marketing) until accepted.
 */
export default function CookieConsent() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings) return;
    if (settings.cookie_consent_required === false) { setOpen(false); return; }
    const c = readConsent();
    setOpen(!c);
  }, [settings]);

  if (!open) return null;

  const acceptAll = () => {
    setConsent({ essential: true, analytics: true, marketing: true });
    setOpen(false);
    window.location.reload();
  };

  const rejectNonEssential = () => {
    setConsent({ essential: true, analytics: false, marketing: false });
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-x-3 bottom-3 md:inset-x-auto md:bottom-6 md:right-6 md:max-w-md z-[70] bg-white border border-[#E5E5E5] shadow-[0_18px_50px_rgba(26,26,26,0.18)] p-5 md:p-6"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      data-testid="cookie-consent-banner"
    >
      <p className="font-heading text-lg text-[#1A1A1A] mb-2">A note on cookies</p>
      <p className="font-body text-[13px] text-[#5A5A5A] leading-relaxed mb-4">
        We use essential cookies to run the site, and (with your permission) analytics &amp; marketing cookies to
        understand how it&rsquo;s used and improve our floristry. Read our{" "}
        <Link to="/privacy" className="underline hover:text-[#1A1A1A]">privacy policy</Link>.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={acceptAll}
          className="btn-dark rounded-none px-5 py-2.5 text-xs uppercase tracking-[0.22em]"
          data-testid="cookie-accept-all"
        >
          Accept all
        </button>
        <button
          onClick={rejectNonEssential}
          className="btn-outline-dark rounded-none px-5 py-2.5 text-xs uppercase tracking-[0.22em]"
          data-testid="cookie-reject"
        >
          Essential only
        </button>
      </div>
    </div>
  );
}

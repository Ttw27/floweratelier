import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const location = useLocation();

  if (!settings?.whatsapp_enabled || !settings?.whatsapp_number) return null;
  // Hide on admin to avoid clashing with admin UI elements
  if (location.pathname.startsWith("/admin")) return null;

  const digits = settings.whatsapp_number.replace(/\D/g, "");
  if (!digits) return null;
  const msg = encodeURIComponent(settings.whatsapp_default_message || "Hello");
  const href = `https://wa.me/${digits}?text=${msg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-testid="whatsapp-floating-button"
      className="fixed z-[60] bottom-6 right-6 md:bottom-8 md:right-8 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-ping" aria-hidden="true" />
      <span className="relative flex items-center justify-center w-14 h-14 md:w-15 md:h-15 rounded-full bg-[#25D366] hover:bg-[#1DA851] transition-colors shadow-[0_8px_24px_rgba(37,211,102,0.35)]">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="#fff" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.426-.545-.516-1.146-1.291-1.46-1.954a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.61-.81-2.86-.156-.515-.27-.63-.785-.63-.245 0-.5-.045-.703-.045-.36 0-.74.075-1.026.357-.357.357-1.156 1.154-1.156 2.708 0 1.55 1.124 3.055 1.281 3.27 1.135 1.521 2.5 2.69 4.226 3.395 2.418.99 2.92.79 3.45.74.69-.07 2.117-.84 2.43-1.706.314-.866.314-1.6.22-1.71-.094-.11-.293-.165-.587-.275-.27-.135-.665-.27-.825-.31-.16-.04-.234-.215-.165-.385.07-.17 1.142-1.99 1.142-2.45 0-.385-.245-.74-.555-.74Z"/>
          <path d="M16.002 4C9.376 4 4 9.376 4 16.002a11.93 11.93 0 0 0 1.616 6.005L4 28l6.149-1.602A11.95 11.95 0 0 0 16.002 28C22.628 28 28 22.624 28 16.002 28 9.376 22.628 4 16.002 4Zm0 21.81c-1.834 0-3.62-.493-5.182-1.426l-.371-.221-3.66.953.978-3.566-.242-.388a9.778 9.778 0 0 1-1.498-5.16c0-5.41 4.404-9.814 9.815-9.814 5.412 0 9.815 4.405 9.815 9.814 0 5.41-4.403 9.814-9.815 9.814Z"/>
        </svg>
      </span>
    </a>
  );
}

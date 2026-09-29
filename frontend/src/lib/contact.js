// Shared contact helpers. Always prefer the admin-editable settings values;
// these fallbacks are the studio's real details (used only if settings are empty).
export const FALLBACK_PHONE = "07773 683 630";
export const FALLBACK_WHATSAPP = "447773683630";
export const FALLBACK_EMAIL = "info@floweratelier.co.uk";

// Normalise a UK phone number to an E.164-style string for tel: links.
// "07773 683 630" -> "+447773683630", "44 7773..." -> "+447773...", "+44 7773..." -> "+447773..."
export function toTelHref(raw) {
  let n = String(raw || "").replace(/[\s()\-.]/g, "");
  if (!n) return "";
  if (n.startsWith("+")) return `tel:${n}`;
  if (n.startsWith("00")) return `tel:+${n.slice(2)}`;
  if (n.startsWith("44")) return `tel:+${n}`;
  if (n.startsWith("0")) return `tel:+44${n.slice(1)}`;
  return `tel:${n}`;
}

export function getContact(settings) {
  const phone = (settings?.phone_number || "").trim() || FALLBACK_PHONE;
  const whatsapp = ((settings?.whatsapp_number || "").replace(/\D/g, "")) || FALLBACK_WHATSAPP;
  const email = (settings?.contact_email || "").trim() || FALLBACK_EMAIL;
  return { phone, telHref: toTelHref(phone), whatsapp, email };
}

export function whatsappHref(settings, message) {
  const { whatsapp } = getContact(settings);
  return `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

// Mirrors backend _ws_calc_amounts so the price shown is the price charged.
// Session values override workshop values when they are set (not null/undefined).

export function workshopPricePerGuest(workshop, session) {
  // Session price of blank/0 = use the workshop price (same as backend)
  if (Number(session?.price_per_guest) > 0) return Number(session.price_per_guest);
  return Number(workshop?.price_per_guest) || 0;
}

export function workshopDepositPerGuest(workshop, session) {
  const price = workshopPricePerGuest(workshop, session);
  let deposit;
  // Blank or 0 = not set → 50% of price (same as backend)
  if (Number(session?.deposit_amount) > 0) deposit = Number(session.deposit_amount);
  else if (Number(workshop?.deposit_amount) > 0) deposit = Number(workshop.deposit_amount);
  else deposit = price * 0.5;
  // Same clamp as the backend: 0 <= deposit <= price
  return Math.min(Math.max(0, deposit), price);  // rounded only on the total, like the backend
}

export function workshopDiscountPct(workshop) {
  return Math.min(Math.max(0, Number(workshop?.full_payment_discount_pct ?? 0) || 0), 100);
}

export function calcWorkshopAmounts(workshop, session, guests, paymentChoice) {
  const g = Math.max(1, parseInt(guests, 10) || 1);
  const pricePerGuest = workshopPricePerGuest(workshop, session);
  const depositPerGuest = workshopDepositPerGuest(workshop, session);
  const discountPct = workshopDiscountPct(workshop);
  const subtotal = +(pricePerGuest * g).toFixed(2);
  const fullDiscount = +(subtotal * discountPct / 100).toFixed(2);
  const fullAmount = +(subtotal - fullDiscount).toFixed(2);
  const depositAmount = +Math.min(depositPerGuest * g, subtotal).toFixed(2);
  // A deposit option only makes sense when there is something to pay now and something left over
  const depositAvailable = depositAmount > 0 && depositAmount < subtotal;
  const choice = depositAvailable ? paymentChoice : "full";
  const discountAmount = choice === "full" ? fullDiscount : 0;
  const amountDueNow = choice === "full" ? fullAmount : depositAmount;
  const balanceOnDay = +(subtotal - amountDueNow).toFixed(2);
  return { guests: g, pricePerGuest, depositPerGuest, discountPct, subtotal, fullAmount, depositAmount, depositAvailable, effectiveChoice: choice, discountAmount, amountDueNow, balanceOnDay };
}

// True when a session's date is before today (local time).
export function isSessionPast(session) {
  if (!session?.date) return false;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return String(session.date).slice(0, 10) < todayIso;
}

export const fmtWorkshopDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
};

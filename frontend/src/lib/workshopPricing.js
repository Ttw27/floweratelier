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
  // Paying in full leaves nothing to pay on the day (the discount is a saving, not a balance)
  const balanceOnDay = choice === "full" ? 0 : +(subtotal - amountDueNow).toFixed(2);
  return { guests: g, pricePerGuest, depositPerGuest, discountPct, subtotal, fullAmount, depositAmount, depositAvailable, effectiveChoice: choice, discountAmount, amountDueNow, balanceOnDay };
}

// Today's date ("YYYY-MM-DD") and the time ("HH:MM") in London, whatever the visitor's own timezone.
function londonNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value || "";
    return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
  } catch {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
  }
}

// Today's date in London as "YYYY-MM-DD"
export function londonTodayIso() {
  return londonNow().date;
}

// True once a session has started (London time). With no start time it stays bookable until the end of its day.
// Mirrors backend _session_is_past.
export function isSessionPast(session) {
  if (!session?.date) return false;
  const now = londonNow();
  const day = String(session.date).slice(0, 10);
  if (day !== now.date) return day < now.date;
  const m = /^(\d{1,2}):(\d{2})/.exec(String(session.start_time || "").trim());
  if (!m) return false;
  const start = `${m[1].padStart(2, "0")}:${m[2]}`;
  return now.time >= start;
}

// "18:30" -> "6:30pm", "18:00" -> "6pm". Anything unreadable is shown as typed.
export function fmtTime(t) {
  const raw = String(t || "").trim();
  const m = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (!m) return raw;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return raw;
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 || 12;
  return min === 0 ? `${h12}${suffix}` : `${h12}:${String(min).padStart(2, "0")}${suffix}`;
}

// "6:30pm–9pm", "from 6:30pm", "until 9pm" or "".
export function fmtTimeRange(start, end) {
  const s = fmtTime(start);
  const e = fmtTime(end);
  if (s && e) return `${s}–${e}`;
  if (s) return `from ${s}`;
  if (e) return `until ${e}`;
  return "";
}

// "1 place left" / "3 places left" / "Fully booked"
export function placesLeftLabel(n) {
  const left = Math.max(0, Number(n) || 0);
  if (left <= 0) return "Fully booked";
  return `${left} place${left === 1 ? "" : "s"} left`;
}

// Where the session happens, for display.
export function sessionLocationLabel(session, workshop) {
  if (session?.at_customer_venue) return "At your venue";
  return String(session?.location || workshop?.location_default || "").trim() || "Location TBC";
}

export const fmtWorkshopDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
};

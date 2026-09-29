import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Truck, CalendarDays, Droplets, Scissors, Sun, Phone, Mail } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { getContact } from "../lib/contact";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const money = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return v === 0 ? "Free" : `£${v.toFixed(2)}`;
};

const joinList = (items) => {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

const fmtDay = (iso) => {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
};

export default function DeliveryPage() {
  const { settings } = useSettings();
  const contact = getContact(settings);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios.get(`${API_URL}/api/delivery/options`)
      .then((r) => { if (alive) setOptions(r.data || null); })
      .catch(() => { if (alive) setOptions(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const fees = options?.delivery_fees || null;
  const rules = options?.rules || null;
  const blockedWeekdays = Array.isArray(rules?.blocked_weekdays) ? rules.blocked_weekdays : [];
  const deliveryDays = WEEKDAYS.filter((_, i) => !blockedWeekdays.includes(i));
  const today = new Date().toISOString().slice(0, 10);
  const upcomingClosures = (Array.isArray(rules?.blocked_dates) ? rules.blocked_dates : []).filter((d) => d >= today).slice(0, 8);
  const nextDate = Array.isArray(options?.available_dates) && options.available_dates.length > 0 ? options.available_dates[0] : null;
  const saturdayDiffers = fees && Number(fees.saturday) !== Number(fees.standard);

  return (
    <div className="pt-28 pb-20 bg-[#FAFAF7]" data-testid="delivery-page">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <p className="accent-label mb-4"><span className="thin-rule" />Delivery &amp; Care</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] mb-6">Delivery &amp; flower care</h1>
        <p className="font-body text-base text-[#5A5A5A] leading-relaxed mb-12">
          Every bouquet is made to order in our Leicester studio and delivered on the date you choose at checkout.
        </p>

        {/* Delivery */}
        <section className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-8" data-testid="delivery-info">
          <div className="flex items-center gap-3 mb-5">
            <Truck size={18} strokeWidth={1.3} className="text-[#1A1A1A]" />
            <h2 className="font-heading text-2xl text-[#1A1A1A]">Delivery</h2>
          </div>

          {loading ? (
            <div className="py-6 flex justify-center"><div className="spinner" /></div>
          ) : !options ? (
            <p className="font-body text-sm text-[#5A5A5A] leading-relaxed">
              Delivery charges and available dates are shown at checkout. For anything specific, please get in touch using the details below.
            </p>
          ) : (
            <div className="space-y-6 font-body text-sm text-[#1A1A1A]/90 leading-relaxed">
              {fees && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#B3A89B] mb-2">Delivery charges</p>
                  <div className="border border-[#E5E5E5]">
                    <FeeRow label={saturdayDiffers ? "Weekday delivery" : "Delivery"} value={money(fees.standard)} />
                    {saturdayDiffers && <FeeRow label="Saturday delivery" value={money(fees.saturday)} />}
                    {Number(fees.free_threshold) > 0 && (
                      <FeeRow label={`Orders of £${Number(fees.free_threshold).toFixed(2)} or more`} value="Free" />
                    )}
                  </div>
                  <p className="text-[12px] text-[#7A7A7A] mt-2">The exact charge for your chosen date is shown at checkout before you pay.</p>
                </div>
              )}

              {rules && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#B3A89B] mb-2">When we deliver</p>
                  <ul className="space-y-2">
                    {deliveryDays.length > 0 && deliveryDays.length < 7 && (
                      <li>We deliver on {joinList(deliveryDays)}.</li>
                    )}
                    {Number(rules.min_lead_days) > 0 && (
                      <li>
                        Because every order is made fresh, please allow at least {rules.min_lead_days} day{Number(rules.min_lead_days) === 1 ? "" : "s"} between ordering and delivery.
                      </li>
                    )}
                    {nextDate && (
                      <li data-testid="delivery-next-date">The next available delivery date is <strong>{fmtDay(nextDate.date)}</strong>.</li>
                    )}
                    <li>You choose your delivery date at checkout — only dates we can fulfil are shown.</li>
                  </ul>
                  {upcomingClosures.length > 0 && (
                    <p className="text-[12px] text-[#7A7A7A] mt-3">
                      No deliveries on: {upcomingClosures.map(fmtDay).join(" · ")}.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Care */}
        <section className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-8" data-testid="care-info">
          <div className="flex items-center gap-3 mb-5">
            <CalendarDays size={18} strokeWidth={1.3} className="text-[#1A1A1A]" />
            <h2 className="font-heading text-2xl text-[#1A1A1A]">Caring for your flowers</h2>
          </div>
          <ul className="space-y-5 font-body text-sm text-[#1A1A1A]/90 leading-relaxed">
            <CareTip icon={Scissors} title="Trim the stems">
              Before placing in water, cut 2–3 cm from each stem at an angle with clean, sharp scissors. Repeat every couple of days.
            </CareTip>
            <CareTip icon={Droplets} title="Fresh, clean water">
              Use a clean vase filled with cool water and add any flower food provided. Top up daily and change the water every two to three days.
            </CareTip>
            <CareTip icon={Scissors} title="Remove low leaves">
              Strip any leaves that would sit below the waterline — they cloud the water and shorten vase life.
            </CareTip>
            <CareTip icon={Sun} title="Choose a cool spot">
              Keep your flowers away from direct sunlight, radiators, draughts and ripening fruit.
            </CareTip>
          </ul>
        </section>

        {/* Contact */}
        <section className="border-t border-[#E5E5E5] pt-8">
          <p className="font-body text-sm text-[#5A5A5A] leading-relaxed mb-4">
            Questions about a delivery, or need a specific time? We&rsquo;re happy to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 font-body text-sm">
            <a href={contact.telHref} className="inline-flex items-center gap-2 text-[#1A1A1A] hover:text-[#B3A89B]"><Phone size={14} strokeWidth={1.3} />{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-[#1A1A1A] hover:text-[#B3A89B]"><Mail size={14} strokeWidth={1.3} />{contact.email}</a>
          </div>
          <p className="font-body text-sm text-[#7A7A7A] mt-8">
            Ready to send flowers? <Link to="/collection" className="underline text-[#1A1A1A]">Browse the collection</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

function FeeRow({ label, value }) {
  if (value === null) return null;
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E5E5] last:border-b-0">
      <span>{label}</span>
      <span className="font-heading text-base">{value}</span>
    </div>
  );
}

function CareTip({ icon: Icon, title, children }) {
  return (
    <li className="flex gap-4">
      <Icon size={16} strokeWidth={1.3} className="text-[#B3A89B] mt-1 shrink-0" />
      <div>
        <p className="font-heading text-base text-[#1A1A1A] mb-1">{title}</p>
        <p className="text-[#5A5A5A]">{children}</p>
      </div>
    </li>
  );
}

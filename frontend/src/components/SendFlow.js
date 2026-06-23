import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "../context/CartContext";
import { trackEvent } from "./Pixels";
import BoxDesigner from "./BoxDesigner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STEPS = [
  { key: "card", label: "Pick a card" },
  { key: "message", label: "Write message" },
  { key: "date", label: "Delivery day" },
  { key: "box", label: "Choose box" },
  { key: "addons", label: "Add a treat" },
  { key: "review", label: "Review" },
];

const BOX_CHOICES = [
  { id: "kraft", name: "Signature kraft box", price: 0, description: "Hand-tied in our standard ivory atelier kraft box.", image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=70" },
  { id: "vase", name: "Glass studio vase", price: 12, description: "Arrives ready-arranged in a re-usable hand-blown vase.", image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=70" },
  { id: "personalised", name: "Personalised box (+£9.99)", price: 9.99, description: "Designed by you — drag-and-drop photos, custom text, fonts and colours.", image: "https://images.unsplash.com/photo-1620662736427-b8a198f52a4d?w=800&q=70" },
];

const ADDON_GROUPS = [
  { sub_type: "treat", title: "Treats — teddies, chocolates &amp; drinks" },
  { sub_type: "candle", title: "House candles" },
  { sub_type: "jewellery_box", title: "Keepsake jewellery boxes" },
];

export default function SendFlow({ product, open, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState([]);
  const [addons, setAddons] = useState({ treat: [], candle: [], jewellery_box: [] });
  const [delivery, setDelivery] = useState(null);
  const [busy, setBusy] = useState(false);

  // selections
  const [chosenCardId, setChosenCardId] = useState(null);
  const [cardMessage, setCardMessage] = useState("");
  const [chosenDate, setChosenDate] = useState(null);
  const [chosenBox, setChosenBox] = useState("kraft");
  const [chosenAddonIds, setChosenAddonIds] = useState([]);
  const [boxDesign, setBoxDesign] = useState(null);   // {preview_url, background, layers}
  const [designerOpen, setDesignerOpen] = useState(false);

  // Load reference data once when opened
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [cR, tR, ccR, jR, dR] = await Promise.all([
          axios.get(`${API_URL}/api/cards`),
          axios.get(`${API_URL}/api/addons?sub_type=treat`),
          axios.get(`${API_URL}/api/addons?sub_type=candle`),
          axios.get(`${API_URL}/api/addons?sub_type=jewellery_box`),
          axios.get(`${API_URL}/api/delivery/options`),
        ]);
        if (cancelled) return;
        setCards(cR.data);
        setAddons({ treat: tR.data, candle: ccR.data, jewellery_box: jR.data });
        setDelivery(dR.data);
      } catch {
        toast.error("Couldn't load send-flow options");
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(0);
      setChosenCardId(null);
      setCardMessage("");
      setChosenDate(null);
      setChosenBox("kraft");
      setChosenAddonIds([]);
      setBoxDesign(null);
      setDesignerOpen(false);
    } else {
      trackEvent("InitiateCheckout", { content_name: product?.name, value: product?.price });
    }
  }, [open, product]);

  const totalAddonsPrice = useMemo(() => {
    const all = [...addons.treat, ...addons.candle, ...addons.jewellery_box];
    return chosenAddonIds.reduce((sum, id) => sum + (all.find((a) => a.id === id)?.price || 0), 0);
  }, [chosenAddonIds, addons]);

  const boxObj = BOX_CHOICES.find((b) => b.id === chosenBox);
  const totalPrice = (product?.price || 0) + (boxObj?.price || 0) + totalAddonsPrice;

  const canAdvance = () => {
    switch (STEPS[step].key) {
      case "card": return !!chosenCardId;
      case "message": return cardMessage.trim().length > 0;
      case "date": return !!chosenDate;
      case "box": return chosenBox !== "personalised" || !!boxDesign;
      case "addons": return true;
      case "review": return true;
      default: return true;
    }
  };

  const next = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const submit = async () => {
    if (!product) return;
    setBusy(true);
    try {
      const card = cards.find((c) => c.id === chosenCardId);
      const all = [...addons.treat, ...addons.candle, ...addons.jewellery_box];
      const chosenAddons = all.filter((a) => chosenAddonIds.includes(a.id));
      const meta = {
        // Re-using existing box_personalization slot to flow data into cart/order
        send_flow: {
          card: card ? { id: card.id, name: card.name, image_url: card.image_url } : null,
          card_message: cardMessage,
          delivery_date: chosenDate,
          box_choice: chosenBox,
          box_label: boxObj?.name,
          box_extra_price: boxObj?.price || 0,
          box_design: chosenBox === "personalised" ? boxDesign : null,
          addons: chosenAddons.map((a) => ({ id: a.id, name: a.name, price: a.price, sub_type: a.sub_type })),
        },
      };
      await addToCart(product.id, 1, null, meta);
      trackEvent("AddToCart", { content_name: product.name, value: totalPrice, currency: "GBP" });
      toast.success("Added to your basket");
      onClose?.();
      navigate("/cart");
    } catch {
      toast.error("Could not add to basket");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto" data-testid="send-flow-overlay" onClick={onClose}>
      <div className="bg-white w-full md:max-w-4xl md:max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()} data-testid="send-flow-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3 min-w-0">
            <p className="accent-label text-[10px]">Step {step + 1} / {STEPS.length}</p>
            <h3 className="font-heading text-base md:text-xl text-[#1A1A1A] truncate">{STEPS[step].label}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" data-testid="send-flow-close" className="text-[#7A7A7A] hover:text-[#1A1A1A]">
            <X size={20} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="px-5 md:px-8 pt-4 pb-2 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`h-[3px] flex-1 transition-colors ${i <= step ? "bg-[#1A1A1A]" : "bg-[#E5E5E5]"}`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {STEPS[step].key === "card" && (
            <div data-testid="step-card">
              <p className="font-body text-sm text-[#7A7A7A] mb-6">Every order arrives with a hand-finished greeting card.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cards.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChosenCardId(c.id)}
                    className={`group text-left bg-white border ${chosenCardId === c.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A]/15" : "border-[#E5E5E5] hover:border-[#1A1A1A]"} transition-colors`}
                    data-testid={`card-option-${c.id}`}
                  >
                    <div className="aspect-square overflow-hidden bg-[#F2EFEB]">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-body text-[13px] text-[#1A1A1A] truncate">{c.name}</p>
                      <p className="font-body text-[11px] text-[#7A7A7A] truncate">{c.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {STEPS[step].key === "message" && (
            <div data-testid="step-message" className="max-w-xl">
              <p className="font-body text-sm text-[#7A7A7A] mb-6">Hand-written by the studio onto your chosen card.</p>
              <Textarea
                rows={6}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value.slice(0, 280))}
                placeholder={"e.g. Happy birthday darling — with all my love, J xx"}
                className="light-input rounded-none"
                data-testid="card-message-input"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="font-body text-[11px] text-[#7A7A7A]">{cardMessage.length} / 280</p>
                <p className="font-body text-[11px] text-[#7A7A7A]">Leave anonymous? Type &ldquo;—&rdquo;.</p>
              </div>
            </div>
          )}

          {STEPS[step].key === "date" && (
            <div data-testid="step-date">
              <div className="flex items-center gap-2 text-[#1A1A1A] mb-2">
                <CalendarIcon size={16} strokeWidth={1.4} />
                <p className="font-body text-sm">
                  {delivery?.rules?.min_lead_days ?? 4}-day minimum lead time
                  {delivery?.rules?.blocked_weekdays?.length ? `, ${delivery.rules.blocked_weekdays.map(d => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d]).join(" / ")} closed` : ""}.
                </p>
              </div>
              <p className="font-body text-xs text-[#7A7A7A] mb-5">Saturday delivery carries a small premium.</p>
              {!delivery ? (
                <p className="text-sm text-[#7A7A7A]">Loading dates…</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {delivery.available_dates.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setChosenDate(d.date)}
                      className={`px-3 py-3 text-left border transition-colors ${chosenDate === d.date ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                      data-testid={`delivery-date-${d.date}`}
                    >
                      <span className="block text-[10px] uppercase tracking-[0.18em] opacity-80">{d.day_name}</span>
                      <span className="block font-body text-[13px]">{d.formatted}</span>
                      {d.is_saturday && <span className="block text-[10px] mt-0.5 opacity-75">+ Saturday fee</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {STEPS[step].key === "box" && (
            <div data-testid="step-box" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BOX_CHOICES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setChosenBox(b.id)}
                    className={`text-left bg-white border ${chosenBox === b.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A]/15" : "border-[#E5E5E5] hover:border-[#1A1A1A]"} transition-colors`}
                    data-testid={`box-choice-${b.id}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#F2EFEB]">
                      <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-body text-[13px] text-[#1A1A1A]">{b.name}</p>
                        {b.price > 0 && <span className="font-body text-[12px] text-[#1A1A1A]">+£{b.price.toFixed(2)}</span>}
                      </div>
                      <p className="font-body text-[11px] text-[#7A7A7A] mt-1">{b.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Personalised box designer panel */}
              {chosenBox === "personalised" && (
                <div className="bg-[#F2EFEB] border border-[#1A1A1A]/15 p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start" data-testid="box-personalised-panel">
                  {boxDesign?.preview_url ? (
                    <img src={boxDesign.preview_url} alt="Your design" className="w-full md:w-56 aspect-[10/7] object-cover bg-white" data-testid="box-design-preview" />
                  ) : (
                    <div className="w-full md:w-56 aspect-[10/7] bg-white border border-dashed border-[#1A1A1A]/20 flex items-center justify-center">
                      <Sparkles size={28} className="text-[#B3A89B]" strokeWidth={1.2} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="accent-label mb-2"><span className="thin-rule" />{boxDesign ? "Your design is saved" : "Bring your box to life"}</p>
                    <p className="font-body text-[13px] text-[#1A1A1A] leading-relaxed mb-4">
                      Drag-and-drop your own photos, type names &amp; dates, choose from six luxury fonts, and pick text + background colours. The studio will recreate your saved design as faithfully as our materials allow.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setDesignerOpen(true)} className="btn-dark rounded-none" data-testid="open-box-designer">
                        <Sparkles size={14} className="mr-2" /> {boxDesign ? "Edit design" : "Open designer"}
                      </Button>
                      {boxDesign && (
                        <Button variant="outline" className="rounded-none" onClick={() => setBoxDesign(null)} data-testid="clear-box-design">
                          Clear design
                        </Button>
                      )}
                    </div>
                    {!boxDesign && (
                      <p className="font-body text-[11px] text-[#7A7A7A] mt-3">A saved design is required before you can continue.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {STEPS[step].key === "addons" && (
            <div data-testid="step-addons" className="space-y-10">
              <p className="font-body text-sm text-[#7A7A7A]">Optional finishing touches. Tap to add — tap again to remove.</p>
              {ADDON_GROUPS.map((g) => (
                <section key={g.sub_type}>
                  <h4 className="font-heading text-lg text-[#1A1A1A] mb-3" dangerouslySetInnerHTML={{ __html: g.title }} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(addons[g.sub_type] || []).map((a) => {
                      const selected = chosenAddonIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setChosenAddonIds((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])}
                          className={`text-left bg-white border ${selected ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A]/15" : "border-[#E5E5E5] hover:border-[#1A1A1A]"} transition-colors`}
                          data-testid={`addon-${a.id}`}
                        >
                          <div className="aspect-square overflow-hidden bg-[#F2EFEB] relative">
                            <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />
                            {selected && <span className="absolute top-2 right-2 w-6 h-6 bg-[#1A1A1A] text-white flex items-center justify-center"><Check size={12} /></span>}
                          </div>
                          <div className="p-2.5">
                            <p className="font-body text-[12px] text-[#1A1A1A] truncate">{a.name}</p>
                            <p className="font-body text-[12px] text-[#1A1A1A]">£{a.price.toFixed(2)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {STEPS[step].key === "review" && (
            <div data-testid="step-review" className="max-w-xl">
              <div className="space-y-4 text-sm text-[#1A1A1A]">
                <Row label="Bouquet" value={`${product?.name} — £${(product?.price || 0).toFixed(2)}`} />
                <Row label="Card" value={cards.find(c => c.id === chosenCardId)?.name || "—"} />
                <Row label="Message" value={cardMessage || "—"} />
                <Row label="Delivery" value={chosenDate ? new Date(chosenDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "—"} />
                <Row label="Box" value={`${boxObj?.name}${boxObj?.price ? ` — +£${boxObj.price.toFixed(2)}` : ""}`} />
                <Row label="Add-ons" value={chosenAddonIds.length === 0 ? "None" : `${chosenAddonIds.length} item(s) — £${totalAddonsPrice.toFixed(2)}`} />
              </div>

              {chosenBox === "personalised" && boxDesign?.preview_url && (
                <div className="mt-6">
                  <p className="accent-label mb-2"><span className="thin-rule" />Your box design</p>
                  <img src={boxDesign.preview_url} alt="Your saved box design" className="w-full max-w-sm aspect-[10/7] object-cover bg-white border border-[#E5E5E5]" data-testid="review-box-design-preview" />
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[#E5E5E5] flex items-center justify-between">
                <p className="accent-label">Estimated total</p>
                <p className="font-heading text-2xl text-[#1A1A1A]" data-testid="send-flow-total">£{totalPrice.toFixed(2)}</p>
              </div>
              <p className="font-body text-[11px] text-[#7A7A7A] mt-2">Final delivery fee &amp; any Saturday premium are calculated at checkout.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 md:px-8 py-4 border-t border-[#E5E5E5] flex items-center justify-between gap-3 bg-white">
          <Button variant="outline" className="rounded-none" onClick={back} disabled={step === 0} data-testid="send-flow-back">
            <ChevronLeft size={14} className="mr-1" /> Back
          </Button>
          <p className="font-body text-[11px] text-[#7A7A7A] hidden sm:block">{STEPS[step].label}</p>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!canAdvance()} className="btn-dark rounded-none" data-testid="send-flow-next">
              Continue <ChevronRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={busy || !chosenCardId || !chosenDate} className="btn-dark rounded-none" data-testid="send-flow-submit">
              {busy ? "Adding…" : "Add to basket"}
            </Button>
          )}
        </div>
      </div>

      {/* Personalised box designer */}
      <BoxDesigner
        open={designerOpen}
        initialBg={boxDesign?.background}
        onClose={() => setDesignerOpen(false)}
        onSave={(design) => setBoxDesign(design)}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#F0F0F0] pb-2">
      <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A] shrink-0">{label}</span>
      <span className="font-body text-[13px] text-[#1A1A1A] text-right break-words">{value}</span>
    </div>
  );
}

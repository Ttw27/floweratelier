/**
 * Renders a rich summary of the customer's send-flow choices on a cart line / order line.
 * Accepts the metadata stored under `box_personalization.send_flow`.
 */
export default function SendFlowSummary({ data, compact = false }) {
  if (!data) return null;
  const { card, card_message, delivery_date, box, box_design, addons = [] } = data;

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    } catch { return iso; }
  };

  return (
    <div className="mt-3 bg-[#F2EFEB] p-4 space-y-3" data-testid="send-flow-summary">
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#1A1A1A]">Your gift in detail</p>

      <div className="grid sm:grid-cols-2 gap-3 text-[12px] text-[#1A1A1A]">
        <Item label="Card">
          {card ? (
            <div className="flex items-center gap-2">
              {card.image_url && <img src={card.image_url} alt={card.name} className="w-10 h-10 object-cover bg-white" />}
              <span>{card.name}</span>
            </div>
          ) : <span className="text-[#7A7A7A]">No card (flowers only)</span>}
        </Item>

        {card && (
          <Item label="Message" full={!compact}>
            <span className="italic break-words">{card_message?.trim() ? `“${card_message}”` : "—"}</span>
          </Item>
        )}

        <Item label="Delivery">
          <span>{fmtDate(delivery_date)}</span>
        </Item>

        <Item label="Box">
          {box ? (
            <span>
              {box.name}{box.price > 0 ? ` · +£${box.price.toFixed(2)}` : ""}
              {box.is_personalised ? <span className="ml-2 inline-block bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5">Personalised</span> : null}
            </span>
          ) : <span className="text-[#7A7A7A]">—</span>}
        </Item>
      </div>

      {box_design?.preview_url && (
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A] mb-1.5">Your box design</p>
          <img
            src={box_design.preview_url}
            alt="Your saved box design"
            className="w-full max-w-[260px] aspect-[10/7] object-cover bg-white border border-[#E5E5E5]"
            data-testid="cart-box-design-preview"
          />
        </div>
      )}

      {addons.length > 0 && (
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A] mb-1.5">Add-ons</p>
          <ul className="space-y-1">
            {addons.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-[12px] text-[#1A1A1A]">
                <span className="flex items-center gap-2">
                  {a.image_url && <img src={a.image_url} alt={a.name} className="w-7 h-7 object-cover bg-white" />}
                  <span>{a.name}</span>
                </span>
                <span>£{Number(a.price || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Item({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A] mb-1">{label}</p>
      <div className="font-body">{children}</div>
    </div>
  );
}

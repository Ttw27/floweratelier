import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const fmt = (n) => `£${(Number(n) || 0).toFixed(2)}`;
const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
};
const fmtDay = (iso) => {
  if (!iso) return "—";
  try { return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
};

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const isPaid = (o) => o.payment_status === "paid";
// An order is treated as abandoned when it was never paid and nobody has moved it on from "pending".
const isAbandoned = (o) => !isPaid(o) && (o.status || "pending") === "pending";

const unitPrice = (item) => {
  if (item.unit_price != null) return Number(item.unit_price);
  const qty = Number(item.quantity) || 1;
  if (item.item_total != null) return Number(item.item_total) / qty;
  return Number(item.price) || 0;
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/orders`);
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const abandonedCount = useMemo(() => orders.filter(isAbandoned).length, [orders]);

  const visible = useMemo(() => orders.filter((o) => {
    if (!showUnpaid && isAbandoned(o)) return false;
    if (statusFilter !== "all" && (o.status || "pending") !== statusFilter) return false;
    return true;
  }), [orders, showUnpaid, statusFilter]);

  const toggle = (id) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <div data-testid="orders-admin">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showUnpaid} onChange={(e) => setShowUnpaid(e.target.checked)} data-testid="orders-show-unpaid" />
            <span className="font-body text-sm text-[#1A1A1A]">Show unpaid / abandoned checkouts ({abandonedCount})</span>
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-none bg-white" data-testid="orders-status-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] hover:text-[#B3A89B]" data-testid="orders-refresh">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2EFEB]">
              <tr>
                {["", "Order", "Placed", "Delivery", "Recipient", "Total", "Payment", "Status"].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left accent-label text-[#1A1A1A]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-[#7A7A7A]">Loading orders…</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-[#7A7A7A]">
                  No orders to show{!showUnpaid && abandonedCount > 0 ? ` — ${abandonedCount} unpaid checkout(s) hidden` : ""}.
                </td></tr>
              )}
              {!loading && visible.map((order) => {
                const open = expanded.has(order.id);
                const paid = isPaid(order);
                return (
                  <Fragment key={order.id}>
                    <tr className={`border-t border-[#E5E5E5] ${paid ? "" : "bg-[#FCFBF8]"}`} data-testid={`admin-order-${order.id}`}>
                      <td className="px-2 py-3 w-8">
                        <button type="button" onClick={() => toggle(order.id)} className="text-[#7A7A7A] hover:text-[#1A1A1A]" aria-label={open ? "Hide details" : "Show details"} aria-expanded={open} data-testid={`admin-order-toggle-${order.id}`}>
                          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">
                        <button type="button" onClick={() => toggle(order.id)} className="hover:underline">{order.id.slice(0, 8)}</button>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-[#7A7A7A] whitespace-nowrap">{fmtDateTime(order.created_at)}</td>
                      <td className="px-4 py-3 font-body text-sm text-[#1A1A1A] whitespace-nowrap">
                        {fmtDay(order.delivery_date)}
                        {order.is_saturday_delivery && <span className="ml-1 text-[10px] uppercase tracking-wider text-[#7A7A7A]">Sat</span>}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{order.recipient_name}</td>
                      <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{fmt(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-body whitespace-nowrap ${paid ? "bg-[#C4CFC0] text-[#1A1A1A]" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                          {paid ? "Paid" : "Not paid"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={order.status || "pending"} onValueChange={(value) => updateStatus(order.id, value)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs rounded-none" data-testid={`admin-order-status-${order.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t border-[#F0F0F0] bg-[#FAFAF7]" data-testid={`admin-order-detail-${order.id}`}>
                        <td colSpan={8} className="px-4 md:px-8 py-6">
                          <OrderDetail order={order} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order }) {
  const addr = order.delivery_address || {};
  const legacyBox = order.box_personalization;
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="space-y-5">
        <Block label="Payment">
          <p className={order.payment_status === "paid" ? "text-[#1A1A1A]" : "text-amber-800"}>
            {order.payment_status === "paid" ? "Paid" : `Not paid (${order.payment_status || "pending"})`}
          </p>
        </Block>
        <Block label="Delivery date">
          <p>{fmtDay(order.delivery_date)}{order.is_saturday_delivery ? " · Saturday" : ""}</p>
        </Block>
        <Block label="Recipient">
          <p>{order.recipient_name || "—"}</p>
          {order.recipient_phone && <a href={`tel:${order.recipient_phone.replace(/\s/g, "")}`} className="underline">{order.recipient_phone}</a>}
        </Block>
        <Block label="Delivery address">
          <p>{addr.line1}</p>
          {addr.line2 && <p>{addr.line2}</p>}
          <p>{[addr.city, addr.postcode].filter(Boolean).join(" ")}</p>
        </Block>
        <Block label="Customer email">
          {order.customer_email ? <a href={`mailto:${order.customer_email}`} className="underline break-all">{order.customer_email}</a> : <p className="text-[#7A7A7A]">—</p>}
        </Block>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <Block label={`Items (${(order.items || []).length})`}>
          <div className="space-y-4">
            {(order.items || []).map((item, idx) => <OrderItem key={item.line_id || idx} item={item} />)}
          </div>
        </Block>

        {legacyBox && (legacyBox.box_color || legacyBox.ribbon_color || legacyBox.box_message) && (
          <Block label="Presentation (checkout)">
            {legacyBox.box_color && <p>Box · {legacyBox.box_color.replace(/-/g, " ")}</p>}
            {legacyBox.ribbon_color && <p>Ribbon · {legacyBox.ribbon_color.replace(/-/g, " ")}</p>}
            {legacyBox.box_message && <p className="italic">&ldquo;{legacyBox.box_message}&rdquo;</p>}
          </Block>
        )}

        <Block label="Gift message / note">
          {order.gift_message?.trim() ? <p className="italic whitespace-pre-wrap">&ldquo;{order.gift_message}&rdquo;</p> : <p className="text-[#7A7A7A]">—</p>}
        </Block>

        <div className="border-t border-[#E5E5E5] pt-4 max-w-xs ml-auto space-y-1 font-body text-sm">
          <Row label="Subtotal" value={fmt(order.subtotal)} />
          <Row label={`Delivery${order.is_saturday_delivery ? " (Sat)" : ""}`} value={Number(order.delivery_fee) === 0 ? "Free" : fmt(order.delivery_fee)} />
          <Row label="Total" value={fmt(order.total)} strong />
        </div>
      </div>
    </div>
  );
}

function OrderItem({ item }) {
  const sf = item.box_personalization?.send_flow;
  const legacy = !sf ? item.box_personalization : null;
  const qty = Number(item.quantity) || 1;
  return (
    <div className="flex gap-4 border border-[#E5E5E5] bg-white p-4">
      {item.image && <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-[#F2EFEB] shrink-0" />}
      <div className="flex-1 min-w-0 font-body text-sm text-[#1A1A1A] space-y-1">
        <div className="flex flex-wrap justify-between gap-2">
          <p className="font-medium">{item.name}{item.size ? ` · ${item.size}` : ""}</p>
          <p>{qty} × {fmt(unitPrice(item))}{item.item_total != null ? ` = ${fmt(item.item_total)}` : ""}</p>
        </div>
        {sf && (
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
            <p><span className="text-[#7A7A7A]">Card:</span> {sf.card?.name || "No card"}</p>
            {sf.delivery_date && <p><span className="text-[#7A7A7A]">Chosen day:</span> {fmtDay(sf.delivery_date)}</p>}
            {sf.card && (
              <p className="sm:col-span-2"><span className="text-[#7A7A7A]">Card message:</span> <span className="italic whitespace-pre-wrap">{sf.card_message?.trim() ? `“${sf.card_message}”` : "—"}</span></p>
            )}
            <p><span className="text-[#7A7A7A]">Box:</span> {sf.box?.name || "—"}{sf.box?.is_personalised ? " (personalised)" : ""}</p>
            {sf.box_design?.preview_url && (
              <p>
                <span className="text-[#7A7A7A]">Box design:</span>{" "}
                <a href={sf.box_design.preview_url} target="_blank" rel="noopener noreferrer" className="underline">Open image</a>
              </p>
            )}
            {(sf.addons || []).length > 0 && (
              <p className="sm:col-span-2"><span className="text-[#7A7A7A]">Add-ons:</span> {sf.addons.map((a) => a.name).join(", ")}</p>
            )}
          </div>
        )}
        {sf?.box_design?.preview_url && (
          <a href={sf.box_design.preview_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
            <img src={sf.box_design.preview_url} alt="Box design" className="w-40 aspect-[10/7] object-cover border border-[#E5E5E5] bg-white" />
          </a>
        )}
        {legacy && (legacy.box_color || legacy.ribbon_color || legacy.box_message) && (
          <p className="text-[13px] text-[#7A7A7A]">
            {[legacy.box_color && `Box: ${legacy.box_color}`, legacy.ribbon_color && `Ribbon: ${legacy.ribbon_color}`, legacy.box_message && `“${legacy.box_message}”`].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

function Block({ label, children }) {
  return (
    <div>
      <p className="accent-label text-[10px] mb-1.5">{label}</p>
      <div className="font-body text-sm text-[#1A1A1A] space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between ${strong ? "text-[#1A1A1A] font-medium pt-1 border-t border-[#E5E5E5]" : "text-[#7A7A7A]"}`}>
      <span>{label}</span>
      <span className="text-[#1A1A1A]">{value}</span>
    </div>
  );
}

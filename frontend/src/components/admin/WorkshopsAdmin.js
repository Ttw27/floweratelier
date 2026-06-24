import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Calendar, X, ChevronRight } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const emptyWorkshop = () => ({
  slug: "", name: "", tag: "", season: "",
  short_description: "", description: "", includes: "",
  duration: "", group_size: "", location_default: "",
  image_url: "",
  price_per_guest: 0, deposit_amount: 0, full_payment_discount_pct: 5,
  cancellation_policy: "Deposits are non-refundable. Balance is collected on the day.",
  sort_order: 0, active: true,
});

const emptySession = (workshop_id) => ({
  workshop_id, date: "", start_time: "", end_time: "", location: "",
  capacity: 14, spots_booked: 0,
  price_per_guest: "", deposit_amount: "",
  notes: "", active: true,
});

const fmtDate = (iso) => {
  if (!iso) return "";
  try { return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
};

export default function WorkshopsAdmin() {
  const [tab, setTab] = useState("workshops"); // workshops | sessions | bookings
  const [workshops, setWorkshops] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionFilter, setSessionFilter] = useState("");
  const [saving, setSaving] = useState(false);

  const loadWorkshops = async () => {
    const r = await axios.get(`${API_URL}/api/admin/workshops`);
    setWorkshops(r.data || []);
  };
  const loadSessions = async () => {
    const r = await axios.get(`${API_URL}/api/admin/workshop-sessions`);
    setSessions(r.data || []);
  };
  const loadBookings = async () => {
    const r = await axios.get(`${API_URL}/api/admin/workshop-bookings`);
    setBookings(r.data || []);
  };

  useEffect(() => { loadWorkshops(); loadSessions(); loadBookings(); }, []);

  const seedWorkshops = async () => {
    if (!window.confirm("Seed starter workshops + 2 upcoming dates each? (skipped if already present)")) return;
    try {
      const r = await axios.post(`${API_URL}/api/seed/workshops`);
      toast.success(`Workshops: ${r.data.workshops} · Sessions: ${r.data.sessions}`);
      await Promise.all([loadWorkshops(), loadSessions()]);
    } catch (err) { toast.error(err.response?.data?.detail || "Seed failed"); }
  };

  const saveWorkshop = async (e) => {
    e.preventDefault();
    const w = editingWorkshop;
    if (!w.slug || !w.name) { toast.error("Slug and name are required"); return; }
    setSaving(true);
    try {
      const payload = {
        slug: w.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        name: w.name, tag: w.tag || "", season: w.season || "",
        short_description: w.short_description || "", description: w.description || "",
        includes: typeof w.includes === "string"
          ? w.includes.split("\n").map((s) => s.trim()).filter(Boolean)
          : (w.includes || []),
        duration: w.duration || "", group_size: w.group_size || "",
        location_default: w.location_default || "", image_url: w.image_url || "",
        gallery_images: [], price_per_guest: parseFloat(w.price_per_guest) || 0,
        deposit_amount: parseFloat(w.deposit_amount) || 0,
        full_payment_discount_pct: parseFloat(w.full_payment_discount_pct) || 0,
        cancellation_policy: w.cancellation_policy || "",
        sort_order: parseInt(w.sort_order) || 0, active: !!w.active,
      };
      if (w.id) await axios.put(`${API_URL}/api/admin/workshops/${w.id}`, payload);
      else await axios.post(`${API_URL}/api/admin/workshops`, payload);
      toast.success("Saved");
      setEditingWorkshop(null);
      await loadWorkshops();
    } catch (err) { toast.error(err.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const removeWorkshop = async (id) => {
    if (!window.confirm("Delete this workshop?")) return;
    try { await axios.delete(`${API_URL}/api/admin/workshops/${id}`); toast.success("Deleted"); await loadWorkshops(); }
    catch (err) { toast.error(err.response?.data?.detail || "Delete failed"); }
  };

  const saveSession = async (e) => {
    e.preventDefault();
    const s = editingSession;
    if (!s.workshop_id || !s.date) { toast.error("Workshop and date required"); return; }
    setSaving(true);
    try {
      const payload = {
        workshop_id: s.workshop_id, date: s.date,
        start_time: s.start_time || "", end_time: s.end_time || "",
        location: s.location || "", capacity: parseInt(s.capacity) || 14,
        spots_booked: parseInt(s.spots_booked) || 0,
        price_per_guest: s.price_per_guest === "" || s.price_per_guest === null ? null : parseFloat(s.price_per_guest),
        deposit_amount: s.deposit_amount === "" || s.deposit_amount === null ? null : parseFloat(s.deposit_amount),
        notes: s.notes || "", active: !!s.active,
      };
      if (s.id) await axios.put(`${API_URL}/api/admin/workshop-sessions/${s.id}`, payload);
      else await axios.post(`${API_URL}/api/admin/workshop-sessions`, payload);
      toast.success("Saved");
      setEditingSession(null);
      await loadSessions();
    } catch (err) { toast.error(err.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const removeSession = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try { await axios.delete(`${API_URL}/api/admin/workshop-sessions/${id}`); toast.success("Deleted"); await loadSessions(); }
    catch (err) { toast.error(err.response?.data?.detail || "Delete failed"); }
  };

  const wMap = Object.fromEntries(workshops.map((w) => [w.id, w]));
  const filteredSessions = sessionFilter ? sessions.filter((s) => s.workshop_id === sessionFilter) : sessions;

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="workshops-admin-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Workshops</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Workshop programmes, dated sessions and bookings.</p>
        </div>
        <Button onClick={seedWorkshops} variant="outline" className="rounded-none" data-testid="workshops-seed-btn">Seed starter</Button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-[#E5E5E5] mb-6">
        {[
          { id: "workshops", testId: "programmes", label: `Programmes (${workshops.length})` },
          { id: "sessions",  testId: "sessions",   label: `Sessions (${sessions.length})` },
          { id: "bookings",  testId: "bookings",   label: `Bookings (${bookings.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] border-b-2 ${tab === t.id ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent text-[#7A7A7A] hover:text-[#1A1A1A]"}`}
            data-testid={`workshops-subtab-${t.testId}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* === WORKSHOPS === */}
      {tab === "workshops" && (
        <div>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setEditingWorkshop(emptyWorkshop())} className="btn-dark rounded-none" data-testid="workshops-add-btn">
              <Plus size={14} className="mr-2" /> Add programme
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workshops.length === 0 && <p className="text-sm text-[#7A7A7A] col-span-full">No workshops yet. Click &ldquo;Seed starter&rdquo; or &ldquo;Add programme&rdquo;.</p>}
            {workshops.map((w) => (
              <div key={w.id} className="border border-[#E5E5E5] bg-white" data-testid={`workshops-row-${w.id}`}>
                <div className="aspect-[4/3] overflow-hidden bg-[#F2EFEB]">
                  {w.image_url ? <img src={w.image_url} alt={w.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="p-3">
                  <p className="font-body text-[12px] text-[#1A1A1A] truncate">{w.name}</p>
                  <p className="font-body text-[11px] text-[#7A7A7A] truncate">{w.slug} · £{Number(w.price_per_guest).toFixed(0)}/guest · {w.active ? "Active" : "Hidden"}</p>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingWorkshop({ ...w, includes: (w.includes || []).join("\n") })} className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid={`workshops-edit-${w.id}`}><Pencil size={14} /></button>
                    <button onClick={() => removeWorkshop(w.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`workshops-delete-${w.id}`}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SESSIONS === */}
      {tab === "sessions" && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <Label className="text-xs text-[#7A7A7A]">Filter by workshop</Label>
              <select value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)} className="light-input rounded-none h-9 px-3 ml-2" data-testid="sessions-filter">
                <option value="">All workshops</option>
                {workshops.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <Button onClick={() => setEditingSession(emptySession(sessionFilter || (workshops[0]?.id || "")))} className="btn-dark rounded-none" data-testid="sessions-add-btn">
              <Plus size={14} className="mr-2" /> Add date
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F2EFEB]">
                <tr>
                  {["Workshop", "Date", "Time", "Location", "Capacity", "Booked", "Price", "Active", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-left accent-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 && (<tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#7A7A7A]">No sessions.</td></tr>)}
                {filteredSessions.map((s) => {
                  const w = wMap[s.workshop_id];
                  return (
                    <tr key={s.id} className="border-t border-[#E5E5E5]" data-testid={`sessions-row-${s.id}`}>
                      <td className="px-3 py-2 text-sm">{w?.name || s.workshop_id}</td>
                      <td className="px-3 py-2 text-sm">{fmtDate(s.date)}</td>
                      <td className="px-3 py-2 text-sm">{s.start_time}{s.end_time ? `–${s.end_time}` : ""}</td>
                      <td className="px-3 py-2 text-sm">{s.location || w?.location_default || "—"}</td>
                      <td className="px-3 py-2 text-sm">{s.capacity}</td>
                      <td className="px-3 py-2 text-sm">{s.spots_booked}</td>
                      <td className="px-3 py-2 text-sm">£{Number(s.price_per_guest ?? w?.price_per_guest ?? 0).toFixed(0)}</td>
                      <td className="px-3 py-2 text-sm">{s.active ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => setEditingSession({ ...s })} className="text-[#7A7A7A] hover:text-[#1A1A1A] mr-2" data-testid={`sessions-edit-${s.id}`}><Pencil size={14} /></button>
                        <button onClick={() => removeSession(s.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`sessions-delete-${s.id}`}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === BOOKINGS === */}
      {tab === "bookings" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2EFEB]">
              <tr>
                {["Created", "Workshop", "Date", "Name", "Email", "Phone", "Guests", "Dietary", "Payment", "Paid", "Balance", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left accent-label">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (<tr><td colSpan={12} className="px-4 py-8 text-center text-sm text-[#7A7A7A]">No bookings yet.</td></tr>)}
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-[#E5E5E5]" data-testid={`bookings-row-${b.id}`}>
                  <td className="px-3 py-2 text-xs text-[#7A7A7A]">{b.created_at?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-sm">{b.workshop_name}</td>
                  <td className="px-3 py-2 text-sm">{(b.session_id && sessions.find((s) => s.id === b.session_id)?.date) || "—"}</td>
                  <td className="px-3 py-2 text-sm">{b.name}</td>
                  <td className="px-3 py-2 text-sm">{b.email}</td>
                  <td className="px-3 py-2 text-sm">{b.phone}</td>
                  <td className="px-3 py-2 text-sm">{b.guests}</td>
                  <td className="px-3 py-2 text-xs max-w-[180px] truncate" title={b.dietary_requirements}>{b.dietary_requirements || "—"}</td>
                  <td className="px-3 py-2 text-xs">{b.payment_choice}</td>
                  <td className="px-3 py-2 text-sm">£{Number(b.amount_paid).toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm">£{Number(b.balance_due_on_day).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${b.payment_status === "paid" ? "bg-[#C4CFC0]" : "bg-[#F2EFEB] text-[#7A7A7A]"}`}>{b.payment_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Edit workshop modal === */}
      {editingWorkshop && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditingWorkshop(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={saveWorkshop} className="bg-white max-w-2xl w-full p-6 md:p-8 max-h-[95vh] overflow-y-auto" data-testid="workshops-edit-form">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-heading text-xl">{editingWorkshop.id ? "Edit workshop" : "Add workshop"}</h4>
              <button type="button" onClick={() => setEditingWorkshop(null)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Slug (URL)"><Input value={editingWorkshop.slug} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, slug: e.target.value })} placeholder="christmas-wreath" className="light-input rounded-none" data-testid="workshops-form-slug" /></Field>
              <Field label="Name"><Input value={editingWorkshop.name} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, name: e.target.value })} className="light-input rounded-none" data-testid="workshops-form-name" /></Field>
              <Field label="Tag (badge)"><Input value={editingWorkshop.tag} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, tag: e.target.value })} className="light-input rounded-none" /></Field>
              <Field label="Season label"><Input value={editingWorkshop.season} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, season: e.target.value })} className="light-input rounded-none" /></Field>
              <div className="md:col-span-2"><Field label="Short description (card)"><Textarea rows={2} value={editingWorkshop.short_description} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, short_description: e.target.value })} className="light-input rounded-none" /></Field></div>
              <div className="md:col-span-2"><Field label="Full description (detail page)"><Textarea rows={4} value={editingWorkshop.description} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, description: e.target.value })} className="light-input rounded-none" /></Field></div>
              <div className="md:col-span-2"><Field label="Includes (one per line)"><Textarea rows={3} value={editingWorkshop.includes} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, includes: e.target.value })} className="light-input rounded-none" placeholder="All materials\nMulled wine\nWreath box" /></Field></div>
              <Field label="Duration"><Input value={editingWorkshop.duration} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, duration: e.target.value })} className="light-input rounded-none" /></Field>
              <Field label="Group size"><Input value={editingWorkshop.group_size} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, group_size: e.target.value })} className="light-input rounded-none" /></Field>
              <div className="md:col-span-2"><Field label="Default location"><Input value={editingWorkshop.location_default} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, location_default: e.target.value })} className="light-input rounded-none" /></Field></div>
              <div className="md:col-span-2"><Field label="Hero image URL"><Input value={editingWorkshop.image_url} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, image_url: e.target.value })} className="light-input rounded-none" /></Field></div>
              <Field label="Price per guest (£)"><Input type="number" step="0.01" value={editingWorkshop.price_per_guest} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, price_per_guest: e.target.value })} className="light-input rounded-none" data-testid="workshops-form-price" /></Field>
              <Field label="Deposit per guest (£)"><Input type="number" step="0.01" value={editingWorkshop.deposit_amount} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, deposit_amount: e.target.value })} className="light-input rounded-none" data-testid="workshops-form-deposit" /></Field>
              <Field label="Full-pay discount %"><Input type="number" step="0.1" value={editingWorkshop.full_payment_discount_pct} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, full_payment_discount_pct: e.target.value })} className="light-input rounded-none" /></Field>
              <Field label="Sort order"><Input type="number" value={editingWorkshop.sort_order} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, sort_order: e.target.value })} className="light-input rounded-none" /></Field>
              <div className="md:col-span-2"><Field label="Cancellation policy"><Textarea rows={2} value={editingWorkshop.cancellation_policy} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, cancellation_policy: e.target.value })} className="light-input rounded-none" /></Field></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingWorkshop.active} onChange={(e) => setEditingWorkshop({ ...editingWorkshop, active: e.target.checked })} />
                <span className="font-body text-xs text-[#1A1A1A]">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="workshops-form-save">{saving ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEditingWorkshop(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* === Edit session modal === */}
      {editingSession && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditingSession(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={saveSession} className="bg-white max-w-lg w-full p-6 md:p-8" data-testid="sessions-edit-form">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-heading text-xl">{editingSession.id ? "Edit session" : "Add session"}</h4>
              <button type="button" onClick={() => setEditingSession(null)}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <Field label="Workshop">
                <select value={editingSession.workshop_id} onChange={(e) => setEditingSession({ ...editingSession, workshop_id: e.target.value })} className="light-input rounded-none h-10 px-3 w-full" data-testid="sessions-form-workshop">
                  {workshops.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
              <Field label="Date"><Input type="date" value={editingSession.date} onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })} className="light-input rounded-none" data-testid="sessions-form-date" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start time"><Input type="time" value={editingSession.start_time} onChange={(e) => setEditingSession({ ...editingSession, start_time: e.target.value })} className="light-input rounded-none" /></Field>
                <Field label="End time"><Input type="time" value={editingSession.end_time} onChange={(e) => setEditingSession({ ...editingSession, end_time: e.target.value })} className="light-input rounded-none" /></Field>
              </div>
              <Field label="Location (override)"><Input value={editingSession.location} onChange={(e) => setEditingSession({ ...editingSession, location: e.target.value })} placeholder="Leave blank to use workshop default" className="light-input rounded-none" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Capacity"><Input type="number" value={editingSession.capacity} onChange={(e) => setEditingSession({ ...editingSession, capacity: e.target.value })} className="light-input rounded-none" data-testid="sessions-form-capacity" /></Field>
                <Field label="Already booked"><Input type="number" value={editingSession.spots_booked} onChange={(e) => setEditingSession({ ...editingSession, spots_booked: e.target.value })} className="light-input rounded-none" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price override (£)"><Input type="number" step="0.01" value={editingSession.price_per_guest ?? ""} onChange={(e) => setEditingSession({ ...editingSession, price_per_guest: e.target.value })} placeholder="Blank = use workshop default" className="light-input rounded-none" /></Field>
                <Field label="Deposit override (£)"><Input type="number" step="0.01" value={editingSession.deposit_amount ?? ""} onChange={(e) => setEditingSession({ ...editingSession, deposit_amount: e.target.value })} placeholder="Blank = workshop default" className="light-input rounded-none" /></Field>
              </div>
              <Field label="Notes"><Textarea rows={2} value={editingSession.notes} onChange={(e) => setEditingSession({ ...editingSession, notes: e.target.value })} className="light-input rounded-none" /></Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingSession.active} onChange={(e) => setEditingSession({ ...editingSession, active: e.target.checked })} />
                <span className="font-body text-xs text-[#1A1A1A]">Active (visible to customers)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="sessions-form-save">{saving ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEditingSession(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-[#1A1A1A] text-sm">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

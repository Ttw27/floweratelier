import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUBTYPES = [
  { id: "treat", label: "Treats (teddies / chocolates / drinks)" },
  { id: "candle", label: "Candles" },
  { id: "jewellery_box", label: "Jewellery boxes" },
];

const empty = (sub_type) => ({ name: "", description: "", image_url: "", price: 0, sub_type, sort_order: 0, active: true });

export default function AddonsAdmin() {
  const [filter, setFilter] = useState("treat");
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/addons`, { params: { sub_type: filter, active_only: false } });
      setItems(r.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault();
    if (!editing.name || !editing.image_url) { toast.error("Name and image URL required"); return; }
    setSaving(true);
    const payload = {
      name: editing.name, description: editing.description || "", image_url: editing.image_url,
      price: parseFloat(editing.price) || 0, sub_type: editing.sub_type,
      sort_order: parseInt(editing.sort_order) || 0, active: !!editing.active,
    };
    try {
      if (editing.id) {
        await axios.put(`${API_URL}/api/admin/addons/${editing.id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/admin/addons`, payload);
      }
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this add-on?")) return;
    await axios.delete(`${API_URL}/api/admin/addons/${id}`);
    toast.success("Deleted");
    await load();
  };

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="addons-admin-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Add-ons</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Optional gift extras shown in the send-flow stepper.</p>
        </div>
        <Button onClick={() => setEditing(empty(filter))} className="btn-dark rounded-none" data-testid="addons-add-btn">
          <Plus size={14} className="mr-2" /> Add to {SUBTYPES.find(s => s.id === filter).label.split(" ")[0]}
        </Button>
      </div>

      {/* Sub-type filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SUBTYPES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.18em] border ${filter === s.id ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
            data-testid={`addons-filter-${s.id}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <p className="font-body text-sm text-[#7A7A7A]">Loading…</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.length === 0 && <p className="text-sm text-[#7A7A7A]">No add-ons in this category yet.</p>}
          {items.map((a) => (
            <div key={a.id} className="border border-[#E5E5E5] bg-white" data-testid={`addons-row-${a.id}`}>
              <div className="aspect-square overflow-hidden bg-[#F2EFEB]">
                <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0.4; }} />
              </div>
              <div className="p-3">
                <p className="font-body text-[12px] text-[#1A1A1A] truncate">{a.name}</p>
                <p className="font-body text-[11px] text-[#1A1A1A]">£{a.price.toFixed(2)}</p>
                <p className="font-body text-[11px] text-[#7A7A7A] truncate">{a.active ? "Active" : "Hidden"}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditing({ ...a })} className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid={`addons-edit-${a.id}`}><Pencil size={14} /></button>
                  <button onClick={() => remove(a.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`addons-delete-${a.id}`}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white max-w-lg w-full p-6 md:p-8" data-testid="addons-edit-form">
            <h4 className="font-heading text-xl mb-6">{editing.id ? "Edit add-on" : "Add new"}</h4>
            <div className="space-y-4">
              <Field label="Name"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="light-input rounded-none" data-testid="addons-form-name" /></Field>
              <Field label="Image URL"><Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="light-input rounded-none" data-testid="addons-form-image" /></Field>
              <Field label="Description"><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="light-input rounded-none" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sub-type">
                  <select value={editing.sub_type} onChange={(e) => setEditing({ ...editing, sub_type: e.target.value })} className="light-input rounded-none w-full h-10 px-3" data-testid="addons-form-subtype">
                    {SUBTYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Price (£)"><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="light-input rounded-none" data-testid="addons-form-price" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort order"><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="light-input rounded-none" /></Field>
                <label className="flex items-end gap-2 pb-3">
                  <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} data-testid="addons-form-active" />
                  <span className="font-body text-xs text-[#1A1A1A]">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="addons-form-save">{saving ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEditing(null)}>Cancel</Button>
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

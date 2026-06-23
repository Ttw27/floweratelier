import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const emptyCard = () => ({ name: "", description: "", image_url: "", price: 0, category: "general", sort_order: 0, active: true });

export default function CardsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/cards?active_only=false`);
      setItems(r.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!editing.name || !editing.image_url) { toast.error("Name and image URL required"); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await axios.put(`${API_URL}/api/admin/cards/${editing.id}`, {
          name: editing.name, description: editing.description || "", image_url: editing.image_url,
          price: parseFloat(editing.price) || 0, category: editing.category || "general",
          sort_order: parseInt(editing.sort_order) || 0, active: !!editing.active,
        });
      } else {
        await axios.post(`${API_URL}/api/admin/cards`, {
          name: editing.name, description: editing.description || "", image_url: editing.image_url,
          price: parseFloat(editing.price) || 0, category: editing.category || "general",
          sort_order: parseInt(editing.sort_order) || 0, active: !!editing.active,
        });
      }
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this card?")) return;
    await axios.delete(`${API_URL}/api/admin/cards/${id}`);
    toast.success("Deleted");
    await load();
  };

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="cards-admin-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Greeting cards</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Cards shown in the product page send-flow stepper. Tap a row to edit.</p>
        </div>
        <Button onClick={() => setEditing(emptyCard())} className="btn-dark rounded-none" data-testid="cards-add-btn">
          <Plus size={14} className="mr-2" /> Add card
        </Button>
      </div>

      {loading ? <p className="font-body text-sm text-[#7A7A7A]">Loading…</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.length === 0 && <p className="text-sm text-[#7A7A7A]">No cards yet. Click &ldquo;Add card&rdquo; or run the seed.</p>}
          {items.map((c) => (
            <div key={c.id} className="border border-[#E5E5E5] bg-white" data-testid={`cards-row-${c.id}`}>
              <div className="aspect-square overflow-hidden bg-[#F2EFEB]">
                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0.4; }} />
              </div>
              <div className="p-3">
                <p className="font-body text-[12px] text-[#1A1A1A] truncate">{c.name}</p>
                <p className="font-body text-[11px] text-[#7A7A7A] truncate">{c.category} · {c.active ? "Active" : "Hidden"}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditing({ ...c })} className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid={`cards-edit-${c.id}`}><Pencil size={14} /></button>
                  <button onClick={() => remove(c.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`cards-delete-${c.id}`}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white max-w-lg w-full p-6 md:p-8" data-testid="cards-edit-form">
            <h4 className="font-heading text-xl mb-6">{editing.id ? "Edit card" : "Add card"}</h4>
            <div className="space-y-4">
              <Field label="Name"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="light-input rounded-none" data-testid="cards-form-name" /></Field>
              <Field label="Image URL"><Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="light-input rounded-none" data-testid="cards-form-image" /></Field>
              <Field label="Description"><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="light-input rounded-none" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="light-input rounded-none w-full h-10 px-3" data-testid="cards-form-category">
                    {["general","birthday","thank-you","wedding","sympathy"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Sort order"><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="light-input rounded-none" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (extra, £)"><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="light-input rounded-none" /></Field>
                <label className="flex items-end gap-2 pb-3">
                  <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} data-testid="cards-form-active" />
                  <span className="font-body text-xs text-[#1A1A1A]">Active (shown to customers)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="cards-form-save">{saving ? "Saving…" : "Save"}</Button>
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

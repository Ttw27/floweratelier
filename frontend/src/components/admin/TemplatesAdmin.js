import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import BoxDesigner from "../BoxDesigner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function TemplatesAdmin() {
  const [cats, setCats] = useState([]);
  const [activeCat, setActiveCat] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category editor (inline)
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");

  // Designer for template-mode
  const [designerOpen, setDesignerOpen] = useState(false);
  const [editingTpl, setEditingTpl] = useState(null); // {name, category_id, layers, id?}

  const loadCats = async () => {
    const r = await axios.get(`${API_URL}/api/templates/categories?active_only=false`);
    setCats(r.data || []);
    if (!activeCat && r.data?.[0]) setActiveCat(r.data[0].id);
  };
  const loadTpls = async () => {
    if (!activeCat) { setItems([]); return; }
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/templates`, { params: { category_id: activeCat, active_only: false } });
      setItems(r.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCats(); }, []);
  useEffect(() => { loadTpls(); }, [activeCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const addCategory = async () => {
    if (!newCatName.trim() || !newCatSlug.trim()) { toast.error("Name and slug required"); return; }
    try {
      await axios.post(`${API_URL}/api/admin/template-categories`, { name: newCatName.trim(), slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, "-"), sort_order: cats.length * 10, active: true });
      setNewCatName(""); setNewCatSlug("");
      await loadCats();
      toast.success("Category added");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this category? It must have no templates.")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/template-categories/${id}`);
      await loadCats();
      toast.success("Removed");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const removeTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await axios.delete(`${API_URL}/api/admin/templates/${id}`);
    await loadTpls();
    toast.success("Removed");
  };

  const openNew = () => {
    if (!activeCat) { toast.error("Add a category first"); return; }
    setEditingTpl({ name: "", category_id: activeCat, layers: [] });
    setDesignerOpen(true);
  };
  const openEdit = (t) => {
    setEditingTpl({ id: t.id, name: t.name, category_id: t.category_id, layers: t.layers || [] });
    setDesignerOpen(true);
  };

  const saveTemplate = async (payload) => {
    // payload: { name, category_id, thumbnail_url, layers }
    try {
      if (editingTpl?.id) {
        await axios.put(`${API_URL}/api/admin/templates/${editingTpl.id}`, { ...payload, sort_order: 0, active: true });
      } else {
        await axios.post(`${API_URL}/api/admin/templates`, { ...payload, sort_order: 0, active: true });
      }
      await loadTpls();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    }
  };

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="templates-admin-card">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Design templates</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Pre-built starter layouts shown to customers in the box designer. Customers click → layout pre-loads → they personalise from there.</p>
        </div>
        <Button onClick={openNew} className="btn-dark rounded-none" data-testid="templates-add-btn">
          <Plus size={14} className="mr-2" /> New template
        </Button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <p className="accent-label mb-3"><span className="thin-rule" />Sub-categories</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {cats.map((c) => (
            <div key={c.id} className={`flex items-center gap-1 border ${activeCat === c.id ? "border-[#1A1A1A]" : "border-[#E5E5E5]"}`}>
              <button
                type="button"
                onClick={() => setActiveCat(c.id)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${activeCat === c.id ? "bg-[#1A1A1A] text-white" : "bg-white text-[#1A1A1A]"}`}
                data-testid={`tpl-admin-cat-${c.slug}`}
              >
                {c.name}
              </button>
              <button
                type="button"
                onClick={() => removeCategory(c.id)}
                className={`px-2 py-1.5 ${activeCat === c.id ? "text-white/70 hover:text-white" : "text-[#7A7A7A] hover:text-red-600"}`}
                aria-label={`Remove ${c.name}`}
                data-testid={`tpl-admin-cat-remove-${c.id}`}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <Input value={newCatName} onChange={(e) => { setNewCatName(e.target.value); if (!newCatSlug) setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} placeholder="e.g. New Baby" className="light-input rounded-none" data-testid="tpl-admin-new-cat-name" />
          <Input value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} placeholder="slug" className="light-input rounded-none max-w-[200px]" data-testid="tpl-admin-new-cat-slug" />
          <Button type="button" variant="outline" className="rounded-none" onClick={addCategory} data-testid="tpl-admin-add-cat-btn">Add category</Button>
        </div>
      </div>

      {/* Templates list */}
      {loading ? (
        <p className="font-body text-sm text-[#7A7A7A]">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.length === 0 && <p className="text-sm text-[#7A7A7A] col-span-full">No templates yet — click &ldquo;New template&rdquo;.</p>}
          {items.map((t) => (
            <div key={t.id} className="border border-[#E5E5E5]" data-testid={`tpl-admin-row-${t.id}`}>
              <div className="aspect-[10/7] bg-[#F2EFEB] overflow-hidden">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#B3A89B] italic">No preview</div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-body text-[12px] text-[#1A1A1A] truncate">{t.name}</p>
                  <p className="font-body text-[11px] text-[#7A7A7A]">{(t.layers || []).length} elements</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => openEdit(t)} className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid={`tpl-admin-edit-${t.id}`}><Pencil size={14} /></button>
                  <button onClick={() => removeTemplate(t.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`tpl-admin-delete-${t.id}`}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BoxDesigner
        open={designerOpen}
        templateMode
        categories={cats}
        initialLayers={editingTpl?.layers}
        initialName={editingTpl?.name}
        initialBg="#F2EFEB"
        onClose={() => setDesignerOpen(false)}
        onSave={saveTemplate}
      />
    </div>
  );
}

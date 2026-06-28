import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Upload, Star } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { value: "wedding",            label: "Weddings" },
  { value: "traveller_wedding",  label: "Traveller Weddings" },
  { value: "faith_wedding",      label: "Faith Weddings" },
  { value: "sympathy",           label: "Sympathy" },
  { value: "traveller_funeral",  label: "Traveller Funerals" },
  { value: "corporate",          label: "Corporate" },
  { value: "hotels",             label: "Hotels & Hospitality" },
  { value: "restaurants",        label: "Restaurants & Members' Clubs" },
  { value: "house",              label: "House Installs" },
  { value: "shop_front",         label: "Shop Front Installs" },
  { value: "in_shop_display",   label: "In-Shop Displays" },
  { value: "film_tv",            label: "Film / TV / Photoshoot" },
  { value: "workshop",           label: "Workshops" },
];

const empty = () => ({
  title: "", category: "wedding", description: "",
  image: "", location: "", price_from: "",
  tags: "", featured: false,
});

export default function PortfolioAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const r = await axios.get(`${API_URL}/api/admin/portfolio`);
      setItems(r.data || []);
    } catch (err) { toast.error("Could not load portfolio"); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const it = editing;
    if (!it.title || !it.image) { toast.error("Title and image are required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: it.title, category: it.category, description: it.description || "",
        image: it.image, location: it.location || null,
        price_from: it.price_from === "" || it.price_from === null ? null : parseFloat(it.price_from),
        tags: typeof it.tags === "string"
          ? it.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : (it.tags || []),
        featured: !!it.featured,
      };
      if (it.id) await axios.put(`${API_URL}/api/admin/portfolio/${it.id}`, payload);
      else await axios.post(`${API_URL}/api/admin/portfolio`, payload);
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (err) { toast.error(err.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this portfolio item?")) return;
    try { await axios.delete(`${API_URL}/api/admin/portfolio/${id}`); toast.success("Deleted"); await load(); }
    catch (err) { toast.error(err.response?.data?.detail || "Delete failed"); }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await axios.post(`${API_URL}/api/uploads/image?folder=portfolio`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url = r.data.url || r.data.image_url || r.data.image;
      if (!url) throw new Error("Upload returned no URL");
      setEditing((e) => ({ ...e, image: url }));
      toast.success("Image uploaded");
    } catch (err) { toast.error(err.response?.data?.detail || "Upload failed"); }
    finally { setUploading(false); }
  };

  const filtered = filter ? items.filter((i) => i.category === filter) : items;
  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filter]);          // reset when filter changes
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="portfolio-admin-card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Portfolio</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Upload &amp; manage bespoke project imagery across all services.</p>
        </div>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="light-input rounded-none h-10 px-3" data-testid="portfolio-filter">
            <option value="">All categories ({items.length})</option>
            {CATEGORIES.map((c) => {
              const n = items.filter((i) => i.category === c.value).length;
              return <option key={c.value} value={c.value}>{c.label} ({n})</option>;
            })}
          </select>
          <Button onClick={() => setEditing(empty())} className="btn-dark rounded-none" data-testid="portfolio-add-btn">
            <Plus size={14} className="mr-2" /> Add item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 && <p className="text-sm text-[#7A7A7A] col-span-full">No portfolio items. Click &ldquo;Add item&rdquo; to upload one.</p>}
        {pageItems.map((i) => (
          <div key={i.id} className="border border-[#E5E5E5] bg-white" data-testid={`portfolio-row-${i.id}`}>
            <div className="aspect-[4/3] bg-[#F2EFEB] relative overflow-hidden">
              {i.image && <img src={i.image} alt={i.title} className="w-full h-full object-cover" />}
              {i.featured && (
                <span className="absolute top-2 left-2 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 inline-flex items-center gap-1">
                  <Star size={9} fill="white" stroke="none" /> Featured
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-body text-[12px] text-[#1A1A1A] truncate">{i.title}</p>
              <p className="font-body text-[11px] text-[#7A7A7A] truncate">{CATEGORIES.find((c) => c.value === i.category)?.label || i.category}{i.location ? ` · ${i.location}` : ""}</p>
              {i.price_from != null && <p className="font-body text-[11px] text-[#1A1A1A]">from £{Number(i.price_from).toFixed(0)}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setEditing({ ...i, tags: (i.tags || []).join(", ") })}
                  className="text-[#7A7A7A] hover:text-[#1A1A1A]"
                  data-testid={`portfolio-edit-${i.id}`}
                ><Pencil size={14} /></button>
                <button onClick={() => remove(i.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`portfolio-delete-${i.id}`}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between flex-wrap gap-3" data-testid="portfolio-pagination">
          <p className="font-body text-xs text-[#7A7A7A]">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-[#E5E5E5] text-[11px] uppercase tracking-[0.18em] disabled:opacity-30" data-testid="portfolio-page-prev">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .map((n, idx, arr) => (
                <span key={n} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-[#7A7A7A]">…</span>}
                  <button onClick={() => setPage(n)} className={`px-3 py-1.5 border text-[11px] uppercase tracking-[0.18em] ${page === n ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#E5E5E5] text-[#1A1A1A]"}`} data-testid={`portfolio-page-${n}`}>{n}</button>
                </span>
              ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-[#E5E5E5] text-[11px] uppercase tracking-[0.18em] disabled:opacity-30" data-testid="portfolio-page-next">Next</button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white max-w-2xl w-full p-6 md:p-8 max-h-[95vh] overflow-y-auto" data-testid="portfolio-edit-form">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-heading text-xl">{editing.id ? "Edit portfolio item" : "Add portfolio item"}</h4>
              <button type="button" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <Label className="text-sm text-[#1A1A1A]">Image *</Label>
                {editing.image ? (
                  <div className="mt-2 relative border border-[#E5E5E5]">
                    <img src={editing.image} alt="" className="w-full max-h-72 object-contain bg-[#F2EFEB]" />
                    <button type="button" onClick={() => setEditing({ ...editing, image: "" })} className="absolute top-2 right-2 bg-white border border-[#E5E5E5] px-2 py-0.5 text-[10px] uppercase tracking-wider" data-testid="portfolio-form-image-clear">Replace</button>
                  </div>
                ) : (
                  <div className="mt-2 border-2 border-dashed border-[#E5E5E5] p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileRef}
                      className="hidden"
                      onChange={(e) => uploadImage(e.target.files?.[0])}
                      data-testid="portfolio-form-image-input"
                    />
                    <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-dark rounded-none" data-testid="portfolio-form-upload">
                      <Upload size={14} className="mr-2" /> {uploading ? "Uploading…" : "Upload image"}
                    </Button>
                    <p className="text-[11px] text-[#7A7A7A] mt-3">…or paste a URL below</p>
                    <Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://…" className="light-input rounded-none mt-2" data-testid="portfolio-form-image-url" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Title *</Label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="light-input rounded-none mt-2" data-testid="portfolio-form-title" />
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Category *</Label>
                  <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="light-input rounded-none h-10 px-3 mt-2 w-full" data-testid="portfolio-form-category">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Location</Label>
                  <Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="e.g. Stoneygate, Leicester" className="light-input rounded-none mt-2" data-testid="portfolio-form-location" />
                </div>
                <div>
                  <Label className="text-sm text-[#1A1A1A]">Price from (£)</Label>
                  <Input type="number" step="0.01" value={editing.price_from ?? ""} onChange={(e) => setEditing({ ...editing, price_from: e.target.value })} placeholder="optional" className="light-input rounded-none mt-2" data-testid="portfolio-form-price" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-[#1A1A1A]">Description</Label>
                <Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="light-input rounded-none mt-2" data-testid="portfolio-form-description" />
              </div>

              <div>
                <Label className="text-sm text-[#1A1A1A]">Tags <span className="text-[#7A7A7A] text-xs">(comma separated)</span></Label>
                <Input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="garden roses, archway, summer" className="light-input rounded-none mt-2" data-testid="portfolio-form-tags" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} data-testid="portfolio-form-featured" />
                <span className="font-body text-sm text-[#1A1A1A]">Featured (appears in mini-portfolio strips on landing pages)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={saving || !editing.image} className="btn-dark rounded-none" data-testid="portfolio-form-save">
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

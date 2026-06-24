import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PRESET_PATHS = [
  { path: "/", label: "Homepage" },
  { path: "/collection", label: "Collection" },
  { path: "/weddings", label: "Weddings" },
  { path: "/traveller-weddings", label: "Traveller Weddings" },
  { path: "/faith-weddings", label: "Faith Weddings" },
  { path: "/sympathy", label: "Sympathy" },
  { path: "/traveller-funerals", label: "Traveller Funerals" },
  { path: "/corporate", label: "Corporate" },
  { path: "/house-installs", label: "House Installs" },
  { path: "/shop-front-installs", label: "Shop-Front Installs" },
  { path: "/in-shop-displays", label: "In-Shop Displays" },
  { path: "/film-tv-photoshoot", label: "Film, TV & Photoshoot" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/consultation", label: "Consultation" },
];

const empty = (path = "") => ({
  path, title: "", description: "", keywords: "", og_image: "",
  canonical: "", robots: "index,follow",
});

export default function SEOAdmin() {
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/seo`);
      setPages(r.data || []);
    } catch (e) {
      toast.error("Could not load SEO pages");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (path) => {
    const existing = pages.find((p) => p.path === path);
    setEditing(existing ? { ...existing } : empty(path));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing.path || !editing.path.startsWith("/")) {
      toast.error("Path must start with /");
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/admin/seo`, editing);
      toast.success("SEO saved");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async (path) => {
    if (!window.confirm(`Remove SEO for ${path}? It will fall back to defaults.`)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/seo`, { params: { path } });
      toast.success("Removed");
      await load();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const isOverridden = (path) => pages.some((p) => p.path === path);

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="seo-admin-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Per-page SEO</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Override the title, description, OG image and canonical URL for any route. Pages without an override use the site defaults set under <span className="italic">Settings → SEO defaults</span>.</p>
        </div>
        <Button onClick={() => setEditing(empty())} className="btn-dark rounded-none" data-testid="seo-add-btn">
          <Plus size={14} className="mr-2" /> New page
        </Button>
      </div>

      {loading ? (
        <p className="font-body text-sm text-[#7A7A7A]">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[#E5E5E5] uppercase text-[10px] tracking-[0.22em] text-[#7A7A7A]">
                <th className="py-3 pr-4">Page</th>
                <th className="py-3 pr-4">Path</th>
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4 hidden md:table-cell">Description</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PRESET_PATHS.map((p) => {
                const row = pages.find((x) => x.path === p.path);
                const overridden = !!row;
                return (
                  <tr key={p.path} className="border-b border-[#F0F0F0]" data-testid={`seo-row-${p.path}`}>
                    <td className="py-3 pr-4 font-body text-[#1A1A1A]">{p.label}</td>
                    <td className="py-3 pr-4 font-body text-xs text-[#7A7A7A]">{p.path}</td>
                    <td className="py-3 pr-4 font-body text-[#1A1A1A] max-w-[260px] truncate">{row?.title || <span className="text-[#B3A89B] italic">(default)</span>}</td>
                    <td className="py-3 pr-4 hidden md:table-cell font-body text-[#7A7A7A] max-w-[320px] truncate">{row?.description || "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider ${overridden ? "bg-[#1A1A1A] text-white" : "bg-[#F0F0F0] text-[#7A7A7A]"}`}>
                        {overridden ? "Custom" : "Default"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button onClick={() => startEdit(p.path)} className="text-[#7A7A7A] hover:text-[#1A1A1A] mr-3" data-testid={`seo-edit-${p.path}`}>
                        <Pencil size={14} />
                      </button>
                      {overridden && (
                        <button onClick={() => remove(p.path)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`seo-delete-${p.path}`}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* Custom paths not in preset */}
              {pages.filter(p => !PRESET_PATHS.find(x => x.path === p.path)).map((p) => (
                <tr key={p.path} className="border-b border-[#F0F0F0]">
                  <td className="py-3 pr-4 font-body text-[#1A1A1A] italic">Custom</td>
                  <td className="py-3 pr-4 font-body text-xs text-[#7A7A7A]">{p.path}</td>
                  <td className="py-3 pr-4 font-body text-[#1A1A1A] max-w-[260px] truncate">{p.title || "—"}</td>
                  <td className="py-3 pr-4 hidden md:table-cell font-body text-[#7A7A7A] max-w-[320px] truncate">{p.description || "—"}</td>
                  <td className="py-3 pr-4"><span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white">Custom</span></td>
                  <td className="py-3 pr-4 text-right">
                    <button onClick={() => setEditing({ ...p })} className="text-[#7A7A7A] hover:text-[#1A1A1A] mr-3"><Pencil size={14} /></button>
                    <button onClick={() => remove(p.path)} className="text-[#7A7A7A] hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-2xl w-full p-6 md:p-8 my-8"
            data-testid="seo-edit-form"
          >
            <h4 className="font-heading text-xl text-[#1A1A1A] mb-6">SEO — {editing.path || "(new)"}</h4>
            <div className="space-y-4">
              <div>
                <Label className="accent-label">Path</Label>
                <Input
                  value={editing.path}
                  onChange={(e) => setEditing({ ...editing, path: e.target.value })}
                  placeholder="/example"
                  className="light-input rounded-none mt-2"
                  data-testid="seo-form-path"
                />
              </div>
              <div>
                <Label className="accent-label">Title <span className="text-[#7A7A7A] normal-case">(50–60 chars ideal)</span></Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="light-input rounded-none mt-2"
                  data-testid="seo-form-title"
                />
                <p className="text-[11px] text-[#7A7A7A] mt-1">{editing.title.length} chars</p>
              </div>
              <div>
                <Label className="accent-label">Meta description <span className="text-[#7A7A7A] normal-case">(140–160 chars ideal)</span></Label>
                <Textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="light-input rounded-none mt-2"
                  data-testid="seo-form-description"
                />
                <p className="text-[11px] text-[#7A7A7A] mt-1">{editing.description.length} chars</p>
              </div>
              <div>
                <Label className="accent-label">Keywords <span className="text-[#7A7A7A] normal-case">(comma separated)</span></Label>
                <Input
                  value={editing.keywords}
                  onChange={(e) => setEditing({ ...editing, keywords: e.target.value })}
                  className="light-input rounded-none mt-2"
                  data-testid="seo-form-keywords"
                  placeholder="luxury florist leicester, midlands weddings, bespoke wedding flowers"
                />
              </div>
              <div>
                <Label className="accent-label">OG image URL</Label>
                <Input
                  value={editing.og_image}
                  onChange={(e) => setEditing({ ...editing, og_image: e.target.value })}
                  className="light-input rounded-none mt-2"
                  placeholder="https://… (1200×630 recommended)"
                  data-testid="seo-form-og"
                />
              </div>
              <div>
                <Label className="accent-label">Canonical URL <span className="text-[#7A7A7A] normal-case">(optional)</span></Label>
                <Input
                  value={editing.canonical}
                  onChange={(e) => setEditing({ ...editing, canonical: e.target.value })}
                  className="light-input rounded-none mt-2"
                  placeholder="https://www.petalsatelier.com/page"
                  data-testid="seo-form-canonical"
                />
              </div>
              <div>
                <Label className="accent-label">Robots</Label>
                <select
                  value={editing.robots}
                  onChange={(e) => setEditing({ ...editing, robots: e.target.value })}
                  className="light-input rounded-none mt-2 w-full h-10 px-3"
                  data-testid="seo-form-robots"
                >
                  <option value="index,follow">index, follow</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="seo-form-save">
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEditing(null)} data-testid="seo-form-cancel">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

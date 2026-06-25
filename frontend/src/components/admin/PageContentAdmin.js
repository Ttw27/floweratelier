import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, X, Upload, Trash2, GripVertical } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Pages CURRENTLY rendering this CMS content. Other seeded slugs remain editable
// but their hardcoded copy is still live until they're wired in the next release.
const LIVE_SLUGS = new Set(["weddings", "sympathy", "corporate"]);

export default function PageContentAdmin() {
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const heroFileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/page-content`);
      setPages(r.data || []);
    } catch (err) { toast.error("Could not load page content"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const seedNow = async () => {
    if (!window.confirm("Seed initial content for the 10 service pages? (skips any already present)")) return;
    try {
      const r = await axios.post(`${API_URL}/api/seed/page-content`);
      toast.success(`Pages: ${r.data.total} · newly inserted: ${r.data.inserted}`);
      await load();
    } catch (err) { toast.error(err.response?.data?.detail || "Seed failed"); }
  };

  const save = async (e) => {
    e.preventDefault();
    const p = editing;
    if (!p.slug) { toast.error("Slug is required"); return; }
    setSaving(true);
    try {
      const payload = {
        slug: p.slug, label: p.label || p.slug,
        hero_eyebrow: p.hero_eyebrow || "",
        hero_title_line1: p.hero_title_line1 || "",
        hero_title_italic: p.hero_title_italic || "",
        hero_title_line2: p.hero_title_line2 || "",
        hero_subheading: p.hero_subheading || "",
        hero_image: p.hero_image || "",
        hero_cta_label: p.hero_cta_label || "",
        hero_cta_url: p.hero_cta_url || "",
        tiers: (p.tiers || []).map((t, i) => ({
          title: t.title || "",
          description: t.description || "",
          price_label: t.price_label || "",
          image_url: t.image_url || "",
          sort_order: typeof t.sort_order === "number" ? t.sort_order : i * 10,
        })),
        active: p.active !== false,
      };
      await axios.put(`${API_URL}/api/admin/page-content/${p.slug}`, payload);
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (err) { toast.error(err.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const uploadFor = async (key, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setUploading((s) => ({ ...s, [key]: true }));
    const fd = new FormData(); fd.append("file", file);
    try {
      const r = await axios.post(`${API_URL}/api/uploads/image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url = r.data.url || r.data.image_url || r.data.image;
      if (!url) throw new Error("No URL returned");
      setEditing((e) => {
        if (key === "hero") return { ...e, hero_image: url };
        const i = parseInt(key.replace("tier-", ""), 10);
        const tiers = [...(e.tiers || [])];
        tiers[i] = { ...tiers[i], image_url: url };
        return { ...e, tiers };
      });
      toast.success("Image uploaded");
    } catch (err) { toast.error(err.response?.data?.detail || "Upload failed"); }
    finally { setUploading((s) => ({ ...s, [key]: false })); }
  };

  const addTier = () => setEditing((e) => ({ ...e, tiers: [...(e.tiers || []), { title: "", description: "", price_label: "", image_url: "", sort_order: (e.tiers?.length || 0) * 10 }] }));
  const removeTier = (i) => setEditing((e) => ({ ...e, tiers: e.tiers.filter((_, idx) => idx !== i) }));
  const moveTier = (i, dir) => setEditing((e) => {
    const arr = [...e.tiers];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return e;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...e, tiers: arr };
  });

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8" data-testid="page-content-admin-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Service Pages</h3>
          <p className="font-body text-sm text-[#7A7A7A] mt-1">Edit hero copy, hero image and tier pricing for each service page.</p>
        </div>
        <Button onClick={seedNow} variant="outline" className="rounded-none" data-testid="page-content-seed-btn">Seed starter</Button>
      </div>

      {loading ? (
        <p className="text-sm text-[#7A7A7A]">Loading…</p>
      ) : pages.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-[#1A1A1A] mb-4">No pages yet — click &ldquo;Seed starter&rdquo; to populate the 10 service pages with editable copy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <div key={p.id} className="border border-[#E5E5E5] bg-white p-4" data-testid={`page-content-row-${p.slug}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-heading text-lg text-[#1A1A1A] truncate">{p.label || p.slug}</p>
                  <p className="font-body text-[11px] text-[#7A7A7A] truncate">/{p.slug} · {(p.tiers || []).length} tier{(p.tiers || []).length === 1 ? "" : "s"}</p>
                </div>
                {LIVE_SLUGS.has(p.slug) ? (
                  <span className="font-body text-[9px] uppercase tracking-[0.18em] bg-[#C4CFC0] px-2 py-0.5 shrink-0">Live</span>
                ) : (
                  <span className="font-body text-[9px] uppercase tracking-[0.18em] bg-[#F2EFEB] text-[#7A7A7A] px-2 py-0.5 shrink-0" title="Editable here — page still uses hardcoded copy until wired (next release)">Editable</span>
                )}
              </div>
              <p className="font-body text-xs text-[#7A7A7A] line-clamp-2 min-h-[2.5rem]">{p.hero_subheading}</p>
              <button
                onClick={() => setEditing(JSON.parse(JSON.stringify(p)))}
                className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#1A1A1A] underline"
                data-testid={`page-content-edit-${p.slug}`}
              >
                <Pencil size={12} /> Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white w-full md:max-w-3xl p-6 md:p-8 md:max-h-[95vh] overflow-y-auto" data-testid="page-content-edit-form">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="accent-label mb-2"><span className="thin-rule" />/{editing.slug}</p>
                <h4 className="font-heading text-2xl text-[#1A1A1A]">{editing.label || editing.slug}</h4>
                {!LIVE_SLUGS.has(editing.slug) && (
                  <p className="font-body text-[11px] text-[#7A7A7A] mt-1">Heads-up: this page still uses its hardcoded copy on the live site. Your edits will be applied in the next release wiring.</p>
                )}
              </div>
              <button type="button" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>

            {/* HERO */}
            <fieldset className="border border-[#E5E5E5] p-5 mb-6">
              <legend className="px-2 accent-label">Hero block</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Eyebrow"><Input value={editing.hero_eyebrow || ""} onChange={(e) => setEditing({ ...editing, hero_eyebrow: e.target.value })} className="light-input rounded-none" data-testid="page-content-form-eyebrow" /></Field>
                <Field label="CTA label"><Input value={editing.hero_cta_label || ""} onChange={(e) => setEditing({ ...editing, hero_cta_label: e.target.value })} className="light-input rounded-none" /></Field>
                <Field label="Title — line 1"><Input value={editing.hero_title_line1 || ""} onChange={(e) => setEditing({ ...editing, hero_title_line1: e.target.value })} className="light-input rounded-none" data-testid="page-content-form-title1" /></Field>
                <Field label="Title — line 2 (optional)"><Input value={editing.hero_title_line2 || ""} onChange={(e) => setEditing({ ...editing, hero_title_line2: e.target.value })} className="light-input rounded-none" /></Field>
                <Field label="Title — italic word">
                  <Input value={editing.hero_title_italic || ""} onChange={(e) => setEditing({ ...editing, hero_title_italic: e.target.value })} placeholder="e.g. bloom." className="light-input rounded-none" />
                </Field>
                <Field label="CTA URL"><Input value={editing.hero_cta_url || ""} onChange={(e) => setEditing({ ...editing, hero_cta_url: e.target.value })} placeholder="/consultation?service=wedding" className="light-input rounded-none" /></Field>
                <div className="md:col-span-2">
                  <Field label="Subheading"><Textarea rows={3} value={editing.hero_subheading || ""} onChange={(e) => setEditing({ ...editing, hero_subheading: e.target.value })} className="light-input rounded-none" data-testid="page-content-form-subheading" /></Field>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#1A1A1A]">Hero image</Label>
                  <div className="mt-2 border border-[#E5E5E5] p-3 flex items-center gap-3">
                    <div className="w-24 h-16 bg-[#F2EFEB] shrink-0 overflow-hidden">
                      {editing.hero_image && <img src={editing.hero_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <Input value={editing.hero_image || ""} onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })} placeholder="https://… or upload below" className="light-input rounded-none" />
                      <div className="mt-2 flex items-center gap-2">
                        <input type="file" accept="image/*" ref={heroFileRef} className="hidden" onChange={(e) => uploadFor("hero", e.target.files?.[0])} data-testid="page-content-form-hero-file" />
                        <button type="button" onClick={() => heroFileRef.current?.click()} disabled={uploading.hero} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] underline" data-testid="page-content-form-hero-upload">
                          <Upload size={12} /> {uploading.hero ? "Uploading…" : "Upload image"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* TIERS */}
            <fieldset className="border border-[#E5E5E5] p-5 mb-6">
              <legend className="px-2 accent-label">Tiers / Services</legend>

              <div className="space-y-4">
                {(editing.tiers || []).map((t, i) => (
                  <div key={i} className="border border-[#E5E5E5] p-4 grid grid-cols-1 md:grid-cols-12 gap-3" data-testid={`page-content-tier-${i}`}>
                    <div className="md:col-span-1 flex md:flex-col items-center justify-center text-[#7A7A7A] gap-1">
                      <button type="button" title="Up"   onClick={() => moveTier(i, -1)} className="hover:text-[#1A1A1A]" aria-label="Move tier up">▲</button>
                      <GripVertical size={14} />
                      <button type="button" title="Down" onClick={() => moveTier(i, +1)} className="hover:text-[#1A1A1A]" aria-label="Move tier down">▼</button>
                    </div>
                    <div className="md:col-span-2">
                      <div className="aspect-[4/3] bg-[#F2EFEB] mb-2 overflow-hidden">{t.image_url && <img src={t.image_url} alt="" className="w-full h-full object-cover" />}</div>
                      <ImageUploader testId={`page-content-tier-${i}-upload`} disabled={uploading[`tier-${i}`]} onChoose={(file) => uploadFor(`tier-${i}`, file)} />
                      <Input value={t.image_url || ""} onChange={(e) => {
                        const tiers = [...editing.tiers]; tiers[i] = { ...t, image_url: e.target.value }; setEditing({ ...editing, tiers });
                      }} placeholder="or paste URL" className="light-input rounded-none mt-2 text-xs h-8" />
                    </div>
                    <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Title"><Input value={t.title} onChange={(e) => { const tiers = [...editing.tiers]; tiers[i] = { ...t, title: e.target.value }; setEditing({ ...editing, tiers }); }} className="light-input rounded-none" data-testid={`page-content-tier-${i}-title`} /></Field>
                      <Field label="Price label"><Input value={t.price_label} onChange={(e) => { const tiers = [...editing.tiers]; tiers[i] = { ...t, price_label: e.target.value }; setEditing({ ...editing, tiers }); }} placeholder="e.g. from £245" className="light-input rounded-none" data-testid={`page-content-tier-${i}-price`} /></Field>
                      <div className="md:col-span-2">
                        <Field label="Description"><Textarea rows={2} value={t.description} onChange={(e) => { const tiers = [...editing.tiers]; tiers[i] = { ...t, description: e.target.value }; setEditing({ ...editing, tiers }); }} className="light-input rounded-none" /></Field>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex md:flex-col items-center justify-center">
                      <button type="button" onClick={() => removeTier(i)} className="text-[#7A7A7A] hover:text-red-600" aria-label="Remove tier" data-testid={`page-content-tier-${i}-remove`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}

                <Button type="button" onClick={addTier} variant="outline" className="rounded-none" data-testid="page-content-tier-add">
                  <Plus size={14} className="mr-2" /> Add tier
                </Button>
              </div>
            </fieldset>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="page-content-form-save">{saving ? "Saving…" : "Save changes"}</Button>
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
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ImageUploader({ testId, disabled, onChoose }) {
  const ref = useRef(null);
  return (
    <>
      <input type="file" accept="image/*" ref={ref} className="hidden" onChange={(e) => onChoose(e.target.files?.[0])} data-testid={testId} />
      <button type="button" onClick={() => ref.current?.click()} disabled={disabled} className="w-full inline-flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.18em] underline">
        <Upload size={11} /> {disabled ? "Uploading…" : "Upload"}
      </button>
    </>
  );
}

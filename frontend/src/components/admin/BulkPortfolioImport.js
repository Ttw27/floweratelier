import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, CheckCircle2, AlertTriangle } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Bulk-add many photos to the portfolio in one go.
 * 1. Choose the photos (and optionally a suggestions.json with category/title/tags per file name).
 * 2. Review everything in a grid — untick, re-categorise, retitle.
 * 3. Import: each photo is uploaded, then added as a new portfolio item. Nothing existing is changed.
 */
export default function BulkPortfolioImport({ categories, onClose, onDone }) {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [showExcluded, setShowExcluded] = useState(true);

  // Free the preview images when the window closes (not on every edit, or the previews would vanish)
  const previewsRef = useRef([]);
  useEffect(() => () => previewsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const pickFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    const manifestFile = files.find((f) => f.name.toLowerCase().endsWith(".json"));
    const images = files.filter((f) => f.type.startsWith("image/"));
    let suggestions = {};
    if (manifestFile) {
      try {
        const data = JSON.parse(await manifestFile.text());
        (Array.isArray(data) ? data : []).forEach((s) => { if (s?.file) suggestions[s.file] = s; });
      } catch {
        toast.error("Couldn't read the suggestions file — you can still fill details in by hand");
      }
    }
    if (!images.length) { toast.error("Please choose some photos"); return; }
    const tooBig = images.filter((f) => f.size > 10 * 1024 * 1024);
    if (tooBig.length) toast.error(`${tooBig.length} photo(s) are over 10MB and were skipped`);
    const fallback = categories[0]?.value || "wedding";
    const next = images
      .filter((f) => f.size <= 10 * 1024 * 1024)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => {
        const s = suggestions[f.name] || {};
        const known = categories.some((c) => c.value === s.category);
        return {
          key: f.name,
          file: f,
          preview: URL.createObjectURL(f),
          include: s.include !== false,
          category: known ? s.category : fallback,
          title: s.title || f.name.replace(/\.[^.]+$/, ""),
          tags: Array.isArray(s.tags) ? s.tags.join(", ") : (s.tags || ""),
          featured: !!s.featured,
          note: s.note || "",
          status: "pending", // pending | uploading | done | error
          error: "",
        };
      });
    previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previewsRef.current = next.map((r) => r.preview);
    setRows(next);
  };

  const update = (key, patch) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const toImport = rows.filter((r) => r.include && r.status !== "done");
  const counts = useMemo(() => {
    const c = {};
    rows.filter((r) => r.include).forEach((r) => { c[r.category] = (c[r.category] || 0) + 1; });
    return c;
  }, [rows]);

  const runImport = async () => {
    if (!toImport.length) return;
    if (!window.confirm(`Add ${toImport.length} photo(s) to the portfolio? They'll appear on the website straight away.`)) return;
    setRunning(true);
    setProgress({ done: 0, total: toImport.length });
    let ok = 0;
    for (const r of toImport) {
      update(r.key, { status: "uploading", error: "" });
      try {
        const fd = new FormData();
        fd.append("file", r.file);
        const up = await axios.post(`${API_URL}/api/uploads/image?folder=portfolio`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        const url = up.data.url || up.data.image_url || up.data.image;
        if (!url) throw new Error("Upload returned no address");
        await axios.post(`${API_URL}/api/admin/portfolio`, {
          title: r.title.trim() || "Untitled",
          category: r.category,
          description: "",
          image: url,
          location: null,
          price_from: null,
          tags: r.tags.split(",").map((t) => t.trim()).filter(Boolean),
          featured: !!r.featured,
        });
        update(r.key, { status: "done" });
        ok += 1;
      } catch (err) {
        update(r.key, { status: "error", error: err.response?.data?.detail || err.message || "Failed" });
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setRunning(false);
    const failed = toImport.length - ok;
    if (failed) toast.error(`${ok} added, ${failed} failed — press Import again to retry the failed ones`);
    else toast.success(`${ok} photo(s) added to the portfolio`);
    onDone?.();
  };

  const visible = showExcluded ? rows : rows.filter((r) => r.include);

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start md:items-center justify-center p-2 md:p-6" data-testid="portfolio-bulk-import">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <div>
            <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Bulk import photos</h3>
            <p className="font-body text-xs text-[#7A7A7A] mt-1">Check each photo's category and title, untick any you don't want, then import.</p>
          </div>
          <button type="button" onClick={() => !running && onClose?.()} aria-label="Close" className="text-[#7A7A7A] hover:text-[#1A1A1A]"><X size={20} /></button>
        </div>

        {rows.length === 0 ? (
          <div className="p-8 text-center">
            <label className="inline-flex flex-col items-center gap-3 border-2 border-dashed border-[#D9D3CB] px-10 py-12 cursor-pointer hover:border-[#1A1A1A]">
              <Upload size={28} className="text-[#B3A89B]" />
              <span className="font-body text-sm text-[#1A1A1A]">Choose photos</span>
              <span className="font-body text-xs text-[#7A7A7A] max-w-sm">
                Select all the photos — and the <strong>suggestions.json</strong> file if you have one, to fill in categories, titles and tags automatically. (Tip: press Cmd+A in the folder to select everything.)
              </span>
              <input type="file" multiple accept="image/*,.json,application/json" className="hidden" onChange={(e) => pickFiles(e.target.files)} data-testid="portfolio-bulk-files" />
            </label>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-[#E5E5E5] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-body text-[#5A5A5A]">
              <span><strong className="text-[#1A1A1A]">{rows.filter((r) => r.include).length}</strong> of {rows.length} selected</span>
              {Object.entries(counts).map(([cat, n]) => (
                <span key={cat}>{categories.find((c) => c.value === cat)?.label || cat}: {n}</span>
              ))}
              <label className="ml-auto inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showExcluded} onChange={(e) => setShowExcluded(e.target.checked)} />
                Show unticked photos
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visible.map((r) => (
                  <div key={r.key} className={`border ${r.include ? "border-[#E5E5E5]" : "border-dashed border-[#D9D3CB] opacity-60"} bg-white`} data-testid={`bulk-row-${r.key}`}>
                    <div className="relative aspect-square bg-[#F2EFEB]">
                      <img src={r.preview} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                      <label className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[11px] font-body inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={r.include} disabled={r.status === "done"} onChange={(e) => update(r.key, { include: e.target.checked })} />
                        Include
                      </label>
                      {r.status === "done" && <span className="absolute top-2 right-2 bg-[#5C7A3F] text-white text-[10px] px-2 py-0.5 inline-flex items-center gap-1"><CheckCircle2 size={11} /> Added</span>}
                      {r.status === "uploading" && <span className="absolute top-2 right-2 bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5">Uploading…</span>}
                      {r.status === "error" && <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5" title={r.error}>Failed</span>}
                    </div>
                    <div className="p-3 space-y-2">
                      {r.note && (
                        <p className="text-[11px] text-[#6B4E00] bg-[#FBF3E7] px-2 py-1 inline-flex gap-1"><AlertTriangle size={12} className="shrink-0 mt-0.5" />{r.note}</p>
                      )}
                      <select value={r.category} onChange={(e) => update(r.key, { category: e.target.value })} disabled={r.status === "done"} className="light-input rounded-none h-9 px-2 w-full text-sm">
                        {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <Input value={r.title} onChange={(e) => update(r.key, { title: e.target.value })} disabled={r.status === "done"} className="light-input rounded-none h-9 text-sm" placeholder="Title" />
                      <Input value={r.tags} onChange={(e) => update(r.key, { tags: e.target.value })} disabled={r.status === "done"} className="light-input rounded-none h-9 text-xs" placeholder="Tags, comma separated" />
                      <label className="inline-flex items-center gap-2 text-[11px] font-body text-[#5A5A5A] cursor-pointer">
                        <input type="checkbox" checked={r.featured} disabled={r.status === "done"} onChange={(e) => update(r.key, { featured: e.target.checked })} />
                        Featured
                      </label>
                      <p className="text-[10px] text-[#B3A89B] truncate">{r.key}</p>
                      {r.status === "error" && <p className="text-[11px] text-red-600">{r.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <p className="font-body text-xs text-[#7A7A7A]">
                {running ? `Importing ${progress.done} of ${progress.total}… please keep this window open.` : "New items are added alongside your existing portfolio — nothing is replaced or removed."}
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-none" disabled={running} onClick={() => setRows([])}>Choose different photos</Button>
                <Button type="button" className="btn-dark rounded-none" disabled={running || !toImport.length} onClick={runImport} data-testid="portfolio-bulk-import-btn">
                  {running ? `Importing ${progress.done}/${progress.total}…` : `Import ${toImport.length} photo${toImport.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

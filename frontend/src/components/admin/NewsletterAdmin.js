import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const fmtDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
};

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/newsletter`);
      setSubscribers(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyAll = async () => {
    const text = subscribers.map((s) => s.email).join(", ");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${subscribers.length} email${subscribers.length === 1 ? "" : "s"}`);
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  };

  const downloadCsv = () => {
    const rows = [["email", "subscribed_at"], ...subscribers.map((s) => [s.email, s.created_at || ""])];
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div data-testid="newsletter-admin">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="font-heading text-2xl font-light text-[#1A1A1A]">Newsletter subscribers</h3>
          <p className="font-body text-sm text-[#7A7A7A]">{loading ? "Loading…" : `${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={copyAll} disabled={!subscribers.length} className="btn-outline-dark rounded-none inline-flex items-center gap-2" data-testid="newsletter-copy-all">
            <Copy size={14} /> Copy all emails
          </Button>
          <Button type="button" onClick={downloadCsv} disabled={!subscribers.length} className="btn-dark rounded-none inline-flex items-center gap-2" data-testid="newsletter-download-csv">
            <Download size={14} /> Download CSV
          </Button>
          <Button type="button" variant="outline" onClick={load} className="rounded-none inline-flex items-center gap-2" data-testid="newsletter-refresh">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2EFEB]">
              <tr>
                {["Email", "Subscribed"].map((h) => <th key={h} className="px-4 py-3 text-left accent-label text-[#1A1A1A]">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {!loading && subscribers.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-8 text-center font-body text-sm text-[#7A7A7A]">No subscribers yet.</td></tr>
              )}
              {subscribers.map((s) => (
                <tr key={s.email} className="border-t border-[#E5E5E5]">
                  <td className="px-4 py-3 font-body text-sm text-[#1A1A1A] break-all">{s.email}</td>
                  <td className="px-4 py-3 font-body text-sm text-[#7A7A7A] whitespace-nowrap">{fmtDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

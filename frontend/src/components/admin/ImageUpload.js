import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * ImageUpload — reusable image upload + URL paste component.
 * Props:
 *   value      — current image URL string
 *   onChange   — called with new URL string
 *   folder     — R2 folder name (e.g. "homepage", "products", "portfolio")
 *   label      — optional label text
 *   aspectClass — optional Tailwind aspect class e.g. "aspect-video" (default: "aspect-[4/3]")
 */
export default function ImageUpload({ value, onChange, folder = "misc", label, aspectClass = "aspect-[4/3]" }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await axios.post(`${API_URL}/api/uploads/image?folder=${folder}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = r.data.url;
      if (!url) throw new Error("No URL returned");
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <p className="font-body text-sm text-[#1A1A1A] mb-2">{label}</p>}
      {value ? (
        <div className="relative border border-[#E5E5E5] group">
          <div className={`${aspectClass} overflow-hidden bg-[#F2EFEB]`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-white text-[#1A1A1A] text-[11px] uppercase tracking-[0.18em] px-3 py-2 flex items-center gap-1.5"
            >
              <Upload size={12} /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-white text-red-500 text-[11px] uppercase tracking-[0.18em] px-3 py-2 flex items-center gap-1.5"
            >
              <X size={12} /> Remove
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-[#E5E5E5] p-6 text-center">
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-[#1A1A1A] text-white rounded-none font-body text-xs uppercase tracking-[0.22em] px-6 py-2 h-auto hover:bg-[#333]"
          >
            <Upload size={13} className="mr-2" />
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
          <p className="font-body text-[11px] text-[#7A7A7A] mt-3">JPG, PNG, WebP · max 10MB</p>
          <p className="font-body text-[11px] text-[#7A7A7A] mt-1">or paste a URL:</p>
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="light-input rounded-none mt-2 text-xs"
          />
        </div>
      )}
      {value && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="light-input rounded-none mt-2 text-xs"
        />
      )}
    </div>
  );
}

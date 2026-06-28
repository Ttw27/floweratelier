import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function HomepageAdmin({ settings, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        homepage_hero_image: settings.homepage_hero_image || "",
        homepage_category1_image: settings.homepage_category1_image || "",
        homepage_category2_image: settings.homepage_category2_image || "",
        homepage_category3_image: settings.homepage_category3_image || "",
        homepage_category4_image: settings.homepage_category4_image || "",
        homepage_subscription_image: settings.homepage_subscription_image || "",
        homepage_bespoke_image: settings.homepage_bespoke_image || "",
        testimonials: settings.testimonials || [
          { quote: "", author: "", location: "" },
        ],
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/settings`, { ...settings, ...form });
      toast.success("Homepage updated");
      if (onSaved) onSaved();
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateTestimonial = (i, field, value) => {
    const updated = form.testimonials.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    );
    setForm({ ...form, testimonials: updated });
  };

  const addTestimonial = () => {
    setForm({
      ...form,
      testimonials: [...form.testimonials, { quote: "", author: "", location: "" }],
    });
  };

  const removeTestimonial = (i) => {
    setForm({
      ...form,
      testimonials: form.testimonials.filter((_, idx) => idx !== i),
    });
  };

  if (!form) return <p className="font-body text-sm text-[#7A7A7A]">Loading...</p>;

  return (
    <div className="bg-white border border-[#E5E5E5] p-8 max-w-4xl">
      <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-2">Homepage</h3>
      <p className="font-body text-sm text-[#7A7A7A] mb-8">
        Manage homepage images and testimonials. Paste any image URL (Unsplash, your own CDN, etc).
      </p>

      <div className="space-y-10">
        {/* Hero image */}
        <section>
          <p className="accent-label mb-4"><span className="thin-rule" />Hero section</p>
          <div>
            <Label className="text-[#1A1A1A] text-sm">Hero image URL</Label>
            {form.homepage_hero_image && (
              <img src={form.homepage_hero_image} alt="Hero preview" className="mt-2 mb-3 h-32 w-full object-cover border border-[#E5E5E5]" />
            )}
            <Input
              value={form.homepage_hero_image}
              onChange={(e) => setForm({ ...form, homepage_hero_image: e.target.value })}
              placeholder="https://..."
              className="light-input rounded-none mt-2"
            />
          </div>
        </section>

        {/* Category grid images */}
        <section className="pt-8 border-t border-[#E5E5E5]">
          <p className="accent-label mb-4"><span className="thin-rule" />Category grid images</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: "homepage_category1_image", label: "Signature Bouquets" },
              { key: "homepage_category2_image", label: "Weddings" },
              { key: "homepage_category3_image", label: "Sympathy" },
              { key: "homepage_category4_image", label: "Bespoke Portfolio" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-[#1A1A1A] text-sm">{label}</Label>
                {form[key] && (
                  <img src={form[key]} alt={label} className="mt-2 mb-2 h-24 w-full object-cover border border-[#E5E5E5]" />
                )}
                <Input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder="https://..."
                  className="light-input rounded-none mt-1"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Other section images */}
        <section className="pt-8 border-t border-[#E5E5E5]">
          <p className="accent-label mb-4"><span className="thin-rule" />Other section images</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: "homepage_subscription_image", label: "Subscription section" },
              { key: "homepage_bespoke_image", label: "Bespoke commissions section" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-[#1A1A1A] text-sm">{label}</Label>
                {form[key] && (
                  <img src={form[key]} alt={label} className="mt-2 mb-2 h-24 w-full object-cover border border-[#E5E5E5]" />
                )}
                <Input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder="https://..."
                  className="light-input rounded-none mt-1"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="pt-8 border-t border-[#E5E5E5]">
          <p className="accent-label mb-4"><span className="thin-rule" />Testimonials</p>
          <div className="space-y-6">
            {form.testimonials.map((t, i) => (
              <div key={i} className="border border-[#E5E5E5] p-6 relative">
                <button
                  onClick={() => removeTestimonial(i)}
                  className="absolute top-4 right-4 text-[#7A7A7A] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#1A1A1A] text-sm">Quote</Label>
                    <Textarea
                      value={t.quote}
                      onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                      placeholder="The quote text..."
                      className="light-input rounded-none mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[#1A1A1A] text-sm">Author</Label>
                      <Input
                        value={t.author}
                        onChange={(e) => updateTestimonial(i, "author", e.target.value)}
                        placeholder="e.g. Eloise & Felix"
                        className="light-input rounded-none mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1A1A] text-sm">Location / Date</Label>
                      <Input
                        value={t.location}
                        onChange={(e) => updateTestimonial(i, "location", e.target.value)}
                        placeholder="e.g. Stoneygate · June 2025"
                        className="light-input rounded-none mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addTestimonial}
              className="flex items-center gap-2 font-body text-xs uppercase tracking-[0.22em] text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors border border-dashed border-[#E5E5E5] px-4 py-3 w-full justify-center"
            >
              <Plus size={14} /> Add testimonial
            </button>
          </div>
        </section>

        <div className="pt-6 border-t border-[#E5E5E5]">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1A1A1A] text-white rounded-none font-body text-xs uppercase tracking-[0.22em] px-8 py-3 h-auto hover:bg-[#333]"
          >
            {saving ? "Saving..." : "Save homepage"}
          </Button>
        </div>
      </div>
    </div>
  );
}

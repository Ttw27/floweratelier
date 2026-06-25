import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, MessageCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP_NUMBER = "447123456789";

export default function WorkshopEnquireModal({ open, workshop, onClose }) {
  const [form, setForm] = useState({ name: "", venue_name: "", email: "", phone: "", target_date: "", guests: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: "", venue_name: "", email: "", phone: "", target_date: "", guests: "", message: "" });
      setSent(false);
    }
  }, [open]);

  if (!open || !workshop) return null;

  const whatsappMsg = encodeURIComponent(workshop.whatsapp_message || `Hello Flower Atelier — I'd like to enquire about ${workshop.name}.`);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error("Name, email & phone are required"); return; }
    setSubmitting(true);
    try {
      const messageBody = [
        `Venue host enquiry — ${workshop.name} (${workshop.slug})`,
        form.venue_name && `Venue: ${form.venue_name}`,
        form.target_date && `Target date: ${form.target_date}`,
        form.guests && `Expected guests: ${form.guests}`,
        form.message && `Notes: ${form.message}`,
      ].filter(Boolean).join("\n");

      await axios.post(`${API_URL}/api/inquiries`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        event_date: form.target_date || null,
        message: messageBody,
        service_type: "workshop_host",
      });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not send — please try WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto" onClick={onClose} data-testid="workshop-enquire-modal">
      <div className="bg-[#FAFAF7] w-full md:max-w-[720px] md:max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-[#E5E5E5] bg-white">
          <div>
            <p className="accent-label text-[10px]"><span className="thin-rule" />{workshop.tag || "Enquire"}</p>
            <h3 className="font-heading text-lg md:text-2xl text-[#1A1A1A]">{workshop.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid="workshop-enquire-close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          {sent ? (
            <div className="text-center py-8" data-testid="workshop-enquire-sent">
              <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto text-[#5C7A3F] mb-4" />
              <h4 className="font-heading text-2xl text-[#1A1A1A] mb-3">Thank you.</h4>
              <p className="font-body text-sm text-[#5A5A5A] mb-6">We&rsquo;ll be in touch within 24 hours with bespoke pricing and the next available dates.</p>
              <Button onClick={onClose} variant="outline" className="rounded-none">Close</Button>
            </div>
          ) : (
            <>
              {workshop.enquire_pitch && (
                <p className="font-body text-sm text-[#5A5A5A] leading-relaxed mb-5">{workshop.enquire_pitch}</p>
              )}

              {workshop.enquire_bullets?.length > 0 && (
                <div className="bg-white border border-[#E5E5E5] p-4 mb-6">
                  <p className="accent-label mb-3"><span className="thin-rule" />The pitch</p>
                  <ul className="space-y-2">
                    {workshop.enquire_bullets.map((b) => (
                      <li key={b} className="flex gap-2 font-body text-sm text-[#1A1A1A]"><span className="text-[#B3A89B] mt-1">·</span><span>{b}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {/* WhatsApp shortcut */}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-testid="workshop-enquire-whatsapp">
                <Button type="button" className="w-full bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-none py-6 mb-5">
                  <MessageCircle size={16} className="mr-2" /> WhatsApp the studio
                </Button>
              </a>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A]">or send a quick brief</span>
                <div className="flex-1 h-px bg-[#E5E5E5]" />
              </div>

              <form onSubmit={submit} className="space-y-4" data-testid="workshop-enquire-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Your name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-enquire-name" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Venue / organisation</Label>
                    <Input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} placeholder="e.g. The Drapers Arms" className="light-input rounded-none mt-2" data-testid="workshop-enquire-venue" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-enquire-email" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Phone *</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-enquire-phone" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Approx. date</Label>
                    <Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="light-input rounded-none mt-2" data-testid="workshop-enquire-date" />
                  </div>
                  <div>
                    <Label className="text-sm text-[#1A1A1A]">Expected guests</Label>
                    <Input value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} placeholder="e.g. 14–20" className="light-input rounded-none mt-2" data-testid="workshop-enquire-guests" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-[#1A1A1A]">Anything else?</Label>
                  <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="light-input rounded-none mt-2" placeholder="Tell us about the room, the audience, and what you'd like the night to feel like." data-testid="workshop-enquire-notes" />
                </div>

                <Button type="submit" disabled={submitting} className="btn-dark rounded-none w-full py-6" data-testid="workshop-enquire-submit">
                  {submitting ? "Sending…" : "Send enquiry"}
                </Button>
                <p className="text-[11px] text-[#7A7A7A] text-center">We&rsquo;ll reply within one working day.</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

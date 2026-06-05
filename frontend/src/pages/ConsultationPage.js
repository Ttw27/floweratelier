import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar, Clock, Phone, Mail, CheckCircle } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ConsultationPage() {
  const [searchParams] = useSearchParams();
  const defaultService = searchParams.get("service") || "";
  const portfolioItemId = searchParams.get("portfolio_item_id") || null;
  const portfolioTitle = searchParams.get("ref_title") || null;

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eventDate, setEventDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", service_type: defaultService,
    budget: "", message: portfolioTitle ? `Interest in: ${portfolioTitle}\n\n` : "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/inquiries`, {
        portfolio_item_id: portfolioItemId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        budget: formData.budget || null,
        message: formData.message,
        service_type: formData.service_type || null,
      });
      setSubmitted(true);
      toast.success("Thank you — we'll be in touch within 24 hours");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit enquiry");
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center py-16" data-testid="consultation-success">
        <div className="max-w-lg mx-auto text-center px-6">
          <div className="w-20 h-20 border border-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-10">
            <CheckCircle size={36} strokeWidth={1.3} className="text-[#1A1A1A]" />
          </div>
          <p className="accent-label mb-6">Received</p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] mb-6 tracking-tight">Thank you</h1>
          <p className="font-body text-[#7A7A7A] mb-10 leading-relaxed">
            Your enquiry has reached the atelier. Our team will review it personally
            and respond within 24 hours to arrange a conversation.
          </p>
          <div className="space-y-2 font-body text-sm text-[#7A7A7A]">
            <p className="flex items-center justify-center gap-2"><Phone size={14} strokeWidth={1.3} />020 7123 4567</p>
            <p className="flex items-center justify-center gap-2"><Mail size={14} strokeWidth={1.3} />atelier@petalsatelier.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28" data-testid="consultation-page">
      <section className="py-16 md:py-24 px-6 md:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-6"><span className="thin-rule" />Enquire</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-8 max-w-4xl" data-testid="consultation-title">
            Begin a <span className="italic text-[#B3A89B]">bespoke</span><br />conversation.
          </h1>
          <p className="font-body text-base text-[#7A7A7A] leading-relaxed max-w-2xl">
            Weddings, sympathy, corporate programmes, private residences, or a commissioned piece
            from the portfolio — whatever the occasion, the conversation begins here.
          </p>
          {portfolioTitle && (
            <p className="mt-4 accent-label text-[#1A1A1A]">Reference · {portfolioTitle}</p>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8" data-testid="consultation-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="accent-label text-[#1A1A1A]">Full name *</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} className="mt-2 light-input rounded-none" placeholder="Your name" required data-testid="consultation-name" />
                </div>
                <div>
                  <Label className="accent-label text-[#1A1A1A]">Email *</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-2 light-input rounded-none" placeholder="you@example.com" required data-testid="consultation-email" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="accent-label text-[#1A1A1A]">Phone *</Label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} className="mt-2 light-input rounded-none" placeholder="07123 456789" required data-testid="consultation-phone" />
                </div>
                <div>
                  <Label className="accent-label text-[#1A1A1A]">Service *</Label>
                  <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
                    <SelectTrigger className="mt-2 light-input rounded-none font-body" data-testid="consultation-service">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] rounded-none">
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="sympathy">Sympathy / Funeral</SelectItem>
                      <SelectItem value="corporate">Corporate / Event</SelectItem>
                      <SelectItem value="house">House Install</SelectItem>
                      <SelectItem value="bespoke">Bespoke Commission</SelectItem>
                      <SelectItem value="gift">Gift Bouquet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="accent-label text-[#1A1A1A]">Event date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="mt-2 w-full light-input rounded-none h-10 px-3 text-left flex items-center justify-between font-body text-sm"
                        data-testid="consultation-date"
                      >
                        <span className={eventDate ? "text-[#1A1A1A]" : "text-[#B3A89B]"}>
                          {eventDate ? format(eventDate, "EEEE, d MMMM yyyy") : "Select a date"}
                        </span>
                        <Calendar size={14} strokeWidth={1.3} className="text-[#7A7A7A]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-[#E5E5E5] rounded-none" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="accent-label text-[#1A1A1A]">Budget range</Label>
                  <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                    <SelectTrigger className="mt-2 light-input rounded-none font-body" data-testid="consultation-budget">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] rounded-none">
                      <SelectItem value="500-1500">£500 – £1,500</SelectItem>
                      <SelectItem value="1500-3000">£1,500 – £3,000</SelectItem>
                      <SelectItem value="3000-7500">£3,000 – £7,500</SelectItem>
                      <SelectItem value="7500-15000">£7,500 – £15,000</SelectItem>
                      <SelectItem value="over-15000">£15,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="accent-label text-[#1A1A1A]">Tell us about your vision *</Label>
                <Textarea name="message" value={formData.message} onChange={handleChange} className="mt-2 light-input rounded-none min-h-[180px]" placeholder="The occasion, style, venue, and anything else you'd like us to know…" required data-testid="consultation-message" />
              </div>

              <Button type="submit" disabled={submitting} className="btn-dark w-full py-6 rounded-none" data-testid="consultation-submit">
                {submitting ? "Sending…" : "Send Enquiry"}
              </Button>
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#B3A89B] text-center">Response within 24 hours</p>
            </form>
          </div>

          {/* Info */}
          <div>
            <div className="bg-white border border-[#E5E5E5] p-8 mb-6">
              <p className="accent-label mb-5 text-[#1A1A1A]">What to expect</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Calendar size={16} strokeWidth={1.3} className="text-[#1A1A1A] mt-0.5" />
                  <div>
                    <p className="font-body text-sm text-[#1A1A1A]">Flexible scheduling</p>
                    <p className="font-body text-xs text-[#7A7A7A] mt-1">Atelier, video or phone — at your convenience.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={16} strokeWidth={1.3} className="text-[#1A1A1A] mt-0.5" />
                  <div>
                    <p className="font-body text-sm text-[#1A1A1A]">Complimentary</p>
                    <p className="font-body text-xs text-[#7A7A7A] mt-1">No cost, no obligation, no pressure.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] p-8">
              <p className="accent-label mb-5 text-[#1A1A1A]">Direct</p>
              <div className="space-y-3">
                <a href="tel:+442071234567" className="flex items-center gap-3 font-body text-sm text-[#1A1A1A] hover:text-[#B3A89B] transition-colors"><Phone size={14} strokeWidth={1.3} />020 7123 4567</a>
                <a href="mailto:atelier@petalsatelier.com" className="flex items-center gap-3 font-body text-sm text-[#1A1A1A] hover:text-[#B3A89B] transition-colors"><Mail size={14} strokeWidth={1.3} />atelier@petalsatelier.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

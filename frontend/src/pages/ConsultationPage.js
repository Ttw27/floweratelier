import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Mail, CheckCircle } from "lucide-react";

export default function ConsultationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service_type: "",
    event_date: "",
    budget: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In production, this would send to backend
    console.log("Consultation request:", formData);
    setSubmitted(true);
    toast.success("Thank you! We'll be in touch within 24 hours.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0B0C0B] pt-20 flex items-center justify-center" data-testid="consultation-success">
        <div className="max-w-lg mx-auto text-center px-6">
          <div className="w-20 h-20 bg-[#161A18] border border-[#252825] rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} className="text-[#C5A059]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-light text-[#F4F0E6] mb-4">
            Thank You
          </h1>
          <p className="font-body text-[#A3A6A1] mb-8">
            Your consultation request has been received. Our team will review your requirements 
            and be in touch within 24 hours to arrange a convenient time to discuss your vision.
          </p>
          <div className="space-y-3">
            <p className="font-body text-sm text-[#A3A6A1]">
              <Phone size={16} className="inline mr-2 text-[#C5A059]" />
              01234 567 890
            </p>
            <p className="font-body text-sm text-[#A3A6A1]">
              <Mail size={16} className="inline mr-2 text-[#C5A059]" />
              hello@petalsatelier.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20" data-testid="consultation-page">
      {/* Header */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-b border-[#252825]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
              Book a Consultation
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-[#F4F0E6] mb-6" data-testid="consultation-title">
              Let's Create<br />
              <span className="italic">Something Beautiful</span>
            </h1>
            <p className="font-body text-[#A3A6A1] leading-relaxed">
              Whether you're planning a wedding, corporate event, or have a bespoke 
              requirement, we'd love to discuss your vision. Complete the form below 
              and we'll arrange a consultation at your convenience.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="consultation-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-[#F4F0E6] text-sm">Full Name *</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2 dark-input"
                      placeholder="Your name"
                      required
                      data-testid="consultation-name"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-[#F4F0E6] text-sm">Email *</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 dark-input"
                      placeholder="you@example.com"
                      required
                      data-testid="consultation-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-[#F4F0E6] text-sm">Phone Number *</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2 dark-input"
                      placeholder="07123 456 789"
                      required
                      data-testid="consultation-phone"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-[#F4F0E6] text-sm">Service Type *</Label>
                    <Select 
                      value={formData.service_type} 
                      onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                    >
                      <SelectTrigger className="mt-2 dark-input" data-testid="consultation-service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161A18] border-[#252825]">
                        <SelectItem value="wedding">Wedding Floristry</SelectItem>
                        <SelectItem value="funeral">Sympathy & Funeral</SelectItem>
                        <SelectItem value="event">Corporate/Event</SelectItem>
                        <SelectItem value="gift">Luxury Gift</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-[#F4F0E6] text-sm">Event/Delivery Date</Label>
                    <Input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      className="mt-2 dark-input"
                      data-testid="consultation-date"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-[#F4F0E6] text-sm">Budget Range</Label>
                    <Select 
                      value={formData.budget} 
                      onValueChange={(value) => setFormData({ ...formData, budget: value })}
                    >
                      <SelectTrigger className="mt-2 dark-input" data-testid="consultation-budget">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161A18] border-[#252825]">
                        <SelectItem value="under-500">Under £500</SelectItem>
                        <SelectItem value="500-1000">£500 - £1,000</SelectItem>
                        <SelectItem value="1000-2500">£1,000 - £2,500</SelectItem>
                        <SelectItem value="2500-5000">£2,500 - £5,000</SelectItem>
                        <SelectItem value="over-5000">Over £5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="font-body text-[#F4F0E6] text-sm">Tell Us About Your Vision *</Label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-2 dark-input min-h-[150px]"
                    placeholder="Describe your event, style preferences, venue details, or any specific requirements..."
                    required
                    data-testid="consultation-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-gold w-full text-base py-6"
                  data-testid="consultation-submit"
                >
                  Request Consultation
                </Button>

                <p className="font-body text-xs text-[#A3A6A1] text-center">
                  We'll respond within 24 hours. For urgent enquiries, please call us directly.
                </p>
              </form>
            </div>

            {/* Info */}
            <div className="lg:pl-12">
              <div className="luxury-card p-8 mb-8">
                <h3 className="font-heading text-xl text-[#F4F0E6] mb-6">What to Expect</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-[#C5A059] mt-1" />
                    <div>
                      <p className="font-body text-[#F4F0E6] text-sm mb-1">Flexible Scheduling</p>
                      <p className="font-body text-[#A3A6A1] text-xs">In-person, video call, or phone consultations available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={20} className="text-[#C5A059] mt-1" />
                    <div>
                      <p className="font-body text-[#F4F0E6] text-sm mb-1">No Obligation</p>
                      <p className="font-body text-[#A3A6A1] text-xs">Consultations are complimentary with no pressure</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-8">
                <h3 className="font-heading text-xl text-[#F4F0E6] mb-6">Contact Us Directly</h3>
                <div className="space-y-4">
                  <a href="tel:+441234567890" className="flex items-center gap-3 text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                    <Phone size={18} />
                    <span className="font-body">01234 567 890</span>
                  </a>
                  <a href="mailto:hello@petalsatelier.com" className="flex items-center gap-3 text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                    <Mail size={18} />
                    <span className="font-body">hello@petalsatelier.com</span>
                  </a>
                </div>
              </div>

              {/* Image */}
              <div className="mt-8">
                <img
                  src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600"
                  alt="Floral consultation"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

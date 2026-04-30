import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Calendar, Users, Sparkles } from "lucide-react";

export default function WeddingsPage() {
  const services = [
    {
      title: "Bridal Bouquet",
      description: "Your crowning glory, designed to complement your dress and personal style",
      price: "from £195",
      image: "https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/12a142ed2b28feae7d2b9e1bd97279a7c9bf8aaf7fae184fe9d56aa279456ed3.png"
    },
    {
      title: "Bridesmaids & Flower Girls",
      description: "Coordinated arrangements for your bridal party",
      price: "from £65 each",
      image: "https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/f27037e690ea606fe6fdfcd8e721d768249ffa5685c08d3c2b65680492c5a13e.png"
    },
    {
      title: "Venue Decoration",
      description: "Table centres, ceremony arrangements, and statement installations",
      price: "from £500",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600"
    },
    {
      title: "Buttonholes & Corsages",
      description: "Elegant accessories for the wedding party",
      price: "from £25 each",
      image: "https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20" data-testid="weddings-page">
      {/* Hero */}
      <section 
        className="relative min-h-[70vh] flex items-center"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/12a142ed2b28feae7d2b9e1bd97279a7c9bf8aaf7fae184fe9d56aa279456ed3.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
            Wedding Floristry
          </p>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-[#F4F0E6] mb-6 max-w-3xl" data-testid="weddings-title">
            Your Perfect Day,<br />
            <span className="italic">Blossoming Beautifully</span>
          </h1>
          <p className="font-body text-lg text-[#F4F0E6]/80 mb-8 max-w-xl">
            From intimate ceremonies to grand celebrations, we create bespoke 
            wedding flowers that tell your unique love story.
          </p>
          <Link to="/consultation">
            <Button className="btn-gold text-base" data-testid="book-wedding-consultation">
              Book Wedding Consultation
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#252825]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
              Our Process
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6]">
              How We Work Together
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: "Consultation", desc: "We meet to discuss your vision, venue, and style" },
              { icon: Heart, title: "Design", desc: "We create a bespoke proposal tailored to you" },
              { icon: Sparkles, title: "Creation", desc: "Our florists craft your flowers with care" },
              { icon: Users, title: "Your Day", desc: "We deliver and style, you enjoy your celebration" }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#161A18] border border-[#252825] flex items-center justify-center mx-auto mb-6">
                  <step.icon size={24} className="text-[#C5A059]" />
                </div>
                <p className="font-body text-sm text-[#C5A059] mb-2">Step {idx + 1}</p>
                <h3 className="font-heading text-xl text-[#F4F0E6] mb-2">{step.title}</h3>
                <p className="font-body text-sm text-[#A3A6A1]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
              Wedding Services
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#F4F0E6]">
              Complete Wedding Floristry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="luxury-card overflow-hidden group" data-testid={`wedding-service-${idx}`}>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square image-hover-container">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="font-heading text-2xl text-[#F4F0E6] mb-3 group-hover:text-[#C5A059] transition-colors">
                      {service.title}
                    </h3>
                    <p className="font-body text-sm text-[#A3A6A1] mb-4">{service.description}</p>
                    <p className="font-body text-[#C5A059]">{service.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#121413]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-[#C5A059] mb-4">
            Let's Create Magic
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-light text-[#F4F0E6] mb-6">
            Ready to Discuss Your Wedding Flowers?
          </h2>
          <p className="font-body text-[#A3A6A1] mb-8">
            Book a complimentary consultation to share your vision. We'll guide you 
            through options, discuss your venue, and create a proposal as unique as your love story.
          </p>
          <Link to="/consultation">
            <Button className="btn-gold text-base" data-testid="cta-wedding-consultation">
              Book Your Consultation
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

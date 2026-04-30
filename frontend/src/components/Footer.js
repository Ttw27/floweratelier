import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAF7] border-t border-[#E5E5E5]" data-testid="footer">
      {/* Main Footer */}
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-baseline gap-2 mb-8">
              <span className="font-heading text-3xl font-light text-[#1A1A1A]">Petals</span>
              <span className="font-heading text-3xl font-light italic text-[#B3A89B]">Atelier</span>
            </Link>
            <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-10 max-w-sm">
              Bespoke floral couture for life's most meaningful occasions — weddings, sympathy
              tributes, corporate programmes and private residence installations.
            </p>
            <div className="space-y-3">
              <a href="tel:+442071234567" className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#B3A89B] transition-colors">
                <Phone size={15} strokeWidth={1.3} />
                <span className="font-body text-sm">020 7123 4567</span>
              </a>
              <a href="mailto:atelier@petalsatelier.com" className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#B3A89B] transition-colors">
                <Mail size={15} strokeWidth={1.3} />
                <span className="font-body text-sm">atelier@petalsatelier.com</span>
              </a>
              <div className="flex items-center gap-3 text-[#7A7A7A]">
                <MapPin size={15} strokeWidth={1.3} />
                <span className="font-body text-sm">Mayfair, London</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h4 className="accent-label mb-6 text-[#1A1A1A]">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/collection" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-collection">Bouquets</Link></li>
              <li><Link to="/collection/garden-roses" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Garden Roses</Link></li>
              <li><Link to="/collection/exotics" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Orchids</Link></li>
              <li><Link to="/collection/celebration" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Celebration</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="accent-label mb-6 text-[#1A1A1A]">Services</h4>
            <ul className="space-y-3">
              <li><Link to="/weddings" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-weddings">Weddings</Link></li>
              <li><Link to="/sympathy" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-sympathy">Sympathy</Link></li>
              <li><Link to="/corporate" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-corporate">Corporate Events</Link></li>
              <li><Link to="/house-installs" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-house-installs">House Installs</Link></li>
              <li><Link to="/portfolio" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-portfolio">Bespoke Portfolio</Link></li>
            </ul>
          </div>

          {/* Studio */}
          <div className="lg:col-span-3">
            <h4 className="accent-label mb-6 text-[#1A1A1A]">The Atelier</h4>
            <ul className="space-y-3 mb-8">
              <li><Link to="/consultation" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors" data-testid="footer-consultation">Book a Consultation</Link></li>
              <li><a href="#" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Delivery & Care</a></li>
              <li><a href="#" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Privacy</a></li>
              <li><a href="#" className="font-body text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">Terms</a></li>
            </ul>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#1A1A1A] hover:text-[#B3A89B] transition-colors" data-testid="social-instagram">
                <Instagram size={18} strokeWidth={1.3} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#E5E5E5]">
        <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-body text-[11px] text-[#B3A89B] tracking-wide">
            © 2026 Petals Atelier — London. All rights reserved.
          </p>
          <p className="font-body text-[11px] text-[#B3A89B] tracking-wide italic">
            Floral couture, by hand.
          </p>
        </div>
      </div>

      {/* Large Brand Display */}
      <div className="overflow-hidden py-10 border-t border-[#E5E5E5]">
        <p className="display-serif text-[18vw] md:text-[12vw] text-[#EFE9E1] text-center leading-[0.85] select-none italic">
          Petals Atelier
        </p>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B0C0B] border-t border-[#252825]" data-testid="footer">
      {/* Main Footer */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-heading text-3xl font-light text-[#F4F0E6]">Petals</span>
              <span className="font-heading text-3xl font-light text-[#C5A059] italic ml-2">Atelier</span>
            </Link>
            <p className="font-body text-[#A3A6A1] text-sm leading-relaxed mb-8 max-w-md">
              Bespoke luxury floristry for life's most precious moments. 
              Specialising in wedding flowers, sympathy tributes, and premium 
              gift arrangements crafted with artistry and care.
            </p>
            <div className="space-y-3">
              <a href="tel:+441234567890" className="flex items-center space-x-3 text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                <Phone size={16} />
                <span className="font-body text-sm">01234 567 890</span>
              </a>
              <a href="mailto:hello@petalsatelier.com" className="flex items-center space-x-3 text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                <Mail size={16} />
                <span className="font-body text-sm">hello@petalsatelier.com</span>
              </a>
              <div className="flex items-center space-x-3 text-[#A3A6A1]">
                <MapPin size={16} />
                <span className="font-body text-sm">Kent, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg text-[#F4F0E6] mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/weddings" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors" data-testid="footer-weddings">
                  Wedding Floristry
                </Link>
              </li>
              <li>
                <Link to="/sympathy" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors" data-testid="footer-sympathy">
                  Sympathy & Funerals
                </Link>
              </li>
              <li>
                <Link to="/collection" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors" data-testid="footer-collection">
                  Luxury Bouquets
                </Link>
              </li>
              <li>
                <Link to="/consultation" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors" data-testid="footer-consultation">
                  Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-heading text-lg text-[#F4F0E6] mb-6">Information</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                  Delivery Information
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                  Care Guide
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-sm text-[#A3A6A1] hover:text-[#C5A059] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#252825]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto py-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-body text-xs text-[#A3A6A1]/60">
            © 2024 Petals Atelier. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-[#A3A6A1]/60 hover:text-[#C5A059] transition-colors" data-testid="social-instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="text-[#A3A6A1]/60 hover:text-[#C5A059] transition-colors" data-testid="social-facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Large Brand Text */}
      <div className="overflow-hidden py-12 border-t border-[#252825]">
        <p className="font-heading text-[12vw] md:text-[8vw] text-[#252825] text-center leading-none select-none">
          Petals Atelier
        </p>
      </div>
    </footer>
  );
}

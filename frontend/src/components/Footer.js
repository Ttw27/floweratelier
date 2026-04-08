import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#233520] text-white py-16 md:py-20" data-testid="footer">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="font-heading text-3xl font-light text-white tracking-tight">
                Petals
              </span>
              <span className="font-accent text-xl text-[#F2CFC0] ml-2">online</span>
            </Link>
            <p className="font-body text-white/70 text-sm leading-relaxed mb-6">
              Beautiful flowers delivered with care. Bringing joy to your doorstep since 2020.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-[#F2CFC0] transition-colors" data-testid="social-instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-[#F2CFC0] transition-colors" data-testid="social-facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-[#F2CFC0] transition-colors" data-testid="social-twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-lg mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/flowers" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm" data-testid="footer-all-flowers">
                  All Flowers
                </Link>
              </li>
              <li>
                <Link to="/flowers/birthday" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm" data-testid="footer-birthday">
                  Birthday
                </Link>
              </li>
              <li>
                <Link to="/flowers/anniversary" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm" data-testid="footer-anniversary">
                  Anniversary
                </Link>
              </li>
              <li>
                <Link to="/flowers/sympathy" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm" data-testid="footer-sympathy">
                  Sympathy
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm" data-testid="footer-subscriptions">
                  Subscriptions
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading text-lg mb-6">Help</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm">
                  Delivery Information
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm">
                  Care Guides
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-white/70 hover:text-[#F2CFC0] transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail size={18} className="text-[#F2CFC0] mt-0.5" />
                <span className="font-body text-white/70 text-sm">hello@petalsonline.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone size={18} className="text-[#F2CFC0] mt-0.5" />
                <span className="font-body text-white/70 text-sm">0800 123 4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#F2CFC0] mt-0.5" />
                <span className="font-body text-white/70 text-sm">London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-body text-white/50 text-sm">
            © 2024 Petals Online. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="font-body text-white/50 hover:text-white/70 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="font-body text-white/50 hover:text-white/70 text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

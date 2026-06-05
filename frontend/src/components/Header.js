import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Shop", path: "/collection" },
    { name: "Weddings", path: "/weddings" },
    { name: "Sympathy", path: "/sympathy" },
    { name: "Corporate", path: "/corporate" },
    { name: "House Installs", path: "/house-installs" },
    { name: "Portfolio", path: "/portfolio" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50" data-testid="header">
      {/* Utility strip — Bloom & Wild style */}
      <div className="bg-[#1A1A1A] text-[#FAFAF7] py-1.5 px-6 md:px-12" data-testid="utility-strip">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[10px] uppercase tracking-[0.22em] font-body">
          <span className="hidden md:inline">Complimentary London delivery over £100</span>
          <span className="md:hidden">Free delivery over £100</span>
          <span className="hidden lg:inline">Order by 2pm · Next-day delivery available</span>
          <Link to="/consultation" className="hover:text-[#B3A89B] transition-colors">Enquire — bespoke →</Link>
        </div>
      </div>
      <div className="glass-header">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-[#1A1A1A]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-baseline gap-2" data-testid="logo-link">
            <span className="font-heading text-2xl md:text-[28px] font-light text-[#1A1A1A] tracking-tight">
              Petals
            </span>
            <span className="font-heading text-2xl md:text-[28px] font-light italic text-[#B3A89B]">
              Atelier
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-9" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link font-body text-[11px] uppercase tracking-[0.22em] font-medium transition-colors ${
                  isActive(link.path) ? "text-[#1A1A1A] active" : "text-[#7A7A7A] hover:text-[#1A1A1A]"
                }`}
                data-testid={`nav-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/consultation"
              className="hidden md:inline-block font-body text-[11px] uppercase tracking-[0.22em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:border-transparent transition-all"
              data-testid="header-enquire"
            >
              Enquire
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-[#1A1A1A] hover:text-[#B3A89B] transition-colors" data-testid="user-menu-trigger">
                <User size={19} strokeWidth={1.3} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border border-[#E5E5E5] rounded-none text-[#1A1A1A]">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="text-[#7A7A7A] text-xs">
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer font-body text-xs uppercase tracking-wider" data-testid="account-link">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer font-body text-xs uppercase tracking-wider" data-testid="admin-link">
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-body text-xs uppercase tracking-wider" data-testid="logout-button">
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer font-body text-xs uppercase tracking-wider" data-testid="login-link">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="cursor-pointer font-body text-xs uppercase tracking-wider" data-testid="register-link">
                        Create Account
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link to="/cart" className="p-2 relative text-[#1A1A1A] hover:text-[#B3A89B] transition-colors" data-testid="cart-link">
              <ShoppingBag size={19} strokeWidth={1.3} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[10px] w-5 h-5 flex items-center justify-center font-body font-medium" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAFAF7] border-t border-[#E5E5E5]" data-testid="mobile-menu">
          <nav className="px-6 py-8 space-y-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block font-body text-xs uppercase tracking-[0.22em] ${
                  isActive(link.path) ? "text-[#1A1A1A]" : "text-[#7A7A7A]"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/consultation"
              className="block font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A] pt-4 border-t border-[#E5E5E5]"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-nav-enquire"
            >
              Enquire
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

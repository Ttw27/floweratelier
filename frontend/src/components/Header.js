import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Phone } from "lucide-react";
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

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Collection", path: "/collection" },
    { name: "Weddings", path: "/weddings" },
    { name: "Sympathy", path: "/sympathy" },
    { name: "Consultation", path: "/consultation" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect" data-testid="header">
      <div className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-[#F4F0E6]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <span className="font-heading text-2xl md:text-3xl font-light text-[#F4F0E6] tracking-wide">
              Petals
            </span>
            <span className="font-heading text-2xl md:text-3xl font-light text-[#C5A059] italic ml-2">
              Atelier
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${
                  isActive(link.path)
                    ? "text-[#C5A059]"
                    : "text-[#F4F0E6]/80 hover:text-[#C5A059]"
                }`}
                data-testid={`nav-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Phone - Desktop only */}
            <a
              href="tel:+441234567890"
              className="hidden md:flex items-center space-x-2 text-[#A3A6A1] hover:text-[#C5A059] transition-colors"
              data-testid="phone-link"
            >
              <Phone size={16} />
              <span className="font-body text-sm">01onal 567 890</span>
            </a>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-[#F4F0E6]/80 hover:text-[#C5A059] transition-colors" data-testid="user-menu-trigger">
                <User size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-[#161A18] border border-[#252825] text-[#F4F0E6]">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="text-[#A3A6A1] text-sm">
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#252825]" />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer" data-testid="account-link">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer" data-testid="admin-link">
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#252825]" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" data-testid="logout-button">
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer" data-testid="login-link">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="cursor-pointer" data-testid="register-link">
                        Create Account
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link to="/cart" className="p-2 relative text-[#F4F0E6]/80 hover:text-[#C5A059] transition-colors" data-testid="cart-link">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A059] text-[#0B0C0B] text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B0C0B] border-t border-[#252825]" data-testid="mobile-menu">
          <nav className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 font-body text-sm uppercase tracking-wider ${
                  isActive(link.path) ? "text-[#C5A059]" : "text-[#F4F0E6]/80"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

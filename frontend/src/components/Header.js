import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OCCASIONS = [
  { name: "Weddings", path: "/weddings" },
  { name: "Traveller Weddings", path: "/traveller-weddings" },
  { name: "Faith & Cultural Weddings", path: "/faith-weddings" },
  { name: "Sympathy & Funerals", path: "/sympathy" },
  { name: "Traveller Funerals", path: "/traveller-funerals" },
];

const SERVICES = [
  { name: "Corporate Events", path: "/corporate" },
  { name: "House Installs", path: "/house-installs" },
  { name: "Shop Front Installs", path: "/shop-front-installs" },
  { name: "In-Shop Bespoke Displays", path: "/in-shop-displays" },
  { name: "Film, TV & Photoshoot", path: "/film-tv-photoshoot" },
  { name: "Workshops", path: "/workshops" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState({ occasions: false, services: false });
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const isAnyActive = (paths) => paths.some((p) => isActive(p));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = (active) => `nav-link font-body text-[11px] uppercase tracking-[0.22em] font-medium transition-colors ${active ? "text-[#1A1A1A] active" : "text-[#7A7A7A] hover:text-[#1A1A1A]"}`;
  const dropdownItemClass = "cursor-pointer font-body text-xs uppercase tracking-wider focus:bg-[#F2EFEB]";

  return (
    <header className="fixed top-0 left-0 right-0 z-50" data-testid="header">
      {/* Utility strip */}
      {settings?.utility_bar_enabled !== false && (
        <div className="bg-[#1A1A1A] text-[#FAFAF7] py-1.5 px-6 md:px-12" data-testid="utility-strip">
          <div className="max-w-[1400px] mx-auto flex items-center justify-end gap-4 sm:gap-6 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.22em] font-body">
            {settings?.utility_bar_text ? (
              <span className="text-[#FAFAF7]/85 truncate min-w-0" data-testid="utility-strip-text">
                {settings.utility_bar_text}
              </span>
            ) : null}
            <Link to="/consultation" className="hover:text-[#B3A89B] transition-colors whitespace-nowrap shrink-0" data-testid="utility-enquire-link">
              Enquire — bespoke →
            </Link>
          </div>
        </div>
      )}

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
              <Link to="/collection" className={linkClass(isActive("/collection"))} data-testid="nav-shop">
                Shop
              </Link>

              {/* Occasions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`${linkClass(isAnyActive(OCCASIONS.map(o => o.path)))} flex items-center gap-1 outline-none`} data-testid="nav-occasions">
                  Occasions <ChevronDown size={11} strokeWidth={1.4} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white border border-[#E5E5E5] rounded-none text-[#1A1A1A] mt-2">
                  {OCCASIONS.map((occ) => (
                    <DropdownMenuItem key={occ.path} asChild className={dropdownItemClass}>
                      <Link to={occ.path} data-testid={`nav-occasion-${occ.path.replace("/", "")}`}>{occ.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Services dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`${linkClass(isAnyActive(SERVICES.map(s => s.path)))} flex items-center gap-1 outline-none`} data-testid="nav-services">
                  Services <ChevronDown size={11} strokeWidth={1.4} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-[#E5E5E5] rounded-none text-[#1A1A1A] mt-2">
                  {SERVICES.map((s) => (
                    <DropdownMenuItem key={s.path} asChild className={dropdownItemClass}>
                      <Link to={s.path} data-testid={`nav-service-${s.path.replace("/", "")}`}>{s.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/portfolio" className={linkClass(isActive("/portfolio"))} data-testid="nav-portfolio">
                Portfolio
              </Link>
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
                      <DropdownMenuItem disabled className="text-[#7A7A7A] text-xs">{user.name}</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                      <DropdownMenuItem asChild>
                        <Link to="/account" className={dropdownItemClass} data-testid="account-link">My Account</Link>
                      </DropdownMenuItem>
                      {user.is_admin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className={dropdownItemClass} data-testid="admin-link">Admin</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                      <DropdownMenuItem onClick={handleLogout} className={dropdownItemClass} data-testid="logout-button">Sign Out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/login" className={dropdownItemClass} data-testid="login-link">Sign In</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register" className={dropdownItemClass} data-testid="register-link">Create Account</Link>
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
        <div className="lg:hidden bg-[#FAFAF7] border-t border-[#E5E5E5] max-h-[calc(100vh-7rem)] overflow-y-auto" data-testid="mobile-menu">
          <nav className="px-6 py-8 space-y-5">
            <Link to="/collection" className="block font-body text-xs uppercase tracking-[0.22em] text-[#7A7A7A]" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-shop">Shop</Link>

            {/* Occasions section */}
            <div>
              <button
                onClick={() => setMobileSubOpen({ ...mobileSubOpen, occasions: !mobileSubOpen.occasions })}
                className="flex items-center justify-between w-full font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A]"
                data-testid="mobile-nav-occasions"
              >
                <span>Occasions</span>
                <ChevronDown size={12} className={`transition-transform ${mobileSubOpen.occasions ? "rotate-180" : ""}`} />
              </button>
              {mobileSubOpen.occasions && (
                <div className="mt-4 pl-4 border-l border-[#E5E5E5] space-y-3">
                  {OCCASIONS.map((o) => (
                    <Link key={o.path} to={o.path} className="block font-body text-xs uppercase tracking-[0.22em] text-[#7A7A7A]" onClick={() => setMobileMenuOpen(false)}>
                      {o.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Services section */}
            <div>
              <button
                onClick={() => setMobileSubOpen({ ...mobileSubOpen, services: !mobileSubOpen.services })}
                className="flex items-center justify-between w-full font-body text-xs uppercase tracking-[0.22em] text-[#1A1A1A]"
                data-testid="mobile-nav-services"
              >
                <span>Services</span>
                <ChevronDown size={12} className={`transition-transform ${mobileSubOpen.services ? "rotate-180" : ""}`} />
              </button>
              {mobileSubOpen.services && (
                <div className="mt-4 pl-4 border-l border-[#E5E5E5] space-y-3">
                  {SERVICES.map((s) => (
                    <Link key={s.path} to={s.path} className="block font-body text-xs uppercase tracking-[0.22em] text-[#7A7A7A]" onClick={() => setMobileMenuOpen(false)}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/portfolio" className="block font-body text-xs uppercase tracking-[0.22em] text-[#7A7A7A]" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-portfolio">Portfolio</Link>

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

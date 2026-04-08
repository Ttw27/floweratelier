import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Search, Heart } from "lucide-react";
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

  const categories = [
    { name: "All Flowers", slug: "" },
    { name: "Birthday", slug: "birthday" },
    { name: "Anniversary", slug: "anniversary" },
    { name: "Thank You", slug: "thank-you" },
    { name: "Sympathy", slug: "sympathy" },
    { name: "Roses", slug: "roses" },
    { name: "Plants", slug: "plants" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAFAF7]/95 backdrop-blur-xl border-b border-[#E3E5DF]" data-testid="header">
      {/* Top announcement bar */}
      <div className="bg-[#233520] text-white text-center py-2 text-sm font-body">
        <p>Free delivery on orders over £50 | Next day delivery available</p>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <span className="font-heading text-3xl md:text-4xl font-light text-[#233520] tracking-tight">
              Petals
            </span>
            <span className="font-accent text-xl md:text-2xl text-[#C07A65] ml-2">online</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" data-testid="desktop-nav">
            <DropdownMenu>
              <DropdownMenuTrigger className="nav-link font-body text-sm uppercase tracking-wider" data-testid="flowers-dropdown">
                Flowers
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border border-[#E3E5DF]">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link
                      to={`/flowers${cat.slug ? `/${cat.slug}` : ""}`}
                      className="cursor-pointer"
                      data-testid={`nav-category-${cat.slug || "all"}`}
                    >
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/subscriptions" className="nav-link font-body text-sm uppercase tracking-wider" data-testid="nav-subscriptions">
              Subscriptions
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hidden md:block" data-testid="search-button">
              <Search size={20} className="text-[#233520]" />
            </button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2" data-testid="user-menu-trigger">
                <User size={20} className="text-[#233520]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border border-[#E3E5DF]">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="text-[#788275] text-sm">
                      Hello, {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer" data-testid="account-link">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscriptions" className="cursor-pointer" data-testid="my-subscriptions-link">
                        My Subscriptions
                      </Link>
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer" data-testid="admin-link">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
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
            <Link to="/cart" className="p-2 relative" data-testid="cart-link">
              <ShoppingBag size={20} className="text-[#233520]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C07A65] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E3E5DF]" data-testid="mobile-menu">
          <nav className="px-4 py-4 space-y-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/flowers${cat.slug ? `/${cat.slug}` : ""}`}
                className="block py-2 text-[#233520] font-body"
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-${cat.slug || "all"}`}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/subscriptions"
              className="block py-2 text-[#233520] font-body"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-nav-subscriptions"
            >
              Subscriptions
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

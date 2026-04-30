import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Pages
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WeddingsPage from "./pages/WeddingsPage";
import SympathyPage from "./pages/SympathyPage";
import CorporatePage from "./pages/CorporatePage";
import HouseInstallsPage from "./pages/HouseInstallsPage";
import BespokePortfolioPage from "./pages/BespokePortfolioPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import ConsultationPage from "./pages/ConsultationPage";
import AdminPage from "./pages/AdminPage";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#1A1A1A]">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/collection/:category" element={<CollectionPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/weddings" element={<WeddingsPage />} />
                <Route path="/sympathy" element={<SympathyPage />} />
                <Route path="/corporate" element={<CorporatePage />} />
                <Route path="/house-installs" element={<HouseInstallsPage />} />
                <Route path="/portfolio" element={<BespokePortfolioPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/consultation" element={<ConsultationPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" theme="light" />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

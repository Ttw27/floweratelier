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
import TravellerWeddingsPage from "./pages/TravellerWeddingsPage";
import FaithWeddingsPage from "./pages/FaithWeddingsPage";
import SympathyPage from "./pages/SympathyPage";
import TravellerFuneralsPage from "./pages/TravellerFuneralsPage";
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
import ThemePreviewPage from "./pages/ThemePreviewPage";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#1A1A1A]">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/collection/:category" element={<CollectionPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/weddings" element={<WeddingsPage />} />
                <Route path="/traveller-weddings" element={<TravellerWeddingsPage />} />
                <Route path="/faith-weddings" element={<FaithWeddingsPage />} />
                <Route path="/sympathy" element={<SympathyPage />} />
                <Route path="/traveller-funerals" element={<TravellerFuneralsPage />} />
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
                <Route path="/themes" element={<ThemePreviewPage />} />
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

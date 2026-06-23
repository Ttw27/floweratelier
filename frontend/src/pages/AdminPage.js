import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Package, ShoppingBag, Users, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import SEOAdmin from "../components/admin/SEOAdmin";
import CardsAdmin from "../components/admin/CardsAdmin";
import AddonsAdmin from "../components/admin/AddonsAdmin";
import BoxesAdmin from "../components/admin/BoxesAdmin";
import TemplatesAdmin from "../components/admin/TemplatesAdmin";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", original_price: "", category_id: "",
    images: "", in_stock: true, featured: false, occasion_tags: "",
  });

  const { settings, refresh: refreshSettings } = useSettings();
  const [settingsForm, setSettingsForm] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        utility_bar_text: settings.utility_bar_text || "",
        utility_bar_enabled: settings.utility_bar_enabled !== false,
        whatsapp_number: settings.whatsapp_number || "",
        whatsapp_enabled: settings.whatsapp_enabled !== false,
        whatsapp_default_message: settings.whatsapp_default_message || "",
        meta_pixel_id: settings.meta_pixel_id || "",
        ga4_id: settings.ga4_id || "",
        gtm_id: settings.gtm_id || "",
        cookie_consent_required: settings.cookie_consent_required !== false,
        delivery_min_lead_days: settings.delivery_min_lead_days ?? 4,
        delivery_blocked_weekdays: settings.delivery_blocked_weekdays || [6],
        delivery_blocked_dates: settings.delivery_blocked_dates || [],
        delivery_window_days: settings.delivery_window_days ?? 28,
        seo_default_title: settings.seo_default_title || "",
        seo_default_description: settings.seo_default_description || "",
        seo_default_og_image: settings.seo_default_og_image || "",
        seo_site_name: settings.seo_site_name || "Petals Atelier",
      });
    }
  }, [settings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await axios.put(`${API_URL}/api/settings`, settingsForm);
      await refreshSettings();
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => { if (!authLoading && (!user || !user.is_admin)) navigate("/login"); }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.is_admin) return;
      try {
        const [statsRes, ordersRes, inquiriesRes, productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/stats`),
          axios.get(`${API_URL}/api/admin/orders`),
          axios.get(`${API_URL}/api/admin/inquiries`),
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/categories`),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setInquiries(inquiriesRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch { toast.error("Failed to load admin data"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Updated");
    } catch { toast.error("Failed"); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name, description: productForm.description,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category_id: productForm.category_id,
        images: productForm.images.split(",").map((s) => s.trim()).filter(Boolean),
        in_stock: productForm.in_stock, featured: productForm.featured,
        occasion_tags: productForm.occasion_tags.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editingProduct) { await axios.put(`${API_URL}/api/products/${editingProduct.id}`, payload); toast.success("Updated"); }
      else { await axios.post(`${API_URL}/api/products`, payload); toast.success("Created"); }
      const productsRes = await axios.get(`${API_URL}/api/products`);
      setProducts(productsRes.data);
      setShowProductForm(false); setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", original_price: "", category_id: "", images: "", in_stock: true, featured: false, occasion_tags: "" });
    } catch (error) { toast.error(error.response?.data?.detail || "Save failed"); }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name, description: product.description,
      price: product.price.toString(), original_price: product.original_price?.toString() || "",
      category_id: product.category_id, images: product.images.join(", "),
      in_stock: product.in_stock, featured: product.featured,
      occasion_tags: product.occasion_tags.join(", "),
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try { await axios.delete(`${API_URL}/api/products/${productId}`); setProducts(products.filter((p) => p.id !== productId)); toast.success("Deleted"); }
    catch { toast.error("Failed"); }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center pt-28"><div className="spinner" /></div>;
  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen pt-28 py-12" data-testid="admin-page">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto">
        <p className="accent-label mb-4"><span className="thin-rule" />Administration</p>
        <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] mb-12 tracking-tight" data-testid="admin-title">Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5] border border-[#E5E5E5] mb-12">
            <div className="bg-white p-6" data-testid="stat-orders">
              <Package className="text-[#1A1A1A] mb-3" size={18} strokeWidth={1.3} />
              <p className="accent-label mb-2">Orders</p>
              <p className="font-heading text-3xl font-light text-[#1A1A1A]">{stats.total_orders}</p>
            </div>
            <div className="bg-white p-6" data-testid="stat-products">
              <ShoppingBag className="text-[#1A1A1A] mb-3" size={18} strokeWidth={1.3} />
              <p className="accent-label mb-2">Products</p>
              <p className="font-heading text-3xl font-light text-[#1A1A1A]">{stats.total_products}</p>
            </div>
            <div className="bg-white p-6" data-testid="stat-users">
              <Users className="text-[#1A1A1A] mb-3" size={18} strokeWidth={1.3} />
              <p className="accent-label mb-2">Clients</p>
              <p className="font-heading text-3xl font-light text-[#1A1A1A]">{stats.total_users}</p>
            </div>
            <div className="bg-white p-6" data-testid="stat-revenue">
              <DollarSign className="text-[#1A1A1A] mb-3" size={18} strokeWidth={1.3} />
              <p className="accent-label mb-2">Revenue</p>
              <p className="font-heading text-3xl font-light text-[#1A1A1A]">£{stats.total_revenue.toFixed(0)}</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-transparent border-b border-[#E5E5E5] rounded-none p-0 h-auto w-full justify-start">
            <TabsTrigger value="orders" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="inquiries" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-inquiries-tab">Inquiries</TabsTrigger>
            <TabsTrigger value="products" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-products-tab">Products</TabsTrigger>
            <TabsTrigger value="cards" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-cards-tab">Cards</TabsTrigger>
            <TabsTrigger value="boxes" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-boxes-tab">Boxes</TabsTrigger>
            <TabsTrigger value="templates" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-templates-tab">Templates</TabsTrigger>
            <TabsTrigger value="addons" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-addons-tab">Add-ons</TabsTrigger>
            <TabsTrigger value="seo" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-seo-tab">SEO</TabsTrigger>
            <TabsTrigger value="settings" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="admin-settings-tab">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" data-testid="admin-orders-content">
            <div className="bg-white border border-[#E5E5E5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F2EFEB]">
                    <tr>
                      {["Order", "Date", "Recipient", "Total", "Payment", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left accent-label text-[#1A1A1A]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-[#E5E5E5]" data-testid={`admin-order-${order.id}`}>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#7A7A7A]">{format(new Date(order.created_at), "MMM d, yyyy")}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{order.recipient_name}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">£{order.total.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-body ${order.payment_status === "paid" ? "bg-[#C4CFC0] text-[#1A1A1A]" : "bg-[#F2EFEB] text-[#7A7A7A]"}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-body bg-[#F2EFEB] text-[#1A1A1A]">{order.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-[130px] h-8 text-xs rounded-none"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inquiries" data-testid="admin-inquiries-content">
            <div className="bg-white border border-[#E5E5E5]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F2EFEB]">
                    <tr>
                      {["Date", "Name", "Email", "Service", "Event date", "Message"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left accent-label text-[#1A1A1A]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-[#7A7A7A]">No inquiries yet.</td></tr>
                    )}
                    {inquiries.map((i) => (
                      <tr key={i.id} className="border-t border-[#E5E5E5]" data-testid={`admin-inquiry-${i.id}`}>
                        <td className="px-4 py-3 font-body text-sm text-[#7A7A7A]">{format(new Date(i.created_at), "MMM d, yyyy")}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{i.name}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{i.email}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">{i.service_type || "—"}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#7A7A7A]">{i.event_date || "—"}</td>
                        <td className="px-4 py-3 font-body text-xs text-[#7A7A7A] max-w-xs truncate">{i.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" data-testid="admin-products-content">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: "", description: "", price: "", original_price: "", category_id: "", images: "", in_stock: true, featured: false, occasion_tags: "" });
                  setShowProductForm(!showProductForm);
                }}
                className="btn-dark rounded-none inline-flex items-center gap-2"
                data-testid="add-product-btn"
              >
                <Plus size={14} /> Add Product
              </Button>
            </div>

            {showProductForm && (
              <div className="bg-white border border-[#E5E5E5] p-8 mb-6" data-testid="product-form">
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-6">{editingProduct ? "Edit product" : "New product"}</h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="accent-label text-[#1A1A1A]">Name *</Label>
                      <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-2 light-input rounded-none" required data-testid="product-name-input" />
                    </div>
                    <div>
                      <Label className="accent-label text-[#1A1A1A]">Category *</Label>
                      <Select value={productForm.category_id} onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}>
                        <SelectTrigger className="mt-2 light-input rounded-none" data-testid="product-category-select"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Description *</Label>
                    <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-2 light-input rounded-none" required data-testid="product-description-input" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="accent-label text-[#1A1A1A]">Price (£) *</Label>
                      <Input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-2 light-input rounded-none" required data-testid="product-price-input" />
                    </div>
                    <div>
                      <Label className="accent-label text-[#1A1A1A]">Original price (£)</Label>
                      <Input type="number" step="0.01" value={productForm.original_price} onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })} className="mt-2 light-input rounded-none" placeholder="Sale only" data-testid="product-original-price-input" />
                    </div>
                  </div>

                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Image URLs (comma separated) *</Label>
                    <Input value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} className="mt-2 light-input rounded-none" required data-testid="product-images-input" />
                  </div>

                  <div>
                    <Label className="accent-label text-[#1A1A1A]">Occasion tags (comma separated)</Label>
                    <Input value={productForm.occasion_tags} onChange={(e) => setProductForm({ ...productForm, occasion_tags: e.target.value })} className="mt-2 light-input rounded-none" placeholder="birthday, anniversary" data-testid="product-tags-input" />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.in_stock} onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })} />
                      <span className="font-body text-sm text-[#1A1A1A]">In stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} />
                      <span className="font-body text-sm text-[#1A1A1A]">Featured</span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="btn-dark rounded-none" data-testid="save-product-btn">{editingProduct ? "Update" : "Create"}</Button>
                    <Button type="button" onClick={() => setShowProductForm(false)} className="btn-outline-dark rounded-none">Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white border border-[#E5E5E5]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F2EFEB]">
                    <tr>
                      {["Image", "Name", "Category", "Price", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-left accent-label text-[#1A1A1A]">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-[#E5E5E5]" data-testid={`admin-product-${product.id}`}>
                        <td className="px-4 py-3"><div className="w-12 h-16 bg-[#F2EFEB]"><img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /></div></td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">
                          {product.name}
                          {product.featured && <span className="ml-2 bg-[#E8D8D0] text-[#1A1A1A] text-[10px] uppercase tracking-wider px-2 py-0.5">Signature</span>}
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#7A7A7A]">{product.category_name}</td>
                        <td className="px-4 py-3 font-body text-sm text-[#1A1A1A]">£{product.price.toFixed(2)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-body ${product.in_stock ? "bg-[#C4CFC0] text-[#1A1A1A]" : "bg-red-100 text-red-700"}`}>{product.in_stock ? "In stock" : "Out"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => handleEditProduct(product)} className="text-[#7A7A7A] hover:text-[#1A1A1A]" data-testid={`edit-product-${product.id}`}><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-[#7A7A7A] hover:text-red-600" data-testid={`delete-product-${product.id}`}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" data-testid="admin-seo-content">
            <SEOAdmin />
          </TabsContent>

          <TabsContent value="cards" data-testid="admin-cards-content">
            <CardsAdmin />
          </TabsContent>

          <TabsContent value="boxes" data-testid="admin-boxes-content">
            <BoxesAdmin />
          </TabsContent>

          <TabsContent value="templates" data-testid="admin-templates-content">
            <TemplatesAdmin />
          </TabsContent>

          <TabsContent value="addons" data-testid="admin-addons-content">
            <AddonsAdmin />
          </TabsContent>

          <TabsContent value="settings" data-testid="admin-settings-content">
            <div className="bg-white border border-[#E5E5E5] p-8 max-w-4xl" data-testid="settings-form-card">
              <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-2">Site settings</h3>
              <p className="font-body text-sm text-[#7A7A7A] mb-8">Global controls for messaging, contact, tracking, delivery and SEO defaults. Changes go live instantly.</p>

              {settingsForm && (
                <form onSubmit={handleSaveSettings} className="space-y-10">
                  {/* === Utility bar === */}
                  <section data-testid="settings-section-utility">
                    <p className="accent-label mb-4"><span className="thin-rule" />Utility bar</p>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[#1A1A1A] text-sm">Bar text</Label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.utility_bar_enabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, utility_bar_enabled: e.target.checked })}
                          data-testid="settings-utility-enabled"
                        />
                        <span className="font-body text-xs text-[#7A7A7A] uppercase tracking-wider">Show bar</span>
                      </label>
                    </div>
                    <Input
                      value={settingsForm.utility_bar_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, utility_bar_text: e.target.value })}
                      placeholder="e.g. Valentine's pre-orders now open · order by Fri 12 Feb"
                      className="light-input rounded-none"
                      data-testid="settings-utility-text"
                    />
                    <p className="font-body text-[11px] text-[#7A7A7A] mt-2">
                      Leave blank to show only the &ldquo;Enquire — bespoke&rdquo; link. Use this strip for seasonal drops or occasion-led messages.
                    </p>
                  </section>

                  {/* === WhatsApp === */}
                  <section className="pt-8 border-t border-[#E5E5E5]" data-testid="settings-section-whatsapp">
                    <p className="accent-label mb-4"><span className="thin-rule" />WhatsApp</p>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[#1A1A1A] text-sm">Number</Label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.whatsapp_enabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_enabled: e.target.checked })}
                          data-testid="settings-whatsapp-enabled"
                        />
                        <span className="font-body text-xs text-[#7A7A7A] uppercase tracking-wider">Show WhatsApp button</span>
                      </label>
                    </div>
                    <Input
                      value={settingsForm.whatsapp_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      placeholder="e.g. 447123456789 (country code + number, no + or spaces)"
                      className="light-input rounded-none"
                      data-testid="settings-whatsapp-number"
                    />
                    <p className="font-body text-[11px] text-[#7A7A7A] mt-2">
                      International format without &lsquo;+&rsquo; or spaces. UK example: 447123456789.
                    </p>
                    <div className="mt-4">
                      <Label className="text-[#1A1A1A] text-sm">Default message</Label>
                      <Textarea
                        value={settingsForm.whatsapp_default_message}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_default_message: e.target.value })}
                        className="mt-2 light-input rounded-none"
                        rows={3}
                        data-testid="settings-whatsapp-message"
                      />
                    </div>
                  </section>

                  {/* === Tracking pixels === */}
                  <section className="pt-8 border-t border-[#E5E5E5]" data-testid="settings-section-pixels">
                    <p className="accent-label mb-4"><span className="thin-rule" />Tracking pixels</p>
                    <p className="font-body text-[12px] text-[#7A7A7A] mb-4">
                      Page views fire automatically on every route change. Pixels are blocked until the visitor accepts cookies (UK GDPR). Leave blank to disable.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Meta (Facebook) Pixel ID</Label>
                        <Input
                          value={settingsForm.meta_pixel_id}
                          onChange={(e) => setSettingsForm({ ...settingsForm, meta_pixel_id: e.target.value.trim() })}
                          placeholder="e.g. 1234567890123456"
                          className="light-input rounded-none mt-2"
                          data-testid="settings-meta-pixel-id"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Google Analytics 4 ID</Label>
                        <Input
                          value={settingsForm.ga4_id}
                          onChange={(e) => setSettingsForm({ ...settingsForm, ga4_id: e.target.value.trim() })}
                          placeholder="e.g. G-XXXXXXXXXX"
                          className="light-input rounded-none mt-2"
                          data-testid="settings-ga4-id"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Google Tag Manager ID <span className="text-[#7A7A7A] normal-case">(optional)</span></Label>
                        <Input
                          value={settingsForm.gtm_id}
                          onChange={(e) => setSettingsForm({ ...settingsForm, gtm_id: e.target.value.trim() })}
                          placeholder="e.g. GTM-XXXXXX"
                          className="light-input rounded-none mt-2"
                          data-testid="settings-gtm-id"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer pb-2">
                          <input
                            type="checkbox"
                            checked={settingsForm.cookie_consent_required}
                            onChange={(e) => setSettingsForm({ ...settingsForm, cookie_consent_required: e.target.checked })}
                            data-testid="settings-consent-required"
                          />
                          <span className="font-body text-xs text-[#1A1A1A]">Require cookie consent before firing pixels (UK GDPR)</span>
                        </label>
                      </div>
                    </div>
                  </section>

                  {/* === Delivery rules === */}
                  <section className="pt-8 border-t border-[#E5E5E5]" data-testid="settings-section-delivery">
                    <p className="accent-label mb-4"><span className="thin-rule" />Delivery rules</p>
                    <p className="font-body text-[12px] text-[#7A7A7A] mb-4">
                      Controls the calendar shown to customers on product pages, the cart, and checkout — and is enforced server-side when an order is placed.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Minimum lead time (days)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={settingsForm.delivery_min_lead_days}
                          onChange={(e) => setSettingsForm({ ...settingsForm, delivery_min_lead_days: parseInt(e.target.value, 10) || 0 })}
                          className="light-input rounded-none mt-2"
                          data-testid="settings-delivery-lead"
                        />
                        <p className="text-[11px] text-[#7A7A7A] mt-1">Earliest the customer can choose. Default 4 days.</p>
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Days surfaced in calendar</Label>
                        <Input
                          type="number"
                          min="7"
                          value={settingsForm.delivery_window_days}
                          onChange={(e) => setSettingsForm({ ...settingsForm, delivery_window_days: parseInt(e.target.value, 10) || 28 })}
                          className="light-input rounded-none mt-2"
                          data-testid="settings-delivery-window"
                        />
                        <p className="text-[11px] text-[#7A7A7A] mt-1">How far ahead the calendar runs. Default 28 days.</p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <Label className="text-[#1A1A1A] text-sm">Blocked weekdays (recurring)</Label>
                      <div className="grid grid-cols-7 gap-2 mt-3">
                        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, idx) => {
                          const blocked = settingsForm.delivery_blocked_weekdays.includes(idx);
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => {
                                const list = blocked
                                  ? settingsForm.delivery_blocked_weekdays.filter((x) => x !== idx)
                                  : [...settingsForm.delivery_blocked_weekdays, idx];
                                setSettingsForm({ ...settingsForm, delivery_blocked_weekdays: list });
                              }}
                              data-testid={`settings-blocked-weekday-${idx}`}
                              className={`py-2 text-xs uppercase tracking-[0.18em] border ${blocked ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[#7A7A7A] mt-2">Tap to toggle. Default: Sunday closed.</p>
                    </div>

                    <div className="mt-5">
                      <Label className="text-[#1A1A1A] text-sm">Blocked specific dates</Label>
                      <div className="flex flex-wrap gap-2 mt-3 mb-2">
                        {(settingsForm.delivery_blocked_dates || []).map((d) => (
                          <span key={d} className="inline-flex items-center gap-2 px-3 py-1 bg-[#F2EFEB] text-[#1A1A1A] text-xs">
                            {d}
                            <button
                              type="button"
                              onClick={() => setSettingsForm({
                                ...settingsForm,
                                delivery_blocked_dates: settingsForm.delivery_blocked_dates.filter((x) => x !== d),
                              })}
                              className="text-[#7A7A7A] hover:text-red-600"
                              data-testid={`settings-remove-date-${d}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {(settingsForm.delivery_blocked_dates || []).length === 0 && (
                          <span className="text-[11px] text-[#7A7A7A]">None set.</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          id="blockDateInput"
                          className="light-input rounded-none max-w-[220px]"
                          data-testid="settings-add-blocked-date"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-none"
                          onClick={() => {
                            const el = document.getElementById("blockDateInput");
                            const v = el?.value;
                            if (!v) return;
                            if ((settingsForm.delivery_blocked_dates || []).includes(v)) return;
                            setSettingsForm({ ...settingsForm, delivery_blocked_dates: [...settingsForm.delivery_blocked_dates, v] });
                            if (el) el.value = "";
                          }}
                          data-testid="settings-add-blocked-date-btn"
                        >
                          Add date
                        </Button>
                      </div>
                      <p className="text-[11px] text-[#7A7A7A] mt-2">e.g. Christmas Day, Boxing Day, public holidays.</p>
                    </div>
                  </section>

                  {/* === SEO defaults === */}
                  <section className="pt-8 border-t border-[#E5E5E5]" data-testid="settings-section-seo">
                    <p className="accent-label mb-4"><span className="thin-rule" />SEO defaults</p>
                    <p className="font-body text-[12px] text-[#7A7A7A] mb-4">
                      Used when a route hasn&rsquo;t been individually customised under the SEO tab.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Site name</Label>
                        <Input
                          value={settingsForm.seo_site_name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, seo_site_name: e.target.value })}
                          className="light-input rounded-none mt-2"
                          data-testid="settings-seo-site-name"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Default title</Label>
                        <Input
                          value={settingsForm.seo_default_title}
                          onChange={(e) => setSettingsForm({ ...settingsForm, seo_default_title: e.target.value })}
                          className="light-input rounded-none mt-2"
                          data-testid="settings-seo-default-title"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Default meta description</Label>
                        <Textarea
                          rows={2}
                          value={settingsForm.seo_default_description}
                          onChange={(e) => setSettingsForm({ ...settingsForm, seo_default_description: e.target.value })}
                          className="mt-2 light-input rounded-none"
                          data-testid="settings-seo-default-description"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A] text-sm">Default OG image URL</Label>
                        <Input
                          value={settingsForm.seo_default_og_image}
                          onChange={(e) => setSettingsForm({ ...settingsForm, seo_default_og_image: e.target.value })}
                          placeholder="https://… (1200×630 recommended)"
                          className="light-input rounded-none mt-2"
                          data-testid="settings-seo-default-og"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={savingSettings} className="btn-dark rounded-none" data-testid="settings-save-btn">
                      {savingSettings ? "Saving…" : "Save all settings"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

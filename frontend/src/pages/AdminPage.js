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
        </Tabs>
      </div>
    </div>
  );
}

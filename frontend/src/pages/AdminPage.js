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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category_id: "",
    images: "",
    in_stock: true,
    featured: false,
    occasion_tags: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.is_admin) return;
      try {
        const [statsRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/stats`),
          axios.get(`${API_URL}/api/admin/orders`),
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/categories`)
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category_id: productForm.category_id,
        images: productForm.images.split(",").map(s => s.trim()).filter(Boolean),
        in_stock: productForm.in_stock,
        featured: productForm.featured,
        occasion_tags: productForm.occasion_tags.split(",").map(s => s.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct.id}`, payload);
        toast.success("Product updated");
      } else {
        await axios.post(`${API_URL}/api/products`, payload);
        toast.success("Product created");
      }

      // Refresh products
      const productsRes = await axios.get(`${API_URL}/api/products`);
      setProducts(productsRes.data);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        original_price: "",
        category_id: "",
        images: "",
        in_stock: true,
        featured: false,
        occasion_tags: ""
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save product");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category_id: product.category_id,
      images: product.images.join(", "),
      in_stock: product.in_stock,
      featured: product.featured,
      occasion_tags: product.occasion_tags.join(", ")
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-[#F0F0EA]" data-testid="admin-page">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#233520] mb-8" data-testid="admin-title">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 border border-[#E3E5DF]" data-testid="stat-orders">
              <Package className="text-[#C07A65] mb-2" size={24} />
              <p className="font-body text-sm text-[#788275]">Total Orders</p>
              <p className="font-heading text-2xl text-[#233520]">{stats.total_orders}</p>
            </div>
            <div className="bg-white p-6 border border-[#E3E5DF]" data-testid="stat-products">
              <ShoppingBag className="text-[#C07A65] mb-2" size={24} />
              <p className="font-body text-sm text-[#788275]">Products</p>
              <p className="font-heading text-2xl text-[#233520]">{stats.total_products}</p>
            </div>
            <div className="bg-white p-6 border border-[#E3E5DF]" data-testid="stat-users">
              <Users className="text-[#C07A65] mb-2" size={24} />
              <p className="font-body text-sm text-[#788275]">Users</p>
              <p className="font-heading text-2xl text-[#233520]">{stats.total_users}</p>
            </div>
            <div className="bg-white p-6 border border-[#E3E5DF]" data-testid="stat-revenue">
              <DollarSign className="text-[#C07A65] mb-2" size={24} />
              <p className="font-body text-sm text-[#788275]">Revenue</p>
              <p className="font-heading text-2xl text-[#233520]">£{stats.total_revenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white p-1 border border-[#E3E5DF]">
            <TabsTrigger value="orders" className="font-body data-[state=active]:bg-[#E8ECE1]" data-testid="admin-orders-tab">
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="font-body data-[state=active]:bg-[#E8ECE1]" data-testid="admin-products-tab">
              Products
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" data-testid="admin-orders-content">
            <div className="bg-white border border-[#E3E5DF] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F0F0EA]">
                    <tr>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Order ID</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Date</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Recipient</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Total</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Payment</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Status</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-[#E3E5DF]" data-testid={`admin-order-${order.id}`}>
                        <td className="px-4 py-3 font-body text-sm text-[#233520]">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#788275]">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#233520]">
                          {order.recipient_name}
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#233520]">
                          £{order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-body capitalize ${
                            order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-[#F0F0EA] text-[#788275]"
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-body capitalize ${
                            order.status === "confirmed" ? "bg-green-100 text-green-800" :
                            order.status === "processing" ? "bg-blue-100 text-blue-800" :
                            order.status === "delivered" ? "bg-[#E8ECE1] text-[#233520]" :
                            "bg-[#F0F0EA] text-[#788275]"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
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

          {/* Products Tab */}
          <TabsContent value="products" data-testid="admin-products-content">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    description: "",
                    price: "",
                    original_price: "",
                    category_id: "",
                    images: "",
                    in_stock: true,
                    featured: false,
                    occasion_tags: ""
                  });
                  setShowProductForm(!showProductForm);
                }}
                className="bg-[#C07A65] hover:bg-[#a86856] text-white font-body"
                data-testid="add-product-btn"
              >
                <Plus size={18} className="mr-2" />
                Add Product
              </Button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-white border border-[#E3E5DF] p-6 mb-6" data-testid="product-form">
                <h3 className="font-heading text-lg text-[#233520] mb-4">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-[#233520]">Name *</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="mt-1 border-[#E3E5DF]"
                        required
                        data-testid="product-name-input"
                      />
                    </div>
                    <div>
                      <Label className="font-body text-[#233520]">Category *</Label>
                      <Select
                        value={productForm.category_id}
                        onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}
                      >
                        <SelectTrigger className="mt-1 border-[#E3E5DF]" data-testid="product-category-select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="font-body text-[#233520]">Description *</Label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="mt-1 border-[#E3E5DF]"
                      required
                      data-testid="product-description-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-[#233520]">Price (£) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="mt-1 border-[#E3E5DF]"
                        required
                        data-testid="product-price-input"
                      />
                    </div>
                    <div>
                      <Label className="font-body text-[#233520]">Original Price (£)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.original_price}
                        onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                        className="mt-1 border-[#E3E5DF]"
                        placeholder="For sale items"
                        data-testid="product-original-price-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-body text-[#233520]">Image URLs (comma separated) *</Label>
                    <Input
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      className="mt-1 border-[#E3E5DF]"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      required
                      data-testid="product-images-input"
                    />
                  </div>

                  <div>
                    <Label className="font-body text-[#233520]">Occasion Tags (comma separated)</Label>
                    <Input
                      value={productForm.occasion_tags}
                      onChange={(e) => setProductForm({ ...productForm, occasion_tags: e.target.value })}
                      className="mt-1 border-[#E3E5DF]"
                      placeholder="birthday, anniversary, thank-you"
                      data-testid="product-tags-input"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.in_stock}
                        onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                        className="rounded border-[#E3E5DF]"
                      />
                      <span className="font-body text-sm text-[#233520]">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                        className="rounded border-[#E3E5DF]"
                      />
                      <span className="font-body text-sm text-[#233520]">Featured</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="bg-[#C07A65] hover:bg-[#a86856] text-white font-body"
                      data-testid="save-product-btn"
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProductForm(false)}
                      className="border-[#E3E5DF] text-[#788275]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="bg-white border border-[#E3E5DF] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F0F0EA]">
                    <tr>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Image</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Name</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Category</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Price</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Status</th>
                      <th className="px-4 py-3 text-left font-body text-sm text-[#788275]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-[#E3E5DF]" data-testid={`admin-product-${product.id}`}>
                        <td className="px-4 py-3">
                          <div className="w-12 h-16 bg-[#F0F0EA]">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#233520]">
                          {product.name}
                          {product.featured && (
                            <span className="ml-2 bg-[#F2CFC0] text-[#233520] text-xs px-2 py-0.5">Featured</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#788275]">
                          {product.category_name}
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-[#233520]">
                          £{product.price.toFixed(2)}
                          {product.original_price && (
                            <span className="ml-2 text-[#788275] line-through text-xs">
                              £{product.original_price.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-body ${
                            product.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-1 text-[#788275] hover:text-[#233520]"
                              data-testid={`edit-product-${product.id}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 text-[#788275] hover:text-red-600"
                              data-testid={`delete-product-${product.id}`}
                            >
                              <Trash2 size={16} />
                            </button>
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

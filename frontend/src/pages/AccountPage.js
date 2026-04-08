import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, User, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: { pathname: "/account" } } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${API_URL}/api/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-[#E8ECE1] text-[#233520]";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-[#F0F0EA] text-[#788275]";
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12" data-testid="account-page">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#233520]" data-testid="account-title">
              My Account
            </h1>
            <p className="font-body text-[#788275] mt-2">
              Welcome back, {user.name}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="mt-4 md:mt-0 border-[#E3E5DF] text-[#788275] hover:bg-[#F0F0EA]"
            data-testid="logout-btn"
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-[#F0F0EA] p-1">
            <TabsTrigger value="orders" className="font-body data-[state=active]:bg-white" data-testid="orders-tab">
              My Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="font-body data-[state=active]:bg-white" data-testid="profile-tab">
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" data-testid="orders-content">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="spinner" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white border border-[#E3E5DF]">
                <Package size={48} className="mx-auto text-[#E3E5DF] mb-4" />
                <h2 className="font-heading text-xl text-[#233520] mb-2">No orders yet</h2>
                <p className="font-body text-[#788275] mb-6">Start shopping to see your orders here</p>
                <Button
                  onClick={() => navigate("/flowers")}
                  className="bg-[#C07A65] hover:bg-[#a86856] text-white font-body"
                >
                  Shop Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-[#E3E5DF] p-6" data-testid={`order-${order.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <p className="font-body text-sm text-[#788275]">
                          Order placed {format(new Date(order.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="font-body text-xs text-[#788275]">
                          Order ID: {order.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <span className={`px-3 py-1 text-xs font-body capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-3 py-1 text-xs font-body capitalize ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Items Preview */}
                      <div className="flex gap-2 flex-wrap">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-16 h-20 bg-[#F0F0EA]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-16 h-20 bg-[#F0F0EA] flex items-center justify-center">
                            <span className="font-body text-sm text-[#788275]">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="text-[#C07A65] mt-0.5" />
                          <span className="font-body text-sm text-[#233520]">
                            Delivery: {format(new Date(order.delivery_date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-[#C07A65] mt-0.5" />
                          <span className="font-body text-sm text-[#233520]">
                            {order.delivery_address.line1}, {order.delivery_address.city}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <User size={16} className="text-[#C07A65] mt-0.5" />
                          <span className="font-body text-sm text-[#233520]">
                            {order.recipient_name}
                          </span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <p className="font-body text-sm text-[#788275]">Total</p>
                        <p className="font-heading text-xl text-[#233520]">£{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" data-testid="profile-content">
            <div className="bg-white border border-[#E3E5DF] p-8 max-w-md">
              <h2 className="font-heading text-xl text-[#233520] mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-body text-sm text-[#788275]">Name</p>
                  <p className="font-body text-[#233520]">{user.name}</p>
                </div>
                <div>
                  <p className="font-body text-sm text-[#788275]">Email</p>
                  <p className="font-body text-[#233520]">{user.email}</p>
                </div>
                <div>
                  <p className="font-body text-sm text-[#788275]">Account Type</p>
                  <p className="font-body text-[#233520]">{user.is_admin ? "Administrator" : "Customer"}</p>
                </div>
                <div>
                  <p className="font-body text-sm text-[#788275]">Member Since</p>
                  <p className="font-body text-[#233520]">
                    {format(new Date(user.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

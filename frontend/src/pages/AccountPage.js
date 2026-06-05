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

  useEffect(() => { if (!authLoading && !user) navigate("/login"); }, [user, authLoading, navigate]);
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try { const response = await axios.get(`${API_URL}/api/orders`); setOrders(response.data); }
      catch {}
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-[#E8D8D0] text-[#1A1A1A]";
      case "processing": return "bg-[#C4CFC0] text-[#1A1A1A]";
      case "delivered": return "bg-[#1A1A1A] text-white";
      case "cancelled": return "bg-red-100 text-red-700";
      case "paid": return "bg-[#C4CFC0] text-[#1A1A1A]";
      default: return "bg-[#F2EFEB] text-[#7A7A7A]";
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center pt-28"><div className="spinner" /></div>;
  }

  return (
    <div className="min-h-screen pt-28 py-12" data-testid="account-page">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <p className="accent-label mb-4"><span className="thin-rule" />Atelier Account</p>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1A1A] tracking-tight" data-testid="account-title">
              {user.name}
            </h1>
          </div>
          <Button variant="outline" onClick={logout} className="mt-6 md:mt-0 btn-outline-dark rounded-none" data-testid="logout-btn">
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-transparent border-b border-[#E5E5E5] rounded-none p-0 h-auto w-full justify-start">
            <TabsTrigger value="orders" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="profile" className="font-body text-xs uppercase tracking-[0.22em] rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-5" data-testid="profile-tab">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" data-testid="orders-content">
            {loading ? (
              <div className="flex justify-center py-16"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#E5E5E5]">
                <Package size={42} strokeWidth={1} className="mx-auto text-[#B3A89B] mb-6" />
                <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-3">No orders yet</h2>
                <p className="font-body text-sm text-[#7A7A7A] mb-8">Begin with the signature collection</p>
                <Button onClick={() => navigate("/collection")} className="btn-dark rounded-none">Shop Collection</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-[#E5E5E5] p-8" data-testid={`order-${order.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <p className="accent-label">{format(new Date(order.created_at), "MMM d, yyyy")}</p>
                        <p className="font-body text-[11px] text-[#B3A89B] mt-1">ID · {order.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 md:mt-0">
                        <span className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-body ${getStatusColor(order.status)}`}>{order.status}</span>
                        <span className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-body ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex gap-2 flex-wrap">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-16 h-20 bg-[#F2EFEB]"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-16 h-20 bg-[#F2EFEB] flex items-center justify-center font-body text-sm text-[#7A7A7A]">+{order.items.length - 3}</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2"><Calendar size={14} strokeWidth={1.3} className="text-[#1A1A1A] mt-0.5" /><span className="font-body text-sm text-[#1A1A1A]">{format(new Date(order.delivery_date), "EEEE, MMMM d")}</span></div>
                        <div className="flex items-start gap-2"><MapPin size={14} strokeWidth={1.3} className="text-[#1A1A1A] mt-0.5" /><span className="font-body text-sm text-[#1A1A1A]">{order.delivery_address.line1}, {order.delivery_address.city}</span></div>
                        <div className="flex items-start gap-2"><User size={14} strokeWidth={1.3} className="text-[#1A1A1A] mt-0.5" /><span className="font-body text-sm text-[#1A1A1A]">{order.recipient_name}</span></div>
                      </div>
                      <div className="text-right">
                        <p className="accent-label">Total</p>
                        <p className="font-heading text-3xl font-light text-[#1A1A1A] mt-1">£{order.total.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" data-testid="profile-content">
            <div className="bg-white border border-[#E5E5E5] p-10 max-w-lg">
              <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-8">Profile</h2>
              <div className="space-y-6">
                <div><p className="accent-label mb-1">Name</p><p className="font-body text-[#1A1A1A]">{user.name}</p></div>
                <div><p className="accent-label mb-1">Email</p><p className="font-body text-[#1A1A1A]">{user.email}</p></div>
                <div><p className="accent-label mb-1">Account</p><p className="font-body text-[#1A1A1A]">{user.is_admin ? "Administrator" : "Client"}</p></div>
                <div><p className="accent-label mb-1">Member since</p><p className="font-body text-[#1A1A1A]">{format(new Date(user.created_at), "MMMM d, yyyy")}</p></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

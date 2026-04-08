import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Flower, Calendar, Gift } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postcode: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes] = await Promise.all([
          axios.get(`${API_URL}/api/subscriptions/plans`)
        ]);
        setPlans(plansRes.data);
        
        if (user) {
          const subsRes = await axios.get(`${API_URL}/api/subscriptions`);
          setSubscriptions(subsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/subscriptions" } } });
      return;
    }

    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/subscriptions`, {
        plan_type: selectedPlan,
        delivery_address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          city: formData.city,
          postcode: formData.postcode
        },
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone
      });
      toast.success("Subscription created! We'll be in touch to confirm your first delivery.");
      setShowForm(false);
      setSelectedPlan(null);
      // Refresh subscriptions
      const subsRes = await axios.get(`${API_URL}/api/subscriptions`);
      setSubscriptions(subsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create subscription");
    }
  };

  const handleCancel = async (subId) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/subscriptions/${subId}`);
      toast.success("Subscription cancelled");
      setSubscriptions(subscriptions.map(s => 
        s.id === subId ? { ...s, status: "cancelled" } : s
      ));
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const features = [
    "Freshly hand-tied bouquets",
    "Free delivery included",
    "Skip or pause anytime",
    "Exclusive seasonal varieties",
    "Gift message with each delivery"
  ];

  return (
    <div className="min-h-screen" data-testid="subscriptions-page">
      {/* Hero */}
      <section className="bg-[#E8ECE1] py-16 md:py-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="font-body text-sm uppercase tracking-[0.2em] text-[#788275] mb-3">
              Flower Subscriptions
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-light text-[#233520] mb-6" data-testid="subscriptions-title">
              Fresh Blooms, Delivered Regularly
            </h1>
            <p className="font-body text-[#788275] text-lg leading-relaxed">
              Treat yourself or someone special to regular deliveries of beautiful, 
              seasonal flowers. Choose your frequency and let us surprise you with 
              our florist's selection.
            </p>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-light text-[#233520] mb-8 text-center">
            Choose Your Plan
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-[#C07A65] bg-[#F2CFC0]/10"
                      : "border-[#E3E5DF] bg-white hover:border-[#788275]"
                  }`}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setShowForm(true);
                  }}
                  data-testid={`plan-${plan.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Flower className="text-[#C07A65]" size={24} />
                    {selectedPlan === plan.id && (
                      <Check className="text-[#C07A65]" size={20} />
                    )}
                  </div>
                  <h3 className="font-heading text-xl text-[#233520] mb-2">{plan.name}</h3>
                  <p className="font-body text-sm text-[#788275] mb-4">{plan.description}</p>
                  <p className="font-heading text-2xl text-[#233520]">
                    £{plan.price.toFixed(2)}
                    <span className="font-body text-sm text-[#788275]">/delivery</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          <div className="bg-[#F0F0EA] p-8 max-w-2xl mx-auto">
            <h3 className="font-heading text-lg text-[#233520] mb-4 text-center">
              What's included with every subscription
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check size={16} className="text-[#C07A65]" />
                  <span className="font-body text-sm text-[#233520]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Form */}
      {showForm && (
        <section className="py-16 md:py-24 bg-[#FAFAF7]" data-testid="subscription-form-section">
          <div className="px-4 md:px-8 max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-light text-[#233520] mb-8">
              Delivery Details
            </h2>

            {!user && (
              <div className="bg-[#F2CFC0]/30 border border-[#C07A65] p-4 mb-8">
                <p className="font-body text-[#233520]">
                  Please <a href="/login" className="text-[#C07A65] underline">sign in</a> or{" "}
                  <a href="/register" className="text-[#C07A65] underline">create an account</a> to subscribe.
                </p>
              </div>
            )}

            <form onSubmit={handleSubscribe} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body text-[#233520]">Recipient Name *</Label>
                  <Input
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                    placeholder="John Smith"
                    required
                    data-testid="sub-recipient-name"
                  />
                </div>
                <div>
                  <Label className="font-body text-[#233520]">Phone Number *</Label>
                  <Input
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                    className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                    placeholder="07123 456789"
                    required
                    data-testid="sub-recipient-phone"
                  />
                </div>
              </div>

              <div>
                <Label className="font-body text-[#233520]">Address Line 1 *</Label>
                <Input
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                  placeholder="123 High Street"
                  required
                  data-testid="sub-address-line1"
                />
              </div>

              <div>
                <Label className="font-body text-[#233520]">Address Line 2</Label>
                <Input
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                  placeholder="Apartment, suite, etc."
                  data-testid="sub-address-line2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body text-[#233520]">City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                    placeholder="London"
                    required
                    data-testid="sub-city"
                  />
                </div>
                <div>
                  <Label className="font-body text-[#233520]">Postcode *</Label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                    placeholder="SW1A 1AA"
                    required
                    data-testid="sub-postcode"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!user}
                className="w-full bg-[#C07A65] hover:bg-[#a86856] text-white py-6 text-base font-body"
                data-testid="start-subscription-btn"
              >
                Start Subscription
              </Button>
            </form>
          </div>
        </section>
      )}

      {/* My Subscriptions */}
      {user && subscriptions.length > 0 && (
        <section className="py-16 md:py-24 bg-white" data-testid="my-subscriptions-section">
          <div className="px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-light text-[#233520] mb-8">
              My Subscriptions
            </h2>

            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="border border-[#E3E5DF] p-6 flex flex-col md:flex-row md:items-center md:justify-between" data-testid={`subscription-${sub.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading text-lg text-[#233520] capitalize">
                        {sub.plan_type} Delivery
                      </h3>
                      <span className={`px-2 py-1 text-xs font-body capitalize ${
                        sub.status === "active" ? "bg-green-100 text-green-800" :
                        sub.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-[#F0F0EA] text-[#788275]"
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="font-body text-sm text-[#788275]">
                      £{sub.price.toFixed(2)} per delivery • {sub.recipient_name}
                    </p>
                    <p className="font-body text-sm text-[#788275]">
                      {sub.delivery_address.line1}, {sub.delivery_address.city}
                    </p>
                  </div>
                  {sub.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancel(sub.id)}
                      className="mt-4 md:mt-0 border-red-300 text-red-600 hover:bg-red-50"
                      data-testid={`cancel-sub-${sub.id}`}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

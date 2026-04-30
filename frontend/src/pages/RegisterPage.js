import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20 flex items-center justify-center" data-testid="register-page">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-light text-[#F4F0E6] mb-2" data-testid="register-title">
            Create Account
          </h1>
          <p className="font-body text-[#A3A6A1]">Join our exclusive clientele</p>
        </div>

        <div className="bg-[#121413] border border-[#252825] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="font-body text-[#F4F0E6] text-sm">Full Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 dark-input"
                placeholder="Your name"
                required
                data-testid="register-name"
              />
            </div>
            <div>
              <Label className="font-body text-[#F4F0E6] text-sm">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 dark-input"
                placeholder="you@example.com"
                required
                data-testid="register-email"
              />
            </div>
            <div>
              <Label className="font-body text-[#F4F0E6] text-sm">Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-2 dark-input"
                placeholder="••••••••"
                required
                data-testid="register-password"
              />
            </div>
            <div>
              <Label className="font-body text-[#F4F0E6] text-sm">Confirm Password</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-2 dark-input"
                placeholder="••••••••"
                required
                data-testid="register-confirm-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gold py-4" data-testid="register-submit">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-[#A3A6A1]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#C5A059] hover:text-[#DFBB73]" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

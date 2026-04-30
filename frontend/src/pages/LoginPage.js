import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0B] pt-20 flex items-center justify-center" data-testid="login-page">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-light text-[#F4F0E6] mb-2" data-testid="login-title">
            Welcome Back
          </h1>
          <p className="font-body text-[#A3A6A1]">Sign in to your account</p>
        </div>

        <div className="bg-[#121413] border border-[#252825] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="font-body text-[#F4F0E6] text-sm">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 dark-input"
                placeholder="you@example.com"
                required
                data-testid="login-email"
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
                data-testid="login-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gold py-4" data-testid="login-submit">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-[#A3A6A1]">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#C5A059] hover:text-[#DFBB73]" data-testid="register-link">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#161A18] border border-[#252825] text-center">
          <p className="font-body text-xs text-[#A3A6A1]">
            <strong className="text-[#C5A059]">Demo:</strong> admin@petalsatelier.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

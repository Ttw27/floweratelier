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
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-28 flex items-center justify-center py-16" data-testid="login-page">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <p className="accent-label mb-4">Atelier Account</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight" data-testid="login-title">Welcome back</h1>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="accent-label text-[#1A1A1A]">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2 light-input rounded-none" placeholder="you@example.com" required data-testid="login-email" />
            </div>
            <div>
              <Label className="accent-label text-[#1A1A1A]">Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-2 light-input rounded-none" placeholder="••••••••" required data-testid="login-password" />
            </div>
            <Button type="submit" disabled={loading} className="btn-dark w-full py-5 rounded-none" data-testid="login-submit">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[#7A7A7A]">
              New here?{" "}
              <Link to="/register" className="text-[#1A1A1A] underline" data-testid="register-link">Create an account</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#F2EFEB] text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#7A7A7A]">
            Demo · admin@petalsatelier.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

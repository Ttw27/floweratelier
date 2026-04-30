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
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success("Welcome to the atelier");
      navigate("/");
    } catch (error) { toast.error(error.response?.data?.detail || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center py-16" data-testid="register-page">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <p className="accent-label mb-4">Atelier Account</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight" data-testid="register-title">Create an account</h1>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="accent-label text-[#1A1A1A]">Full name</Label>
              <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2 light-input rounded-none" placeholder="Your name" required data-testid="register-name" />
            </div>
            <div>
              <Label className="accent-label text-[#1A1A1A]">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2 light-input rounded-none" placeholder="you@example.com" required data-testid="register-email" />
            </div>
            <div>
              <Label className="accent-label text-[#1A1A1A]">Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-2 light-input rounded-none" placeholder="••••••••" required data-testid="register-password" />
            </div>
            <div>
              <Label className="accent-label text-[#1A1A1A]">Confirm password</Label>
              <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="mt-2 light-input rounded-none" placeholder="••••••••" required data-testid="register-confirm-password" />
            </div>
            <Button type="submit" disabled={loading} className="btn-dark w-full py-5 rounded-none" data-testid="register-submit">
              {loading ? "Creating…" : "Create Account"}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[#7A7A7A]">
              Already a client?{" "}
              <Link to="/login" className="text-[#1A1A1A] underline" data-testid="login-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

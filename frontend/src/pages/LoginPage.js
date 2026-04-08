import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-light text-[#233520] mb-2" data-testid="login-title">
            Welcome Back
          </h1>
          <p className="font-body text-[#788275]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white border border-[#E3E5DF] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="font-body text-[#233520]">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                placeholder="you@example.com"
                required
                data-testid="login-email"
              />
            </div>
            <div>
              <Label className="font-body text-[#233520]">Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                placeholder="••••••••"
                required
                data-testid="login-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C07A65] hover:bg-[#a86856] text-white py-4 font-body"
              data-testid="login-submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-[#788275]">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#C07A65] hover:text-[#a86856]" data-testid="register-link">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-[#E8ECE1] text-center">
          <p className="font-body text-sm text-[#788275]">
            <strong>Demo Admin:</strong> admin@petals.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

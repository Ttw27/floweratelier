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
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" data-testid="register-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-light text-[#233520] mb-2" data-testid="register-title">
            Create Account
          </h1>
          <p className="font-body text-[#788275]">
            Join us and enjoy exclusive benefits
          </p>
        </div>

        <div className="bg-white border border-[#E3E5DF] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="font-body text-[#233520]">Full Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                placeholder="John Smith"
                required
                data-testid="register-name"
              />
            </div>
            <div>
              <Label className="font-body text-[#233520]">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                placeholder="you@example.com"
                required
                data-testid="register-email"
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
                data-testid="register-password"
              />
            </div>
            <div>
              <Label className="font-body text-[#233520]">Confirm Password</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 border-[#E3E5DF] focus:border-[#C07A65]"
                placeholder="••••••••"
                required
                data-testid="register-confirm-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C07A65] hover:bg-[#a86856] text-white py-4 font-body"
              data-testid="register-submit"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-[#788275]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#C07A65] hover:text-[#a86856]" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

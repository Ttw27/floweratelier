import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LoginsAdmin() {
  const { user, applyAuth } = useAuth();
  const [form, setForm] = useState({ name: "", new_email: "", new_password: "", confirm_password: "", current_password: "" });
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [grantEmail, setGrantEmail] = useState("");

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name || "", new_email: f.new_email || user.email || "" }));
  }, [user]);

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/admins`);
      setAdmins(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error("Failed to load admin accounts");
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const saveMyLogin = async (e) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      toast.error("The new passwords don't match");
      return;
    }
    if (!form.current_password) {
      toast.error("Enter your current password to confirm the change");
      return;
    }
    setSaving(true);
    try {
      const r = await axios.put(`${API_URL}/api/auth/me/credentials`, {
        current_password: form.current_password,
        new_email: form.new_email,
        new_password: form.new_password || null,
        name: form.name,
      });
      applyAuth(r.data.access_token, r.data.user);
      setForm((f) => ({ ...f, new_password: "", confirm_password: "", current_password: "" }));
      toast.success("Your login has been updated");
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update your login");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (a) => {
    if (!window.confirm(`Remove admin access from ${a.email}? Their account is kept, but they will no longer be able to open Admin.`)) return;
    try {
      await axios.put(`${API_URL}/api/admin/admins/${a.id}/revoke`);
      toast.success("Admin access removed");
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not remove access");
    }
  };

  const grant = async (e) => {
    e.preventDefault();
    if (!grantEmail.trim()) return;
    if (!window.confirm(`Give ${grantEmail.trim()} full admin access?`)) return;
    try {
      await axios.post(`${API_URL}/api/admin/admins`, { email: grantEmail.trim() });
      toast.success("Admin access granted");
      setGrantEmail("");
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not grant access");
    }
  };

  const demoAccounts = admins.filter((a) => a.uses_demo_password);

  return (
    <div className="space-y-10" data-testid="logins-admin">
      {demoAccounts.length > 0 && (
        <div className="flex gap-3 border border-red-200 bg-red-50 p-4" data-testid="logins-demo-warning">
          <AlertTriangle size={18} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-body text-sm text-red-800">
            {demoAccounts.map((a) => a.email).join(", ")} still {demoAccounts.length === 1 ? "uses" : "use"} the old demo password, which has been public.
            {demoAccounts.some((a) => a.is_you)
              ? " Change your email and password below now."
              : " Remove its admin access below."}
          </p>
        </div>
      )}

      {/* Your own login */}
      <section className="bg-white border border-[#E5E5E5] p-6 md:p-8">
        <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-1">Your login</h2>
        <p className="font-body text-sm text-[#7A7A7A] mb-6">Change the email and password you use to sign in to Admin.</p>
        <form onSubmit={saveMyLogin} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          <div>
            <Label className="text-[#1A1A1A] text-sm">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="light-input rounded-none mt-2" data-testid="logins-name" />
          </div>
          <div>
            <Label className="text-[#1A1A1A] text-sm">Login email</Label>
            <Input type="email" value={form.new_email} onChange={(e) => setForm({ ...form, new_email: e.target.value })} className="light-input rounded-none mt-2" data-testid="logins-email" />
          </div>
          <div>
            <Label className="text-[#1A1A1A] text-sm">New password</Label>
            <Input type="password" autoComplete="new-password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} placeholder="Leave blank to keep current" className="light-input rounded-none mt-2" data-testid="logins-new-password" />
            <p className="font-body text-[11px] text-[#7A7A7A] mt-2">At least 8 characters.</p>
          </div>
          <div>
            <Label className="text-[#1A1A1A] text-sm">Confirm new password</Label>
            <Input type="password" autoComplete="new-password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className="light-input rounded-none mt-2" data-testid="logins-confirm-password" />
          </div>
          <div className="md:col-span-2 border-t border-[#E5E5E5] pt-5">
            <Label className="text-[#1A1A1A] text-sm">Current password (to confirm)</Label>
            <Input type="password" autoComplete="current-password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} className="light-input rounded-none mt-2 max-w-sm" data-testid="logins-current-password" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving} className="btn-dark rounded-none" data-testid="logins-save">
              {saving ? "Saving..." : "Update my login"}
            </Button>
          </div>
        </form>
      </section>

      {/* Who has admin access */}
      <section className="bg-white border border-[#E5E5E5] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-heading text-2xl font-light text-[#1A1A1A] mb-1">Who has admin access</h2>
            <p className="font-body text-sm text-[#7A7A7A]">Everyone listed here can open Admin and change the site.</p>
          </div>
          <Button type="button" variant="outline" onClick={loadAdmins} className="rounded-none shrink-0"><RefreshCw size={14} /></Button>
        </div>
        {loadingAdmins ? (
          <p className="font-body text-sm text-[#7A7A7A]">Loading...</p>
        ) : (
          <ul className="divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
            {admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3" data-testid={`logins-admin-${a.id}`}>
                <div className="min-w-0">
                  <p className="font-body text-sm text-[#1A1A1A] break-all">
                    {a.email}
                    {a.is_you && <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#F2EFEB] text-[#5A5A5A]">You</span>}
                    {a.uses_demo_password && <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-red-100 text-red-700">Demo password</span>}
                  </p>
                  {a.name && <p className="font-body text-xs text-[#7A7A7A]">{a.name}</p>}
                </div>
                {!a.is_you && (
                  <Button type="button" variant="outline" onClick={() => revoke(a)} className="rounded-none text-xs" data-testid={`logins-revoke-${a.id}`}>
                    Remove admin access
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={grant} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl">
          <Input type="email" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="Email of someone who has registered on the site" className="light-input rounded-none" data-testid="logins-grant-email" />
          <Button type="submit" variant="outline" className="rounded-none shrink-0" data-testid="logins-grant">Give admin access</Button>
        </form>
      </section>
    </div>
  );
}

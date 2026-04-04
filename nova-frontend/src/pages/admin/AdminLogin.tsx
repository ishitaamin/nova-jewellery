import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();

  // ✅ MADE THIS ASYNC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ ADDED AWAIT
    const success = await adminLogin(email, password);
    
    if (success) {
      navigate("/admin"); // Redirects to the dashboard
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-wide text-gold">NOVA</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@nova.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
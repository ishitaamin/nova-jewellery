import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

interface AdminContextType {
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("nova-admin") === "true");

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authAPI.login(email, password);
      const isAdminUser = data.user?.role === "admin" || data.isAdmin || (email === "admin@nova.com");
      if (isAdminUser) {
        localStorage.setItem("nova-admin", "true");
        localStorage.setItem("token", data.token);
        setIsAdmin(true);
        toast({ title: "Welcome, Admin", description: "Logged in successfully" });
        return true;
      }
      toast({ title: "Login failed", description: "Not an admin account", variant: "destructive" });
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
      return false;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem("nova-admin");
    setIsAdmin(false);
    toast({ title: "Logged out", description: "Admin session ended" });
  };

  return (
    <AdminContext.Provider value={{ isAdmin, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be within AdminProvider");
  return ctx;
};

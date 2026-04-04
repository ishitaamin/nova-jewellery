import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

export interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verify: (email: string, otp: string) => Promise<boolean>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("nova-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  // ✅ Sync user with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("nova-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("nova-user");
    }
  }, [user]);

  // ✅ Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ REGISTER
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      await authAPI.register(name, email, password);
  
      toast({
        title: "OTP Sent!",
        description: "Please verify your email",
      });
  
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
  
      toast({
        title: "Registration failed",
        description: msg,
        variant: "destructive",
      });
  
      return false;
    }
  };

  // ✅ LOGIN
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data } = await authAPI.login(email, password);
  
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
      };
  
      setUser(user);
      setToken(data.token);
  
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.name}`,
      });
  
      return { success: true };
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Invalid email or password";
  
      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive",
      });
  
      return { success: false, message: msg };
    }
  };


  // Add this inside AuthProvider, right below the register function
  const verify = async (email: string, otp: string): Promise<boolean> => {
    try {
      const { data } = await authAPI.verifyOTP(email, otp);

      // Update global state immediately
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
      setToken(data.token);

      toast({
        title: "Success",
        description: "Email verified successfully! You are now logged in.",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.response?.data?.message || "Invalid OTP",
        variant: "destructive",
      });
      return false;
    }
  };
  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);

    toast({
      title: "Logged out",
      description: "See you soon!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout ,verify}}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};
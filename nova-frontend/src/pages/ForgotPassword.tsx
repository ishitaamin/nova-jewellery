import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast({ title: "OTP Sent", description: "Check your email for the reset code." });
      setStep(2);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to send OTP", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      toast({ title: "Password Reset Successful", description: "You can now log in with your new password." });
      window.location.href = "/login";
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to reset password", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">Reset Password</h1>
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full border p-3 rounded-md" />
            <button type="submit" disabled={loading} className="w-full bg-foreground text-background py-3 rounded-md">{loading ? "Sending..." : "Send OTP"}</button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input required type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full border p-3 rounded-md" />
            <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" minLength={6} className="w-full border p-3 rounded-md" />
            <button type="submit" disabled={loading} className="w-full bg-foreground text-background py-3 rounded-md">{loading ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to Login</Link>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
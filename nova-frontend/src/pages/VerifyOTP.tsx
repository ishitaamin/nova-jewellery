import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verify } = useAuth();

  const email = location.state?.email;

  const handleVerify = async () => {
    setLoading(true);
    const success = await verify(email, otp);
    setLoading(false);

    if (success) {
      navigate("/profile");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-center">Verify OTP</h1>
        <p className="text-sm text-center text-muted-foreground mt-2">
          Enter the OTP sent to your email
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="mt-6 w-full border px-4 py-3 rounded-md text-center text-lg tracking-widest"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="mt-6 w-full bg-foreground text-background py-3 rounded-md"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </main>
  );
};

export default VerifyOTP;
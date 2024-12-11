"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get email from session storage (you can also use localStorage or other means of storing the email)
  const email = sessionStorage.getItem("email");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("http://localhost:8000/api/users/verify-otp/", {
        otp, // OTP entered by the user
        email, // Pass the email from sessionStorage
      });

      if (res.status === 200) {
        // OTP verified successfully - redirect to login page
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Verify OTP</h1>
      <form onSubmit={handleVerifyOTP}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

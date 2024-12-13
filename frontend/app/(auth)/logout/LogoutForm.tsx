"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

export default function LogoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call logout API
      await api.post("http://localhost:8000/api/users/logout/");

      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");

      // Redirect to login or home page
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Logout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Logout</h1>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

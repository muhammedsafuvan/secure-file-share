"use client";
import { useState } from "react";
import api from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      // Send registration data to the backend
      const res = await api.post("/api/users/register/", {
        username, // Required field
        email, // Required field
        password, // Required field
      });

      console.log("RES", res)

      if (res.status === 201) {
        sessionStorage.setItem("email", email);

        // Successful registration - redirect to OTP verification page
        router.push("/verify-otp");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.email?.[0] ||
        error.response?.data?.username?.[0] ||
        error.response?.data?.password?.[0] ||
        "Registration failed."
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <p>
        Already have an account? <Link href="/login">Login here</Link>.
      </p>
    </div>
  );
}

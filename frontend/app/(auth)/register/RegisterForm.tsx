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

  const validateInputs = () => {
    // Username validation: alphanumeric and length between 3-20 characters
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError("Username must be alphanumeric and 6-20 characters long.");
      return false;
    }
    if (username.length < 6) {
      setError("Username must be at least 6 characters long.");
      return false;
    }

    // Email validation: standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password validation: at least 6 characters
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Validate inputs before sending the request
    if (!validateInputs()) {
      return;
    }

    try {
      // Send registration data to the backend
      const res = await api.post("/api/users/register/", {
        username,
        email,
        password,
      });

      console.log("RES", res);

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
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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

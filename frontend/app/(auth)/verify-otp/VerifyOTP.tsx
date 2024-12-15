"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import AxiosError

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Ensure this runs only on the client side
    const storedEmail = sessionStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific error
        setError(err.response?.data?.error || "OTP verification failed.");
      } else {
        // Handle non-Axios errors
        setError("An unknown error occurred.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Verify your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label
                  htmlFor="otp"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  id="otp"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading} // Disable the button when loading
                className={`w-full h-10 text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-8 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

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
                className="w-full h-10 text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-8 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >Verify
              </button>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
              {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign in
                </a>
              </p> */}
            </form>
          </div>
        </div>
      </div>
    </section>
    // <div>
    //   <h1>Verify OTP</h1>
    //   <form onSubmit={handleVerifyOTP}>
    //     <input
    //       type="text"
    //       placeholder="Enter OTP"
    //       value={otp}
    //       onChange={(e) => setOtp(e.target.value)}
    //       required
    //     />
    //     <button type="submit" disabled={loading}>
    //       {loading ? "Verifying..." : "Verify OTP"}
    //     </button>
    //   </form>
    //   {error && <p style={{ color: "red" }}>{error}</p>}
    // </div>
  );
}

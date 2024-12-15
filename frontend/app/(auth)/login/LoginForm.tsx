"use client";
import { AxiosError } from 'axios';

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateInputs = () => {
    // Email validation: checks if the email is in a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password validation: checks for minimum length of 6 characters
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs before sending to the server
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("http://localhost:8000/api/users/login/", {
        email,
        password,
      });

      // Save access token
      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("userEmail", email);

      // Redirect to dashboard or home page
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Login failed.");
      } else {
        setError("An unknown error occurred.");
      }
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
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Sign in"}
              </button>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <a
                  href="/register"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

  // return (
  //   // <div>
  //   //   <h1>Login</h1>
  //   //   <form onSubmit={handleLogin}>
  //   //     <input
  //   //       type="email"
  //   //       placeholder="Email"
  //   //       value={email}
  //   //       onChange={(e) => setEmail(e.target.value)}
  //   //       required
  //   //     />
  //   //     <input
  //   //       type="password"
  //   //       placeholder="Password"
  //   //       value={password}
  //   //       onChange={(e) => setPassword(e.target.value)}
  //   //       required
  //   //     />
  //   //     <button type="submit" disabled={loading}>
  //   //       {loading ? "Logging in..." : "Login"}
  //   //     </button>
  //   //   </form>
  //   //   {error && <p style={{ color: "red" }}>{error}</p>}
  //   // </div>



  // //   <div className="blank-layout-container justify-content-center align-items-center bg-light">
  // //   <div className="position-relative row w-100 h-100 bg-gradient justify-content-center">
  // //     <div className="col-lg-4 d-flex align-items-center">
  // //       <Card className="cardWithShadow boxed-auth">
  // //         <CardContent className="p-32">
  // //           <div className="text-center">
  // //             {/* <Link href="/dashboard">
  // //               <img
  // //                 src="./assets/images/logos/logo.svg"
  // //                 className="align-middle m-2"
  // //                 alt="logo"
  // //               />
  // //             </Link> */}
  // //           </div>

  // //           <div className="row m-t-24 custom-row">
  // //             <div className="col-6">
  // //               {/* <Button
  // //                 variant="outlined"
  // //                 className="w-100 d-flex align-items-center"
  // //               >
  // //                 <div className="d-flex align-items-center">
  // //                   <img
  // //                     src="/assets/images/svgs/google-icon.svg"
  // //                     alt="google"
  // //                     width={16}
  // //                     className="m-r-8"
  // //                   />
  // //                   <span className="d-none d-lg-block">
  // //                     Sign in with Google
  // //                   </span>
  // //                 </div>
  // //               </Button>
  // //             </div>
  // //             <div className="col-6">
  // //               <Button
  // //                 variant="outlined"
  // //                 className="w-100 d-flex align-items-center"
  // //               >
  // //                 <div className="d-flex align-items-center">
  // //                   <img
  // //                     src="/assets/images/svgs/facebook-icon.svg"
  // //                     alt="facebook"
  // //                     width={40}
  // //                     className="m-r-4"
  // //                   />
  // //                   <span className="d-none d-lg-block">
  // //                     Sign in with FB
  // //                   </span>
  // //                 </div>
  // //               </Button> */}
  // //             </div>
  // //           </div>

  // //           {/* <div className="or-border m-t-30">or sign in with</div> */}

  // //           <form className="m-t-30" onSubmit={handleLogin}>
  // //     <label className="mat-subtitle-2 f-s-14 f-w-600 m-b-12 d-block">
  // //       Email
  // //     </label>
  // //     <TextField
  // //       variant="outlined"
  // //       fullWidth
  // //       size="small"
  // //       type="email"
  // //       color="primary"
  // //       placeholder="Email"
  // //       value={email}
  // //       onChange={(e) => setEmail(e.target.value)}
  // //       required
  // //     />
  // //     <br />
  // //     <br />
  // //     <label className="mat-subtitle-2 f-s-14 f-w-600 m-b-12 d-block">
  // //       Password
  // //     </label>
  // //     <TextField
  // //       variant="outlined"
  // //       fullWidth
  // //       size="small"
  // //       type="password"
  // //       color="primary"
  // //       placeholder="Password"
  // //       value={password}
  // //       onChange={(e) => setPassword(e.target.value)}
  // //       required
  // //     />
  // //     <br />
  // //     <br />
  // //     <Button
  // //       type="submit"
  // //       variant="contained"
  // //       color="primary"
  // //       fullWidth
  // //       className="w-100"
  // //       disabled={loading}
  // //     >
  // //       {loading ? "Logging in..." : "Sign In"}
  // //     </Button>
  // //     {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}
  // //   </form>
  // //           <br />
  // //           {/* <br /> */}
  // //           <span className="d-block f-w-500 text-center m-t-24">
  // //             {/* New to MaterialM?{" "} */}
  // //             <Link
  // //               href="/register"
  // //               className="text-decoration-none text-primary f-w-500 f-s-14"
  // //             >
  // //               Create an account
  // //             </Link>
  // //           </span>
  // //         </CardContent>
  // //       </Card>
  // //     </div>
  // //   </div>
  // // </div>



  // );
// }

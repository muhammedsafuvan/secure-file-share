"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from 'next/image';
import Link from 'next/link'


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const imgSource = '/assets/img/login-office-dark.jpeg';


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
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
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>

  //   <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
  //   <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
  //     <div className="flex flex-col overflow-y-auto md:flex-row">
  //       {/* <div className="relative h-32 md:h-auto md:w-1/2">
  //         <Image
  //           aria-hidden="true"
  //           className="hidden object-cover w-full h-full"
  //           src={imgSource}
  //           alt="Office"
  //           layout="fill"
  //         />
  //       </div> */}
  //       <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
  //         <div className="w-full">
  //           <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
  //             Login
  //           </h1>
            
  //           <div className="form-control w-full">
  //             <label className="label">
  //               <span className="label-text">Email</span>
  //             </label>
  //             <input
  //               type="email"
  //               placeholder="john@doe.com"
  //               className="input input-bordered w-full"
  //             />
  //           </div>

  //           <div className="form-control w-full mt-4">
  //             <label className="label">
  //               <span className="label-text">Password</span>
  //             </label>
  //             <input
  //               type="password"
  //               placeholder="***************"
  //               className="input input-bordered w-full"
  //             />
  //           </div>

  //           <Link href="/example" passHref>
  //             <button className="btn btn-primary w-full mt-4">
  //               Log in
  //             </button>
  //           </Link>

  //           <hr className="my-8" />

  //           <p className="mt-1">
  //             <Link href="/example/create-account">
  //               {/* <a className="text-sm font-medium text-primary hover:underline"> */}
  //                 Create account
  //               {/* </a> */}
  //             </Link>
  //           </p>
  //         </div>
  //       </main>
  //     </div>
  //   </div>
  // </div>
  );
}



// import React, { useContext } from 'react'
// import Link from 'next/link'
// import Image from 'next/image'

// import { Label, Input, Button, WindmillContext } from '@roketid/windmill-react-ui'
// import { GithubIcon, TwitterIcon } from 'icons'

// function LoginPage() {
//   const { mode } = useContext(WindmillContext)
//   const imgSource = mode === 'dark' ? '/assets/img/login-office-dark.jpeg' : '/assets/img/login-office.jpeg'

//   return (
//     <div className='flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900'>
//       <div className='flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800'>
//         <div className='flex flex-col overflow-y-auto md:flex-row'>
//           <div className='relative h-32 md:h-auto md:w-1/2'>
//             <Image
//               aria-hidden='true'
//               className='hidden object-cover w-full h-full'
//               src={imgSource}
//               alt='Office'
//               layout='fill'
//             />
//           </div>
//           <main className='flex items-center justify-center p-6 sm:p-12 md:w-1/2'>
//             <div className='w-full'>
//               <h1 className='mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200'>
//                 Login
//               </h1>
//               <Label>
//                 <span>Email</span>
//                 <Input
//                   className='mt-1'
//                   type='email'
//                   placeholder='john@doe.com'
//                 />
//               </Label>

//               <Label className='mt-4'>
//                 <span>Password</span>
//                 <Input
//                   className='mt-1'
//                   type='password'
//                   placeholder='***************'
//                 />
//               </Label>

//               <Link href='/example' passHref={true}>
//                 <Button className='mt-4' block>
//                   Log in
//                 </Button>
//               </Link>

//               <hr className='my-8' />

//               <Button block layout='outline'>
//                 <GithubIcon className='w-4 h-4 mr-2' aria-hidden='true' />
//                 Github
//               </Button>
//               <Button className='mt-4' block layout='outline'>
//                 <TwitterIcon className='w-4 h-4 mr-2' aria-hidden='true' />
//                 Twitter
//               </Button>

//               <p className='mt-4'>
//                 <Link href='/example/forgot-password'>
//                   <a className='text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline'>
//                     Forgot your password?
//                   </a>
//                 </Link>
//               </p>
//               <p className='mt-1'>
//                 <Link href='/example/create-account'>
//                   <a className='text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline'>
//                     Create account
//                   </a>
//                 </Link>
//               </p>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage
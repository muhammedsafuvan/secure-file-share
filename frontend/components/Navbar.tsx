"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux"; // Import useSelector
import { clearUser } from "@/redux/slices/userSlice";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get the loggedIn state from the Redux store

  const handleLogout = () => {
    dispatch(clearUser()); // Clear user data from Redux
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    router.push("/login"); // Redirect to login page
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-white font-bold text-2xl">
          <Link href="/">FileShare</Link>
        </div>
        <ul className="flex space-x-6 text-white">
          <li>
            <Link href="/" className="hover:text-emerald-400">Home</Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          </li>
          <li>
            <Link href="/files" className="hover:text-emerald-400">Files</Link>
          </li>
          <li>
          <button onClick={handleLogout}>Logout</button>
            
          </li>
          
        </ul>
      </div>
    </nav>
  );
}

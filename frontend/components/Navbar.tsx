"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux"; // Import useSelector
import { clearUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get the loggedIn state from the Redux store
  const loggedIn = useSelector((state: RootState) => state.user.loggedIn);


  const handleLogout = () => {
    dispatch(clearUser()); // Clear user data from Redux
    localStorage.removeItem("authToken");
    router.push("/login"); // Redirect to login page
  };

  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          {loggedIn ? (
            <button onClick={handleLogout}>Logout</button> // Show Logout if logged in
          ) : (
            <Link href="/login">Login</Link> // Show Login if not logged in
          )}
        </li>
      </ul>
    </nav>
  );
}

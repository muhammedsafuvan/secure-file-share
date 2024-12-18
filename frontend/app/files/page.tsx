"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import FileList from "./FileList";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <p>Loading...</p>; // Show a loading state during authentication check
  }

  if (!isAuthenticated) {
    return null; // Prevent unauthorized users from seeing any content
  }

  return (
    <main>
    <Navbar />
      <FileList />
    </main>
  );
}

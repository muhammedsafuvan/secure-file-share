"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api"; // Ensure api utility attaches Authorization header
import { useRouter } from "next/navigation"; // Use correct import

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Disable button until email is retrieved
  const router = useRouter();
  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail ? userEmail.split("@")[0] : null;


  useEffect(() => {
    // Retrieve email from localStorage (or other secure storage)
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      // Redirect to login if email is not found
      router.push("/login");
    } else {
      setIsLoading(false); // Enable the button
    }
  }, [router]);

  const handleUpload = async () => {
    console.log("FILE", file)
    if (!file) {
      alert("Please select a file!");
      return;
    }

    // Validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Invalid file type. Please upload PNG, JPEG, PDF, or DOCX files.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File size exceeds the 5 MB limit.");
      return;
    }

    try {      
      const formData = new FormData();
      formData.append("file", file);  // Append the file without encryption
      formData.append("file_name", file.name);  


      // Make API call
      await api.post("http://localhost:8000/api/files/upload/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      alert("File uploaded successfully!");
      router.push("/files");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-gray-900 py-12 px-6">
    {/* Heading at the top */}
    <h2 className="text-4xl font-semibold text-center text-gray-900 dark:text-white mb-6">
      Welcome back, <span className="text-5xl font-bold text-emerald-600">{userName || 'User'}</span>!
    </h2>
    <br /><br />
    <div className="w-full max-w-lg bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 p-8">
      <h1 className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white text-center mb-6">
        Secure File Upload
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Upload your files securely with ease. Ensure your files are under 5MB and in the supported formats.
      </p>

      <div className="flex flex-col items-center space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full max-w-md text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 mb-6"
          disabled={isLoading} // Disable input until email is retrieved
        />
        
        <button
          onClick={handleUpload}
          className={`w-full max-w-md py-2 px-4 rounded-lg text-white ${
            isLoading || !file ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'
          } focus:ring-4 focus:outline-none focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800`}
          disabled={isLoading || !file} // Disable button if loading or no file selected
        >
          {isLoading ? 'Loading...' : 'Upload File'}
        </button>
      </div>
    </div>
  </div>
  );
}

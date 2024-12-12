"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api"; // Ensure api utility attaches Authorization header
import { useRouter } from "next/navigation"; // Use correct import
import { encryptFile } from "@/utils/encryption"; // Assuming this function exists

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

      // Create FormData for file upload
      // const formData = new FormData();
      // formData.append("file", encryptedFile);
      // formData.append("encryption_key", encryptedKey);
      // formData.append("iv", iv);

      // Make API call
      await api.post("http://localhost:8000/api/files/upload/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={isLoading} // Disable input until email is retrieved
      />
      <button
        onClick={handleUpload}
        disabled={isLoading || !file} // Disable button if loading or no file selected
      >
        Upload
      </button>
    </div>
  );
}

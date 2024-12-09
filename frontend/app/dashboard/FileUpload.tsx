"use client";
import { useState } from "react";
import api from "@/utils/api";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/files/upload", formData);
      alert("File uploaded successfully!");
    } catch (error) {
      alert("Failed to upload file.");
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

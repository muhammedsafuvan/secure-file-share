"use client";
import { useState } from "react";
import api from "@/utils/api";
import { AxiosError } from "axios";

interface SecureShareLinkProps {
  fileId: string;
}

export default function SecureShareLink({ fileId }: SecureShareLinkProps) {
  const [link, setLink] = useState("");

  const generateLink = async () => {
    try {
      const res = await api.post(`/files/${fileId}/share`, {
        expiresIn: 3600, // 1 hour
      });
      setLink(res.data.link);
    } catch (error: unknown) {
      alert("Failed to generate link.");
      if (error instanceof AxiosError) {
        console.error("Error details:", error.response?.data);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  return (
    <div>
      <button onClick={generateLink}>Generate Secure Link</button>
      {link && <p>Shareable Link: {link}</p>}
    </div>
  );
}

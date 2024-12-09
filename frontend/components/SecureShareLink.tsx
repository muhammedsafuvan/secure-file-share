"use client";
import { useState } from "react";
import api from "@/utils/api";

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
    } catch (error) {
      alert("Failed to generate link.");
    }
  };

  return (
    <div>
      <button onClick={generateLink}>Generate Secure Link</button>
      {link && <p>Shareable Link: {link}</p>}
    </div>
  );
}

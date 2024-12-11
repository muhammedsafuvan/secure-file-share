"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";

type File = {
  id: string;
  name: string;
  download_url: string;
};

export default function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get("/files");
        setFiles(res.data);
      } catch (err) {
        setError("Failed to fetch files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (file: File) => {
    try {
      const res = await fetch(file.download_url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href); // Clean up
    } catch {
      alert("Failed to download file.");
    }
  };

  if (loading) return <div>Loading files...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Uploaded Files</h2>
      {files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.name}{" "}
              <button onClick={() => handleDownload(file)}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";

type File = {
  id: string;
  owner: string;
  name: string;
  file: string;
  encrypted_content: string;
  encryption_key: string;
  iv: string;
  uploaded_at: string;
  updated_at: string;
};

export default function FileList() {
  const [ownedFiles, setOwnedFiles] = useState<File[]>([]);
  const [sharedFiles, setSharedFiles] = useState<File[]>([]);
  const [loadingOwned, setLoadingOwned] = useState<boolean>(true);
  const [loadingShared, setLoadingShared] = useState<boolean>(true);
  const [errorOwned, setErrorOwned] = useState<string | null>(null);
  const [errorShared, setErrorShared] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnedFiles = async () => {
      try {
        const res = await api.get("http://localhost:8000/api/files/owned/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setOwnedFiles(res.data);
      } catch (err) {
        setErrorOwned("Failed to fetch owned files.");
      } finally {
        setLoadingOwned(false);
      }
    };

    const fetchSharedFiles = async () => {
      try {
        const res = await api.get("http://localhost:8000/api/files/shared/");
        setSharedFiles(res.data);
      } catch (err) {
        setErrorShared("Failed to fetch shared files.");
      } finally {
        setLoadingShared(false);
      }
    };

    fetchOwnedFiles();
    fetchSharedFiles();
  }, []);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`http://localhost:8000/api/files/download/${fileId}/`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file.");
    }
  };

  const handlePreview = async (fileId: string) => {
    try {
      // Make a GET request to download the decrypted file
      const response = await api.get(`http://localhost:8000/api/files/download/${fileId}/`, {
        responseType: "blob", // Ensure we get the file as a binary blob
      });
  
      // Extract MIME type and filename from the headers
      const contentType = response.headers["content-type"] || "application/octet-stream";
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "file";
  
      if (contentDisposition && contentDisposition.includes("filename=")) {
        fileName = contentDisposition.split("filename=")[1].replace(/"/g, "");
      }
  
      // Create a Blob for the file data
      const blob = new Blob([response.data], { type: contentType });
  
      // Handle file preview based on content type
      const previewUrl = URL.createObjectURL(blob);
  
      if (contentType.startsWith("image/")) {
        // Directly set preview for image files
        // setPreviewUrl(previewUrl);
        window.open(previewUrl, "_blank");
      } else if (contentType === "application/pdf") {
        // Open PDF in a new browser tab
        window.open(previewUrl, "_blank");
      } else {
        // For unsupported preview types, trigger download
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      alert("Failed to preview the file.");
    }
  };
  

  return (
    <div>
      <h2>Uploaded Files</h2>
      <div>
        <h3>Owned Files</h3>
        {loadingOwned ? (
          <p>Loading owned files...</p>
        ) : errorOwned ? (
          <p style={{ color: "red" }}>{errorOwned}</p>
        ) : ownedFiles.length === 0 ? (
          <p>No owned files found.</p>
        ) : (
          <ul>
            {ownedFiles.map((file) => (
              <li key={file.id}>
                {file.name}{" "}
                <button onClick={() => handleDownload(file.id, file.name)}>Download</button>{" "}
                <button onClick={() => handlePreview(file.id)}>Preview</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>Shared Files</h3>
        {loadingShared ? (
          <p>Loading shared files...</p>
        ) : errorShared ? (
          <p style={{ color: "red" }}>{errorShared}</p>
        ) : sharedFiles.length === 0 ? (
          <p>No shared files found.</p>
        ) : (
          <ul>
            {sharedFiles.map((file) => (
              <li key={file.id}>
                {file.name}{" "}
                <button onClick={() => handleDownload(file.id, file.name)}>Download</button>{" "}
                <button onClick={() => handlePreview(file.id)}>Preview</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {previewUrl && (
        <div>
          <h3>Preview</h3>
          {/* Adjust preview logic based on the file type */}
          <iframe src={previewUrl} width="100%" height="500px" style={{ border: "none" }}></iframe>
          <button onClick={() => setPreviewUrl(null)}>Close Preview</button>
        </div>
      )}
    </div>
  );
}

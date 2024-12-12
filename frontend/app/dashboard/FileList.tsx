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

  // const handleDownload = async (file: File) => {
  //   try {
  //     const res = await fetch(file.file); // Assuming `file` contains the downloadable URL
  //     const blob = await res.blob();
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = file.name;
  //     link.click();
  //     URL.revokeObjectURL(link.href); // Clean up
  //   } catch {
  //     alert("Failed to download file.");
  //   }
  // };

  const handleDownload = async (fileId: string, fileName: string) => {
    console.log("FILE ID", fileId)
    try {
      // Make a GET request to the API endpoint
      const response = await api.get(`http://localhost:8000/api/files/download/${fileId}/`, {
        responseType: 'blob', // Ensure the response is treated as a binary blob
      });
  
      // Create a blob from the response data
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
  
      // Generate a temporary URL for the blob and set it for the download link
      link.href = URL.createObjectURL(blob);
      link.download = fileName; // Use the provided file name
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file.');
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
                <button onClick={() => handleDownload(file.id, file.name)}>Download</button>
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
                <button onClick={() => handleDownload(file.id, file.name)}>Download</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

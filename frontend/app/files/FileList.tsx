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
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [emailToShare, setEmailToShare] = useState<string>("");
  const [fileToShare, setFileToShare] = useState<string | null>(null);
  const [expireTime, setExpireTime] = useState<string>("");

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
        setErrorOwned("No owned files found. Start by uploading your files.");
      } finally {
        setLoadingOwned(false);
      }
    };

    const fetchSharedFiles = async () => {
      try {
        const res = await api.get("http://localhost:8000/api/files/shared/");
        setSharedFiles(res.data);
      } catch (err) {
        setErrorShared("No shared files found.");
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

  const handlePreview = async (fileId: string, isView: boolean = false) => {
    try {
      const response = await api.get(`http://localhost:8000/api/files/download/${fileId}/`, {
        params: { isView: isView }, 
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const previewUrl = URL.createObjectURL(blob);

      if (contentType.startsWith("image/") || contentType === "application/pdf") {
        window.open(previewUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = "file";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      alert("Failed to preview the file.");
    }
  };

  const handleShare = (fileId: string) => {
    setFileToShare(fileId);
    setShowShareModal(true);
  };

  const handleConfirmShare = async () => {
    if (!fileToShare || !emailToShare || !expireTime) return;

    try {
      await api.post(`http://localhost:8000/api/files/share/${fileToShare}/`, {
        email: emailToShare,
        expire_time: parseInt(expireTime, 10),
      });
      alert("File shared successfully!");
      setShowShareModal(false);
      setEmailToShare("");
      setExpireTime("");
      setFileToShare(null);
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Failed to share the file.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-gray-900 py-12 px-6">
      <h2 className="text-4xl font-semibold text-center text-gray-900 dark:text-white mb-6">
        Uploaded Files
      </h2>
  
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Owned Files
        </h3>
  
        {loadingOwned ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">Loading owned files...</p>
        ) : errorOwned ? (
          <p className="text-gray-400 text-center">{errorOwned}</p>
        ) : ownedFiles.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-600 text-center">No owned files found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {ownedFiles.map((file) => (
              <div
                className="w-full max-w-md md:max-w-2xl h-auto bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:border-gray-700"
                key={file.id}
              >
                <p className="text-gray-900 dark:text-white mb-4">{file.name}</p>
                <div className="flex justify-between space-x-4">
                  <button
                    onClick={() => handleDownload(file.id, file.name)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handlePreview(file.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleShare(file.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
  
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
          Shared Files
        </h3>
  
        {loadingShared ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">Loading shared files...</p>
        ) : errorShared ? (
          <p className="text-gray-400 text-center">{errorShared}</p>
        ) : sharedFiles.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-600 text-center">No shared files found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {sharedFiles.map((file) => (
              <div
                className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:border-gray-700"
                key={file.id}
              >
                <p className="text-gray-900 dark:text-white mb-4">{file.name}</p>
                <button
                  onClick={() => handlePreview(file.id, true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
            <iframe src={previewUrl} width="100%" height="500px" className="mb-4"></iframe>
            <button
              onClick={() => setPreviewUrl(null)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg dark:bg-red-600 dark:hover:bg-red-700"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
  
  {showShareModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-10 w-full sm:w-96 md:w-[600px] dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Share File</h3>

      <div className="mb-6">
        <label className="block text-gray-900 dark:text-white mb-2">Email Address:</label>
        <input
          type="email"
          value={emailToShare}
          onChange={(e) => setEmailToShare(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-900 dark:text-white mb-2">Expire Time (hours):</label>
        <input
          type="number"
          value={expireTime}
          onChange={(e) => setExpireTime(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleConfirmShare}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          Confirm
        </button>
        <button
          onClick={() => setShowShareModal(false)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg dark:bg-red-600 dark:hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
  
  
  
    
}

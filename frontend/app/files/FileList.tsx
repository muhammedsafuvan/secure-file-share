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

  const handlePreview = async (fileId: string) => {
    try {
      const response = await api.get(`http://localhost:8000/api/files/download/${fileId}/`, {
        params: { isView: "true" }, 
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
    <div>
      <h2>Uploaded Files</h2>
      <div>
        <h3>Owned Files</h3>
        {loadingOwned ? (
          <p>Loading owned files...</p>
        ) : errorOwned ? (
          <p style={{ color: "grey" }}>{errorOwned}</p>
        ) : ownedFiles.length === 0 ? (
          <p>No owned files found.</p>
        ) : (
          <ul>
            {ownedFiles.map((file) => (
              <li key={file.id}>
                {file.name} {" "}
                <button onClick={() => handleDownload(file.id, file.name)}>Download</button> {" "}
                <button onClick={() => handlePreview(file.id)}>View</button> {" "}
                <button onClick={() => handleShare(file.id)}>Share</button>
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
          <p style={{ color: "grey" }}>{errorShared}</p>
        ) : sharedFiles.length === 0 ? (
          <p>No shared files found.</p>
        ) : (
          <ul>
            {sharedFiles.map((file) => (
              <li key={file.id}>
                {file.name} {" "}
                <button onClick={() => handlePreview(file.id)}>View</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {previewUrl && (
        <div>
          <h3>Preview</h3>
          <iframe src={previewUrl} width="100%" height="500px" style={{ border: "none" }}></iframe>
          <button onClick={() => setPreviewUrl(null)}>Close Preview</button>
        </div>
      )}

      {/* {showShareModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Share File</h3>
            <input
              type="email"
              placeholder="Enter email address"
              value={emailToShare}
              onChange={(e) => setEmailToShare(e.target.value)}
            />
            <button onClick={handleConfirmShare}>Confirm</button>
            <button onClick={() => setShowShareModal(false)}>Cancel</button>
          </div>
        </div>
      )} */}

{showShareModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Share File</h3>
            <div style={{ marginBottom: "10px" }}>
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={emailToShare}
                onChange={(e) => setEmailToShare(e.target.value)}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Expire Time (hours):</label>
              <input
                type="number"
                placeholder="Enter expire time"
                value={expireTime}
                onChange={(e) => setExpireTime(e.target.value)}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={handleConfirmShare} style={{ padding: "5px 10px" }}>
                Confirm
              </button>
              <button onClick={() => setShowShareModal(false)} style={{ padding: "5px 10px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 300px;
        }

        label {
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }

        input {
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          border: none;
          cursor: pointer;
        }

        button:hover {
          background: #f0f0f0;
        }
      `}</style>

    </div>
  );
}

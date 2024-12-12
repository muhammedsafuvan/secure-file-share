export async function encryptFile(file: File) {
  // Generate a random 256-bit key (32 bytes)
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256, // 256-bit key
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Generate a random 128-bit IV (16 bytes)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes is a common length for AES-GCM

  // Convert the file to an ArrayBuffer
  const fileArrayBuffer = await file.arrayBuffer();

  // Encrypt the file using AES-GCM
  const encryptedFile = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileArrayBuffer
  );

  // Encode the encrypted file and IV to base64 to make it easier to handle in JSON
  const encryptedFileBase64 = bufferToBase64(encryptedFile);
  const ivBase64 = bufferToBase64(iv);

  // Export the encryption key to base64 (only for storage or sharing, not to be used in encryption directly)
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const encryptedKey = bufferToBase64(exportedKey);

  return {
    encryptedFile: encryptedFileBase64,
    encryptedKey: encryptedKey,
    iv: ivBase64,
  };
}

// Helper function to convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

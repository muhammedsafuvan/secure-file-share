import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


class FileEncryptionUtils:
    @staticmethod
    def encrypt_file(file_content):
        """Encrypt the file using AES-GCM and return the encrypted data along with encryption parameters."""
        # Generate a random 256-bit key and 12-byte IV for AES-GCM
        key = os.urandom(32)  # AES-256 key
        iv = os.urandom(12)   # 12-byte IV required for AES-GCM

        # Create AES-GCM cipher
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Encrypt the file content
        encrypted_data = encryptor.update(file_content) + encryptor.finalize()

        # Get the authentication tag (for AES-GCM)
        auth_tag = encryptor.tag

        # Return encrypted data, key, IV, and authentication tag
        return encrypted_data, key, iv, auth_tag

    @staticmethod
    def decrypt_file(file_content, auth_tag_b64, key_b64, iv_b64):
        """Decrypt the file using AES-GCM."""
        # Decode the base64-encoded values if necessary
        auth_tag = base64.b64decode(auth_tag_b64)
        key = base64.b64decode(key_b64)
        iv = base64.b64decode(iv_b64)

        # Read the encrypted file content
        with open(file_content.path, "rb") as f:
            ciphertext = f.read()

        # Ensure IV is 12 bytes (required for AES-GCM)
        if len(iv) != 12:
            raise ValueError(f"Invalid IV size ({len(iv)}). Must be 12 bytes for AES-GCM.")

        # Create the AES-GCM cipher
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, auth_tag), backend=default_backend())
        decryptor = cipher.decryptor()

        # Decrypt the ciphertext
        decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
        return decrypted_data

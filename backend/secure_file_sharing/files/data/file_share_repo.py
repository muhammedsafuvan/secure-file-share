import os
import base64
from django.utils import timezone
from files.models import FileShare
from users.models import User
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from django.conf import settings

class FileShareRepo:

    @staticmethod
    def get_file_share(file, user):
        """Get the file share details for a given file and user."""
        try:
            file_share = FileShare.objects.get(file=file, shared_with=user)
            return file_share
        except FileShare.DoesNotExist:
            return None

    @staticmethod
    def create_file_share(file, shared_by, shared_with_email, expires_in, permission):
        """Create a new file share entry."""
        try:
            shared_with_user = User.objects.get(email=shared_with_email)
        except User.DoesNotExist:
            return None
        
        expires_at = None
        if expires_in:
            expires_at = timezone.now() + timezone.timedelta(hours=int(expires_in))

        file_share = FileShare.objects.create(
            file=file,
            shared_by=shared_by,
            shared_with=shared_with_user,
            permission=permission if permission else 'VIEW',
            expires_at=expires_at
        )

        file_share.generate_share_link()
        return file_share


    @staticmethod
    def get_user_shared_files(user):
        """Retrieve all files shared with a specific user."""
        return FileShare.objects.filter(
            shared_with=user, 
            expires_at__gt=timezone.now()
        )

    @staticmethod
    def decrypt_file(file_content, auth_tag_b64, key_b64, iv_b64):
        """Decrypt the file using AES-GCM."""
        auth_tag = base64.b64decode(auth_tag_b64)
        key = base64.b64decode(key_b64)
        iv = base64.b64decode(iv_b64)

        with open(file_content.path, "rb") as f:
            ciphertext = f.read()

        if len(iv) != 12:
            raise ValueError(f"Invalid IV size ({len(iv)}). Must be 12 bytes for AES-GCM.")

        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, auth_tag), backend=default_backend())
        decryptor = cipher.decryptor()

        decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
        return decrypted_data

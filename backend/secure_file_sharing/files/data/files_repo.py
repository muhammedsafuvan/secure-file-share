import os
import base64
from django.core.files.base import ContentFile
from files.models import File
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from django.conf import settings

class FileRepo:

    @staticmethod
    def create_file(owner, file_name, file_content, encryption_key, iv, auth_tag):
        """Create and save the file to the database."""
        file = ContentFile(file_content, name=file_name)
        new_file = File.objects.create(
            owner=owner,
            name=file_name,
            file=file,
            encryption_key=base64.b64encode(encryption_key).decode('utf-8'),
            iv=base64.b64encode(iv).decode('utf-8'),
            auth_tag=base64.b64encode(auth_tag).decode('utf-8')
        )
        return new_file

    @staticmethod
    def get_file_by_id(file_id ):
        """Retrieve a file by its ID """
        try:
            file = File.objects.get(id=file_id)
            return file
        except File.DoesNotExist:
            return None

    @staticmethod
    def get_user_owned_files(user):
        """Retrieve all files owned by a specific user."""
        return File.objects.filter(owner=user)
    

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

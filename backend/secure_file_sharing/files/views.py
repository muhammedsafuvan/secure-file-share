import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, Http404
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import File, FileShare
from .serializers import FileSerializer, FileShareSerializer
from users.models import User
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
from django.core.files.base import ContentFile
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import ValidationError
from .models import File
from .serializers import FileSerializer

# Allowed file types and size limit
# ALLOWED_FILE_TYPES = [
#     "image/png",
#     "image/jpeg",
#     "application/pdf",
#     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
# ]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get data from the request
            # file_data = request.data.get('file')  # Raw file data
            file_name = request.data.get("file_name")  # Get file name
            file_data = request.FILES.get('file')  
            
            if not file_data or not file_name:
                return Response(
                    {"error": "Missing required fields: 'file' and 'file_name'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Decode the base64-encoded file
            try:
                file_content = file_data.read()

                # Generate encryption key, IV, and auth tag
                encrypted_data, encryption_key, iv, auth_tag = self.encrypt_file(file_content)


                # Save the encrypted file using the original file name
                file = ContentFile(encrypted_data, name=file_name)

                # Save the encrypted file to the database
                new_file = File.objects.create(
                    owner=request.user,
                    name=file_name,
                    file=file,
                    encryption_key=base64.b64encode(encryption_key).decode('utf-8'),
                    iv=base64.b64encode(iv).decode('utf-8'),
                    auth_tag=base64.b64encode(auth_tag).decode('utf-8')
                )

                # Serialize and return the file details
                serializer = FileSerializer(new_file)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response(
                    {"error": f"Failed to decode or encrypt file: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred. Please try again later. {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def encrypt_file(self, file_content):
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




class FileShareView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        try:
            file = File.objects.get(id=file_id, owner=request.user)
        except File.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        shared_with_username = request.data.get('shared_with')
        permission = request.data.get('permission', 'VIEW')
        expires_in = request.data.get('expires_in')  # in hours

        try:
            shared_with_user = User.objects.get(username=shared_with_username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        expires_at = None
        if expires_in:
            expires_at = timezone.now() + timezone.timedelta(hours=int(expires_in))

        file_share = FileShare.objects.create(
            file=file,
            shared_by=request.user,
            shared_with=shared_with_user,
            permission=permission,
            expires_at=expires_at
        )

        file_share.generate_share_link()  # Generate secure shareable link

        serializer = FileShareSerializer(file_share)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file = File.objects.get(id=file_id)
        except File.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the owner or has access via a share
        if file.owner != request.user:
            try:
                file_share = FileShare.objects.get(file=file, shared_with=request.user)
                if file_share.is_expired:
                    return Response({'error': 'File share has expired'}, status=status.HTTP_403_FORBIDDEN)
                if file_share.permission == FileShare.Permission.VIEW:
                    return Response({'error': 'You do not have permission to download this file'}, status=status.HTTP_403_FORBIDDEN)
            except FileShare.DoesNotExist:
                return Response({'error': 'You do not have access to this file'}, status=status.HTTP_403_FORBIDDEN)

        # Decrypt the file content before returning it
        encrypted_key = file.encryption_key
        iv = file.iv
        auth_tag = file.auth_tag

        try:
            # Decrypt the file
            decrypted_file = self.decrypt_file(file.file, auth_tag, encrypted_key, iv)

            decrypt_dir = os.path.join(settings.MEDIA_ROOT, 'decrypt')  # media/decrypt directory inside MEDIA_ROOT
            os.makedirs(decrypt_dir, exist_ok=True)  # Create the decrypt directory if it doesn't exist

            # Path for the decrypted file (ensuring unique filename)
            decrypted_file_path = os.path.join(decrypt_dir, f"decrypted_{file.id}_{file.name}")

            # Save the decrypted file
            with open(decrypted_file_path, "wb") as f:
                f.write(decrypted_file)

            # Return the decrypted file as a response (streaming from the file path)
            response = FileResponse(open(decrypted_file_path, 'rb'), as_attachment=True, filename=file.name)
            return response
        except Exception as e:
            return Response({'error': f'Error while accessing the file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def decrypt_file(self, file_content, auth_tag_b64, key_b64, iv_b64):
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



class UserOwnedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all files where the authenticated user is the owner
            files = File.objects.filter(owner=request.user)

            if not files.exists():
                return Response({"detail": "No files found."}, status=status.HTTP_404_NOT_FOUND)

            # Serialize the files
            serializer = FileSerializer(files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserSharedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all FileShare objects where the authenticated user is the "shared_with"
            file_shares = FileShare.objects.filter(shared_with=request.user)

            if not file_shares.exists():
                return Response({"detail": "No shared files found."}, status=status.HTTP_404_NOT_FOUND)

            # Get the files from the file shares
            files = [file_share.file for file_share in file_shares]

            # Serialize the files
            serializer = FileSerializer(files, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

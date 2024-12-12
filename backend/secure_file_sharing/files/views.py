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
            # Get data from the JSON body
            file_data = request.data.get('file')  # Base64 encoded file
            encrypted_key = request.data.get("encryption_key")
            iv = request.data.get("iv")
            file_name = request.data.get("file_name")  # Get file name

            # Validate required fields
            if not file_data or not encrypted_key or not iv or not file_name:
                return Response(
                    {"error": "Missing required fields: 'file', 'encryption_key', 'iv', 'file_name'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Decode the base64-encoded file
            try:
                file_content = base64.b64decode(file_data)

                # Save the file using the file name provided by the client
                file = ContentFile(file_content, name=file_name)

                # Save the file to the database
                new_file = File.objects.create(
                    owner=request.user,
                    name=file_name,
                    file=file,
                    encryption_key=encrypted_key,
                    iv=iv,
                )

                # Serialize and return the file details
                serializer = FileSerializer(new_file)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                return Response(
                    {"error": f"Failed to decode file: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred. Please try again later. {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )



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

        # Decrypt the file (you'll implement your decryption logic here)
        decrypted_file = self.decrypt_file(file.file, encrypted_key, iv)

        try:
            response = FileResponse(decrypted_file, as_attachment=True, filename=file.name)
            return response
        except Exception as e:
            return Response({'error': 'Error while accessing the file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def decrypt_file(self, ciphertext_b64, auth_tag_b64, key_b64, iv_b64):
        """Decrypt the file using AES-GCM."""
        # Decode the base64-encoded values
        ciphertext = base64.b64decode(ciphertext_b64)
        auth_tag = base64.b64decode(auth_tag_b64)
        key = base64.b64decode(key_b64)
        iv = base64.b64decode(iv_b64)

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

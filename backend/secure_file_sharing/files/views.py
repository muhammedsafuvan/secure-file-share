import os
from files.models import FileShare
from files.utils.file_encryption_utils import FileEncryptionUtils
from files.data.files_repo import FileRepo
from files.data.file_share_repo import FileShareRepo

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import FileSerializer, FileShareSerializer
from django.conf import settings
from django.http import FileResponse

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            file_name = request.data.get("file_name")
            file_data = request.FILES.get('file')

            if not file_data or not file_name:
                return Response(
                    {"error": "Missing required fields: 'file' and 'file_name'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                file_content = file_data.read()

                # Generate encryption key, IV, and auth tag
                encrypted_data, encryption_key, iv, auth_tag = FileEncryptionUtils.encrypt_file(file_content)


                # Save the encrypted file to the database via FileRepo
                new_file = FileRepo.create_file(
                    owner=request.user,
                    file_name=file_name,
                    file_content=encrypted_data,
                    encryption_key=encryption_key,
                    iv=iv,
                    auth_tag=auth_tag
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
                {"error": f"An unexpected error occurred. {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class FileShareView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        file = FileRepo.get_file_by_id(file_id)
        if not file:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        shared_with_email = request.data.get('email')
        expires_in = request.data.get('expire_time')

        file_share = FileShareRepo.create_file_share(
            file=file,
            shared_by=request.user,
            shared_with_email=shared_with_email,
            expires_in=expires_in
        )

        if not file_share:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FileShareSerializer(file_share)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        file = FileRepo.get_file_by_id(file_id)
        print("FILE ID", file_id)
        is_view = request.GET.get('isView', 'false') == 'true'
        if not file:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if (file.owner != request.user) or is_view:
            try:
                file_share = FileShareRepo.get_file_share(file, request.user)
                if file_share.is_expired:
                    return Response({'error': 'File share has expired'}, status=status.HTTP_403_FORBIDDEN)
                if file_share.permission == FileShare.Permission.VIEW and is_view == False:
                    return Response({'error': 'You do not have permission to download this file'}, status=status.HTTP_403_FORBIDDEN)
            except FileShare.DoesNotExist:
                return Response({'error': 'You do not have access to this file'}, status=status.HTTP_403_FORBIDDEN)

        # file_share = FileShareRepo.get_file_share(file, request.user)
        # if file_share.is_expired or file_share.permission != 'VIEW':
        #     return Response({'error': 'You do not have permission to download this file'}, status=status.HTTP_403_FORBIDDEN)

        try:
            decrypted_file = FileEncryptionUtils.decrypt_file(file.file, file.auth_tag, file.encryption_key, file.iv)
            decrypt_dir = os.path.join(settings.MEDIA_ROOT, 'decrypt')
            os.makedirs(decrypt_dir, exist_ok=True)
            decrypted_file_path = os.path.join(decrypt_dir, f"decrypted_{file.id}_{file.name}")

            with open(decrypted_file_path, "wb") as f:
                f.write(decrypted_file)

            response = FileResponse(open(decrypted_file_path, 'rb'), as_attachment=True, filename=file.name)
            return response
        except Exception as e:
            return Response({'error': f'Error while accessing the file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserOwnedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            files = FileRepo.get_user_owned_files(request.user)

            if not files.exists():
                return Response({"detail": "No files found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = FileSerializer(files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSharedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            file_shares = FileShareRepo.get_user_shared_files(request.user)

            if not file_shares.exists():
                return Response({"detail": "No shared files found."}, status=status.HTTP_404_NOT_FOUND)

            files = [file_share.file for file_share in file_shares]
            serializer = FileSerializer(files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

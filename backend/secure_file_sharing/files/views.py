from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, Http404
from django.utils import timezone
from .models import File, FileShare
from .serializers import FileSerializer, FileShareSerializer
from users.models import User

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        encrypted_key = request.data.get('encrypted_key')
        iv = request.data.get('iv')

        if not file or not encrypted_key or not iv:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        new_file = File.objects.create(
            owner=request.user,
            name=file.name,
            file=file,
            encrypted_key=encrypted_key,
            iv=iv
        )

        serializer = FileSerializer(new_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FileShareView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        try:
            file = File.objects.get(id=file_id, owner=request.user)
        except File.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        shared_with_username = request.data.get('shared_with')
        can_download = request.data.get('can_download', False)
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
            shared_with=shared_with_user,
            can_download=can_download,
            expires_at=expires_at
        )

        serializer = FileShareSerializer(file_share)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            # Check if the file exists and is owned by the user
            file = File.objects.get(id=file_id)
        except File.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the owner or has access via a share
        if file.owner != request.user:
            try:
                file_share = FileShare.objects.get(file=file, shared_with=request.user)
                if not file_share.can_download:
                    return Response({'error': 'You do not have permission to download this file'}, status=status.HTTP_403_FORBIDDEN)
                if file_share.expires_at and timezone.now() > file_share.expires_at:
                    return Response({'error': 'File share has expired'}, status=status.HTTP_403_FORBIDDEN)
            except FileShare.DoesNotExist:
                return Response({'error': 'You do not have access to this file'}, status=status.HTTP_403_FORBIDDEN)

        # Serve the file
        try:
            response = FileResponse(file.file.open('rb'), as_attachment=True, filename=file.name)
            return response
        except Exception as e:
            return Response({'error': 'Error while accessing the file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

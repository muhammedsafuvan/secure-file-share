from rest_framework import serializers
from .models import File, FileShare

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'encrypted_key', 'iv', 'uploaded_at']
        extra_kwargs = {'encrypted_key': {'write_only': True}, 'iv': {'write_only': True}}

class FileShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShare
        fields = ['id', 'file', 'shared_with', 'can_download', 'expires_at']
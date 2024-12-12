from rest_framework import serializers
from .models import File, FileShare

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'owner', 'name', 'file', 'encrypted_content', 'encryption_key', 'iv', 'uploaded_at', 'updated_at']

    def create(self, validated_data):
        # You can add custom create logic if needed, e.g., handling file encryption here
        return File.objects.create(**validated_data)

class FileShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShare
        fields = ['id', 'file', 'shared_by', 'shared_with', 'permission', 'share_link', 'expires_at', 'created_at']

    def create(self, validated_data):
        # You can add custom create logic here if needed
        return FileShare.objects.create(**validated_data)
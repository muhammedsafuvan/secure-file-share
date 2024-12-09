from django.contrib import admin
from .models import File, FileShare

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'uploaded_at', 'updated_at')  # Customize this as needed

@admin.register(FileShare)
class FileShareAdmin(admin.ModelAdmin):
    list_display = ('file', 'shared_by', 'shared_with', 'permission', 'expires_at')  # Customize this as needed

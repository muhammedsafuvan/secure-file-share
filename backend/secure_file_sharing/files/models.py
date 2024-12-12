from django.db import models
from django.conf import settings
from django.utils import timezone
from encrypted_model_fields.fields import EncryptedTextField
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

def get_default_user():
    return get_user_model().objects.first().id  

class File(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_files')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    encrypted_content = EncryptedTextField(default='')
    encryption_key = models.CharField(max_length=44, default='LVRmqK3/KHffhEWXUNGGZNj5C+NnC46YGhwRMQetdHA=')  # Base64 encoded 32-byte key
    iv = models.CharField(max_length=24)  # Base64 encoded 16-byte IV
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    auth_tag = models.CharField(max_length=24, default='')  

    def __str__(self):
        return self.name

class FileShare(models.Model):
    class Permission(models.TextChoices):
        VIEW = 'VIEW', _('View')
        DOWNLOAD = 'DOWNLOAD', _('Download')

    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shared_files', default=get_default_user)
    shared_with = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_files', null=True, blank=True)
    permission = models.CharField(max_length=10, choices=Permission.choices, default=Permission.VIEW)
    share_link = models.CharField(max_length=64, unique=True, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} shared by {self.shared_by.username}"

    @property
    def is_expired(self):
        return self.expires_at and timezone.now() > self.expires_at

    def generate_share_link(self):
        import secrets
        self.share_link = secrets.token_urlsafe(48)
        self.save()

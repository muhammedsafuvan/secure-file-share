from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        REGULAR = 'REGULAR', _('Regular User')
        GUEST = 'GUEST', _('Guest')

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.REGULAR,
    )
    otp = models.IntegerField(null=True, blank=True)  # Store the OTP
    otp_expiration = models.DateTimeField(null=True, blank=True)  # OTP expiration time
    is_verified = models.BooleanField(default=False)  
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)
    is_mfa_enabled = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    # username = None  

    USERNAME_FIELD = 'email'  
    REQUIRED_FIELDS = []  

    def __str__(self):
        return self.email

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_regular(self):
        return self.role == self.Role.REGULAR

    @property
    def is_guest(self):
        return self.role == self.Role.GUEST

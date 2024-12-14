from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound, ValidationError
from django.utils import timezone
from users.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class UserRepository:
    """Repository for user-related database operations."""
    def __init__(self):
        self.user_model = get_user_model()

    def is_email_taken(self, email):
        """Check if the email is already taken."""
        return self.user_model.objects.filter(email=email).exists()

    def create_user(self, serializer, password):
        """Create and save a new user."""
        user = serializer.save()
        user.set_password(password)  # Securely hash the password
        user.save()
        return user

    @staticmethod
    def get_user_by_email(email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise NotFound('User not found')

    @staticmethod
    def validate_otp(user, otp):
        if user.otp != int(otp):
            raise ValidationError('Invalid OTP')
        
        if user.otp_expiration < timezone.now():
            raise ValidationError('OTP has expired')

    @staticmethod
    def mark_user_verified(user):
        user.is_verified = True
        user.save()

    @staticmethod
    def authenticate_user(email, password):
        user = authenticate(username=email, password=password)
        if not user:
            raise NotFound('Invalid credentials')
        return user

    @staticmethod
    def check_user_verified(user):
        if not user.is_verified:
            raise NotFound('User email is not verified')

    @staticmethod
    def generate_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    
    @staticmethod
    def blacklist_refresh_token(refresh_token):
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            raise ValidationError('Invalid or expired refresh token')
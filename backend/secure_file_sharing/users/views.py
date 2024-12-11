from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from random import randint
from django.utils import timezone

import pyotp
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)


# Utility function to generate OTP

def send_otp(user):
    """Generate and send OTP to the user's email."""
    otp = randint(100000, 999999)  # Generate a 6-digit OTP
    user.otp = otp  # Save OTP to the user model (add this field if not present)
    user.otp_expiration = timezone.now() + timezone.timedelta(minutes=5)
    user.save()

    subject = 'Email Verification OTP'
    message = f'Your OTP for verification is {otp}. It will expire in 10 minutes.'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        # Extract data from request
        print(request)
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Ensure email is unique
        if get_user_model().objects.filter(email=email).exists():
            return Response({'error': 'Email is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize user data
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Save the user
            user = serializer.save()

            # Optionally, you can handle the role or other fields here if necessary.
            user.set_password(password)  # Ensure password is securely stored
            user.save()

            # Send OTP email to the user
            send_otp(user)

            # Return response, informing the user to verify OTP
            return Response({'message': 'Registration successful. Please verify your OTP sent to your email.'}, status=status.HTTP_201_CREATED)

        # If serializer is invalid, return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        # Validate OTP
        try:
            user = get_user_model().objects.get(email=email)
            print(f"USER {user}")
            logger.debug(f"User: {user}, Email: {email}")  
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if OTP is valid and not expired
        if user.otp != int(otp):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if user.otp_expiration < timezone.now():
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid and not expired, mark the user as verified
        user.is_verified = True  # You can add a flag `is_verified` in the User model
        user.save()

        return Response({'message': 'OTP verified successfully. You can now log in.'}, status=status.HTTP_200_OK)

# Login API with MFA handling
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate user with email (username)
        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if the user is verified
        if not user.is_verified:
            # Send OTP if not verified
            send_otp(user)
            return Response({'error': 'Email not verified. OTP has been sent to your email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate tokens if authentication is successful
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })



# New view to handle the step of verifying MFA (TOTP) after login
class VerifyMFAView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        mfa_code = request.data.get('mfa_code')

        # Authenticate user to check if they are valid
        user = authenticate(username=username)

        if user is None:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)

        # Validate MFA code
        if user.is_mfa_enabled:
            totp = pyotp.TOTP(user.mfa_secret)
            if not totp.verify(mfa_code):
                return Response({'error': 'Invalid MFA code'}, status=status.HTTP_401_UNAUTHORIZED)

        # If MFA passes, generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


# MFA Setup API
class SetupMFAView(APIView):
    def post(self, request):
        user = request.user
        print(f"User {user}")
        print(user.is_authenticated)
        print(user.is_mfa_enabled)
        if not user.is_authenticated:
            return Response({'error': f'Unauthorized {user}'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_mfa_enabled:
            # Generate a new secret
            secret = pyotp.random_base32()
            user.mfa_secret = secret
            user.is_mfa_enabled = True
            user.save()

            # Generate a QR code URL for the MFA setup
            otp_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="YourAppName")
            return Response({'otp_url': otp_url}, status=status.HTTP_200_OK)

        return Response({'error': 'MFA is already enabled'}, status=status.HTTP_400_BAD_REQUEST)



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

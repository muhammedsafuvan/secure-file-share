from .utils.email_utils import EmailUtility
from .data.user_repo import UserRepository
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from rest_framework.exceptions import NotFound, ValidationError

import pyotp
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)



class RegisterView(APIView):
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.user_repo = UserRepository()  # Initialize the repository
        self.email_utility = EmailUtility()

    def post(self, request):
        # Extract data from request
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Ensure email is unique
        if self.user_repo.is_email_taken(email):
            return Response({'error': 'Email is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize user data
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Save the user
            user = self.user_repo.create_user(serializer, password)

            # Send OTP email to the user
            self.email_utility.send_otp(user)

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
            user = UserRepository.get_user_by_email(email)
            logger.debug(f"User: {user}, Email: {email}")  
        except NotFound:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            UserRepository.validate_otp(user, otp)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid and not expired, mark the user as verified
        UserRepository.mark_user_verified(user)

        return Response({'message': 'OTP verified successfully. You can now log in.'}, status=status.HTTP_200_OK)

# Login API with MFA handling
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate user with email (username) and password
        try:
            user = UserRepository.authenticate_user(email, password)
        except NotFound:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if the user is verified
        try:
            UserRepository.check_user_verified(user)
        except NotFound:
            # Send OTP if not verified
            self.email_utility.send_otp(user)
            return Response({'error': 'Email not verified. OTP has been sent to your email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate tokens if authentication is successful
        tokens = UserRepository.generate_tokens(user)

        return Response(tokens)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Use the TokenRepository to blacklist the refresh token
        try:
            UserRepository.blacklist_refresh_token(refresh_token)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)


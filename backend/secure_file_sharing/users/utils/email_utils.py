from django.core.mail import send_mail
from django.conf import settings
import random
from django.utils import timezone

class EmailUtility:
    """
    A utility class for handling email operations such as sending OTPs.
    """

    def __init__(self, from_email=None):
        """
        Initialize the utility with a default sender email.
        Args:
            from_email (str): Optional custom sender email. Defaults to Django settings' DEFAULT_FROM_EMAIL.
        """
        self.from_email = from_email or settings.DEFAULT_FROM_EMAIL

    def send_email(self, subject, message, recipient_list):
        """
        Send a simple email.
        Args:
            subject (str): Subject of the email.
            message (str): Body of the email.
            recipient_list (list): List of recipient email addresses.
        Returns:
            int: Number of successfully delivered messages.
        """
        return send_mail(subject, message, self.from_email, recipient_list)

    def send_otp_email(self, user, otp=None, otp_length=6):
        """
        Send an OTP email to a user.
        Args:
            user (object): The user object to whom the OTP should be sent.
            otp (str): Optional pre-generated OTP. If None, generates a new one.
            otp_length (int): Length of the OTP to be generated.
        Returns:
            str: The OTP sent to the user.
        """
        if not otp:
            otp = self.generate_otp(otp_length)

        subject = "Your OTP for Registration"
        message = f"Hello {user.username},\n\nYour OTP is: {otp}\n\nThank you!"
        self.send_email(subject, message, [user.email])

        # Optionally, you can save the OTP to the user's record for later validation
        # user.otp = otp
        # user.save()

        return otp
    
    def send_otp(self, user):
        """Generate and send OTP to the user's email."""
        otp = random.randint(100000, 999999)  # Generate a 6-digit OTP
        user.otp = otp  # Save OTP to the user model (add this field if not present)
        user.otp_expiration = timezone.now() + timezone.timedelta(minutes=5)
        user.save()

        subject = 'Email Verification OTP'
        message = f'Your OTP for verification is {otp}. It will expire in 10 minutes.'
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

    @staticmethod
    def generate_otp(length=6):
        """
        Generate a random numeric OTP.
        Args:
            length (int): Length of the OTP.
        Returns:
            str: Generated OTP.
        """
        return ''.join([str(random.randint(0, 9)) for _ in range(length)])

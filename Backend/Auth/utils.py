import random
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache

def generate_otp():
    """Generate 6 digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    """Send OTP to user's email"""
    subject = 'Email Verification OTP'
    message = f'Your verification OTP is: {otp}'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        send_mail(subject, message, from_email, recipient_list)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
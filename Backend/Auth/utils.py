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

from django.core.mail import send_mail
from django.conf import settings
from .email_templates import (
    COMPANY_REGISTRATION_TEMPLATE,
    INDIVIDUAL_REGISTRATION_TEMPLATE,
    WORKER_REGISTRATION_TEMPLATE
)

def send_registration_email(user_type, user_data):
    """Send registration confirmation email based on user type"""
    try:
        if user_type == 'COMPANY':
            subject = "Welcome to SwiftServe - Company Registration Received"
            message = COMPANY_REGISTRATION_TEMPLATE.format(
                company_name=user_data.get('companyName'),
                reg_number=user_data.get('registrationNumber'),
                email=user_data.get('email')
            )
        elif user_type == 'INDIVIDUAL':
            subject = "Welcome to SwiftServe!"
            message = INDIVIDUAL_REGISTRATION_TEMPLATE.format(
                name=f"{user_data.get('firstName')} {user_data.get('lastName')}",
                email=user_data.get('email')
            )
        else:  # WORKER
            subject = "Welcome to SwiftServe - Worker Registration"
            message = WORKER_REGISTRATION_TEMPLATE.format(
                name=f"{user_data.get('firstName')} {user_data.get('lastName')}",
                email=user_data.get('email'),
                company_name=user_data.get('company_name')
            )

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_data.get('email')],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send registration email: {str(e)}")
        return False
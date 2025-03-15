from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

def send_kyc_notification_email(user_email, status, reason=None):
    if status == 'APPROVED':
        subject = 'SwiftServe - KYC Verification Approved'
        template = 'emails/kyc_approved.html'
    else:
        subject = 'SwiftServe - KYC Verification Rejected'
        template = 'emails/kyc_rejected.html'

    context = {
        'status': status,
        'reason': reason
    }

    html_message = render_to_string(template, context)

    send_mail(
        subject=subject,
        message='',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        html_message=html_message,
        fail_silently=False,
    )
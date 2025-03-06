from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from Auth.models import CustomUser
from django.utils import timezone
import threading

def delete_expired_accounts():
    try:
        now = timezone.now()
        accounts_to_delete = CustomUser.objects.filter(
            is_pending_deletion=True,
            scheduled_deletion_date__lte=now
        )
        count = accounts_to_delete.count()
        accounts_to_delete.delete()
        print(f"Successfully deleted {count} expired accounts")
    except Exception as e:
        print(f"Error deleting expired accounts: {e}")

def start():
    # Prevent multiple scheduler instances
    if not hasattr(start, "scheduler"):
        start.scheduler = BackgroundScheduler()
        start.scheduler.add_job(
            delete_expired_accounts,
            trigger=CronTrigger(hour="0", minute="0"),  # Run at midnight
            id="delete_expired_accounts",
            max_instances=1,
            replace_existing=True,
        )
        start.scheduler.start()

# Add shutdown handler
def shutdown():
    if hasattr(start, "scheduler"):
        start.scheduler.shutdown()
from django.db import models

class AdminStats(models.Model):
    total_users = models.IntegerField(default=0)
    total_workers = models.IntegerField(default=0)
    total_companies = models.IntegerField(default=0)
    total_clients = models.IntegerField(default=0)
    pending_kyc = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deliveries = models.IntegerField(default=0)
    unread_messages = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

class RevenueData(models.Model):
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

class UserActivity(models.Model):
    date = models.DateField()
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

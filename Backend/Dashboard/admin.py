from django.contrib import admin

# Register your models here.
from .models import*

admin.site.register(AdminStats)
admin.site.register(RevenueData)
admin.site.register(UserActivity)

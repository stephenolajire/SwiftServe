# Generated by Django 5.1.6 on 2025-03-09 02:49

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('KYC', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='kycverification',
            name='updatedAt',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]

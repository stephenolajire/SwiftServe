# Generated by Django 5.1.6 on 2025-03-08 21:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0005_rename_bus_license_customuser_businesslicense_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='fleetSize',
            field=models.BigIntegerField(default=12),
            preserve_default=False,
        ),
    ]

# Generated by Django 5.1.6 on 2025-03-06 21:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0002_rename_date_of_birth_customuser_dob_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='profileimage',
            new_name='profileImage',
        ),
    ]

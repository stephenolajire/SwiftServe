# Generated by Django 5.1.6 on 2025-03-06 21:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0003_rename_profileimage_customuser_profileimage'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='current_lat',
            new_name='latitude',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='current_long',
            new_name='longitude',
        ),
    ]

# Generated by Django 5.1.6 on 2025-03-08 21:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0004_rename_current_lat_customuser_latitude_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='bus_license',
            new_name='businessLicense',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='bus_certificate',
            new_name='cacCertificate',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='company_name',
            new_name='companyName',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='registration_number',
            new_name='registrationNumber',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='tax_id',
            new_name='taxId',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='website_link',
            new_name='website',
        ),
        migrations.AddField(
            model_name='customuser',
            name='cacNumber',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customuser',
            name='contactName',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customuser',
            name='fleetType',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customuser',
            name='insuranceCert',
            field=models.ImageField(default='', upload_to='Insurance'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customuser',
            name='taxClearance',
            field=models.ImageField(default='', upload_to='taxClearance'),
            preserve_default=False,
        ),
    ]

# Generated by Django 5.1.6 on 2025-03-08 22:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0006_customuser_fleetsize'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='dob',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='firstName',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='lastName',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='profileImage',
        ),
        migrations.AlterField(
            model_name='customuser',
            name='address',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='cacCertificate',
            field=models.ImageField(blank=True, null=True, upload_to='cac_certificates/'),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='cacNumber',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='city',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='contactName',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='country',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='fleetSize',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='fleetType',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='insuranceCert',
            field=models.ImageField(blank=True, null=True, upload_to='insurance_certificates/'),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='phoneNumber',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='postalCode',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='state',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='taxClearance',
            field=models.ImageField(blank=True, null=True, upload_to='tax_clearance/'),
        ),
    ]

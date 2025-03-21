# Generated by Django 5.1.6 on 2025-03-11 19:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0002_customuser_localgovernment'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='driversLicense',
            field=models.ImageField(default='', upload_to='License'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='vehiclePlateNumber',
            field=models.CharField(default='', max_length=200),
        ),
        migrations.AddField(
            model_name='customuser',
            name='vehicleRegistration',
            field=models.ImageField(default='', upload_to='vehicleReg'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='vehicleType',
            field=models.CharField(default='', max_length=200),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='user_type',
            field=models.CharField(choices=[('INDIVIDUAL', 'Individual'), ('COMPANY', 'Company'), ('WORKER', 'Worker'), ('CLIENT', 'Client')], max_length=20),
        ),
    ]

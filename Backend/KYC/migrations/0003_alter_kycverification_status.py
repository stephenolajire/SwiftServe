# Generated by Django 5.1.6 on 2025-03-18 15:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('KYC', '0002_kycverification_updatedat'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kycverification',
            name='status',
            field=models.CharField(choices=[('PENDING', 'Pending Review'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected'), ('NONE', 'No Documentation')], default='PENDING', max_length=10),
        ),
    ]

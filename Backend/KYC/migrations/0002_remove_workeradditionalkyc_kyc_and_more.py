# Generated by Django 5.1.6 on 2025-03-02 23:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('KYC', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workeradditionalkyc',
            name='kyc',
        ),
        migrations.DeleteModel(
            name='KYCVerification',
        ),
        migrations.DeleteModel(
            name='WorkerAdditionalKYC',
        ),
    ]

# Generated by Django 5.1.6 on 2025-03-23 08:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Swift', '0007_delivery_delivery_completed_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='delivery',
            name='base_price_per_km',
            field=models.DecimalField(decimal_places=2, default=100.0, max_digits=6),
        ),
        migrations.AddField(
            model_name='delivery',
            name='distance_covered',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Distance covered in kilometers', max_digits=10),
        ),
    ]

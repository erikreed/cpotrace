# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-03 22:30
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_auto_20161103_2143'),
    ]

    operations = [
        migrations.RenameField(
            model_name='car',
            old_name='model_varient',
            new_name='model_variant',
        ),
        migrations.AddField(
            model_name='car',
            name='country_code',
            field=models.CharField(default=None, max_length=2),
            preserve_default=False,
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-25 01:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_auto_20161103_2230'),
    ]

    operations = [
        migrations.AlterField(
            model_name='car',
            name='last_seen',
            field=models.DateTimeField(auto_now=True, db_index=True),
        ),
    ]

# Generated by Django 3.1.5 on 2021-02-01 10:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('spotify', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='SpotifytToken',
            new_name='SpotifyToken',
        ),
    ]
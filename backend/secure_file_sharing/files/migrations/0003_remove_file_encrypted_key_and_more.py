# Generated by Django 5.1.4 on 2024-12-09 09:21

import django.db.models.deletion
import django.utils.timezone
import encrypted_model_fields.fields
import files.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("files", "0002_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name="file",
            name="encrypted_key",
        ),
        migrations.RemoveField(
            model_name="fileshare",
            name="can_download",
        ),
        migrations.AddField(
            model_name="file",
            name="encrypted_content",
            field=encrypted_model_fields.fields.EncryptedTextField(default=""),
        ),
        migrations.AddField(
            model_name="file",
            name="encryption_key",
            field=models.CharField(
                default="LVRmqK3/KHffhEWXUNGGZNj5C+NnC46YGhwRMQetdHA=", max_length=44
            ),
        ),
        migrations.AddField(
            model_name="file",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="fileshare",
            name="created_at",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="fileshare",
            name="permission",
            field=models.CharField(
                choices=[("VIEW", "View"), ("DOWNLOAD", "Download")],
                default="VIEW",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="fileshare",
            name="share_link",
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="fileshare",
            name="shared_by",
            field=models.ForeignKey(
                default=files.models.get_default_user,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="shared_files",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="file",
            name="iv",
            field=models.CharField(max_length=24),
        ),
        migrations.AlterField(
            model_name="file",
            name="owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="owned_files",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="fileshare",
            name="file",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="shares",
                to="files.file",
            ),
        ),
        migrations.AlterField(
            model_name="fileshare",
            name="shared_with",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="received_files",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]

from django.urls import path
from .views import FileDownloadView, FileUploadView, FileShareView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('share/<int:file_id>/', FileShareView.as_view(), name='file-share'),
    path('download/<int:file_id>/', FileDownloadView.as_view(), name='file_download'),
]


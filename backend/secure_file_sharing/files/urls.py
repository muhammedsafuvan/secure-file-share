from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import FileDownloadView, FileUploadView, FileShareView, UserOwnedFilesView, UserSharedFilesView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('share/<int:file_id>/', FileShareView.as_view(), name='file-share'),
    path('download/<int:file_id>/', FileDownloadView.as_view(), name='file_download'),
    path('owned/', UserOwnedFilesView.as_view(), name='user-owned-files'),
    path('shared/', UserSharedFilesView.as_view(), name='user-shared-files'),

]


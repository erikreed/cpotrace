from .views import cars
from django.conf.urls import url


urlpatterns = [
    url(r'cars/$', cars),
]

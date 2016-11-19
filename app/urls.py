from .views import cars, summary
from django.conf.urls import url


urlpatterns = [
    url(r'cars/$', cars),
    url(r'cars/summary/$', summary),
]

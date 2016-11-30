from .views import cars, summary
from django.conf.urls import url


urlpatterns = [
    url(r'^$', cars),
    url(r'^summary/$', summary),
    url(r'^/cars/$', cars),
    url(r'^/cars/summary/$', summary),
]


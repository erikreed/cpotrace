from .views import cars, summary, history
from django.conf.urls import url


urlpatterns = [
    url(r'^$', cars),
    url(r'^summary/$', summary),
    url(r'^history/$', history),
    url(r'^cars/$', cars),
    url(r'^cars/history/$', history),
    url(r'^cars/summary/$', summary),
]


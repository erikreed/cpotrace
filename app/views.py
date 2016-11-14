from app.models import Car
from django.http import JsonResponse
from django.utils import timezone


def cars(request):
    cars = Car.objects.filter(
        last_seen__gte=timezone.now() - timezone.timedelta(days=1),
    )
    return JsonResponse(list(cars.values(
        'first_seen', 'last_seen', 'price', 'is_autopilot',
        'badge', 'metro_id', 'country_code',
        'odometer', 'year', 'model', 'paint', 'title_status', 'vin'
    )), safe=False)

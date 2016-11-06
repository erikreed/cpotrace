from app.models import Car
from django.http import JsonResponse


def cars(request):
    return JsonResponse(list(Car.objects.all().values(
        'first_seen', 'last_seen', 'price', 'is_autopilot',
        'badge', 'metro_id', 'country_code',
        'odometer', 'year', 'model', 'paint', 'title_status'
    )), safe=False)

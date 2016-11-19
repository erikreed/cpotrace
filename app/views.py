from app.models import Car, CarOdometerChange, CarPriceChange
from django.http import JsonResponse
from django.utils import timezone


def cars(request):
    cars = Car.objects.filter(
        last_seen__gte=timezone.now() - timezone.timedelta(days=1),
    )
    if not cars.exists():
        cars = Car.objects.all()[:1000]

    return JsonResponse(list(cars.values(
        'first_seen', 'last_seen', 'price', 'is_autopilot',
        'badge', 'metro_id', 'country_code',
        'odometer', 'year', 'model', 'paint', 'title_status', 'vin'
    )), safe=False)


def summary(request):
    total_cars = Car.objects.count()
    total_price_changes = CarPriceChange.objects.count()
    total_price_change_cars = CarPriceChange.objects.values('car').distinct().count()
    total_odometer_changes = CarOdometerChange.objects.count()
    total_odometer_change_cars = CarOdometerChange.objects.values('car').distinct().count()

    out = {
        'totalCars': total_cars,
        'priceChanges': total_price_changes,
        'priceChangeCars': total_price_change_cars,
        'odometerChanges': total_odometer_changes,
        'odometerChangeCars': total_odometer_change_cars,
    }
    return JsonResponse(out)

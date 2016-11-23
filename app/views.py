from app.models import Car, CarOdometerChange, CarPriceChange
from django.http import JsonResponse
from django.utils import timezone


def cars(request):
    cars = Car.objects.filter(
        last_seen__gte=timezone.now() - timezone.timedelta(days=1),
    )
    if not cars.exists():
        cars = Car.objects.all()[:1000]

    out = []
    for c in cars:
        out.append(dict(
            first_seen=c.first_seen,
            last_seen=c.last_seen,
            price=c.price,
            is_autopilot=c.is_autopilot,
            badge=c.badge,
            metro_id=c.metro_id,
            country_code=c.country_code,
            odometer=c.odometer,
            year=c.year,
            model=c.model,
            paint=c.paint,
            title_status=c.title_status,
            vin=c.vin,
            is_premium=c.is_premium,
            is_panoramic=c.is_panoramic,
            wheels_name=c.wheels_name,
            paint_name=c.paint_name
        ))

    return JsonResponse(out, safe=False)


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

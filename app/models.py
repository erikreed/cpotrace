from django.db import models


class Car(models.Model):
    vin = models.CharField(max_length=32, unique=True)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    price = models.PositiveIntegerField()

    autopilot = models.CharField(max_length=16)
    badge = models.CharField(max_length=16)
    battery = models.CharField(max_length=16)
    config_id = models.PositiveIntegerField()
    decor = models.CharField(max_length=16)

    destination_handling_fee = models.PositiveIntegerField()
    discount = models.PositiveIntegerField()
    drive_train = models.CharField(max_length=16)

    metro_id = models.PositiveSmallIntegerField()
    country_code = models.CharField(max_length=2)

    model = models.CharField(max_length=16)
    model_variant = models.CharField(max_length=16)

    odometer = models.PositiveIntegerField()
    odometer_type = models.CharField(max_length=16)

    option_code_list = models.TextField()
    option_code_list_with_price = models.TextField()

    ownership_transfer_count = models.PositiveSmallIntegerField()

    paint = models.CharField(max_length=16)
    range = models.CharField(max_length=16)
    roof = models.CharField(max_length=16)

    title_status = models.CharField(max_length=16)
    title_sub_status = models.TextField()

    trade_in_type = models.CharField(max_length=16)
    year = models.PositiveSmallIntegerField()

    is_autopilot = models.BooleanField()
    is_first_registration_date = models.BooleanField()
    is_panoramic = models.BooleanField()
    is_premium = models.BooleanField()


class CarPriceChange(models.Model):
    car = models.ForeignKey(Car)
    price_before = models.PositiveIntegerField()
    price_new = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)


class CarOdometerChange(models.Model):
    car = models.ForeignKey(Car)
    odometer_before = models.PositiveIntegerField()
    odometer_new = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

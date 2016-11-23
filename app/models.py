import json
from django.db import models


def _get_options():
    data = json.load(open('app/assets/pricebook-3.5_MS_US.json'))
    options = data['tesla']['configSetPrices']['options']
    for o in list(options.values()):
        if o['value_list']:
            for k, v in o['value_list'].items():
                assert k not in options
                options[k] = v
    trimmed_options = {k: dict(name=v['name'], long_name=v['long_name']) for k, v in options.items()}
    return trimmed_options

options = _get_options()


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

    @property
    def paint_name(self):
        for o in self.options.values():
            if o['long_name'] and 'paint' in o['long_name'].lower():
                return o['long_name']
        return None

    @property
    def wheels_name(self):
        for o in self.options.values():
            if o['long_name'] and ('wheels' in o['long_name'].lower() or 'tire' in o['long_name'].lower()):
                return o['long_name']
        return None

    @property
    def options(self):
        return {k: options[k] for k in self.option_code_list.split(',') if k in options}


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

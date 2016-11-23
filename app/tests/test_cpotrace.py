import json
from app.crawler import TeslaCrawler
from app import models
from django.test import TestCase


class TestParser(TestCase):
    def setUp(self):
        with open('app/tests/sample_response.json') as f:
            self.data = json.load(f)

    def test_url(self):
        crawler = TeslaCrawler(country_code='US')
        url = crawler.make_url()
        assert 'MODEL_S' in url
        assert url.startswith('https://')

    def test_parse_and_update_db(self):
        assert len(self.data) == 34
        crawler = TeslaCrawler(country_code='US')
        cars = crawler.parse_response(self.data)
        assert len(cars) == 34

        crawler.update_database(cars)
        assert models.Car.objects.count() == 34
        assert models.CarOdometerChange.objects.count() == 0
        assert models.CarPriceChange.objects.count() == 0

        self.data[0]['UsedVehiclePrice'] -= 1000
        cars = crawler.parse_response(self.data)
        crawler.update_database(cars)
        assert models.Car.objects.count() == 34
        assert models.CarOdometerChange.objects.count() == 0
        assert models.CarPriceChange.objects.count() == 1
        assert models.CarPriceChange.objects.get().price_new == 75500
        assert models.CarPriceChange.objects.get().price_before == 76500

        crawler.update_database(cars)
        assert models.Car.objects.count() == 34
        assert models.CarOdometerChange.objects.count() == 0
        assert models.CarPriceChange.objects.count() == 1

        self.data[0]['Odometer'] += 1000
        cars = crawler.parse_response(self.data)
        crawler.update_database(cars)
        assert models.Car.objects.count() == 34
        assert models.CarOdometerChange.objects.count() == 1
        assert models.CarPriceChange.objects.count() == 1
        assert models.CarOdometerChange.objects.get().odometer_new == 1973
        assert models.CarOdometerChange.objects.get().odometer_before == 973

    def test_options(self):
        crawler = TeslaCrawler(country_code='US')
        cars = crawler.parse_response(self.data)
        crawler.update_database(cars)

        for c in models.Car.objects.all():
            c.paint_name
            c.wheels_name

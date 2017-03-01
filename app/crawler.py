import argparse
import requests
import logging
import pandas as pd
import time
import json
from django.db import transaction
from app.models import Car, CarPriceChange, CarOdometerChange


logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


BASE_URL = 'https://www.tesla.com/cpo_tool/ajax?exteriors=&priceRange=0%2C250000&sort=featured%7Casc'

COUNTRY_CODES = [
    'US',
    'AT',
    # 'AU',
    'BE',
    'CA',
    'CH',
    'DE',
    'DK',
    # 'EU',
    'FI',
    'FR',
    'GB',
    'HK',
    # 'IE',
    'IT',
    # 'KR',
    # 'LU',
    # 'MO',
    # 'MX',
    'NL',
    'NO',
    'SE',
    # 'TW',
    'jp',
]


def filter_p85_autopilot(df):
    return df[df['isAutopilot'] & df['Badge'].isin(['P85', 'P85+'])]


class CrawlerException(Exception):
    pass


class TeslaCrawler:
    def __init__(self, country_code='US', slack_client=None, filter_criteria=lambda df: df):
        self.cars_seen = pd.DataFrame()
        self.slack_client = slack_client
        self.filter_criteria = filter_criteria
        self.country_code = country_code

    def make_url(self, metro_id=3, status='used', model='MODEL_S'):
        url = BASE_URL
        url += '&titleStatus=' + status
        url += '&model=' + model
        url += '&country=' + self.country_code
        if metro_id is not None:
            url += '&metroId=%d' % metro_id
        return url

    def check_url(self, url):
        logger.debug('Fetching from: %s', url)

        try:
            response = requests.get(url).json()
        except json.JSONDecodeError as e:
            raise CrawlerException(e)
        logger.info('Fetched %d cars', len(response))
        return self.parse_response(response)

    @transaction.atomic
    def update_database(self, cars_df):
        if len(cars_df) == 0:
            return
        existing_cars = {c.vin: c for c in Car.objects.filter(vin__in=cars_df['Vin'])}
        for car in cars_df.itertuples():
            car = self._tuple_to_model(car)
            if car.vin in existing_cars:
                existing = existing_cars[car.vin]
                if car.price != existing.price:
                    CarPriceChange.objects.create(
                        car=existing,
                        price_before=existing.price,
                        price_new=car.price
                    )
                    logger.info('Price change on VIN %s -- %s to %s', car.vin, existing.price, car.price)
                if car.odometer != existing.odometer:
                    CarOdometerChange.objects.create(
                        car=existing,
                        odometer_before=existing.odometer,
                        odometer_new=car.odometer
                    )
                    logger.info('Odometer change on VIN %s -- %s to %s', car.vin, existing.odometer, car.odometer)
                car.first_seen = existing.first_seen
                car.pk = existing.pk
            else:
                self.slack_message('Spotted new: ```%s```' % car)
                logger.info('Adding new VIN: %s', car.vin)
            try:
              with transaction.atomic():
                car.save()
            except:
              logger.exception('Unable to save car!')

    def slack_message(self, message):
        if self.slack_client:
            logger.info('Sending slack message: %s', message)
            self.slack_client.send_message(message)

    def parse_response(self, response):
        cars = pd.DataFrame(response)
        if cars.empty:
            logger.info('No results')
            return cars

        filtered_cars = self.filter_criteria(cars)
        logger.info('Cars matching criteria: %d', len(filtered_cars))

        for _, c in filtered_cars[~filtered_cars['Vin'].isin(self.cars_seen)].iterrows():
            logger.info('Spotted new %s: %d (%s)', c.Badge, c.UsedVehiclePrice, c.Vin)
            self.slack_message('Spotted new: ```%s```' % str(c))

        new_cars = cars if self.cars_seen.empty else cars[~cars['Vin'].isin(self.cars_seen['Vin'])]
        if len(new_cars):
            msg = 'Added %d new vins: ```%s```' % (len(new_cars), cars.groupby(['Badge', 'isAutopilot']).size().to_string())
            logger.info(msg)
            self.slack_message(msg)

        self.cars_seen = cars if self.cars_seen.empty else self.cars_seen.merge(cars, on='Vin', copy=False)
        logger.info('VINs seen: %d', len(self.cars_seen))
        return cars

    def _tuple_to_model(self, c):
        return Car(
            vin=c.Vin,
            price=c.UsedVehiclePrice,
            autopilot=c.AutoPilot,
            badge=c.Badge,
            battery=c.Battery,
            config_id=c.ConfigId,
            decor=c.Decor,
            destination_handling_fee=c.DestinationHandlingFee or 0,
            discount=c.Discount or 0,
            drive_train=c.DriveTrain,
            metro_id=c.MetroId,
            model=c.Model,
            model_variant=c.ModelVariant,
            odometer=c.Odometer,
            odometer_type=c.OdometerType,
            option_code_list=c.OptionCodeList,
            option_code_list_with_price=c.OptionCodeListWithPrice,
            ownership_transfer_count=c.OwnerShipTransferCount or 0,
            paint=c.Paint,
            range=c.Range,
            roof=c.Roof,
            title_status=c.TitleStatus,
            title_sub_status=c.TitleSubStatus or '',
            trade_in_type=c.TradeInType or '',
            year=c.Year,
            is_autopilot=c.isAutopilot,
            is_first_registration_date=c.isFirstRegistrationDate,
            is_panoramic=c.isPanoramic,
            is_premium=c.isPremium,
            country_code=self.country_code,
        )


class TeslaSlackClient:
    def __init__(self, webhook):
        self.webhook = webhook
        logger.debug('Initialized Slack client with webhook URL: %s', webhook)

    def send_message(self, text):
        r = requests.post(
            url=self.webhook,
            json={'text': text},
        )
        assert r.status_code == 200


def main():
    parser = argparse.ArgumentParser(description='Tesla CPO crawler and slack client')
    parser.add_argument('--slack-webhook', help='Slack webhook URL.')

    args = parser.parse_args()
    if args.slack_webhook:
        slack_client = TeslaSlackClient(webhook=args.slack_webhook)
    else:
        logger.info('Slack client not enabled')
        slack_client = None

    crawler = TeslaCrawler(slack_client=slack_client, filter_criteria=filter_p85_autopilot)
    while True:
        crawler.check()
        logger.debug('Sleeping %d seconds...', SLEEP_TIME)
        time.sleep(SLEEP_TIME)

if __name__ == '__main__':
    main()

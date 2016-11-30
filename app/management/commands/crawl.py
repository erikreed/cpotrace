import time
from django.core.management.base import BaseCommand
from app.models import Car
from app.crawler import COUNTRY_CODES, TeslaCrawler, CrawlerException, TeslaSlackClient


class Command(BaseCommand):
    help = 'Crawls and updates the car database'

    def add_arguments(self, parser):
        parser.add_argument('--country-codes', help='Comma delimited list of country codes. Defaults to all.')
        parser.add_argument('--slack-webhook', help='Slack webhook URL.')

    def handle(self, *args, **options):
        slack_client = TeslaSlackClient(webhook=options['slack_webhook']) if options['slack_webhook'] else None

        for country_code in options['country_codes'].split(',') if options['country_codes'] else COUNTRY_CODES:
            crawler = TeslaCrawler(slack_client=slack_client, country_code=country_code)

            for status in ('used', 'new'):
                for model in ('MODEL_S', 'MODEL_X'):
                    url = crawler.make_url(metro_id=None, status=status, model=model)
                    print('Fetching', status, model, 'in', country_code)
                    try:
                        cars = crawler.check_url(url)
                        crawler.update_database(cars)
                    except CrawlerException as e:
                        print('Error crawling:', e)
                    print('Sleeping 1 second [%d cars in database]' % Car.objects.count())
                    time.sleep(1)
        print('Done!')
        print('Saw %d P85s w/ autopilot' % Car.objects.filter(badge__in=['P85', 'P85+'], is_autopilot=True).count())


from django.shortcuts import render
from tethys_sdk.routing import controller
import requests

HYDROSERVER_ENDPOINT = 'https://hydroserver.geoglows.org'

@controller
def home(request):
    """
    Controller for the app home page.
    """
    headers = {'accept': 'application/json'}

    things_list = get_things(headers)
    print(things_list)
    context = {
        'things_list': things_list
    }

    return render(request, 'hydroserver_client/home.html', context)



def get_things(headers):
    things = []

    try:
        url_things = f'{HYDROSERVER_ENDPOINT}/api/data/things'
        response = requests.get(url_things, headers=headers)
        if response.status_code == 200:
            things = response.json()
    except Exception as e:
        print(e)
    return things

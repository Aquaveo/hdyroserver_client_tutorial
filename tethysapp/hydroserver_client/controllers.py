import requests
import json
from django.shortcuts import render
from tethys_sdk.routing import controller
from django.http import JsonResponse


HYDROSERVER_ENDPOINT = 'https://hydroserver.geoglows.org'

@controller
def home(request):
    """
    Controller for the app home page.
    """
    

    things_list = get_things()

    context = {
        'things_list': things_list,
    }

    return render(request, 'hydroserver_client/home.html', context)

def get_things():
    headers = {'accept': 'application/json'}
    things = []

    try:
        url_things = f'{HYDROSERVER_ENDPOINT}/api/data/things'
        response = requests.get(url_things, headers=headers)
        if response.status_code == 200:
            things = response.json()
    except Exception as e:
        print(e)
    return things

@controller
def get_datastreams(request):
    datastreams_list={'datastreams':[]}
    headers = {'accept': 'application/json'}
    datastream_id = json.load(request)['id']
    # breakpoint()
    try:
        url_datastreams = f'{HYDROSERVER_ENDPOINT}/api/data/things/{datastream_id}/datastreams'
        response = requests.get(url_datastreams, headers=headers)
        if response.status_code == 200:
            datastreams_list['datastreams'] = response.json()
    except Exception as e:
        print(e)

    return JsonResponse(datastreams_list)


from django.shortcuts import render
from tethys_sdk.routing import controller
import requests
from django.http import JsonResponse
import json

import geoglows


HYDROSERVER_ENDPOINT = 'https://hydroserver.geoglows.org'
GEOGLOWS_ENDPOINT ='https://geoglows.ecmwf.int/api'
@controller
def home(request):
    """
    Controller for the app home page.
    """
    

    things_list = get_things()
    # print(things_list)
    context = {
        'things_list': things_list
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


@controller
def get_observed_values(request):
    data_list={'data_series':[]}
    headers = {'accept': 'application/json'}
    datastream_id = json.load(request)['id']
    # breakpoint()
    try:
        url_observed_Values = f'{HYDROSERVER_ENDPOINT}/api/sensorthings/v1.1/Datastreams({datastream_id})/Observations?$resultFormat=dataArray&$top=1000'
        response = requests.get(url_observed_Values, headers=headers)
        if response.status_code == 200:
            data_list['data_series'] = response.json().get('value',[])[0].get('dataArray',[])
    except Exception as e:
        print(e)

    return JsonResponse(data_list)

@controller
def save_geoglows_station(request):
    request_data = json.load(request)
    lat = float(request_data['lat'])
    lon = float(request_data['lon'])
    station_obj={
        'latitude':lat,
        'longitude': lon
    }
    try:
        model_data = geoglows.streamflow.latlon_to_reach(lat, lon)
        station_obj.update(model_data)
        # save data into model
    except Exception as e:
        print(e)
    return JsonResponse(station_obj)


@controller
def get_geoglows_forecast(request):
    geo_data_dict = {
        'time':[],
        'values':[]
    }
    request_data = json.load(request)
    reach_id = int(request_data['reach_id'])
    headers = {'accept': 'application/json'}
    params = {"reach_id": reach_id, "return_format": "json"}
    try:
        url_feo_values = f'{GEOGLOWS_ENDPOINT}/ForecastStats/'
        response = requests.get(url_feo_values, params=params, headers=headers)
        breakpoint()
        if response.status_code == 200:
            data_ts = response.json()
            geo_data_dict['time'] = data_ts.get('time_series',{}).get('datetime',[])
            geo_data_dict['values'] = data_ts.get('time_series',{}).get('flow_25%_m^3/s',[])

    except Exception as e:
        print(e)
    return JsonResponse(geo_data_dict)
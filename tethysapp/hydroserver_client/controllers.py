import requests
import json
import geoglows
from django.shortcuts import render
from tethys_sdk.routing import controller
from django.http import JsonResponse
from .model import Geoglows_reach
from .app import HydroserverClient as app

HYDROSERVER_ENDPOINT = 'https://hydroserver.geoglows.org'
GEOGLOWS_ENDPOINT ='https://geoglows.ecmwf.int/api'
@controller
def home(request):
    """
    Controller for the app home page.
    """
    

    things_list = get_things()
    reaches_list = get_geoglows_reaches()

    context = {
        'things_list': things_list,
        'reach_list': reaches_list
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
        add_new_region(model_data['reach_id'], model_data['latitude'], model_data['longitude'], model_data['region'], model_data['distance'])

    except Exception as e:
        print(e)
    return JsonResponse(station_obj)


def add_new_geoglows_reach(reach_id, latitude, longitude, region, distance):
    """
    Persist new reach.
    """
    
    # Create new Dam record
    new_reach = Geoglows_reach(
        latitude=latitude,
        longitude=longitude,
        reach_id=reach_id,
        region=region,
        distance=distance,
    )

    # Get connection/session to database
    Session = app.get_persistent_store_database('primary_db', as_sessionmaker=True)
    session = Session()

    # Add the new dam record to the session
    session.add(new_reach)

    # Commit the session and close the connection
    session.commit()
    session.close()

def get_geoglows_reaches():
    list_reaches = []
    Session = app.get_persistent_store_database('primary_db', as_sessionmaker=True)
    session = Session()

    # Query for all dam records
    reaches = session.query(Geoglows_reach).all()
    session.close()

    try:
        for reach in reaches:
            reach_single = {
                'reach_id':reach.reach_id,
                'latitude':reach.latitude,
                'longitude':reach.longitude,
                'region':reach.region,
                'distance':reach.distance
            }
            list_reaches.append(reach_single)
    except Exception as e:
        print(e)
    return list_reaches

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
        if response.status_code == 200:
            data_ts = response.json()
            geo_data_dict['time'] = data_ts.get('time_series',{}).get('datetime',[])
            geo_data_dict['values'] = data_ts.get('time_series',{}).get('flow_25%_m^3/s',[])

    except Exception as e:
        print(e)
    return JsonResponse(geo_data_dict)
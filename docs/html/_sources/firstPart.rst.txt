========
Tutorial
========

The following tutorial will walk help you to create a `Tethys <https://docs.tethysplatform.org/en/stable/>`_  application that retrieves stations from a `HydroServer <https://hydroserver2.github.io/hydroserver/guide/getting-started.html>`_ instance 
and, it saves reaches from the `GEOGloWS ECMWF Streamflow Service <https://geoglows.ecmwf.int/documentation>`_ into a local PostgreSQL application.


Requirements
------------

- tethys-platform installed locally in the development environment.
- Any Text Editor

Getting Started
---------------

Please create an scaffold of the app using the following command:

.. code-block:: bash


    conda activate tethys
    tethys scaffold hydroserver_client
    tethys install -d


The following will create a start up project, that we will need to clean, please copy the following contents to the following files:
The `home.html` should be the following:

.. code-block:: html


    {% extends "hydroserver_client/base.html" %}

    {% block header_buttons %}
    <div class="header-button glyphicon-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Help">
        <a data-bs-toggle="modal" data-bs-target="#help-modal"><i class="bi bi-question-circle"></i></a>
    </div>
    {% endblock %}

    {% block app_content %}

    {% endblock %}

    {# Use the after_app_content block for modals #}
    {% block after_app_content %}
    <!-- Example Modal -->
    <div class="modal fade" id="help-modal" tabindex="-1" role="dialog" aria-labelledby="help-modal-label">
        <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="help-modal-label">Example Modal</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <p>You can add custom buttons to the app header using the <code>header_buttons</code> block. Use anchor/link tags for the button and wrap it in a div with the class <code>header-button</code>. For buttons with the gliphyicons, add the <code>glyphicon-button</code> class as well.</p>
            <p>Ever have trouble using a modal in a Tethys app? Use the <code>after_app_content</code> block for modal content to allow them to function properly. See: <a href="https://getbootstrap.com/docs/5.1/components/modal/">Bootstrap Modals</a></p>
            <p>Add tooltips to any element by adding the <code>data-bs-toggle</code>, <code>data-bs-placement</code>, and <code>title</code> attributes to the button. See: <a href="https://getbootstrap.com/docs/5.1/components/tooltips/">Bootstrap Tooltips</a></p>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
            </div>
        </div>
        </div>
    </div>
    {% endblock %}

    {% block app_actions %}

    {% endblock %}

The `base.html` should be the following:

.. code-block:: html


    {% extends "tethys_apps/app_base.html" %}

    {% load static %}

    {% block title %}{{ tethys_app.name }}{% endblock %}

    {% block app_icon %}
    {# The path you provided in your app.py is accessible through the tethys_app.icon context variable #}
    <img src="{% if 'http' in tethys_app.icon %}{{ tethys_app.icon }}{% else %}{% static tethys_app.icon %}{% endif %}" />
    {% endblock %}

    {# The name you provided in your app.py is accessible through the tethys_app.name context variable #}
    {% block app_title %}{{ tethys_app.name }}{% endblock %}

    {% block app_navigation_items %}

    {% endblock %}

    {% block app_content %}
    {% endblock %}

    {% block app_actions %}
    {% endblock %}

    {% block content_dependent_styles %}
    {{ block.super }}
    <link href="{% static 'hydroserver_client/css/main.css' %}" rel="stylesheet"/>
    {% endblock %}

    {% block scripts %}
    {{ block.super }}
    <script src="{% static 'hydroserver_client/js/main.js' %}" type="text/javascript"></script>
    {% endblock %}

The `controllers.py` should be the following:

.. code-block:: python


    from django.shortcuts import render
    from tethys_sdk.routing import controller

    @controller
    def home(request):
        """
        Controller for the app home page.
        """
        context = {

        }

        return render(request, 'hydroserver_client/home.html', context)

Adding HydroServer Things
-------------------------

1. First we need to add the CDN dependencies in the `base.html`
   
.. code-block:: html

    
    {% extends "tethys_apps/app_base.html" %}

    {% load static %}

    {% block title %}{{ tethys_app.name }}{% endblock %}

    {% block app_icon %}
    {# The path you provided in your app.py is accessible through the tethys_app.icon context variable #}
    <img src="{% if 'http' in tethys_app.icon %}{{ tethys_app.icon }}{% else %}{% static tethys_app.icon %}{% endif %}" />
    {% endblock %}

    {# The name you provided in your app.py is accessible through the tethys_app.name context variable #}
    {% block app_title %}{{ tethys_app.name }}{% endblock %}

    {% block app_navigation_items %}
    {% endblock %}

    {% block app_content %}
    {% endblock %}

    {% block app_actions %}
    {% endblock %}

    {% block content_dependent_styles %}
    {{ block.super }}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v8.2.0/ol.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="{% static 'hydroserver_client/css/main.css' %}" rel="stylesheet"/>
    {% endblock %}

    {% block scripts %}
    {{ block.super }}
    <script src="https://cdn.jsdelivr.net/npm/ol@v8.2.0/dist/ol.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js" integrity="sha512-GWzVrcGlo0TxTRvz9ttioyYJ+Wwk9Ck0G81D+eO63BaqHaJ3YZX9wuqjwgfcV/MrB2PhaVX9DkYVhbFpStnqpQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    {% endblock %}

2. We need to add all the necesary html for the map and html tags that will show the metadata and popup of the Things in `home.html`

.. code-block:: html


    {% extends "hydroserver_client/base.html" %}
    {% load static %}
    {% block header_buttons %}
    <div class="header-button glyphicon-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Help">
        <a data-bs-toggle="modal" data-bs-target="#help-modal"><i class="bi bi-question-circle"></i></a>
    </div>
    {% endblock %}
    {% block app_navigation_items %}
    <div class="items-wrapper">
    <h4>HydroServer</h4>
    <h6 id="title-thing">
        Metadata
    </h6>
    <p id="prompt-click">
        Please click on a station to see data, and explore the time series of its variables
    </p>
    <table id="table-item-metadata" class="table-sm">
        <tbody>
    
        <tr>
            <td><i class="fas fa-barcode" aria-hidden="true"></i><span>Site Code</span></td>
            <td id="id-samplingFeatureCode"></td>
        </tr>
        <tr>
            <td><i class="fas fa-map" aria-hidden="true"></i><span>Latitude</span></td>
            <td id="id-latitude"></td>
        </tr>
        <tr>
            <td><i class="fas fa-map" aria-hidden="true"></i><span>Longitude</span></td>
            <td id="id-longitude"></td>
        </tr>
        <tr>
            <td><i class="fas fa-mountain" aria-hidden="true"></i><span>Elevation (m)</span></td>
            <td id="id-elevation_m"></td>
        </tr>
        <tr>
            <td><i class="fas fa-map-pin" aria-hidden="true"></i><span>Site Type</span></td>
            <td id="id-samplingFeatureType"></td>
        </tr>
        <tr>
            <td><i class="fas fa-flag-usa" aria-hidden="true"></i><span>State</span></td>
            <td id="id-state"></td>
        </tr>
        <tr>
            <td><i class="fas fa-flag-usa" aria-hidden="true"></i><span>County</span></td>
            <td id="id-county"></td>
        </tr>
        <tr>
            <td><i class="fas fa-globe" aria-hidden="true"></i><span>Privacy</span></td>
            <td id="id-isPrivate"></td>
        </tr>
        </tbody>
    </table>
    </div>
    {% endblock %}
    {% block app_content %}
    <div id="map"></div>
    <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content"></div>
    </div>
    {% endblock %}

    {# Use the after_app_content block for modals #}
    {% block after_app_content %}
    <!-- Example Modal -->
    <div class="modal fade" id="help-modal" tabindex="-1" role="dialog" aria-labelledby="help-modal-label">
    <div class="modal-dialog" role="document">
    <div class="modal-content">
        <div class="modal-header">
        <h5 class="modal-title" id="help-modal-label">Example Modal</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
        <p>You can add custom buttons to the app header using the <code>header_buttons</code> block. Use anchor/link tags for the button and wrap it in a div with the class <code>header-button</code>. For buttons with the gliphyicons, add the <code>glyphicon-button</code> class as well.</p>
        <p>Ever have trouble using a modal in a Tethys app? Use the <code>after_app_content</code> block for modal content to allow them to function properly. See: <a href="https://getbootstrap.com/docs/5.1/components/modal/">Bootstrap Modals</a></p>
        <p>Add tooltips to any element by adding the <code>data-bs-toggle</code>, <code>data-bs-placement</code>, and <code>title</code> attributes to the button. See: <a href="https://getbootstrap.com/docs/5.1/components/tooltips/">Bootstrap Tooltips</a></p>
        </div>
        <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
        </div>
    </div>
    </div>
    </div>
    {% endblock %}
    {% block app_actions %}
    {% endblock %}
    {% block scripts %}
    {{ block.super }}
    {{ things_list|json_script:"things-list" }}
    <script src="{% static 'hydroserver_client/js/main.js' %}" type="text/javascript"></script>
    {% endblock %}


3. make the html dynamic adding the following into the `main.js`

.. code-block:: javascript


    (() => {

    function getCookie(name) {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
      }
      
    const csrftoken = getCookie('csrftoken');

    const makeVectorLayerForMaker = (map,type_marker) =>{
        // Assuming 'map' is your OpenLayers map
        const vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: type_marker== 'geoglows'? 
                        new ol.style.Fill({
                            color: '#72B01D',
                        }):
                        new ol.style.Fill({
                            color: '#8e44ad',
                        })
                    ,
                    stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 1,
                    }),
                }),
            })
        });
        map.addLayer(vectorLayer);
        const myStyle = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({ color: 'blue' }),
              stroke: new ol.style.Stroke({
                color: 'white',
                width: 2,
              }),
            }),
          });

        // Add hover interaction
        const selectPointerMove = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove,
            layers: [vectorLayer],
            style: myStyle, // Apply the same style on hover
        });
    
        map.addInteraction(selectPointerMove);
        return vectorLayer
    }

    const initializeMap = () => {
        const source_draw = new ol.source.Vector({wrapX: false});

        const vector_draw = new ol.layer.Vector({
            source: source_draw,
        });

      const map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM(),
          }),
          vector_draw
        ],
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
          padding: [170, 100, 100, 150]
        }),
      });
        getThings(map);
    };

    const fetchData = (option) => {
        fetch(`get-observed-values/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
          },
          body:JSON.stringify({'id':option})
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {

            let ts_data = data['data_series']

            var data_element = [
                {
                  x: [],
                  y: [],
                  type: 'scatter'
                }
              ];
                            
              ts_data.forEach(([dateStr, value]) => {
                const date = new Date(dateStr);
                data_element[0]['x'].push(date.toISOString().slice(0, 10)); 
                value > 0 ? data_element[0]['y'].push(value) : null;
              });

              Plotly.newPlot('ts_chart', data_element);

          })
          .catch(error => {
            console.error('Error:', error);
            // Handle errors if any
          });
    }

    const makeTableData = (thing)=>{
        const keys = Object.keys(thing);
        for (const key of keys) {

          let id_table = `id-${key}`;

          const element = document.getElementById(id_table);
          if (element) {
            let elementContent = thing[key]
            if(key =='isPrivate'){
                elementContent = elementContent ? 'Private' : 'Public'
            }
            element.innerHTML = elementContent;
            
          }
        }
    }

    const getThings = (map) => {

        const thingsListSerializedData = document.getElementById('things-list').textContent;
        const thingsListParsedData = JSON.parse(thingsListSerializedData);

        // Assuming 'map' is your OpenLayers map
        const vectorLayer = makeVectorLayerForMaker(map,'hydroserver');
   

        map.on('pointermove', evt => {
            if (!evt.dragging) {
              map.getTargetElement().style.cursor = map.hasFeatureAtPixel(map.getEventPixel(evt.originalEvent)) ? 'pointer' : '';
            }
        });
        thingsListParsedData.forEach(item => {
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([item.longitude, item.latitude])
                ),
                name: item.name,
                id: item.id,
                description: item.description,
                type_marker: 'hydroserver'
            });
            vectorLayer.getSource().addFeature(marker);

            map.on('singleclick', evt => {
                const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
                if (feature === marker) {
                    if(feature.get('type_marker') == 'hydroserver'){
                        makeTableData(item);
                        fetch(`get-datastreams/`,{
                            method:'POST',
                            headers:{
                                'Content-Type':'application/json',
                                'X-CSRFToken':csrftoken,
                               }, 
                            body:JSON.stringify({'id':feature.get('id')})
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                          return response.json();
                        })
                        .then(data => {
                         document.getElementById('table-item-metadata').style.display = "block"
                         document.getElementById("prompt-click").style.display = "none";
                         document.getElementById('title-thing').innerHTML =  item.name;
    
                          let data_streams = data['datastreams'];
                          let radio_btn = ``
                          data_streams.forEach((datastream_item)=>{
                            radio_btn += `<input type="radio" id="${datastream_item.id}" name="datastreams" value="${datastream_item.id}">
                            <label for="${datastream_item.id}">${datastream_item.description.split('-')[0]}</label><br>`
                          })
                          const coordinates = feature.getGeometry().getCoordinates();
                          const popupContent = `<h3><strong>${feature.get('name')}</strong></h3>
                                                  <p>${feature.get('description')}</p>
                                                  <form>
                                                    <fieldset>
                                                     </legend><strong>Datastreams</strong></legend>
                                                     <div>
                                                       ${radio_btn}
                                                     </div>
                                                    </fieldset>
                                                  </form>
                                                  <br>
                                                  <div id="ts_chart"></div>`
                                                  ;              
                          const popup = new ol.Overlay({
                              element: document.getElementById('popup'),
                              positioning: 'bottom-center',
                              stopEvent: false,
                              offset: [0, -10]
                          });
                          map.addOverlay(popup);
                          popup.setPosition(coordinates);
                          document.getElementById('popup-content').innerHTML = popupContent;
    
                          var closer = document.getElementById('popup-closer');
                          closer.onclick = function() {
                              popup.setPosition(undefined);
                              closer.blur();
                              return false;
                          };
    
                            document.querySelectorAll('input[name="datastreams"]').forEach(radio => {

                                radio.addEventListener('change', event => {
  
                                if (event.target.checked) {
                                    console.log(event.target.value);
                                }
                                });
                            });
                        })
                        .catch(error => {
                          console.error('There was a problem with the fetch operation:', error);
                        });
    
    
    
    
                    }

                }

            });
        });

        map.getView().fit(vectorLayer.getSource().getExtent())
    };


    initializeMap();



  })();

4. Add the following to the `controllers.py`
   
.. code-block:: python


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

5. add the following styles:

.. code-block:: css

    html,
    body {
    margin: 0;
    height: 100%;
    }

    .items-wrapper{
        margin-top: 10px;

    }
    #table-item-metadata{
        margin-top: 10px;
        display: none;
    }

    .table-sm{
        margin-top: 10px;
        font-size: small;
    }

    #map {
        position: absolute;
        top: 50px;
        bottom: 0;
        width: 100%;
        padding:0px;
    }
    .ol-popup {
        position: absolute;
        background-color: white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 700px;
    }
    .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }
    .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
    }
    .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
    }
    .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
    }
    .ol-popup-closer:after {
        content: "✖";
    }

Once you have added you should be able to get the things in a map, with the different data streams of each one. 
Check out answer with

.. code-block:: bash

    git clone https://github.com/Aquaveo/hdyroserver_client_tutorial.git
    cd hdyroserver_client_tutorial
    git checkout -b adding_things


Adding TimeSeries for HydroServer
---------------------------------

1. Making markers interactive
2. Calling the API

Saving GEOGLoWS reach_id
------------------------

1. Making the map interactive
2. Creating a database and saving data
   

Adding Forecast TimeSeries to the GeoGlows Reach id
---------------------------------------------------
1. Making map interactive
   
2. Calling the service
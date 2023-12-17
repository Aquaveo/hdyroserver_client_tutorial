(() => {

    function getCookie(name) {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
      }
      
    const csrftoken = getCookie('csrftoken');
    const makeVectorLayerForMaker = (map) =>{
        // Assuming 'map' is your OpenLayers map
        const vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                    color: '#8e44ad',
                    }),
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

    const saveStation = (map,draw) =>{
        
        let coordinateString = document.getElementById('lat-lon-id').textContent;
        const [lon, lat] = coordinateString.split(',');
        console.log(lon,lat)

        fetch(`save-geoglows-station/`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'X-CSRFToken':csrftoken,
               }, 
            body:JSON.stringify({'lat':lat,'lon':lon})
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
            console.log(data);
            map.removeInteraction(draw);
            const vectorLayer = makeVectorLayerForMaker(map);
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([data.longitude, data.latitude])
                ),
                distance: data.distance,
                reach_id: data.reach_id,
                region: data.region,
                type_marker:'geoglows'
            });
            vectorLayer.getSource().addFeature(marker);
            map.removeInteraction(draw);

            map.on('singleclick', evt => {
                
                const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
                if (feature === marker) {
                    if(feature.get('type_marker') == 'geoglows'){

                        fetch(`get-geoglows-forecast/`,{
                            method:'POST',
                            headers:{
                                'Content-Type':'application/json',
                                'X-CSRFToken':csrftoken,
                               }, 
                            body:JSON.stringify({'reach_id':feature.get('reach_id')})
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                          return response.json();
                        })
                        .then(data => {
                          console.log(data)
    
                          const coordinates = feature.getGeometry().getCoordinates();
                          const popupContent = `<h3><strong>Reach ID - ${feature.get('reach_id')}</strong></h3>
                                                  <p>Region - ${feature.get('region')}</p>
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
                          var data_element = [
                            {
                              x: data['time'],
                              y: data['values'],
                              type: 'scatter'
                            }
                          ];
                                        
                          Plotly.newPlot('ts_chart', data_element);
                        })
                        .catch(error => {
                          console.error('There was a problem with the fetch operation:', error);
                        });
    
                    }
                }

            });




        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
    const addInteraction = (map,source_draw) =>{
        let draw = new ol.interaction.Draw({
            source: source_draw,
            type: 'Point',
        });
        draw.on('drawend', function(evt){
            // map.removeInteraction(draw);
            document.getElementById('lat-lon-id').innerHTML = ol.proj.transform(evt.feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
            map.removeInteraction(draw);
        },this);
        map.addInteraction(draw);

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
        getReaches(map);
        
        document.getElementById('btn-add-station').addEventListener('click',function(){
            var features = source_draw.getFeatures();
            var lastFeature = features[features.length - 1];
            source_draw.removeFeature(lastFeature);
            addInteraction(map,source_draw);
        })
        document.getElementById('btn-save-station').addEventListener('click',function(event){
            event.preventDefault();
            saveStation(map,draw)
        })
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
            console.log(data)
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
          console.log(id_table)
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
        const vectorLayer = makeVectorLayerForMaker(map);
   

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
                                console.log(radio)
                                radio.addEventListener('change', event => {
                                    console.log("asfgasg")
                                if (event.target.checked) {
                                    fetchData(event.target.value);
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


    const getReaches = (map) =>{
        const reachesListSerializedData = document.getElementById('reach-list').textContent;
        const reachessListParsedData = JSON.parse(reachesListSerializedData);

        // Assuming 'map' is your OpenLayers map
        const vectorLayer = makeVectorLayerForMaker(map);
        map.on('pointermove', evt => {
            if (!evt.dragging) {
              map.getTargetElement().style.cursor = map.hasFeatureAtPixel(map.getEventPixel(evt.originalEvent)) ? 'pointer' : '';
            }
        });
        reachessListParsedData.forEach(item => {
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([data.longitude, data.latitude])
                ),
                distance: data.distance,
                reach_id: data.reach_id,
                region: data.region,
                type_marker:'geoglows'
            });
            
            vectorLayer.getSource().addFeature(marker);
            map.on('singleclick', evt => {
                
                const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
                if (feature === marker) {
                    if(feature.get('type_marker') == 'geoglows'){

                        fetch(`get-geoglows-forecast/`,{
                            method:'POST',
                            headers:{
                                'Content-Type':'application/json',
                                'X-CSRFToken':csrftoken,
                               }, 
                            body:JSON.stringify({'reach_id':feature.get('reach_id')})
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                          return response.json();
                        })
                        .then(data => {
                          console.log(data)
    
                          const coordinates = feature.getGeometry().getCoordinates();
                          const popupContent = `<h3><strong>Reach ID - ${feature.get('reach_id')}</strong></h3>
                                                  <p>Region - ${feature.get('region')}</p>
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
                          var data_element = [
                            {
                              x: data['time'],
                              y: data['values'],
                              type: 'scatter'
                            }
                          ];
                                        
                          Plotly.newPlot('ts_chart', data_element);
                        })
                        .catch(error => {
                          console.error('There was a problem with the fetch operation:', error);
                        });
    
                    }
                }

            });

        });
        
    }

    initializeMap();



  })();
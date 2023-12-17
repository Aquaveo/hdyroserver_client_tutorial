(() => {

    function getCookie(name) {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
      }
      
    const csrftoken = getCookie('csrftoken');

    const initializeMap = () => {
      const map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM(),
          }),
        ],
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
        }),
      });
        getThings(map);

    };

    function fetchData(option) {
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
                            
              // Parse the data to Chart.js format
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
    const getThings = (map) => {

        const thingsListSerializedData = document.getElementById('things-list').textContent;
        const thingsListParsedData = JSON.parse(thingsListSerializedData);

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
                description: item.description
            });
            vectorLayer.getSource().addFeature(marker);

            
            map.on('singleclick', evt => {
                const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
                if (feature === marker) {
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
                        console.log(data)
                      let data_streams = data['datastreams'];
                      let radio_btn = ``
                      data_streams.forEach((datastream_item)=>{
                        radio_btn += `<input type="radio" id="${datastream_item.id}" name="datastreams" value="${datastream_item.id}">
                        <label for="${datastream_item.id}">${datastream_item.description.split('-')[0]}</label><br>`
                      })
                      const coordinates = feature.getGeometry().getCoordinates();
                      const popupContent = `<p><strong>${feature.get('name')}</strong></p>
                                              <p>${feature.get('description')}</p>
                                              <form>
                                                <fieldset>
                                                 </legend>Datastreams</legend>
                                                 <div>
                                                   ${radio_btn}
                                                 </div>
                                                </fieldset>
                                              </form>
                                              <br>
                                              <div id="ts_chart"></div>`
                                              ;
                      
                    // popupContent += radio_btn
                    
                      
                      const popup = new ol.Overlay({
                          element: document.getElementById('popup'),
                          positioning: 'bottom-center',
                          stopEvent: false,
                          offset: [0, -50]
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
            });
        });



        //https://hydroserver.geoglows.org/api/sensorthings/v1.1/Datastreams(08a4f14a-8930-445a-959e-55a1d0bba41f)/Observations?$resultFormat=dataArray&$top=1000
      };


    initializeMap();



  })();
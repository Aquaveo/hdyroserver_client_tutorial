(() => {
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
        
        thingsListParsedData.forEach(item => {
            const marker = new ol.Feature({
            geometry: new ol.geom.Point(
                ol.proj.fromLonLat([item.longitude, item.latitude])
            ),
            });
        
            vectorLayer.getSource().addFeature(marker);
        })
      };
  

    initializeMap();
  })();
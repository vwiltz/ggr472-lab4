mapboxgl.accessToken = 'pk.eyJ1IjoidndpbHR6IiwiYSI6ImNscmZ0N3liOTA1Mmkybm8xeGU0cmZuOW8ifQ.EpQc24rhxsadjwWf3mvoiQ';

const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mapbox/standard',
    center: [-79.39, 43.65],
    zoom: 12
});

map.addControl(new mapboxgl.NavigationControl());

let myPoints;

fetch('https://raw.githubusercontent.com/vwiltz/ggr472-lab4/main/data/data/redlight_cams.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response); // check response in console
        myPoints = response; // store geojson in variable using url from fetch response

        map.on('load', () => {
            map.addSource('collisions', {
                type: 'geojson',
                data: myPoints
            });

            map.addLayer({
                'id': 'toronto-collisions',
                'type': 'circle',
                'source': 'collisions',
                'paint': {
                    'circle-radius': 2,
                    'circle-color': '#000000'
                }
            });

            let bboxgeojson;
            let bbox = turf.envelope(myPoints);
            bboxgeojson = { "type": "FeatureCollection", "features": [bbox] };

            console.log(bbox)
            console.log(bbox.geometry.coordinates)

            const coordinates = bbox.geometry.coordinates[0];
            const minX = coordinates[0][0];
            const minY = coordinates[0][1];
            const maxX = coordinates[2][0];
            const maxY = coordinates[2][1];
            const hexgrid = turf.hexGrid([minX, minY, maxX, maxY], { size: 0.5, units: 'kilometers' });

            map.addSource('hexgrid', {
                type: 'geojson',
                data: hexgrid
            });

            map.addLayer({
                'id': 'hexgrid',
                'type': 'fill',
                'source': 'hexgrid',
                'paint': {
                    'fill-opacity': 0.1,
                    'fill-color': '#00ff00'
                }
            });



        }); // map load event listener closing brace 
    });

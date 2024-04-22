mapboxgl.accessToken = 'pk.eyJ1IjoidndpbHR6IiwiYSI6ImNscmZ0N3liOTA1Mmkybm8xeGU0cmZuOW8ifQ.EpQc24rhxsadjwWf3mvoiQ';

const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mapbox/standard',
    center: [-79.39, 43.65],
    zoom: 12
});

map.addControl(new mapboxgl.NavigationControl());

let myPoints;
let maxcollis = 0; // initialize variable to store the maximum count of points

fetch('https://raw.githubusercontent.com/vwiltz/ggr472-lab4/main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        myPoints = response; 

        map.on('load', () => {
            map.addSource('collisions', {
                type: 'geojson',
                data: myPoints
            });

            // map.addLayer({
            //     'id': 'toronto-collisions',
            //     'type': 'circle',
            //     'source': 'collisions',
            //     'paint': {
            //         'circle-radius': 2,
            //         'circle-color': '#FF0000'
            //     }
            // });

            let bbox = turf.bbox(myPoints); // find bounding box
            let envelopescaled = turf.transformScale(turf.bboxPolygon(bbox), 1.1);
            let bboxscaled = turf.bbox(envelopescaled);
            const myhex = turf.hexGrid(bboxscaled, 0.5, { units: 'kilometers' });

            const collected = turf.collect(myhex, myPoints, '_id', 'values'); // collect points that fall within hexagons

            collected.features.forEach((feature) => {
                feature.properties.COUNT = feature.properties.values.length;
                if (feature.properties.COUNT > maxcollis) {
                    maxcollis = feature.properties.COUNT;
                }
            });

            map.addSource('hexgrid', {
                type: 'geojson',
                data: myhex
            });

            map.addLayer({
                'id': 'hexgrid',
                'type': 'fill',
                'source': 'hexgrid',
                'paint': {
                    'fill-opacity': 0.5,
                    'fill-color': 
                    [
                        'interpolate',
                        ['linear'],
                        ['get', 'COUNT'],
                        0, '#FFFFCC', // color for zero collisions
                        maxcollis * 0.25, '#FFCC00',
                        maxcollis * 0.5, '#FF9900',
                        maxcollis * 0.75, '#FF6600',
                        maxcollis, '#800026' // color for max collisions
                    ],
                    'fill-outline-color': '#000000'
                }
            });
        });
    });
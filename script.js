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
                    'fill-opacity': 0.7,
                    'fill-color':
                        [
                            'interpolate',
                            ['linear'],
                            ['get', 'COUNT'],
                            0, '#ffffcc', // colour for zero collisions
                            maxcollis * 0.25, '#fecc5c',
                            maxcollis * 0.5, '#fd8d3c',
                            maxcollis * 0.75, '#f03b20',
                            maxcollis, '#bd0026' // colour for max collisions
                        ],
                    'fill-outline-color': '#000000'
                }
            });
        });

        // create legend
        const legend = document.getElementById('legend');

        layers.forEach((layer, i) => {
            const color = colors[i];
            const item = document.createElement('div');
            const key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            const value = document.createElement('span');
            value.innerHTML = `${layer}`;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        });

    });
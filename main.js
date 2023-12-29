var mapView = new ol.View({
    center: ol.proj.fromLonLat([97.14608632199847, 5.189996400048977]),
    zoom: 17
});

var map = new ol.Map({
    target: 'map',
    view: mapView
});

var osmTile = new ol.layer.Tile({
    title: 'Open Street Map',
    visible: true,
    type: 'base',
    source: new ol.source.OSM()
});

// map.addLayer(osmTile);

var noneTile = new ol.layer.Tile({
    title: 'None',
    type: 'base',
    visible: false,
});

var googleSatLayer = new ol.layer.Tile({
    title: 'Google Satellite',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        url: 'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        maxZoom: 20,
        tilePixelRatio: 1,
        tileSize: 256,
        projection: 'EPSG:3857',
    }),
});


var HaguSelatanTile = new ol.layer.Tile({
    title: "Batas Hagu Selatan",
    source: new ol.source.TileWMS({
        url: 'http://8.215.28.229:8080/geoserver/dzikriarraiyan/wms',
        params: {
            'LAYERS': 'dzikriarraiyan:batas_gampong',
            'TILED': true
        },
        serverType: 'geoserver',
        visible: true
    })
});

var baseGroup = new ol.layer.Group({
    title: 'Base Maps',
    fold: true,
    layers: [osmTile, googleSatLayer, noneTile]
})

// Create popup Info layer
var createLayer = function(title, layerName) {
    return new ol.layer.Tile({
        title: title,
        source: new ol.source.TileWMS({
            url: 'http://8.215.28.229:8080/geoserver/dzikriarraiyan/wms',
            params: {'LAYERS': `dzikriarraiyan:${layerName}`, 'TILED': true},
            serverType: 'geoserver',
            visible: true
        })
    });
};

// Inisialisasi Layer polylineGroup
var polylineGroup = new ol.layer.Group({
    title: 'Polyline',
    fold: true,
    layers: [
        createLayer('Jalan', 'jalan'),
        createLayer('Lorong', 'lorong'),
        createLayer('Paret', 'paret')
    ],
});

// Inisialisasi Layer polygonGroup
var polygonGroup = new ol.layer.Group({
    title: 'Polygon',
    fold: true,
    layers: [
        createLayer('Balai Pengajian', 'balai_pengajian'),
        createLayer('Gedung Sekolah', 'gedung_sekolah'),
        createLayer('halaman Mesjid', 'halaman_mesjid'),
        createLayer('Kantin', 'kantin'),
        createLayer('Kantor', 'kantor'),
        createLayer('Kedai', 'kedai'),
        createLayer('Kursus', 'kursus'),
        createLayer('Lahan Sekolah', 'lahan_sekolah'),
        createLayer('Perbaikan', 'lainnya'),
        createLayer('Lapangan', 'lapangan'),
        createLayer('Lapangan Sekolah', 'lapangan_sekolah'),
        createLayer('Menara BTS', 'menara_bts'),
        createLayer('Mesjid', 'mesjid'),
        createLayer('Mushola', 'mushola'),
        createLayer('Pabrik', 'pabrik'),
        createLayer('Parkiran', 'parkiran'),
        createLayer('Penginapan', 'penginapan'),
        createLayer('Pos', 'pos'),
        createLayer('Ruko', 'ruko'),
        createLayer('Rumah', 'rumah'),
        createLayer('Tanah', 'tanah'),
        createLayer('Tempat Wudhu', 'tempat wudhu')
    ],
});

map.addLayer(baseGroup);
map.addLayer(HaguSelatanTile);
map.addLayer(polygonGroup);
map.addLayer(polylineGroup);

var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: false,
    groupSelectStyle: 'children'
});

map.addControl(layerSwitcher);


// Create popup Info layer
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var popup = new ol.Overlay({
    element: container,
    autoPan: true,
    autoAnimation: {
        duration: 250
    }
});

map.addOverlay(popup);

closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};

// Function to handle common logic for creating and displaying popup layers
function handlePopupLayer(layerName, featureInfoProperties, extraProperties = {}) {
    map.on('singleclick', function (evt) {
        content.innerHTML = '';
        var resolution = mapView.getResolution();
        var url = createLayer(layerName, layerName.toLowerCase()).getSource().getFeatureInfoUrl(evt.coordinate, resolution, 'EPSG:32647', {
            'INFO_FORMAT': 'application/json',
            'propertyName': featureInfoProperties
        });

        if (url) {
            console.log(url);
            $.getJSON(url, function (data) {
                var feature = data.features[0];
                var props = feature.properties;
                var popupContent = Object.entries(extraProperties).map(([key, label]) => `<h3> ${label} : </h3> <p>${props[key]}</p> <br>`).join(' ');
                content.innerHTML = popupContent;
                popup.setPosition(evt.coordinate);
            });
        } else {
            popup.setPosition(undefined);
        }
    });
}


// // Call Action popup layer Jalan

handlePopupLayer('penginapan', 'nama, pemilik, luas', {
    'nama': 'Nama Penginapan',
    'pemilik': 'Nama Pemilik',
    'luas': 'Luas Bangunan',
});
const mapElement = document.getElementById('map');
const defaultCoordinates = [20.2960, 85.8300];
const defaultZoom = 13;

let viewCoordinates = defaultCoordinates;
let viewZoom = defaultZoom;
let listingSpecificCoordinates = null;
let listingTitle = 'Listing Location'; // Default title

if (mapElement) {
    const titleFromData = mapElement.dataset.title;
    if (titleFromData) {
        listingTitle = titleFromData;
    }

    const coordsString = mapElement.dataset.coordinates;
    if (coordsString) {
        try {
            const parsedCoords = JSON.parse(coordsString);
            if (Array.isArray(parsedCoords) && parsedCoords.length === 2 && 
                typeof parsedCoords[0] === 'number' && typeof parsedCoords[1] === 'number') {
                listingSpecificCoordinates = parsedCoords; // Should be [latitude, longitude]
                viewCoordinates = listingSpecificCoordinates;
                // viewZoom = 15; // Optionally adjust zoom for specific listings
            }
        } catch (e) {
            console.error('Error parsing map coordinates from data attribute:', e);
        }
    }
}

const map = L.map('map').setView(viewCoordinates, viewZoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define a custom red marker icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

if (listingSpecificCoordinates) {
    L.marker(listingSpecificCoordinates, { icon: redIcon }).addTo(map)
        .bindPopup(`<h4>${listingTitle}</h4><p>Exact location provided after booking</p>`)
        .openPopup();
} else {
    // console.log('Displaying map with default coordinates as specific listing coordinates are not available or invalid.');
    // Optionally, add a marker for the default view if you want, perhaps with the default blue icon
    // L.marker(defaultCoordinates).addTo(map).bindPopup('Default Location');
}

// Map interactions: enable if specific listing, disable for default
if (mapElement) {
    if (listingSpecificCoordinates) {
        // If showing a specific listing, allow interaction
        mapElement.style.cursor = ''; // Reset cursor
        // Ensure interactions are enabled (they are by default unless previously disabled)
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();
    }
}

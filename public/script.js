const map = L.map('map', {
  center: [21.16481, -90.03910],
  zoom: 16,
  minZoom: 16,
  maxBounds: [
    [21.160, -90.045],
    [21.170, -90.030]
  ]
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Marker laden
fetch('/markers')
  .then(res => res.json())
  .then(markers => {
    markers.forEach(addMarkerToMap);
  });

function addMarkerToMap(marker) {
  const icon = marker.imageUrl
    ? L.icon({
        iconUrl: marker.imageUrl,
        iconSize: [50, 50],
        className: `round-icon ${marker.castrated ? 'castrated' : ''}`
      })
    : L.divIcon({
        className: `round-icon ${marker.castrated ? 'castrated' : ''}`,
        html: '🐶',
        iconSize: [30, 30]
      });

  L.marker([marker.lat, marker.lng], { icon }).addTo(map);
}

// Marker setzen
map.on('click', async function (e) {
  const upload = confirm("Möchtest du ein Bild an dieser Stelle hochladen?");
  let image = null;

  if (upload) {
    image = await selectImage();
    if (!image) return;
  }

  const castrated = confirm("Ist der Hund kastriert?");
  const formData = new FormData();
  formData.append('lat', e.latlng.lat);
  formData.append('lng', e.latlng.lng);
  formData.append('castrated', castrated);
  if (image) formData.append('image', image);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(() => location.reload());
});

function selectImage() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });
}
// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


const coords = listingData.coordinates;
if (!coords) {
  console.log("No coordinates found");
}


const airbnbIcon = L.icon({
    iconUrl: "/mapMarker/obenai.jpg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// GeoJSON format is [lng, lat]
// Leaflet needs [lat, lng]

const map = L.map('map').setView([coords[1], coords[0]], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

L.marker([coords[1], coords[0]])
    .addTo(map)
    .bindPopup(`<b>${listingData.title}</b>`)
    .openPopup();
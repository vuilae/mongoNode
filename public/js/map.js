// mapScript.js
let map;
let marker;

function initMap() {
  map = L.map("map").setView([0, 0], 2);

  // Use OpenStreetMap as the base map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Add a marker
  marker = L.marker([0, 0], { draggable: true }).addTo(map);

  // Add an event listener to get the selected location
  marker.on("dragend", function (event) {
    // Get the coordinates of the selected location
    const lat = marker.getLatLng().lat;
    const lng = marker.getLatLng().lng;

    // Set the city input value to an empty string to indicate that the city is not specified
    document.getElementById("city").value = "";

    console.log("lat", lat);
    console.log("lng", lng);
    // Set the hidden input fields with the selected coordinates
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
  });
}

// Function to toggle the visibility of input options based on the selected option
function selectInputType() {
  const inputType = document.getElementById("inputType").value;
  document.getElementById("cityInput").style.display =
    inputType === "city" ? "block" : "none";
  document.getElementById("mapInput").style.display =
    inputType === "map" ? "block" : "none";

  if (inputType === "map" && !map) {
    // Load Leaflet and initialize the map if it's not already loaded
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);
  }
}

// Load Leaflet and initialize the map after the page is loaded
window.onload = function () {
  selectInputType(); // Initial state
};

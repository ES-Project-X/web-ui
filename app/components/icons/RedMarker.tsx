import { icon } from "leaflet";

const RedMarker = icon({
  className: "red-marker-icon",
  iconUrl: "/red-marker.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default RedMarker;
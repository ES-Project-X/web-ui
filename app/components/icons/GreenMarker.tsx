import { icon } from "leaflet";

const GreenMarker = icon({
  className: "green-marker-icon",
  iconUrl: "/green-marker.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default GreenMarker;
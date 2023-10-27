import { BasicPOI } from "../structs/poi";
import L from "leaflet";
import "leaflet.markercluster";

const clusterGroup = L.markerClusterGroup();

export function updateClusterGroup(toAddMarkers: BasicPOI[], mapRef: any) {
    clusterGroup.clearLayers();
    toAddMarkers.forEach((marker) => {
        clusterGroup.addLayer(L.marker([marker.latitude, marker.longitude], { icon: marker.icon, title: marker.id }).bindPopup(marker.name));
    });
    mapRef.current.addLayer(clusterGroup);
}
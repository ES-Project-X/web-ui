import { BasicPOI } from "../structs/poi";
import L from "leaflet";
import "leaflet.markercluster";


const clusterGroup = L.markerClusterGroup();

export function updateClusterGroup(toAddMarkers: BasicPOI[], mapRef: any, fetchPOIDetails: Function) {
    clusterGroup.clearLayers();
    toAddMarkers.forEach((marker) => {
        const addMarker = L.marker([marker.latitude, marker.longitude], { icon: marker.icon })
        addMarker.on("click", fetchPOIDetails(marker.id));
        clusterGroup.addLayer(addMarker);
    });
    mapRef.current.addLayer(clusterGroup);
}



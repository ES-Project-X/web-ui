import { BasicPOI } from "../structs/poi";
import L from "leaflet";
import "leaflet.markercluster";
import { useMapEvents, Marker, Popup } from "react-leaflet";

export default function DisplayPOIs({
    markers,
    mapRef,
}: {
    markers: BasicPOI[]
    mapRef: React.MutableRefObject<L.Map | null>
}) {

    const clusterGroup = L.markerClusterGroup();

    let max_lat: number | null = null;
    let min_lat: number | null = null;
    let max_lng: number | null = null;
    let min_lng: number | null = null;

    useMapEvents({
        moveend: (e) => {

            const bounds = e.target.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            let change = false;

            if (max_lat === null || ne.lat > max_lat) {
                max_lat = ne.lat;
                change = true;
            }
            if (min_lat === null || sw.lat < min_lat) {
                min_lat = sw.lat;
                change = true;
            }
            if (max_lng === null || ne.lng > max_lng) {
                max_lng = ne.lng;
                change = true;
            }
            if (min_lng === null || sw.lng < min_lng) {
                min_lng = sw.lng;
                change = true;
            }

            if (change) {
                if (mapRef.current) {
                    markers.forEach((marker) => {
                        clusterGroup.addLayer(L.marker([marker.latitude, marker.longitude], { icon: marker.icon }).bindPopup(marker.name));
                    });

                    mapRef.current.addLayer(clusterGroup);
                }
            }
        }
    })

    return (
        null
    )
}
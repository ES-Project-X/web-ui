import { BasicPOI } from "../structs/poi";
import L from "leaflet";
import "leaflet.markercluster";
import { useMapEvents, Marker, Popup } from "react-leaflet";

export default function DisplayPOIs({
    markers,
    mapRef,
    fetchFunction,
}: {
    markers: BasicPOI[]
    mapRef: React.MutableRefObject<L.Map | null>
    fetchFunction: (clusters: number[]) => void
}) {

    const clusterGroup = L.markerClusterGroup();

    let max_lat: number | null = null;
    let min_lat: number | null = null;
    let max_lng: number | null = null;
    let min_lng: number | null = null;

    useMapEvents({
        moveend: (e) => {

            if (mapRef.current === null) {
                return (null);
            }

            const bounds = e.target.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            let search_clusters: any[] = [];

            if (max_lat === null || ne.lat > max_lat) {
                search_clusters.push([ne.lat, max_lat, max_lng, min_lng]);
                max_lat = ne.lat;
            }
            if (min_lat === null || sw.lat < min_lat) {
                search_clusters.push([min_lat, sw.lat, max_lng, min_lng]);
                min_lat = sw.lat;
            }
            if (max_lng === null || ne.lng > max_lng) {
                search_clusters.push([max_lat, min_lat, ne.lng, max_lng]);
                max_lng = ne.lng;
            }
            if (min_lng === null || sw.lng < min_lng) {
                search_clusters.push([max_lat, min_lat, max_lng, sw.lng]);
                min_lng = sw.lng;
            }

            if (search_clusters.length > 0) {

                fetchFunction(search_clusters);
                console.log(markers);

                markers.forEach((marker) => {
                    clusterGroup.addLayer(L.marker([marker.latitude, marker.longitude], { icon: marker.icon }).bindPopup(marker.name));
                });
                mapRef.current.addLayer(clusterGroup);
            }
        }
    });

    return (
        null
    )
}
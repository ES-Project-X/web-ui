
import { useMapEvents } from "react-leaflet";
import { useState } from "react";

export default function GetClusters({
    fetchFunction,
}: {
    fetchFunction: (clusters: number[][]) => void

}) {
    const [max_lat, setMaxLat] = useState<number | null>(null);
    const [min_lat, setMinLat] = useState<number | null>(null);
    const [max_lng, setMaxLng] = useState<number | null>(null);
    const [min_lng, setMinLng] = useState<number | null>(null);

    useMapEvents({
        moveend: (e) => {
            const bounds = e.target.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            let search_clusters: any[] = [];

            if (max_lat === null || min_lat === null || max_lng === null || min_lng === null) {
                search_clusters.push([ne.lat, sw.lat, ne.lng, sw.lng]);
                setMaxLat(ne.lat);
                setMinLat(sw.lat);
                setMaxLng(ne.lng);
                setMinLng(sw.lng);
            }
            else {
                console.log("max_lat: " + max_lat + " min_lat: " + min_lat + " max_lng: " + max_lng + " min_lng: " + min_lng);
                if (ne.lat > max_lat) {
                    search_clusters.push([ne.lat, max_lat, max_lng, min_lng]);
                    setMaxLat(ne.lat);
                }
                if (sw.lat < min_lat) {
                    search_clusters.push([min_lat, sw.lat, max_lng, min_lng]);
                    setMinLat(sw.lat);
                }
                if (ne.lng > max_lng) {
                    search_clusters.push([max_lat, min_lat, ne.lng, max_lng]);
                    setMaxLng(ne.lng);
                }
                if (sw.lng < min_lng) {
                    search_clusters.push([max_lat, min_lat, min_lng, sw.lng]);
                    setMinLng(sw.lng);
                }
            }
            if (search_clusters.length > 0){
                fetchFunction(search_clusters);
            }
        }
    });

    return null;
}
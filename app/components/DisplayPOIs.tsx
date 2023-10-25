import { useEffect } from "react";
import { BasicPOI } from "../structs/poi";
import L, { LatLng } from "leaflet";
import "leaflet.markercluster";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import RedMarker from "./icons/RedMarker";
import {
    BicycleParkingMarker,
    BicycleShopMarker,
    DrinkingWaterMarker,
    ToiletsMarker,
    BenchMarker
} from "./icons/TypeMarkers";

export default function DisplayPOIs({
    markers,
    mapRef,
}: {
    markers: BasicPOI[]
    mapRef: React.MutableRefObject<L.Map | null>
}) {

    let max_lat: number | null = null;
    let min_lat: number | null = null;
    let max_lng: number | null = null;
    let min_lng: number | null = null;

    const getIcon = (poiType: string) => {
        switch (poiType) {
            case "bicycle-parking":
                return BicycleParkingMarker;
            case "bicycle-shop":
                return BicycleShopMarker;
            case "drinking-water":
                return DrinkingWaterMarker;
            case "toilets":
                return ToiletsMarker;
            case "bench":
                return BenchMarker;
            default:
                return RedMarker;
        }
    }
/*
    useMapEvents({
        moveend: (e) => {

            const bounds = e.target.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            if (max_lat === null || ne.lat > max_lat) {
                max_lat = ne.lat;
            }
            if (min_lat === null || sw.lat < min_lat) {
                min_lat = sw.lat;
            }
            if (max_lng === null || ne.lng > max_lng) {
                max_lng = ne.lng;
            }
            if (min_lng === null || sw.lng < min_lng) {
                min_lng = sw.lng;
            }
            console.log("max_lat: " + max_lat + " min_lat: " + min_lat + " max_lng: " + max_lng + " min_lng: " + min_lng);
        }
    })

    useEffect(() => {
        if (mapRef.current) {
            const clusterGroup = L.markerClusterGroup();
            
            markers.forEach((marker) => {
                clusterGroup.addLayer(L.marker([marker.latitude, marker.longitude], {icon: marker.icon}));
            });

            mapRef.current.addLayer(clusterGroup);
        }
    }, [markers]);
*/
    return (
        <>
            {markers.map((marker) => (
                <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={getIcon(marker.type)}>
                    <Popup>
                        {marker.name}
                    </Popup>
                </Marker>
            ))}
        </>
    )
}
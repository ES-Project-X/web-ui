
import { useMapEvents } from "react-leaflet";
import { useState } from "react";
import { URL_API } from "./constants";
import { BasicPOI } from "../structs/poi";
import RedMarker from "./markers/RedMarker";
import {
    BicycleParkingMarker,
    BicycleShopMarker,
    DrinkingWaterMarker,
    ToiletsMarker,
    BenchMarker,
} from "./markers/TypeMarkers";
import { LeafletEvent } from "leaflet";

export default function GetClusters({
    markers,
    setMarkers,
    filterPOIs,
}: {
    markers: BasicPOI[],
    setMarkers: (markers: BasicPOI[]) => void,
    filterPOIs: () => void,

}) {
    const [max_lat, setMaxLat] = useState<number | null>(null);
    const [min_lat, setMinLat] = useState<number | null>(null);
    const [max_lng, setMaxLng] = useState<number | null>(null);
    const [min_lng, setMinLng] = useState<number | null>(null);

    function getIcon(poiType: string) {
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
    };

    function updateMarkers(data: any) {
        const pois: BasicPOI[] = data.map((poi: any) => {
            return {
                id: poi.id,
                name: poi.name,
                type: poi.type,
                latitude: poi.latitude,
                longitude: poi.longitude,
                icon: getIcon(poi.type),
            };
        });
        if (pois.length > 0) {
            let new_pois = markers;
            pois.forEach((poi: BasicPOI) => {
                new_pois.push(poi);
            });
            setMarkers(new_pois);
            filterPOIs();
        }
    };

    function fetchPOIs(clusters: number[][]) {
        const url = new URL(URL_API + "poi/cluster");
        clusters.forEach((cluster: number[]) => {
            url.searchParams.append("max_lat", cluster[0].toString());
            url.searchParams.append("min_lat", cluster[1].toString());
            url.searchParams.append("max_lng", cluster[2].toString());
            url.searchParams.append("min_lng", cluster[3].toString());
        });

        fetch(url.toString())
            .then((response) => response.json())
            .then((data) => updateMarkers(data))
            .catch((error) => console.log(error));
    };

    function getClusters(e: LeafletEvent) {
        const bounds = e.target.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        let search_clusters: any[] = [];

        const lat_diff = Math.abs(Math.abs(ne.lat) - Math.abs(sw.lat));
        const lng_diff = Math.abs(Math.abs(ne.lng) - Math.abs(sw.lng));

        const new_max_lat = ne.lat + lat_diff;
        const new_min_lat = sw.lat - lat_diff;
        const new_max_lng = ne.lng + lng_diff;
        const new_min_lng = sw.lng - lng_diff;

        let n_max_lat = max_lat;
        let n_min_lat = min_lat;
        let n_max_lng = max_lng;
        let n_min_lng = min_lng;

        if (max_lat === null || min_lat === null || max_lng === null || min_lng === null) {
            n_max_lat = new_max_lat;
            n_min_lat = new_min_lat;
            n_max_lng = new_max_lng;
            n_min_lng = new_min_lng;
            search_clusters.push([new_max_lat, new_min_lat, new_max_lng, new_min_lng]);
        }
        else {
            if (new_max_lat > max_lat) {
                search_clusters.push([new_max_lat, n_max_lat, n_max_lng, n_min_lng]);
                n_max_lat = new_max_lat;
            }
            if (new_min_lat < min_lat) {
                search_clusters.push([n_min_lat, new_min_lat, n_max_lng, n_min_lng]);
                n_min_lat = new_min_lat;
            }
            if (new_max_lng > max_lng) {
                search_clusters.push([n_max_lat, n_min_lat, new_max_lng, n_max_lng]);
                n_max_lng = new_max_lng;
            }
            if (new_min_lng < min_lng) {
                search_clusters.push([n_max_lat, n_min_lat, n_min_lng, new_min_lng]);
                n_min_lng = new_min_lng;
            }
        }
        if (search_clusters.length > 0) {
            fetchPOIs(search_clusters);
        }
        setMaxLat(n_max_lat);
        setMinLat(n_min_lat);
        setMaxLng(n_max_lng);
        setMinLng(n_min_lng);
    }

    useMapEvents({
        moveend: (e) => {
            getClusters(e);
        }
    });

    return null;
}
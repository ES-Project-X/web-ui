import { LatLng } from "leaflet";
import { POI } from "../structs/poi";

function haversineDistance(coord1: { latitude: number, longitude: number }, coord2: { latitude: number, longitude: number }) {
    const R = 6371;  // Raio médio da Terra em quilômetros
    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c * 1000;  // Convertendo para metros
    return distance;
}

function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

export const getDistanceFrom = ({
    currentLocation,
    point,
}: {
    currentLocation: {
        latitude: number;
        longitude: number;
    } | POI;
    point: {
        latitude: number;
        longitude: number;
    } | POI;
}) => {
    const distance = haversineDistance(currentLocation, {
        latitude: point.latitude,
        longitude: point.longitude,
    });
    return distance;
};

export function stringToLatLng(str: string) {
    let latlng = str.split(",");
    return new LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
}
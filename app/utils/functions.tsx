import { LatLng } from "leaflet";
import { POI } from "../structs/poi";

function haversineDistance(coord1: { lat: number, lon: number }, coord2: { lat: number, lon: number }) {
    const R = 6371;  // Raio médio da Terra em quilômetros
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lon - coord1.lon);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
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
        lat: number;
        lon: number;
    };
    point: {
        latitude: number;
        longitude: number;
    } | POI;
}) => {
    const distance = haversineDistance(currentLocation, {
        lat: point.latitude,
        lon: point.longitude,
    });
    return distance;
};

export function stringToLatLng(str: string) {
    let latlng = str.split(",");
    return new LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        //@ts-ignore
        resolve(reader.result.split(",")[1]); // Extract the base64 part
        // get the image type
        //@ts-ignore
        setImageType(reader.result.split(",")[0].split(":")[1].split(";")[0]);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };
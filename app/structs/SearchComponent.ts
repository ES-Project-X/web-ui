import { LatLng } from "leaflet";

export class Coordinate {
    private lat: number;
    private lng: number;
    private null: boolean = true;

    constructor(lat: number = 0, lng: number = 0) {
        this.lat = lat;
        this.lng = lng;
        if (lat !== 0 && lng !== 0) {
            this.null = false;
        }
    }

    toString() {
        return this.lat + ',' + this.lng;
    }

    toLatLng() {
        return new LatLng(this.lat, this.lng);
    }

    isNull() {
        return this.null;
    }

    getLat() {
        return this.lat;
    }

    getLng() {
        return this.lng;
    }

    setLat(lat: number) {
        this.lat = lat;
        if (lat !== 0 && this.lng !== 0) {
            this.null = false;
        }
    }

    setLng(lng: number) {
        this.lng = lng;
        if (this.lat !== 0 && lng !== 0) {
            this.null = false;
        }
    }

}

export class SearchPoint {
    private name: string;
    private coordinate: Coordinate;

    constructor(name: string = "", coordinate: Coordinate = new Coordinate()) {
        this.name = name;
        this.coordinate = coordinate;
    }

    toString() {
        return this.name + ' (' + this.coordinate.toString() + ')';
    }

    isNull() {
        return this.name === "" && this.coordinate.isNull();
    }

    isCoordinateNull() {
        return this.coordinate.isNull();
    }

    isNameNull() {
        return this.name === "";
    }

    setStringCoordinate(coordinate: string) {
        let splitted = coordinate.split(',');
        this.coordinate.setLat(parseFloat(splitted[0]));
        this.coordinate.setLng(parseFloat(splitted[1]));
    }

    setName(name: string) {
        this.name = name;
    }

    setLatLng(latLng: LatLng) {
        this.coordinate.setLat(latLng.lat);
        this.coordinate.setLng(latLng.lng);
    }

    getName() {
        return this.name;
    }

    getLat() {
        return this.coordinate.getLat();
    }

    getLng() {
        return this.coordinate.getLng();
    }

    getCoordinate() {
        return this.coordinate;
    }

    getStringCoordinates() {
        return this.coordinate.toString();
    }

    getLatLng() {
        return this.coordinate.toLatLng();
    }

    resetCoordinate() {
        this.coordinate = new Coordinate();
    }
}

export function copySearchPoint(searchPoint: SearchPoint) {
    return new SearchPoint(searchPoint.getName(), searchPoint.getCoordinate());
}
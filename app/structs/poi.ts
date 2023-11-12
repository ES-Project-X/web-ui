import { Icon } from "leaflet";

export interface POI {
    id: string,
    name: string,
    description: string,
    type: string,
    picture_url: string,
    rating_positive: number,
    rating_negative: number,
}

export interface BasicPOI {
    id: string,
    name: string,
    type: string,
    latitude: number,
    longitude: number,
    icon: Icon,
}

export interface FilterType {
    label: string,
    value: string,
    selected: boolean,
}
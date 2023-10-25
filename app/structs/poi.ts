import { Icon } from "leaflet";

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
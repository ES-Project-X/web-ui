export interface BasicPOI {
    id: string,
    name: string,
    type: string,
    latitude: number,
    longitude: number,
}

export interface FilterType {
    label: string,
    value: string,
    selected: boolean,
}
"use client"

import {MapContainer, TileLayer} from "react-leaflet"
import {LatLng} from "leaflet"
import "leaflet/dist/leaflet.css"

export default function MapComponent() {
    const center = new LatLng(40.64427, -8.64554);

    return (
        <MapContainer
            style={{height: "100%", width: "100%"}}
            center={center} zoom={13} scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            />
        </MapContainer>
    )
}
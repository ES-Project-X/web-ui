import { Marker, Popup, useMapEvents } from "react-leaflet";
import RedMarker from "./icons/RedMarker";
import GreenMarker from "./icons/GreenMarker";
import { LatLng } from "leaflet";
import { useState } from "react";

export default function MarkersManager({
    setOrigin,
    setDestination,
    creatingRoute,
}: {
    setOrigin: (origin: string) => void
    setDestination: (destination: string) => void
    creatingRoute: boolean
}) {

    const [redPosition, setRedPosition] = useState<LatLng | null>(null)
    const [greenPosition, setGreenPosition] = useState<LatLng | null>(null)

    useMapEvents({
        click: (e) => {
            if (creatingRoute) {
                if (greenPosition === null) {
                    setGreenPosition(e.latlng)
                    setOrigin(e.latlng.lat + "," + e.latlng.lng)
                } else {
                    setRedPosition(e.latlng)
                    setDestination(e.latlng.lat + "," + e.latlng.lng)
                }
            }
            else {
                setRedPosition(e.latlng)
            }
        }
    })


    if (creatingRoute) {
        const redMarker = redPosition && <Marker position={redPosition} icon={RedMarker} interactive={true} eventHandlers={{ click: () => setRedPosition(null) }}></Marker>
        const greenMarker = greenPosition && <Marker position={greenPosition} icon={GreenMarker} interactive={true} eventHandlers={{ click: () => setGreenPosition(null) }}></Marker>

        return (
            <>
                {greenMarker}
                {redMarker}
            </>
        )
    }
    else if (redPosition) {
        return (
            <Marker position={redPosition} icon={RedMarker}>
                <Popup>
                    You are at {redPosition.lat.toFixed(4)}, {redPosition.lng.toFixed(4)}
                </Popup>
            </Marker>
        )
    }
    return null;
}
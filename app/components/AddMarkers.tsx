import { useMapEvents } from "react-leaflet";
import RedMarker from "./icons/RedMarker";
import GreenMarker from "./icons/GreenMarker";
import { Marker, Popup } from "react-leaflet";
import { LatLng } from "leaflet";
import { useState } from "react";

export default function AddMarkers({ creatingRoute = false }: { creatingRoute?: boolean }) {

    const [redPosition, setRedPosition] = useState<LatLng | null>(null)
    const [greenPosition, setGreenPosition] = useState<LatLng | null>(null)

    const map = useMapEvents({
        click: (e) => {
            if (creatingRoute) {
                if (greenPosition === null) {
                    setGreenPosition(e.latlng)
                } else {
                    setRedPosition(e.latlng)
                }
            }
            else {
                setRedPosition(e.latlng)
            }
        }
    })

    if (creatingRoute) {
        if (greenPosition !== null && redPosition !== null) {
            return (
                <>
                    <Marker position={greenPosition} icon={GreenMarker} interactive={true} eventHandlers={{ click: () => setGreenPosition(null) }}>
                    </Marker>
                    <Marker position={redPosition} icon={RedMarker} interactive={true} eventHandlers={{ click: () => setRedPosition(null) }}>
                    </Marker>
                </>
            )
        }
        else if (greenPosition !== null) {
            return (
                <Marker position={greenPosition} icon={GreenMarker} interactive={true} eventHandlers={{ click: () => setGreenPosition(null) }}>
                </Marker>
            )
        }
        else if (redPosition !== null) {
            return (
                <Marker position={redPosition} icon={RedMarker} interactive={true} eventHandlers={{ click: () => setRedPosition(null) }}>
                </Marker>
            )
        }
        return null
    }
    return redPosition === null ? null : (
        <Marker position={redPosition} icon={RedMarker}>
            <Popup>
                You are at {redPosition.lat.toFixed(4)}, {redPosition.lng.toFixed(4)}
            </Popup>
        </Marker>
    )
}
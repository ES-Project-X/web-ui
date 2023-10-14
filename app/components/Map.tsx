"use client"

import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet"
import {LatLng} from "leaflet";
import {Button, ButtonGroup} from "react-bootstrap";
import {useRef, useState} from "react";
import "leaflet/dist/leaflet.css"
import "leaflet-rotate"
import "leaflet/dist/images/marker-shadow.png";
import RedMarker from "./icons/RedMarker";
import { useMapEvents } from "react-leaflet";

export default function MapComponent({tileLayerURL}: { tileLayerURL?: string}) {
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);

    const [position, setPosition] = useState<LatLng | null>(null);

    function AddMarkerToClick() {
        const map = useMapEvents({
            click: (e) => {
                console.log(e.latlng)
                setPosition(e.latlng)
            }
        })

        return position === null ? null : (
            <Marker position={position} icon={RedMarker}>
                <Popup>
                    You are at {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </Popup>
            </Marker>
        )
    }

    const addToBearing = (amount: number) => {
        if (mapRef.current) {
            // @ts-ignore
            const nextBearing = mapRef.current.getBearing() + amount % 360;
            // @ts-ignore
            mapRef.current.setBearing(nextBearing);
        }
    }

    return (
        <>
            <MapContainer
                id={"map-container"} ref={mapRef}
                style={{zIndex: 0, height: "100%", width: "100%"}}
                center={center} zoom={13} scrollWheelZoom={true}
                rotate={true} bearing={0}
                // @ts-ignore
                rotateControl={{closeOnZeroBearing: false}} touchRotate={true}
            >
                {tileLayerURL !== undefined ? <TileLayer url={tileLayerURL}/> : null}
                <AddMarkerToClick/>
            </MapContainer>
            <ButtonGroup style={{zIndex: 1, bottom: "3em", left: ".5em"}}>
                <Button id={"map-rotate-left-btn"}
                        variant={"light"} style={{border: ".1em solid black"}}
                        onClick={() => addToBearing(-10)}>
                    Rotate Left
                </Button>
                <Button id={"map-rotate-right-btn"}
                        variant={"light"} style={{border: ".1em solid black"}}
                        onClick={() => addToBearing(10)}>
                    Rotate Right
                </Button>
            </ButtonGroup>
        </>
    )
}
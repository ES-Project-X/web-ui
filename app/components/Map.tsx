"use client"

import {MapContainer, TileLayer} from "react-leaflet"
import {LatLng} from "leaflet";
import {Button, ButtonGroup} from "react-bootstrap";
import {useRef} from "react";
import "leaflet/dist/leaflet.css"
import "leaflet-rotate"

export default function MapComponent() {
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);

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
                data-testid={"map-container"} ref={mapRef}
                style={{zIndex: 0, height: "100%", width: "100%"}}
                center={center} zoom={13} scrollWheelZoom={true}
                rotate={true} bearing={0}
                // @ts-ignore
                rotateControl={{closeOnZeroBearing: false}} touchRotate={true}
            >
                <TileLayer
                    url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
                />
            </MapContainer>
            <ButtonGroup style={{zIndex: 1, bottom: "3em", left: ".5em"}}>
                <Button data-testid={"map-rotate-left-btn"} variant={"light"} style={{border: ".1em solid black"}}
                        onClick={() => addToBearing(-10)}>
                    Rotate Left
                </Button>
                <Button data-testid={"map-rotate-right-btn"} variant={"light"} style={{border: ".1em solid black"}}
                        onClick={() => addToBearing(10)}>
                    Rotate Right
                </Button>
            </ButtonGroup>
        </>
    )
}
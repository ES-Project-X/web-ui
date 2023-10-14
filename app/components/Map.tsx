"use client"

import "leaflet/dist/leaflet.css"

import {MapContainer, TileLayer} from "react-leaflet"
import {LatLng} from "leaflet";
import LocateControl from "./LocateControl";
import {Button, ButtonGroup, Card, Col, Container, Row} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import "leaflet-rotate"


export default function MapComponent({tileLayerURL}: { tileLayerURL?: string }) {
    const mapRef = useRef(null);
    const [userPosition, setUserPosition] = useState({latitude: undefined, longitude: undefined});
    const center = new LatLng(40.64427, -8.64554);

    useEffect(() => {
        navigator.geolocation.watchPosition((location) => {
            const {latitude, longitude} = location.coords;
            setUserPosition({latitude, longitude})
        });
    }, [])

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
                <LocateControl/>
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
            <Card className={"text-center"}
                  style={{zIndex: 1, bottom: "100%", left: "25%", width: "50%"}}>
                <Card.Body>
                    <Card.Title>User Position</Card.Title>
                    <Card.Text id={"map-user-position"}>
                        {userPosition.latitude !== undefined && userPosition.longitude !== undefined
                            ? `Latitude: ${userPosition.latitude} | Longitude: ${userPosition.longitude}`
                            : "Please enable location to see your current location"
                        }
                    </Card.Text>
                </Card.Body>
            </Card>
        </>
    )
}
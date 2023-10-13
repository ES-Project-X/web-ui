"use client"

import {MapContainer, TileLayer} from "react-leaflet"
import {LatLng} from "leaflet";
import {Button, ButtonGroup, Form} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import "leaflet/dist/leaflet.css"
import "leaflet-rotate"
import SearchBar from "@/app/map/SearchBar";

export default function MapComponent({tileLayerURL}: { tileLayerURL?: string }){
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);
    const API_KEY = process.env.PUBLIC_KEY_HERE;
    const URL_GEO = "https://geocode.search.hereapi.com/v1/geocoding?apiKey=" + API_KEY + "&in=countryCode:PRT";
    const URL_REV = "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;
    const [data, setData] = useState(null);


    const addToBearing = (amount: number) => {
        if (mapRef.current) {
            // @ts-ignore
            const nextBearing = mapRef.current.getBearing() + amount % 360;
            // @ts-ignore
            mapRef.current.setBearing(nextBearing);
        }
    }

    const getGeoLocation = (query: string) => {
        useEffect(() => {
            fetch(query)
                .then(response => response.json())
                .then(data => {
                    setData(data);
                    console.log(data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }, []);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = (event.target as HTMLInputElement).value;
            if (query.match(/-?[0-9]{1,3}[.][0-9]+,-?[0-9]{1,3}[.][0-9]+/)) {
                console.log("Coordinates");
                getGeoLocation(URL_REV + "&at=" + query);
            } else {
                console.log("Address");
                getGeoLocation(URL_GEO + "&q=" + query);
            }
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
            </MapContainer>
            <Form style={{zIndex: 1, top: "3em", right: "50em", position: "absolute"}}>
                <Form.Group controlId={"search-bar"}>
                    <Form.Control type={"text"} placeholder={"Search"} onKeyDown={handleKeyDown}/>
                </Form.Group>
            </Form>
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
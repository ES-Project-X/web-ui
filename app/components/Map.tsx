"use client"

import "leaflet/dist/leaflet.css"

import {useEffect, useRef, useState} from "react";
import {Button, ButtonGroup, Form, Card, Row, CloseButton, Container, Col} from "react-bootstrap";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet"
import {LatLng} from "leaflet";
import "leaflet-rotate"

import LocateControl from "./LocateControl";
import MarkersManager from "./MarkersManager";
import FilterBoardComponent from "./FilterBoard";
import {BasicPOI} from "../structs/poi";
import RedMarker from "@/app/components/icons/RedMarker";


export default function MapComponent({tileLayerURL}: { tileLayerURL?: string }) {
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);

    const [userPosition, setUserPosition] = useState<{ [key: string]: undefined | number }>({
        latitude: undefined,
        longitude: undefined
    });
    const [creatingRoute, setCreatingRoute] = useState(false);

    const [types, setTypes] = useState([
        {label: "Bicycle Parking", value: "bicycle_parking", selected: true},
        {label: "Bicycle Shop", value: "bicycle_shop", selected: true},
        {label: "Drinking Water", value: "drinking_water", selected: true},
        {label: "Toilets", value: "toilets", selected: true},
        {label: "Bench", value: "bench", selected: true}
    ]);

    const [basicPOIs, setBasicPOIs] = useState<BasicPOI[]>([
        {id: 0, name: "UA Psycology Department Bicycle Parking", type: "bicycle_parking", latitude: 40.63195, longitude: -8.65799},
        {id: 1, name: "UA Environmental Department Bicycle Parking", type: "bicycle_parking", latitude: 40.63265, longitude: -8.65881},
        {id: 2, name: "UA Catacumbas Bathroom", type: "bathroom", latitude: 40.63071, longitude: -8.65875}
    ])

    const API_KEY = process.env.PUBLIC_KEY_HERE;
    const URL_API = "http://127.0.0.1:8000/"; // TODO: put in .env
    const URL_GEO = "https://geocode.search.hereapi.com/v1/geocode?apiKey=" + API_KEY + "&in=countryCode:PRT";
    const URL_REV = "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;

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

    const updateTypes = (types: {label: string, value: string, selected: boolean}[]) => {
        setTypes(types)
        fetchPOIs()
    }

    const fetchPOIs = () => {
        const typesFetch = types
            .filter(type => type.selected)
            .map(type => type.value)

        const url = new URL(URL_API + "poi");
        typesFetch.forEach(type => url.searchParams.append("type", type))

        fetch(url)
            .then(response => response.json())
            .then(data => {
                setBasicPOIs(data)
            })
    }

    const getGeoLocation = (query: string) => {
        fetch(query)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.items.length === 0) {
                    window.alert("No results");
                    return;
                }
                const lat = data.items[0].position.lat;
                // @ts-ignore
                document.getElementById("lat-text").innerHTML = "Latitude: " + lat;
                const lng = data.items[0].position.lng;
                // @ts-ignore
                document.getElementById("lng-txt").innerHTML = "Longitude: " + lng;
                const address = data.items[0].address.label;
                // @ts-ignore
                document.getElementById("location-text").innerHTML = address;
                // @ts-ignore
                document.getElementById("card-info").style.display = "block";
                // @ts-ignore
                mapRef.current.flyTo(new LatLng(lat, lng), 15);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = (event.target as HTMLInputElement).value;
            if (query.match(/-?[0-9]{1,3}[.][0-9]+,-?[0-9]{1,3}[.][0-9]+/)) {
                getGeoLocation(URL_REV + "&at=" + query);
            } else {
                getGeoLocation(URL_GEO + "&q=" + query);
            }
        }
    }

    const hidecard = () => {
        // @ts-ignore
        document.getElementById("card-info").style.display = "none";
    }

    return (
        <>
            <MapContainer
                id={"map-container"} ref={mapRef}
                className={"map"}
                center={center} zoom={13} scrollWheelZoom={true}
                rotate={true} bearing={0}
                // @ts-ignore
                rotateControl={{closeOnZeroBearing: false}} touchRotate={true}
            >
                {tileLayerURL !== undefined ? <TileLayer url={tileLayerURL}/> : null}
                <LocateControl/>
                <MarkersManager creatingRoute={!creatingRoute}/>
                {/*
                    DISPLAY POIs
                */}
                {basicPOIs.map(poi => {
                    return (
                        <Marker
                            key={poi.id}
                            icon={RedMarker} // TODO: change icon based on type
                            position={new LatLng(poi.latitude, poi.longitude)}
                        >
                            <Popup>
                                {poi.name} <br/> {poi.type}
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
            <Container className={"map-ui d-flex flex-column h-100"} fluid>
                {/*
                    POPUP CARD
                */}
                <Card id={"card-info"} style={{position: "absolute", top: "10em", left: "50%", display: "none"}}>
                    <Card.Header>
                        <CloseButton id={"card-btn"} onClick={hidecard}/>
                    </Card.Header>
                    <Card.Body>
                        <Row id={"location-text"}></Row>
                        <Row id={"lat-text"}></Row>
                        <Row id={"lng-txt"}></Row>
                    </Card.Body>
                </Card>
                {/*
                    UPPER PART OF THE UI
                */}
                <Row className={"pt-2"}>
                    <Col xs={"auto"} className={"mx-auto"}>
                        <Form>
                            <Form.Group controlId={"search-bar"}>
                                <Form.Control type={"text"} placeholder={"Search"} onKeyDown={handleKeyDown}/>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                {/*
                    MIDDLE PART OF THE UI
                */}
                <Row className={"flex-grow-1"}>
                    <Col xs={"auto"} className={"flex-grow-1"}>

                    </Col>
                    <Col xs={"auto"} className={"d-flex align-items-center"}>
                        <Card id={"filter-board"}>
                            <Card.Body>
                                <FilterBoardComponent
                                    types={types}
                                    updateTypes={updateTypes}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                {/*
                    LOWER PART OF THE UI
                */}
                <Row className={"pb-2"}>
                    <Col xs={2} className={"d-flex align-items-end"}>
                        <ButtonGroup>
                            <Button id={"map-rotate-left-btn"} variant={"light"}
                                    onClick={() => addToBearing(-10)}>
                                Rotate Left
                            </Button>
                            <Button id={"map-rotate-right-btn"} variant={"light"}
                                    onClick={() => addToBearing(10)}>
                                Rotate Right
                            </Button>
                        </ButtonGroup>
                    </Col>
                    <Col xs={"auto"} className={"mx-auto"}>
                        <Card className={"text-center"}>
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
                    </Col>
                    <Col xs={2}>

                    </Col>
                </Row>
            </Container>
        </>
    )
}
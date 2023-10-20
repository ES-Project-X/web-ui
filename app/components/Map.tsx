"use client"

import "leaflet/dist/leaflet.css"

import {useEffect, useRef, useState} from "react";
import {Button, ButtonGroup, Form, Card, Row, CloseButton} from "react-bootstrap";
import {MapContainer, TileLayer} from "react-leaflet"
import {LatLng} from "leaflet";
import "leaflet-rotate"

import LocateControl from "./LocateControl";
import MarkersManager from "./MarkersManager";

export default function MapComponent({tileLayerURL}: { tileLayerURL?: string }) {
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);

    const [userPosition, setUserPosition] = useState<{ [key: string]: undefined | number }>({latitude: undefined, longitude: undefined});
    const [creatingRoute, setCreatingRoute] = useState(false);
    const [origin, setOrigin] = useState<string>(null);
    const [destination, setDestination] = useState<string>(null);
    const [odmap, setodmap] = useState(false);

    const API_KEY = process.env.PUBLIC_KEY_HERE;
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

    const getGeoLocation = (query: string) => {
        fetch(query)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.items.length === 0) {
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
                mapRef.current.setView(new LatLng(lat, lng), 15);
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

    const createRoute = () => {
        var card = document.getElementById("card-ori-dest")
        if (!(card) || card.style.display === "none") {
            if ("style" in card) {
                card.style.display = "block";
            }
        }
        else {
            card.style.display = "none";
        }
    }

    const getFromMap = () => {
        if(odmap) {
            console.log("odmap")
            setodmap(false)
            setCreatingRoute(false)
            setOrigin(null)
            setDestination(null)
            // @ts-ignore
            document.getElementById("origin-input").value = "";
            // @ts-ignore
            document.getElementById("origin-input").style.readonly = false;
            // @ts-ignore
            document.getElementById("destination-input").value = "";
            // @ts-ignore
            document.getElementById("destination-input").style.readonly = false;
        } else {
            console.log("not odmap")
            setodmap(true)
            setCreatingRoute(true)
            setOrigin(null)
            setDestination(null)
            // @ts-ignore
            document.getElementById("origin-input").value = "";
            // @ts-ignore
            document.getElementById("origin-input").style.readonly = true;
            // @ts-ignore
            document.getElementById("destination-input").value = "";
            // @ts-ignore
            document.getElementById("destination-input").style.readonly = true;
        }
    }

    const hidecard = () => {
        // @ts-ignore
        document.getElementById("card-info").style.display = "none";
    }

    const updateOrigin = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin(event.target.value);
    }

    const updateDestination = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDestination(event.target.value);
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
                <MarkersManager setOrigin={setOrigin} setDestination={setDestination} creatingRoute={creatingRoute} />
            </MapContainer>
            <Button id={"ori-dst-btn"} onClick={createRoute} variant={"light"} style={{zIndex: 1, scale:"100%", bottom: "6%", left: "0.5em", position: "absolute", border: ".1em solid black"}}>Route</Button>
            <Card id={"card-ori-dest"} style={{zIndex: 1, top: "1%", left: "5%", width:"15%", position: "absolute", display: "none"}}>
                    <Card.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Origin</Form.Label>
                                <Form.Control id={"origin-input"} type={"text"} placeholder={"Origin"} onChange={updateOrigin} value={origin} readOnly={false}/>
                            </Form.Group>
                            <br/>
                            <Form.Group>
                                <Form.Label>Destination</Form.Label>
                                <Form.Control id={"destination-input"} type={"text"} placeholder={"Destination"} onChange={updateDestination} value={destination} readOnly={false}/>
                            </Form.Group>
                            <br/>
                            <Form.Group className="mb-3" >
                                <Form.Check id="mapcbox" type="checkbox" onChange={getFromMap} label="Select in Map" />
                            </Form.Group>
                            <Form.Group>
                                <Button id={"get-route-btn"} variant={"light"} style={{border: ".1em solid black"}}>Get Route</Button>
                            </Form.Group>
                        </Form>
                    </Card.Body>
            </Card>
            <Form id={"searchbar"} style={{zIndex: 1, top: "5%", left: "42.5%", width:"15%", position: "absolute"}}>
                <Form.Group controlId={"search-bar"}>
                    <Form.Control type={"text"} placeholder={"Search"} onKeyDown={handleKeyDown}/>
                </Form.Group>
            </Form>
            <Card id={"card-info"} style={{zIndex: 1, bottom: "3em", right: "20em", position: "absolute", display: "none"}}>
                <Card.Header><CloseButton id={"card-btn"} onClick={hidecard}/></Card.Header>
                <Card.Body><Row id={"location-text"}></Row><Row id={"lat-text"}></Row><Row id={"lng-txt"}></Row></Card.Body>
            </Card>
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
                  style={{zIndex: 1, bottom: "20%", left: "25%", width: "50%"}}>
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
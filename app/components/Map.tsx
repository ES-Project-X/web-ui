"use client"

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Form, Card, Row, CloseButton, Container, Col } from "react-bootstrap";
import { MapContainer, TileLayer } from "react-leaflet"
import { LatLng } from "leaflet";
import "leaflet-rotate"
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import LocateControl from "./LocateControl";
import MarkersManager from "./MarkersManager";
import FilterBoardComponent from "./FilterBoard";
import { BasicPOI, FilterType } from "../structs/poi";
import { updateClusterGroup } from "./DisplayPOIs";

import RedMarker from "./icons/RedMarker";
import { BicycleParkingMarker, BicycleShopMarker, DrinkingWaterMarker, ToiletsMarker, BenchMarker } from "./icons/TypeMarkers";
import FetchComponent from "./FetchComponent";
import POIsSidebar from "@/app/components/POIsSidebar";


export default function MapComponent({ tileLayerURL }: { tileLayerURL?: string }) {
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);

    const [userPosition, setUserPosition] = useState<{ [key: string]: undefined | number }>({
        latitude: undefined,
        longitude: undefined
    });
    const [creatingRoute, setCreatingRoute] = useState(false);
    const [origin, setOrigin] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [odmap, setodmap] = useState(false);

    const [markers, setMarkers] = useState<BasicPOI[]>([]);
    const [selectedPOI, setSelectedPOI] = useState(null) 

    const [filterName, setFilterName] = useState<string>("");
    const [filterTypes, setFilterTypes] = useState<FilterType[]>([
        { label: "Bicycle Parking", value: "bicycle-parking", selected: true },
        { label: "Bicycle Shop", value: "bicycle-shop", selected: true },
        { label: "Drinking Water", value: "drinking-water", selected: true },
        { label: "Toilets", value: "toilets", selected: true },
        { label: "Bench", value: "bench", selected: true }
    ]);

    const API_KEY = process.env.PUBLIC_KEY_HERE;
    const URL_API = "http://127.0.0.1:8000/"; // TODO: put in .env
    const URL_GEO = "https://geocode.search.hereapi.com/v1/geocode?apiKey=" + API_KEY + "&in=countryCode:PRT";
    const URL_REV = "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;

    useEffect(() => {
        navigator.geolocation.watchPosition((location) => {
            const { latitude, longitude } = location.coords;
            setUserPosition({ latitude, longitude })
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

    const getIcon = (poiType: string) => {
        switch (poiType) {
            case "bicycle-parking":
                return BicycleParkingMarker;
            case "bicycle-shop":
                return BicycleShopMarker;
            case "drinking-water":
                return DrinkingWaterMarker;
            case "toilets":
                return ToiletsMarker;
            case "bench":
                return BenchMarker;
            default:
                return RedMarker;
        }
    }

    const fetchPOIs = (clusters: number[][]) => {

        const url = new URL(URL_API + "pois");
        clusters.forEach((cluster: number[]) => {
            url.searchParams.append("max_lat", cluster[0].toString());
            url.searchParams.append("min_lat", cluster[1].toString());
            url.searchParams.append("max_lng", cluster[2].toString());
            url.searchParams.append("min_lng", cluster[3].toString());
        });

        fetch(url.toString())
            .then(response => response.json())
            .then(data => updateMarkers(data))
            .catch(() => { })
    }

    const fetchPOIDetails = (id:string) => {
        const url = new URL(URL_API + "poi/" + id);
        fetch(url.toString())
            .then(response => response.json())
            .then(data => setSelectedPOI(data))
            .catch(() => { })
    }



    const updateMarkers = (data: any) => {
        const pois: BasicPOI[] = data.map((poi: any) => {
            return {
                id: poi.id,
                name: poi.name,
                type: poi.type,
                latitude: poi.latitude,
                longitude: poi.longitude,
                icon: getIcon(poi.type)
            }
        })
        if (pois.length > 0) {
            let new_pois = markers;
            pois.forEach((poi: BasicPOI) => {
                new_pois.push(poi);
            })
            setMarkers(new_pois);
            filterPOIs();
        }
    }

    const filterPOIs = () => {
        const filteredMarkers = markers.filter((marker) => {
            return filterTypes.some((type) => {
                return type.selected && marker.type === type.value;
            })
        })
            .filter((marker) => {
                return marker.name.toLowerCase().includes(filterName.toLowerCase());
            });
        if (mapRef.current) {
            updateClusterGroup(filteredMarkers, mapRef);
        }
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

    const createRoute = () => {
        var card = document.getElementById("card-ori-dest")
        // @ts-ignore
        if (card.style.display === "none") {
            // @ts-ignore
            card.style.display = "block";
        }
        else {
            // @ts-ignore
            card.style.display = "none";
        }
    }

    const getFromMap = () => {
        if (odmap) {
            console.log("odmap")
            setodmap(false)
            setCreatingRoute(false)
            setOrigin("")
            setDestination("")
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
            setOrigin("")
            setDestination("")
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
                className={"map"}
                center={center} zoom={13} scrollWheelZoom={true}
                rotate={true} bearing={0}
                // @ts-ignore
                rotateControl={{ closeOnZeroBearing: false }} touchRotate={true}
            >
                {tileLayerURL !== undefined ? <TileLayer url={tileLayerURL} /> : null}
                <LocateControl />
                <MarkersManager setOrigin={setOrigin} setDestination={setDestination} creatingRoute={creatingRoute} />
                <FetchComponent fetchFunction={fetchPOIs} />
            </MapContainer>
            <Button id={"ori-dst-btn"} onClick={createRoute} variant={"light"} style={{ zIndex: 1, scale: "100%", bottom: "6%", left: "0.5em", position: "absolute", border: ".1em solid black" }}>Route</Button>
            <Card id={"card-ori-dest"} style={{ zIndex: 1, top: "1%", left: "5%", width: "15%", position: "absolute", display: "none" }}>
                <Card.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Origin</Form.Label>
                            <Form.Control id={"origin-input"} type={"text"} placeholder={"Origin"} onChange={updateOrigin} value={origin} readOnly={false} />
                        </Form.Group>
                        <br />
                        <Form.Group>
                            <Form.Label>Destination</Form.Label>
                            <Form.Control id={"destination-input"} type={"text"} placeholder={"Destination"} onChange={updateDestination} value={destination} readOnly={false} />
                        </Form.Group>
                        <br />
                        <Form.Group className="mb-3" >
                            <Form.Check id="mapcbox" type="checkbox" onChange={getFromMap} label="Select in Map" />
                        </Form.Group>
                        <Form.Group>
                            <Button id={"get-route-btn"} variant={"light"} style={{ border: ".1em solid black" }}>Get Route</Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
            <Container className={"map-ui d-flex flex-column h-100"} fluid>
                {/*
                    POPUP CARD
                */}
                <Card id={"card-info"} style={{ position: "absolute", top: "10em", left: "50%", display: "none" }}>
                    <Card.Header>
                        <CloseButton id={"card-btn"} onClick={hidecard} />
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
                                <Form.Control type={"text"} placeholder={"Search"} onKeyDown={handleKeyDown} />
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
                                    filterPOIs={filterPOIs} setFilterName={setFilterName} setFilterTypes={setFilterTypes} types={filterTypes} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={"auto"} className={"d-flex align-items-center"}>
                        <Card id={"poi-sidebar"}>
                            <Card.Body>
                                <POIsSidebar selectedPOI={selectedPOI} />
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
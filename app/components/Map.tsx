"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import {
    Button,
    ButtonGroup,
    Form,
    Card,
    Row,
    CloseButton,
    Container,
    Col,
} from "react-bootstrap";
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
} from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet-rotate";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import LocateControl from "./LocateControl";
import MarkersManager from "./MarkersManager";
import FilterBoardComponent from "./FilterBoard";
import { BasicPOI, FilterType } from "../structs/poi";
import { updateClusterGroup } from "./DisplayPOIs";

import RedMarker from "./icons/RedMarker";
import {
    BicycleParkingMarker,
    BicycleShopMarker,
    DrinkingWaterMarker,
    ToiletsMarker,
    BenchMarker,
} from "./icons/TypeMarkers";
import Sidebar from "./Sidebar";
import GetClusters from "./GetClusters";
import POIsSidebar from "./POIsSidebar";
import { Hash } from "crypto";
import { list } from "postcss";
import { Direction } from "../structs/direction";

const API_KEY = process.env.PUBLIC_KEY_HERE;
const URL_API = process.env.DATABASE_API_URL;
const URL_GEO = "https://geocode.search.hereapi.com/v1/geocode?apiKey=" + API_KEY + "&in=countryCode:PRT";
const URL_REV = "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;
const URL_ROUTING = process.env.URL_ROUTING;


export default function MapComponent({
    tileLayerURL,
}: {
    tileLayerURL?: string;
}) {
    const mapRef = useRef(null);
    const center = new LatLng(40.64427, -8.64554);

    const [userPosition, setUserPosition] = useState<{
        [key: string]: undefined | number;
    }>({
        latitude: undefined,
        longitude: undefined,
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

    const [points, setPoints] = useState<LatLng[][]>([]);

    const [gettingRoute, setGettingRoute] = useState(false);

    const d = [new Direction("test", 10, 10)];

    const [directions, setDirections] = useState<Direction[]>(d);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        navigator.geolocation.watchPosition((location) => {
            const { latitude, longitude } = location.coords;
            setUserPosition({ latitude, longitude });
        });
    }, []);

    useEffect(() => {
        if (gettingRoute) {
            getRoute();
        }
    }, [origin, destination]);

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
        const url = new URL(URL_API + "poi/cluster");
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

    const fetchPOIDetails = (id: string) => {
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
            updateClusterGroup(filteredMarkers, mapRef, fetchPOIDetails);
        }
    }

    const getGeoLocation = (query: string) => {
        fetch(query)
            .then((response) => response.json())
            .then((data) => {
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
                console.error("Error:", error);
            });
    };

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
    };

    const createRoute = () => {
        var card = document.getElementById("card-ori-dest");
        // @ts-ignore
        if (card.style.display === "none") {
            // @ts-ignore
            card.style.display = "block";
        } else {
            // @ts-ignore
            card.style.display = "none";
        }
    };

    const getFromMap = () => {
        if (odmap) {
            console.log("odmap");
            setodmap(false);
            setCreatingRoute(false);
            setGettingRoute(false);
            setPoints([]);
            setOrigin("");
            setDestination("");
            setCurrentIndex(0);
            // @ts-ignore
            document.getElementById("origin-input").value = "";
            // @ts-ignore
            document.getElementById("origin-input").style.readonly = false;
            // @ts-ignore
            document.getElementById("destination-input").value = "";
            // @ts-ignore
            document.getElementById("destination-input").style.readonly = false;
            // @ts-ignore
            document.getElementById("ins-card").style.display = "none";
        } else {
            console.log("not odmap");
            setodmap(true);
            setCreatingRoute(true);
            setGettingRoute(false);
            setPoints([]);
            setOrigin("");
            setDestination("");
            setCurrentIndex(0);
            // @ts-ignore
            document.getElementById("origin-input").value = "";
            // @ts-ignore
            document.getElementById("origin-input").style.readonly = true;
            // @ts-ignore
            document.getElementById("destination-input").value = "";
            // @ts-ignore
            document.getElementById("destination-input").style.readonly = true;
            // @ts-ignore
            document.getElementById("ins-card").style.display = "none";
        }
    };

    const geoCode = async (query: string): Promise<string> => {
        // @ts-ignore
        return fetch(query)
            .then((response) => response.json())
            .then((data) => {
                if (data.items.length === 0) {
                    window.alert("No results");
                    return "";
                }
                const lat = data.items[0].position.lat;
                const lng = data.items[0].position.lng;
                return lat + "," + lng;
            })
            .catch((error) => {
                console.error("Error:", error);
                return "";
            });
    };

    const getRoute = async () => {
        if (origin === "" || destination === "") {
            window.alert("Please fill in both fields");
            return;
        }
        if (odmap) {
            setGettingRoute(true);
        }
        let url = URL_ROUTING;
        if (origin.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/) &&
            destination.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)
        ) {
            console.log("HERE1")
            url += "&point=" + origin + "&point=" + destination;
        } else if (origin.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/) &&
            !destination.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)
        ) {
            console.log("HERE2")
            let dest = await geoCode(URL_GEO + "&q=" + destination);
            url += "&point=" + origin + "&point=" + dest;
        } else if (!origin.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/) &&
            destination.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)
        ) {
            console.log("HERE3")
            let ori = await geoCode(URL_GEO + "&q=" + origin);
            url += "&point=" + ori + "&point=" + destination;
        } else {
            console.log("HERE4")
            let ori = await geoCode(URL_GEO + "&q=" + origin);
            let dest = await geoCode(URL_GEO + "&q=" + destination);
            url += "&point=" + ori + "&point=" + dest;
        }
        if (url) {
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    if (data.paths.length === 0) {
                        window.alert("No results");
                        return;
                    }
                    const points = data.paths[0].points.coordinates;
                    let points2 = [];
                    for (let point of points) {
                        points2.push(new LatLng(point[1], point[0]));
                    }
                    setPoints([points2]);
                    let directions = [];
                    for (let instruction of data.paths[0].instructions) {
                        directions.push(
                            new Direction(
                                instruction.text,
                                instruction.distance.toFixed(2),
                                instruction.time.toFixed(2)
                            )
                        );
                    }
                    setCurrentIndex(0);
                    setDirections(directions);
                    // @ts-ignore
                    document.getElementById("ins-card").style.display = "block";
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

        }
    }

    const hidecard = () => {
        // @ts-ignore
        document.getElementById("card-info").style.display = "none";
    };

    const updateOrigin = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin(event.target.value);
    };

    const updateDestination = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDestination(event.target.value);
    };
    const cancelRoute = () => {
        setPoints([]);
        setGettingRoute(false);
        setCurrentIndex(0);
        // @ts-ignore
        document.getElementById("ins-card").style.display = "none";
    };

    const handleNext = () => {
        setCurrentIndex(currentIndex + 1);
    };

    const handleBefore = () => {
        setCurrentIndex(currentIndex - 1);
    };

    function padTo2Digits(num: number) {
        return num.toString().padStart(2, "0");
    }

    function convertMsToTime(milliseconds: number) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        // 👇️ If you don't want to roll hours over, e.g. 24 to 00
        // 👇️ comment (or remove) the line below
        // commenting next line gets you `24:00:00` instead of `00:00:00`
        // or `36:15:31` instead of `12:15:31`, etc.
        hours = hours % 24;

        return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
            seconds
        )}`;
    }

    const TOKEN =
        "eyJraWQiOiJSc0d4ckllKzZFXC9SVVlPOUFxU1RVaXJCZ2lvamZFUUZucGpXN0FTQVFDWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzMGM4NjM5Yy1jMGE0LTQ0ZjktYjNhZC04MDU5NTk0MTAzZDQiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9kemdZTDhmUFgiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI1ZzRic2ZzbHFhOTV1NHBkMnBvc2JuMHJudSIsImV2ZW50X2lkIjoiZjNjMTVkYmEtMzZhNS00NDNmLTkzZGQtOTNkYjA2OGZkMWExIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwiLCJhdXRoX3RpbWUiOjE2OTk2Mjg1MDcsImV4cCI6MTY5OTYzMjEwNywiaWF0IjoxNjk5NjI4NTA3LCJqdGkiOiJkOGY5ZTgzZS1mNjUyLTRhNjUtYjZhMC02ZmQyM2JlNGUwZWUiLCJ1c2VybmFtZSI6IjMwYzg2MzljLWMwYTQtNDRmOS1iM2FkLTgwNTk1OTQxMDNkNCJ9.cWW4Fb4gXuaPvOL-ZWeEvZ-TKsx5OO1x-6HrzLgGdCz5w0loAYIps9rR-lmetacdmm2oW1WNV8JkDjr6P8AUGhd-FsnIpscddsFTeH2vudZ1RGNc-hZA5OLZ0fwerIvnRTafAI0TXlgzhnHhRLizTs3vLU_ar_mMCmIK3WE2zq1K4C3qOR2cF8BdBByazv9h044Z2zSNkMWK7f6nrp_0AZCNo7wRes--Lx1NktUBTL-hrK43GhQnkAouCppXmYNPIniRcp-iO8yuBJvCz3D43c4eMgxFBdhLAlON6ZRX8Ju-AH4_bk51x4fedwHE6YjJcAa1Ax-CkBKmP4owVU65Zg";
    /* Fetch the user details by username */
    // const res = await fetch(`.../${params.user}`)
    // const data: user = await res.json()
    // const URL_USER = process.env.API_URL;
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState("");
    const [fname, setFname] = useState("");

    useEffect(() => {
        const headers = { Authorization: `Bearer ${TOKEN}` };
        const url = new URL("http://127.0.0.1:8000/user");

        const fetchUser = async () => {
            // console.log("fetching user");
            // console.log("URL_USER:", URL_USER);
            // console.log("TOKEN:", TOKEN);
            try {
                await fetch(url.toString(), { headers })
                    .then((res) => res.json())
                    .then((data) => {
                        setUser(data);
                        //console.log(data);
                        localStorage.setItem("user", JSON.stringify(data));
                        setUsername(data.username);
                        setAvatar(data.image_url);
                        setFname(data.first_name);
                    });
            } catch (error) {
                console.log("error guy:", error);
                console.log(error);
                setUsername("a"); // JUST TO MAKE SURE IT GETS TO PROFILE PAGE - MUST FIX
                setAvatar("");
                setFname("");
            }
        };
        fetchUser();
    }, []);

    return (
        <>
            {/* Sidebar */}

            <Sidebar />

            {/* eventually change this to the main page, but for now fica aqui */}

            <MapContainer
                id={"map-container"}
                ref={mapRef}
                className={"map"}
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                rotate={true}
                bearing={0}
                // @ts-ignore
                rotateControl={{ closeOnZeroBearing: false }}
                touchRotate={true}
            >
                {tileLayerURL !== undefined ? <TileLayer url={tileLayerURL} /> : null}
                {tileLayerURL !== undefined ? <Polyline positions={points} /> : null}
                <LocateControl />
                <MarkersManager
                    setOrigin={setOrigin}
                    setDestination={setDestination}
                    creatingRoute={creatingRoute}
                />
                {/*
                    DISPLAY POIs
                */}
                {basicPOIs.map((poi) => {
                    return (
                        <Marker
                            key={poi.id}
                            icon={getIcon(poi.type)}
                            position={new LatLng(poi.latitude, poi.longitude)}
                        >
                            <Popup>
                                {poi.name} <br /> {poi.type}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
            <Button
                id={"ori-dst-btn"}
                onClick={createRoute}
                variant={"light"}
                style={{
                    zIndex: 1,
                    scale: "100%",
                    bottom: "6%",
                    left: "0.5em",
                    position: "absolute",
                    border: ".1em solid black",
                }}
            >
                Route
            </Button>
            <Card
                id={"card-ori-dest"}
                style={{
                    zIndex: 1,
                    top: "1%",
                    left: "5%",
                    width: "15%",
                    position: "absolute",
                    display: "none",
                }}
            >
                <Card.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Origin</Form.Label>
                            <Form.Control
                                id={"origin-input"}
                                type={"text"}
                                placeholder={"Origin"}
                                onChange={updateOrigin}
                                value={origin}
                                readOnly={false}
                            />
                        </Form.Group>
                        <br />
                        <Form.Group>
                            <Form.Label>Destination</Form.Label>
                            <Form.Control
                                id={"destination-input"}
                                type={"text"}
                                placeholder={"Destination"}
                                onChange={updateDestination}
                                value={destination}
                                readOnly={false}
                            />
                        </Form.Group>
                        <br />
                        <Form.Group className="mb-3">
                            <Form.Check
                                id="mapcbox"
                                type="checkbox"
                                onChange={getFromMap}
                                label="Select in Map"
                            />
                        </Form.Group>
                        <Row>
                            <Button id={"get-route-btn"} onClick={getRoute} variant={"light"} style={{ border: ".1em solid black", width: "40%" }}>Get Route</Button>
                            <Button id={"cancel-route-btn"} onClick={cancelRoute} variant={"light"} style={{ border: ".1em solid black", width: "40%", marginLeft: "20%" }}>Cancel</Button>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
            <Container className={"map-ui d-flex flex-column h-100"} fluid>
                {/*
                {basicPOIs.map(poi => {
                    return (
                        <Marker
                            key={poi.id}
                            icon={getIcon(poi.type)}
                            position={new LatLng(poi.latitude, poi.longitude)}
                        >
                            <Popup>
                                {poi.name} <br/> {poi.type}
                            </Popup>
                        </Marker>
                    )
                })}
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
                            <Button id={"get-route-btn"} onClick={getRoute} variant={"light"} style={{ border: ".1em solid black", width: "40%" }}>Get Route</Button>
                            <Button id={"cancel-route-btn"} onClick={cancelRoute} variant={"light"} style={{ border: ".1em solid black", width: "40%", marginLeft: "20%" }}>Cancel</Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
            <Container className={"map-ui d-flex flex-column h-100"} fluid>
                {/*
                    POPUP CARD
                */}
                <Card
                    id={"card-info"}
                    style={{
                        position: "absolute",
                        top: "10em",
                        left: "50%",
                        display: "none",
                    }}
                >
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
                                <Form.Control
                                    type={"text"}
                                    placeholder={"Search"}
                                    onKeyDown={handleKeyDown}
                                />
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
                                    fetchPOIs={fetchPOIs} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                {/*
                    LOWER PART OF THE UI
                */}
                <Row className={"pb-2"}>
                    <Col xs={2}></Col>
                    <Col xs={"auto"} className={"mx-auto"}>
                        <Card className={"text-center"}>
                            <Card.Body>
                                <Card.Title>User Position</Card.Title>
                                <Card.Text id={"map-user-position"}>
                                    {userPosition.latitude !== undefined &&
                                        userPosition.longitude !== undefined
                                        ? `Latitude: ${userPosition.latitude} | Longitude: ${userPosition.longitude}`
                                        : "Please enable location to see your current location"}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={2} className={"d-flex align-items-end"}>
                        <ButtonGroup>
                            <Button
                                id={"map-rotate-left-btn"}
                                variant={"light"}
                                onClick={() => addToBearing(-10)}
                            >
                                Rotate Left
                            </Button>
                            <Button
                                id={"map-rotate-right-btn"}
                                variant={"light"}
                                onClick={() => addToBearing(10)}
                            >
                                Rotate Right
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

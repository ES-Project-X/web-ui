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
    FormGroup,
    FormLabel,
} from "react-bootstrap";
import { MapContainer, Polyline, TileLayer, useMapEvents } from "react-leaflet";
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
import { Direction } from "../structs/direction";
import RegisterUserModal from "./RegisterUserModal";
import Cookies from "js-cookie";

const API_KEY = process.env.PUBLIC_KEY_HERE;
const URL_API = process.env.DATABASE_API_URL;
const URL_GEO =
    "https://geocode.search.hereapi.com/v1/geocode?apiKey=" +
    API_KEY +
    "&in=countryCode:PRT";
const URL_REV =
    "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;
const URL_ROUTING = process.env.URL_ROUTING;
const COGNITO_LOGIN_URL = process.env.COGNITO_LOGIN_URL;

const TOKEN = Cookies.get('COGNITO_TOKEN');

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
    const [selectedPOI, setSelectedPOI] = useState(null);

    const [filterName, setFilterName] = useState<string>("");
    const [filterTypes, setFilterTypes] = useState<FilterType[]>([
        { label: "Bicycle Parking", value: "bicycle-parking", selected: true },
        { label: "Bicycle Shop", value: "bicycle-shop", selected: true },
        { label: "Drinking Water", value: "drinking-water", selected: true },
        { label: "Toilets", value: "toilets", selected: true },
        { label: "Bench", value: "bench", selected: true },
    ]);

    const [points, setPoints] = useState<LatLng[][]>([]);

    const [gettingRoute, setGettingRoute] = useState(false);

    const d = [new Direction("test", 10, 10)];

    const [directions, setDirections] = useState<Direction[]>(d);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [ratingPositive, setRatingPositive] = useState(0);
    const [ratingNegative, setRatingNegative] = useState(0);

    const [ratingPositiveStat, setRatingPositiveStat] = useState(0);
    const [ratingNegativeStat, setRatingNegativeStat] = useState(0);

    const [gettingInterRoute, setGettingInterRoute] = useState(false);

    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        navigator.geolocation.watchPosition((location) => {
            const { latitude, longitude } = location.coords;
            setUserPosition({ latitude, longitude });
        });
        getRoutes();
    }, []);

    useEffect(() => {
        if (gettingRoute) {
            getRoute();
        }
    }, [origin, destination]);

    const addToBearing = (amount: number) => {
        if (mapRef.current) {
            // @ts-ignore
            const nextBearing = mapRef.current.getBearing() + (amount % 360);
            // @ts-ignore
            mapRef.current.setBearing(nextBearing);
        }
    };

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
    };

    const updateMarkers = (data: any) => {
        const pois: BasicPOI[] = data.map((poi: any) => {
            return {
                id: poi.id,
                name: poi.name,
                type: poi.type,
                latitude: poi.latitude,
                longitude: poi.longitude,
                icon: getIcon(poi.type),
            };
        });
        if (pois.length > 0) {
            let new_pois = markers;
            pois.forEach((poi: BasicPOI) => {
                new_pois.push(poi);
            });
            setMarkers(new_pois);
            filterPOIs();
        }
    };

    const fetchPOIs = (clusters: number[][]) => {
        console.log("fetching pois");
        const url = new URL(URL_API + "poi/cluster");
        clusters.forEach((cluster: number[]) => {
            url.searchParams.append("max_lat", cluster[0].toString());
            url.searchParams.append("min_lat", cluster[1].toString());
            url.searchParams.append("max_lng", cluster[2].toString());
            url.searchParams.append("min_lng", cluster[3].toString());
        });

        fetch(url.toString())
            .then((response) => response.json())
            .then((data) => updateMarkers(data))
            .catch((error) => console.log(error));

        console.log("response:", url.toString());
    };

    function fetchPOIDetails(id: string) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "poi/" + id);
        fetch(url.toString(), { headers })
            .then((response) => response.json())
            .then((data) => {
                setSelectedPOI(data);
                setRatingPositive(data.rating_positive);
                setRatingNegative(data.rating_negative);
            })
            .catch(() => { });
        return;
    }

    const filterPOIs = () => {
        const filteredMarkers = markers
            .filter((marker) => {
                return filterTypes.some((type) => {
                    return type.selected && marker.type === type.value;
                });
            })
            .filter((marker) => {
                return marker.name.toLowerCase().includes(filterName.toLowerCase());
            });
        if (mapRef.current) {
            updateClusterGroup(filteredMarkers, mapRef, fetchPOIDetails);
        }
    };

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

    const drawRoute = (url: string) => {
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
                    // @ts-ignore
                    document.getElementById("cancel-route-btn").style.display = "block";
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    };

    function getRoutes() {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`
        };
        const url = new URL(URL_API + "route/get");
        return fetch(url.toString(), { headers })
            .then(response => response.json())
            .then(data => {
                if (data.detail) {
                    return;
                } else {
                    setRoutes(data);
                }
            })
            .catch(() => {
                alert("Error getting routes")
            })
    }

    function storeRoute(points: string[], names: string[]) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "route/create");
        let name = "";
        for (let i = 0; i < names.length; i++) {
            if (i === names.length - 1) {
                name += names[i];
            } else {
                name += names[i] + "-";
            }
        }
        let body = {
            name: name,
            points: points,
        };
        return fetch(url.toString(), {
            headers,
            method: "POST",
            body: JSON.stringify(body),
        })
            .then((response) => response.json())
            .then((data) => {
                getRoutes();
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    const getRoute = async () => {
        let points = [];

        if (origin === "" || destination === "") {
            window.alert("Please fill in both fields");
            return;
        }
        if (odmap) {
            setGettingRoute(true);
        }
        setGettingInterRoute(true);
        let url = URL_ROUTING;

        let names = [];
        names.push(origin);

        if (origin.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
            url += "&point=" + origin;
            points.push(origin);
        } else {
            let ori = await geoCode(URL_GEO + "&q=" + origin);
            url += "&point=" + ori;
            points.push(ori);
        }

        for (let i = 0; i < numberOfIntermediates; i++) {
            let intermediate = (
                document.getElementById("intermediate-input-" + i) as HTMLInputElement
            ).value;
            names.push(intermediate);
            if (intermediate.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
                url += "&point=" + intermediate;
                points.push(intermediate);
            } else if (intermediate === "") {
            } else {
                let inter = await geoCode(URL_GEO + "&q=" + intermediate);
                url += "&point=" + inter;
                points.push(inter);
            }
        }

        names.push(destination);

        if (destination.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
            url += "&point=" + destination;
            points.push(destination);
        } else {
            let dest = await geoCode(URL_GEO + "&q=" + destination);
            url += "&point=" + dest;
            points.push(dest);
        }

        storeRoute(points, names);

        drawRoute(url!);
    };

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
        setGettingInterRoute(false);
        setCurrentIndex(0);
        // @ts-ignore
        document.getElementById("ins-card").style.display = "none";
        // @ts-ignore
        document.getElementById("cancel-route-btn").style.display = "none";
        // @ts-ignore
        document.getElementById("card-ori-dest").style.display = "none";
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

    function rateExistenceFunction(id: string, existence: boolean) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "poi/exists");
        let body = {
            id: id,
            rating: existence,
        };
        return fetch(url.toString(), {
            headers,
            method: "PUT",
            body: JSON.stringify(body),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.time === 0) {
                    return true;
                } else {
                    // covert seconds in 00h00m00s
                    let seconds = data.time;
                    let minutes = Math.floor(seconds / 60);
                    let hours = Math.floor(minutes / 60);
                    seconds = seconds % 60;
                    minutes = minutes % 60;
                    let time = `${padTo2Digits(hours)}h${padTo2Digits(
                        minutes
                    )}m${padTo2Digits(seconds)}s`;
                    window.alert(
                        "You have already rated this POI, please wait " +
                        time +
                        " to rate again"
                    );
                    return false;
                }
            })
            .catch(() => {
                return false;
            });
    }
    const [existsClicked, setExistsClicked] = useState(false);
    const [fakeNewsClicked, setFakeNewsClicked] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    function rateStatusFunction(id: string, status: boolean) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "poi/status");
        let body = {
            id: id,
            status: status,
        };
        console.log("body:", body);
        return fetch(url.toString(), {
            headers,
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    const [loggedIn, setLoggedIn] = useState(false);

    function removeCookie() {
        Cookies.remove("COGNITO_TOKEN");
        window.location.reload();
    }

    /* Fetch the user details by username */
    // const res = await fetch(`.../${params.user}`)
    // const data: user = await res.json()
    // const URL_USER = process.env.API_URL;
    const [avatar, setAvatar] = useState("");
    const [fname, setFname] = useState("");


    const [isRModalOpen, setIsRModalOpen] = useState(false);

    useEffect(() => {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`
        };
        const url = new URL(URL_API + "user");

        if (TOKEN === undefined) {
            setLoggedIn(false);
            return;
        }

        fetch(url.toString(), { headers })
            .then((res) => res.json())
            .then((data) => {
                setAvatar(data.image_url);
                setFname(data.first_name);
                localStorage.setItem("user", JSON.stringify(data));
                setLoggedIn(true);
            })
            .catch(() => {
                setLoggedIn(false);
                setIsRModalOpen(true);
            });

    }, []);


    useEffect(() => {
        const modal = document.getElementById(
            "register_user_modal"
        ) as HTMLDialogElement;
        if (modal === null) {
            return;
        }
        if (isRModalOpen) {
            modal.showModal();
        } else {
            modal.close();
            setIsRModalOpen(false);
        }
    }, [isRModalOpen]);

    const closeModal = () => {
        setIsRModalOpen(false);
    };

    const registerUser = (userData: any) => {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`
        };
        const url = new URL(URL_API + "auth/register");
        console.log(userData);

        fetch(url.toString(), {
            headers,
            method: "POST",
            body: JSON.stringify(userData)
        })
            .then((res) => res.json())
            .then((data) => {
                setAvatar(data.image_url);
                setFname(data.first_name);
                localStorage.setItem("user", JSON.stringify(data));
                setLoggedIn(true);
            })
            .catch((err) => {
                console.log("error:", err);
            });

        closeModal();
        window.location.reload();
    };

    const [numberOfIntermediates, setNumberOfIntermediates] = useState(0);
    const [canCall, setCanCall] = useState(false);

    let intermediates: any[];
    intermediates = [];

    const eliminateIntermediate = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        const id = event.currentTarget.id;
        intermediates.splice(parseInt(id[id.length - 1]), 1);
        setNumberOfIntermediates(numberOfIntermediates - 1);
        setCanCall(true);
    };

    for (let i = 0; i < numberOfIntermediates; i++) {
        let string = "Intermediate " + (i + 1);
        intermediates.push(
            <FormGroup id={"intermediate" + i}>
                <FormLabel>{string}</FormLabel>
                <Row style={{ paddingLeft: "5%", marginRight: "5%" }}>
                    <Form.Control
                        style={{ width: "82%", marginRight: "2%" }}
                        id={"intermediate-input-" + i}
                        type={"text"}
                        placeholder={"Intermediate " + (i + 1)}
                        readOnly={false}
                    />
                    <Button
                        id={"intermediate-minus-btn-" + i}
                        onClick={eliminateIntermediate}
                        style={{ width: "30px" }}
                    >
                        -
                    </Button>
                </Row>
                <br />
            </FormGroup>
        );
    }

    useEffect(() => {
        if (canCall && gettingInterRoute && origin !== "" && destination !== "") {
            getRoute();
        }
        setCanCall(false);
    }, [numberOfIntermediates]);

    const addIntermediate = () => {
        setNumberOfIntermediates(numberOfIntermediates + 1);
    };

    return (
        <>
            {/* Sidebar */}

            <Sidebar routes={routes} getRoutes={getRoutes} draw={drawRoute} />

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
                maxZoom={18}
                minZoom={2}
                maxBounds={[
                    [-90, -180],
                    [90, 180],
                ]}
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
                <GetClusters fetchFunction={fetchPOIs} />
            </MapContainer>
            <Button
                id={"ori-dst-btn"}
                onClick={createRoute}
                variant={"light"}
                style={{
                    zIndex: 1,
                    scale: "100%",
                    bottom: "1%",
                    left: "0.5em",
                    position: "absolute",
                    border: ".1em solid black",
                }}
            >
                Route
            </Button>
            <Button
                id={"cancel-route-btn"}
                onClick={cancelRoute}
                variant={"light"}
                style={{
                    zIndex: 1,
                    scale: "100%",
                    bottom: "1%",
                    left: "5%",
                    position: "absolute",
                    border: ".1em solid black",
                    display: "none",
                }}
            >
                Cancel
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
                        {intermediates}
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
                        <Button
                            id={"add-intermediate-btn"}
                            onClick={addIntermediate}
                            style={{ width: "60%", marginLeft: "20%" }}
                        >
                            Add Intermediate
                        </Button>
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
                            <Button
                                id={"get-route-btn"}
                                onClick={getRoute}
                                variant={"light"}
                                style={{ border: ".1em solid black", width: "40%" }}
                            >
                                Get Route
                            </Button>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
            {directions[currentIndex] !== undefined && (
                <Card
                    id={"ins-card"}
                    style={{
                        zIndex: 1,
                        bottom: "10%",
                        left: "0.5em",
                        position: "absolute",
                        display: "none",
                    }}
                >
                    <Card.Body>
                        <Card.Title>{directions[currentIndex].direction}</Card.Title>
                        <Card.Text>
                            Distance: {directions[currentIndex].distance} meters <br />
                            Time: {convertMsToTime(directions[currentIndex].duration)}
                        </Card.Text>
                        <Button
                            id={"next-ins-btn"}
                            variant="primary"
                            onClick={handleNext}
                            disabled={currentIndex >= directions.length - 1}
                            style={{ border: ".1em solid black", width: "40%" }}
                        >
                            Next
                        </Button>
                        <Button
                            id={"before-ins-btn"}
                            variant="primary"
                            onClick={handleBefore}
                            disabled={currentIndex == 0}
                            style={{
                                border: ".1em solid black",
                                width: "40%",
                                marginLeft: "20%",
                            }}
                        >
                            Before
                        </Button>
                    </Card.Body>
                </Card>
            )}
            <Container className={"map-ui d-flex flex-column h-100"} fluid>
                {isRModalOpen && (
                    <RegisterUserModal
                        onClose={closeModal}
                        onRegisterUser={registerUser}
                        handleKeyDown={(e) => {
                            // Handle key down events if needed
                        }}
                    />
                )}
                {/*
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

                    <Col xs="auto" className="d-flex align-items-center">
                        {loggedIn ?
                            <>
                                <a className="btn-circle-link me-3">
                                    <button className="btn" onClick={() => { removeCookie() }}>
                                        Logout
                                    </button>
                                </a>
                                <ButtonGroup>
                                    <a href={`/profile`} className="btn-circle-link me-3">
                                        <Button
                                            style={{
                                                backgroundColor: "transparent",
                                                border: "none",
                                                padding: "0",
                                            }}
                                            className="btn-circle"
                                        >
                                            {avatar === "" ? (
                                                <img
                                                    src="https://i.imgur.com/8Km9tLL.png"
                                                    alt={"Default pfp"}
                                                    className="rounded-circle"
                                                    style={{ height: "100%" }}
                                                />
                                            ) : (
                                                <img
                                                    src={avatar}
                                                    alt={`${fname}'s profile`}
                                                    className="rounded-circle"
                                                    style={{ height: "100%", objectFit: "cover" }}
                                                />
                                            )}
                                        </Button>
                                    </a>
                                </ButtonGroup>
                            </>
                            :
                            <a
                                href={COGNITO_LOGIN_URL}
                                className="btn-circle-link me-3"
                                target="_self"
                            >
                                <button className="btn">Login</button>
                            </a>
                        }
                    </Col>
                </Row>
                {/*
                    MIDDLE PART OF THE UI
                */}
                <Row className={"flex-grow-1"}>
                    <Col xs={"auto"} className={"flex-grow-1"}></Col>
                    <Col xs={"auto"} className={"d-flex align-items-center"}>
                        <Card id={"filter-board"}>
                            <Card.Body>
                                <FilterBoardComponent
                                    filterPOIs={filterPOIs}
                                    setFilterName={setFilterName}
                                    setFilterTypes={setFilterTypes}
                                    types={filterTypes}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={"auto"} className={"d-flex align-items-center"}>
                        <Card id={"poi-sidebar"} style={{ display: "none" }}>
                            <Card.Body>
                                <POIsSidebar
                                    selectedPOI={selectedPOI}
                                    rateExistenceFunction={rateExistenceFunction}
                                    rateStatusFunction={rateStatusFunction}
                                    ratingPositive={ratingPositive}
                                    setRatingPositive={setRatingPositive}
                                    ratingNegative={ratingNegative}
                                    setRatingNegative={setRatingNegative}
                                    ratingPositiveStat={ratingPositiveStat}
                                    setRatingPositiveStat={setRatingPositiveStat}
                                    ratingNegativeStat={ratingNegativeStat}
                                    setRatingNegativeStat={setRatingNegativeStat}
                                    existsClicked={existsClicked}
                                    setExistsClicked={setExistsClicked}
                                    fakeNewsClicked={fakeNewsClicked}
                                    setFakeNewsClicked={setFakeNewsClicked}
                                    showDetails={showDetails}
                                    toggleDetails={toggleDetails}
                                    setShowDetails={setShowDetails}
                                />
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

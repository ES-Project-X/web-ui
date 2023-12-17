import { useState, useEffect } from "react";
import { Direction } from "../structs/direction";
import { SearchPoint, copySearchPoint } from "../structs/SearchComponent";
import { URL_API, URL_GEO, URL_REV, URL_ROUTING } from "../utils/constants";
import Cookies from "js-cookie";
import { LatLng, LatLngBounds } from "leaflet";
import { isMobile } from "react-device-detect";

const TOKEN = Cookies.get("COGNITO_TOKEN");

export default function RoutingComponent(
    {
        showRouting,
        setShowRouting,
        loggedIn,
        mapFlyTo,
        mapFitBounds,
        getViewBounds,
        origin,
        setOrigin,
        destination,
        setDestination,
        intermediates,
        setIntermediates,
        setPoints,
        addIntermediate,
        setAddIntermediate,
        setDirections,
        openDirections,
        setCurrentIndex,
        onlyInfo,
        setOnlyInfo,
        gettingRoute,
        setGettingRoute,
    }: {
        showRouting: boolean,
        setShowRouting: (showRouting: boolean) => void,
        loggedIn: boolean,
        mapFlyTo: (lat: number, lng: number, zoom: number) => void,
        mapFitBounds: (bounds: LatLngBounds) => void,
        getViewBounds: () => LatLngBounds,
        origin: SearchPoint,
        setOrigin: (origin: SearchPoint) => void,
        destination: SearchPoint
        setDestination: (destination: SearchPoint) => void,
        intermediates: SearchPoint[],
        setIntermediates: (intermediates: SearchPoint[]) => void,
        setPoints: (points: LatLng[]) => void,
        addIntermediate: boolean,
        setAddIntermediate: (intermediate: boolean) => void,
        setDirections: (directions: Direction[]) => void,
        openDirections: () => void,
        setCurrentIndex: (index: number) => void;
        onlyInfo: boolean;
        setOnlyInfo: (onlyInfo: boolean) => void;
        gettingRoute: boolean;
        setGettingRoute: (gettingRoute: boolean) => void;
    }
) {
    const [pointToRemove, setPointToRemove] = useState(-1);
    const [myOrigin, setMyOrigin] = useState("");
    const [myDestination, setMyDestination] = useState("");
    const [myIntermediates, setMyIntermediates] = useState<string[]>([]);
    const [myPoints, setMyPoints] = useState<string[]>([]);
    const [distance, setDistance] = useState("");
    const [time, setTime] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        if (pointToRemove === -1) {
            return;
        }
        let newIntermediates1: SearchPoint[] = [];
        let newIntermediates2: string[] = [];
        for (let i = 0; i < myIntermediates.length; i++) {
            if (i !== pointToRemove) {
                newIntermediates1.push(intermediates[i]);
                newIntermediates2.push(myIntermediates[i]);
            }
        }
        setMyIntermediates(newIntermediates2);
        setIntermediates(newIntermediates1);
        setPointToRemove(-1);
    }, [pointToRemove]);

    useEffect(() => {
        if (!origin.isNameNull()) {
            setMyOrigin(origin.getName());
        } else if (!origin.isCoordinateNull()) {
            setMyOrigin(origin.getStringCoordinates());
            updateOrigin(origin.getStringCoordinates());
        } else {
            setMyOrigin("");
            clearRoute();
        }
    }, [origin]);

    useEffect(() => {
        if (!destination.isNameNull()) {
            setMyDestination(destination.getName());
        } else if (!destination.isCoordinateNull()) {
            setMyDestination(destination.getStringCoordinates());
            updateDestination(destination.getStringCoordinates());
        } else {
            setMyDestination("");
            clearRoute();
        }
    }, [destination]);

    useEffect(() => {
        let newMyIntermediates = [];
        for (let i = 0; i < intermediates.length; i++) {
            if (!intermediates[i].isNameNull()) {
                newMyIntermediates.push(intermediates[i].getName());
            } else if (!intermediates[i].isCoordinateNull()) {
                newMyIntermediates.push(intermediates[i].getStringCoordinates());
                updateIntermediate(i, intermediates[i].getStringCoordinates());
            } else {
                newMyIntermediates.push("");
            }
        }
        setMyIntermediates(newMyIntermediates);
    }, [intermediates]);

    useEffect(() => {
        if (!origin.isCoordinateNull() && !destination.isCoordinateNull() && gettingRoute) {
            getRoute();
        }
    }, [origin, destination, intermediates]);

    const pushIntermediate = () => {
        setMyIntermediates([...myIntermediates, ""]);
        setIntermediates([...intermediates, new SearchPoint("")]);
    };

    const updateMyIntermediate = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        let newMyIntermediates = [...myIntermediates];
        newMyIntermediates[index] = event.target.value;
        setMyIntermediates(newMyIntermediates);
    };

    const updateOrigin = async (newMyOrigin: string = myOrigin) => {
        let newOrigin = copySearchPoint(origin);
        if (newMyOrigin.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
            newOrigin.setStringCoordinate(newMyOrigin);
            const name = await getPlace(newOrigin.getLat(), newOrigin.getLng())
            if (name !== undefined && name !== "") {
                newOrigin.setName(name);
                setOrigin(newOrigin);
            }
        } else if (newMyOrigin !== "" && newMyOrigin !== origin.getName()) {
            const coordinate = await getCoordinates(newMyOrigin);
            if (coordinate !== undefined && coordinate !== "") {
                const name = await getPlace(coordinate.split(",")[0], coordinate.split(",")[1]);
                if (name !== undefined && name !== "") {
                    newOrigin.setStringCoordinate(coordinate);
                    newOrigin.setName(name);
                    setOrigin(newOrigin);
                }
            }
        }
        return newOrigin;
    }

    const updateDestination = async (newMyDestination: string = myDestination) => {
        let newDestination = copySearchPoint(destination);
        if (newMyDestination.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
            newDestination.setStringCoordinate(newMyDestination);
            const name = await getPlace(newDestination.getLat(), newDestination.getLng());
            if (name !== undefined && name !== "") {
                newDestination.setName(name);
                setDestination(newDestination);
            }
        } else if (newMyDestination !== "" && newMyDestination !== destination.getName()) {
            const coordinate = await getCoordinates(newMyDestination);
            if (coordinate !== undefined && coordinate !== "") {
                const name = await getPlace(coordinate.split(",")[0], coordinate.split(",")[1]);
                if (name !== undefined && name !== "") {
                    newDestination.setStringCoordinate(coordinate);
                    newDestination.setName(name);
                    setDestination(newDestination);
                }
            }
        }
        return newDestination;
    }

    const updateIntermediate = async (index: number, intermediate: string) => {
        let newIntermediates = [...intermediates];
        if (intermediate.match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
            newIntermediates[index].setStringCoordinate(intermediate);
            const name = await getPlace(newIntermediates[index].getLat(), newIntermediates[index].getLng());
            if (name !== undefined && name !== "") {
                newIntermediates[index].setName(name);
                setIntermediates(newIntermediates);
            }
        } else if (intermediate !== "" && intermediate !== newIntermediates[index].getName()) {
            const coordinate = await getCoordinates(intermediate);
            if (coordinate !== undefined && coordinate !== "") {
                const name = await getPlace(coordinate.split(",")[0], coordinate.split(",")[1]);
                if (name !== undefined && name !== "") {
                    newIntermediates[index].setStringCoordinate(coordinate);
                    newIntermediates[index].setName(name);
                    setIntermediates(newIntermediates);
                }
            }
        }
        return newIntermediates[index];
    }

    const updateAllIntermediates = async () => {
        let newIntermediates = [...intermediates];
        for (let i = 0; i < myIntermediates.length; i++) {
            if (myIntermediates[i].match(/-?\d{1,3}[.]\d+,-?\d{1,3}[.]\d+/)) {
                newIntermediates[i].setStringCoordinate(myIntermediates[i]);
                const name = await getPlace(newIntermediates[i].getLat(), newIntermediates[i].getLng());
                if (name !== undefined && name !== "") {
                    newIntermediates[i].setName(name);
                }
            } else if (myIntermediates[i] !== "" && myIntermediates[i] !== newIntermediates[i].getName()) {
                const coordinate = await getCoordinates(myIntermediates[i]);
                if (coordinate !== undefined && coordinate !== "") {
                    const name = await getPlace(coordinate.split(",")[0], coordinate.split(",")[1]);
                    if (name !== undefined && name !== "") {
                        newIntermediates[i].setStringCoordinate(coordinate);
                        newIntermediates[i].setName(name);
                    }
                }
            }
        }
        setIntermediates(newIntermediates);
        return newIntermediates;
    }

    const clearIntermediate = (index: number) => {
        let newIntermediates = [...intermediates];
        for (let i = 0; i < newIntermediates.length; i++) {
            if (i === index) {
                newIntermediates[i] = new SearchPoint("");
            }
        }
        setIntermediates(newIntermediates);
    }

    const geoCode = async (query: string): Promise<string> => {
        return fetch(query)
            .then((response) => response.json())
            .then((data) => {
                if (data.items.length === 0) {
                    alert("No results");
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

    const revGeocode = async (query: string): Promise<string> => {
        return fetch(query)
            .then((response) => response.json())
            .then((data) => {
                if (data.items.length === 0) {
                    alert("No results");
                    return "";
                }
                const address1 = data.items[0].address.district;
                const address2 = data.items[0].address.city;
                if (address1 != undefined) {
                    return address1 + ", " + address2;
                } else {
                    return address2 + ", " + data.items[0].address.county;
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                return "";
            });
    }

    const getCoordinates = async (query: string): Promise<string> => {
        return await geoCode(URL_GEO + "&q=" + query);
    }

    const getPlace = async (lat: number | string, lng: number | string): Promise<string> => {
        return await revGeocode(URL_REV + "&at=" + lat + "," + lng);
    }

    const getRoute = async () => {
        if (origin.isCoordinateNull() || destination.isCoordinateNull()) {
            if (myOrigin === "" || myDestination === "") {
                alert("Please fill in both fields");
                clearRoute();
                return;
            } else if (origin.isCoordinateNull()) {
                origin = await updateOrigin();
            } else if (destination.isCoordinateNull()) {
                destination = await updateDestination();
            }
        }

        let url = URL_ROUTING;
        let newPoints = [];
        let newMyPoints = [];
        let newNames = [];

        url += "&point=" + origin.getStringCoordinates();
        newPoints.push(origin.getLatLng());
        newMyPoints.push(origin.getStringCoordinates());
        newNames.push(origin.getName());

        for (let intermediate of intermediates) {
            if (!intermediate.isCoordinateNull()) {
                url += "&point=" + intermediate.getStringCoordinates();
                newPoints.push(intermediate.getLatLng());
                newMyPoints.push(intermediate.getStringCoordinates());
                newNames.push(intermediate.getName());
            }
        }

        url += "&point=" + destination.getStringCoordinates();
        newPoints.push(destination.getLatLng());
        newMyPoints.push(destination.getStringCoordinates());
        newNames.push(destination.getName());

        let bounds = new LatLngBounds(newPoints[0], newPoints[1]);
        for (let i = 2; i < newPoints.length; i++) {
            bounds.extend(newPoints[i]);
        }

        drawRoute(url!);
        const currentBounds = getViewBounds();
        if (!currentBounds.contains(bounds)) {
            mapFitBounds(bounds);
        }
        let newName = newNames[0];
        for (let i = 1; i < newNames.length-1; i++) {
            newName += "__" + newNames[i].split(",")[0];
        }
        newName += "__" + newNames[newNames.length-1];
        setName(newName);
        setMyPoints(newMyPoints);
        setGettingRoute(true);
        setOnlyInfo(true);
        setCurrentIndex(0);
    };

    const flyTo = async (point: SearchPoint) => {
        if (!point.isNameNull()) {
            if (myOrigin !== "" && myDestination !== "") {
                await updateOrigin();
                await updateAllIntermediates();
                await updateDestination();
            }
            else {
                mapFlyTo(point.getLat(), point.getLng(), 13);
                clearRoute();
            }
        }
    };

    const drawRoute = (url: string) => {
        if (url) {
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    if (data.paths.length === 0) {
                        alert("No results");
                        return;
                    }
                    const points = data.paths[0].points.coordinates;
                    setDistance((data.paths[0].distance / 1000).toFixed(1) + " km");
                    const seconds = data.paths[0].time / 1000;
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    let time = "";
                    if (hours > 0) {
                        time += hours + " h ";
                    }
                    if (minutes > 0) {
                        time += minutes + " min";
                    }
                    setTime(time);
                    let points2 = [];
                    for (let point of points) {
                        points2.push(new LatLng(point[1], point[0]));
                    }
                    setPoints(points2);
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
                    setDirections(directions);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    };

    const clearRoute = () => {
        setGettingRoute(false);
        setPoints([]);
    }

    async function saveRoute() {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "route/create");
        const body = {
            name: name,
            points: myPoints,
        };
        return fetch(url.toString(), {
            headers,
            method: "POST",
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (response.status === 200) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(() => {
                return false;
            });
    }

    useEffect(() => {
        if (origin.isCoordinateNull() || destination.isCoordinateNull()) {
            setAddIntermediate(false);
            return;
        }
        for (let intermediate of intermediates) {
            if (intermediate.isCoordinateNull()) {
                setAddIntermediate(false);
                return;
            }
        }
        setAddIntermediate(true);
    }, [origin, destination, intermediates]);

    function hide() {
        setShowRouting(false);
        setGettingRoute(true);
    }

    return (
        showRouting && (
            (onlyInfo && isMobile) ? (
                <div id={"card-ori-dest"} className="card p-3">
                    <div className="flex flex-col overflow-y-auto max-h-48 sm:max-h-72"></div>
                    <div className="flex flex-col mt-2 mr-auto">
                        <div className="text-black dark:text-white text-xl font-bold">{time}</div>
                        <div className="text-gray-500 text-lg">{distance}</div>
                    </div>
                </div>
            ) : (
                <div id={"card-ori-dest"} className="card p-3">
                    <div className="flex flex-col overflow-y-auto max-h-48 sm:max-h-72">
                        <div className="flex">
                            <input
                                id={"origin-input"}
                                type={"text"}
                                placeholder={"Origin"}
                                onChange={(event) => setMyOrigin(event.target.value)}
                                onBlur={async () => await updateOrigin()}
                                onKeyDown={async (event) => {
                                    if (event.key === "Enter") {
                                        flyTo(await updateOrigin());
                                    } else if (event.key === "Backspace") {
                                        let newOrigin = copySearchPoint(origin);
                                        newOrigin.setName("");
                                        newOrigin.resetCoordinate();
                                        setOrigin(newOrigin);
                                        clearRoute();
                                    }
                                }}
                                value={myOrigin}
                                className="bg-white dark:bg-black text-black dark:text-white shadow appearance-none border rounded w-full py-2 px-3 mb-2 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        {myIntermediates.map((intermediate, index) => {
                            return (
                                <div key={index}>
                                    <div className="flex items-center">
                                        <div>
                                            <button
                                                onClick={() => setPointToRemove(index)}
                                                className="mr-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <input
                                            type={"text"}
                                            placeholder={"Intermediate Point"}
                                            onChange={(event) => updateMyIntermediate(event, index)}
                                            onBlur={async () => updateIntermediate(index, intermediate)}
                                            onKeyDown={async (event) => {
                                                if (event.key === "Enter") {
                                                    const point = await updateIntermediate(index, intermediate);
                                                    if (point !== undefined) {
                                                        flyTo(point);
                                                    }
                                                } else if (event.key === "Backspace") {
                                                    clearIntermediate(index);
                                                }
                                            }}
                                            value={intermediate}
                                            className="bg-white dark:bg-black text-black dark:text-white shadow appearance-none border w-full rounded py-2 px-3 mb-2 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {addIntermediate && (
                            <button
                                id={"add-inter-btn"}
                                onClick={pushIntermediate}
                            >
                                <div className="flex mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <label style={{ cursor: 'pointer' }}>Add Intermediate</label>
                                </div>
                            </button>
                        )}
                        <div>
                            <input
                                id={"destination-input"}
                                type={"text"}
                                placeholder={"Destination"}
                                onChange={(event) => setMyDestination(event.target.value)}
                                onBlur={async () => await updateDestination()}
                                onKeyDown={async (event) => {
                                    if (event.key === "Enter") {
                                        flyTo(await updateDestination());
                                    } else if (event.key === "Backspace") {
                                        let newDestination = copySearchPoint(destination);
                                        newDestination.setName("");
                                        newDestination.resetCoordinate();
                                        setDestination(newDestination);
                                        clearRoute();
                                    }
                                }}
                                value={myDestination}
                                className="bg-white dark:bg-black text-black dark:text-white shadow appearance-none border rounded w-full py-2 px-3 mb-2 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    </div>
                    {gettingRoute && (
                        <div className="flex flex-col mt-2 mr-auto">
                            <div className="text-black dark:text-white text-xl font-bold">{time}</div>
                            <div className="text-gray-500 text-lg">{distance}</div>
                        </div>
                    )}
                    <div>
                        <div className="mt-2 flex w-full">
                            <div className="w-1/2 mr-1.5">
                                <button
                                    id={"get-route-btn"}
                                    onClick={getRoute}
                                    className="btn w-full"
                                >
                                    Get Route
                                </button>
                            </div>
                            <div className="w-1/2 ml-1.5">
                                {gettingRoute && loggedIn && (
                                    <button
                                        id={"save-route-btn"}
                                        onClick={async () => {
                                            if (await saveRoute()) {
                                                alert("Route saved");
                                            } else {
                                                alert("Error saving route");
                                            }
                                        }}
                                        style={{ borderWidth: "3px", borderStyle: "solid" }}
                                        className="bg-white border-green-600 btn w-full text-green-600"
                                    >
                                        Save Route
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex mt-2">
                            {gettingRoute && (
                                <div>
                                    <button
                                        id={"clear-route-btn"}
                                        onClick={openDirections}
                                        className="underline"
                                    >
                                        Show Directions
                                    </button>
                                </div>
                            )}
                            {isMobile && (
                                <div className="ml-auto">
                                    <button
                                        id={"clear-route-btn"}
                                        onClick={hide}
                                        className="underline"
                                    >
                                        Hide Routing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        )
    );
}
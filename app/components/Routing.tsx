import React, { useState } from "react";
import { useEffect } from "react";
import { Direction } from "../structs/direction";
import { URL_API, URL_GEO, URL_ROUTING } from "../utils/constants";
import Cookies from "js-cookie";
import { LatLng } from "leaflet";

const TOKEN = Cookies.get("token");

export default function RoutingComponent(
    {
        setOrigin,
        origin,
        setDestination,
        destination,
        canCall,
        setCanCall,
        setCreatingRoute,
        setPoints,
        setCurrentIndex,
        setDirections,
    }: {
        setOrigin: (origin: string) => void,
        origin: string,
        setDestination: (destination: string) => void,
        destination: string,
        canCall: boolean,
        setCanCall: (canCall: boolean) => void,
        setCreatingRoute: (creatingRoute: boolean) => void,
        setPoints: (points: LatLng[][]) => void,
        setCurrentIndex: (currentIndex: number) => void,
        setDirections: (directions: Direction[]) => void,
    }
) {
    const [odmap, setodmap] = useState(false);
    const [gettingInterRoute, setGettingInterRoute] = useState(false);
    const [gettingRoute, setGettingRoute] = useState(false);
    const [intermediates, setIntermediates] = useState<JSX.Element[]>([]);

    const eliminateIntermediate = (index: number) => {
        const newIntermediates = intermediates.filter((_, i) => i !== index);
        console.log(newIntermediates);
        setIntermediates(newIntermediates);
    }

    const pushIntermediate = () => {
        const i = intermediates.length+1;
        const intermediate = (
            <div className="flex">
                <input
                    id={"intermediate-input-" + i}
                    type={"text"}
                    placeholder={"Intermediate " + i}
                    className="shadow appearance-none border rounded w-full py-2 px-3 mb-2 text-white leading-tight focus:outline-none focus:shadow-outline"
                />
                <button
                    id={"eliminate-intermediate-btn-" + i}
                    onClick={() => eliminateIntermediate(i)}
                    className="btn-circle"
                >
                    -
                </button>
            </div>
        );
        setIntermediates([...intermediates, intermediate]);
    };

    const updateOrigin = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin(event.target.value);
    };

    const updateDestination = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDestination(event.target.value);
    };

    useEffect(() => {
        if (canCall && gettingInterRoute && origin !== "" && destination !== "") {
            getRoute();
        }
        setCanCall(false);
    }, [intermediates]);

    useEffect(() => {
        if (gettingRoute) {
            getRoute();
        }
    }, [origin, destination]);

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

        for (let i = 0; i < intermediates.length; i++) {
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

        drawRoute(url!);
        storeRoute(points, names);
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

    const getFromMap = () => {
        if (odmap) {
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

    async function storeRoute(points: string[], names: string[]) {
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
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    return (
        <div className="flex">
            <div id={"card-ori-dest"} className="card p-3">
                    <div className="flex-col flex">
                        <input
                            id={"origin-input"}
                            type={"text"}
                            placeholder={"Origin"}
                            onChange={updateOrigin}
                            value={origin}
                            className="shadow appearance-none border rounded w-full py-2 px-3 mb-2 text-white leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    {intermediates.map((intermediate) => {
                        return (
                            intermediate
                        );
                    })}
                    <div className="flex-col flex">
                        <input
                            id={"destination-input"}
                            type={"text"}
                            placeholder={"Destination"}
                            onChange={updateDestination}
                            value={destination}
                            className="shadow appearance-none border rounded w-full py-2 px-3 mb-2 text-white leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            id="mapcbox"
                            type="checkbox"
                            onChange={getFromMap}
                            className="mr-2 leading-tight"
                        />
                        <label>Select in map</label>
                    </div>
                <div className="flex flex-col">
                    {origin && destination &&  (
                        <button
                            id={"add-intermediate-btn"}
                            onClick={pushIntermediate}
                            className="btn mb-3"
                        >
                            Add Intermediate
                        </button>
                    )}
                    <button
                        id={"get-route-btn"}
                        onClick={getRoute}
                        className="btn"
                    >
                        Get Route
                    </button>
                </div>
            </div>
        </div >
    );
}
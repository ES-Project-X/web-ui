import { Marker, Popup, useMapEvents } from "react-leaflet";
import RedMarker from "./markers/RedMarker";
import GreenMarker from "./markers/GreenMarker";
import BlueMarker from "./markers/BlueMarker";
import { useState, useEffect } from "react";
import { Coordinate, SearchPoint, copySearchPoint } from "../structs/SearchComponent";

let clickCount = 0;

export default function MarkersManager({
    origin,
    setOrigin,
    destination,
    setDestination,
    intermediates,
    setIntermediates,
    routing,
    setMarkerCoordinates,
}: {
    origin: SearchPoint;
    setOrigin: (origin: SearchPoint) => void;
    destination: SearchPoint;
    setDestination: (destination: SearchPoint) => void;
    intermediates: SearchPoint[];
    setIntermediates: (intermediate: SearchPoint[]) => void;
    routing: boolean;
    setMarkerCoordinates: React.Dispatch<React.SetStateAction<Coordinate>
    >;
}) {
    const [redVisible, setRedVisible] = useState<boolean>(false);
    const [greenVisible, setGreenVisible] = useState<boolean>(false);
    const [blueVisible, setBlueVisible] = useState<boolean>(false);
    const [blueMarkers, setBlueMarkers] = useState<any[]>([]);

    useEffect(() => {
        if (!origin.isCoordinateNull()) {
            setGreenVisible(true);
        } else {
            setGreenVisible(false);
        }
    }, [origin]);

    useEffect(() => {
        if (!destination.isCoordinateNull()) {
            setRedVisible(true);
        } else {
            setRedVisible(false);
        }
    }, [destination]);

    useEffect(() => {
        if (routing && redVisible) {
            setDestination(destination);
        } else {
            setRedVisible(false);
        }
        setGreenVisible(false);
        setBlueVisible(false);
    }, [routing]);

    useEffect(() => {
        let newBlueMarkers = intermediates.map((value, index) => {
            if (!value.isCoordinateNull()) {
                return (
                    <Marker
                        key={index}
                        position={value.getLatLng()}
                        icon={BlueMarker}
                        interactive={true}
                        draggable={true}
                        eventHandlers={{
                            click: () => {
                                let newIntermediates = [...intermediates];
                                newIntermediates[index].setName("");
                                newIntermediates[index].resetCoordinate();
                                setIntermediates(newIntermediates);
                            },
                            dragend: (e) => {
                                let newIntermediateValues = [...intermediates];
                                newIntermediateValues[index].setName("");
                                newIntermediateValues[index].setLatLng(e.target.getLatLng());
                                setIntermediates(newIntermediateValues);
                            },
                        }}
                    ></Marker>
                );
            }
        });
        setBlueMarkers(newBlueMarkers);
        if (intermediates.length === 0) {
            setBlueVisible(false);
        } else {
            setBlueVisible(true);
        }
    }, [intermediates]);

    function handleClick(e: any) {
        if (routing) {
            if (!greenVisible) {
                setGreenVisible(true);
                let newOrigin = copySearchPoint(origin);
                newOrigin.setLatLng(e.latlng);
                newOrigin.setName("");
                setOrigin(newOrigin);
                return;
            } else {
                for (let i = 0; i < intermediates.length; i++) {
                    if (intermediates[i].isCoordinateNull()) {
                        let newIntermediates = [...intermediates];
                        newIntermediates[i].setLatLng(e.latlng);
                        newIntermediates[i].setName("");
                        setIntermediates(newIntermediates);
                        if (!blueVisible) {
                            setBlueVisible(true);
                        }
                        return;
                    }
                }
            }
            if (!redVisible) {
                setRedVisible(true);
            }
            let newDestination = copySearchPoint(destination);
            newDestination.setLatLng(e.latlng);
            newDestination.setName("");
            setDestination(newDestination);
        } else if (redVisible) {
            setRedVisible(false);
            setDestination(new SearchPoint());
            setMarkerCoordinates(new Coordinate());
        } else {
            setRedVisible(true);
            let newDestination = copySearchPoint(destination);
            newDestination.setLatLng(e.latlng);
            setDestination(newDestination);
            setMarkerCoordinates(newDestination.getCoordinate());
        }
    }

    useMapEvents({
        click: (e) => {
            if (!routing && redVisible) {
                setRedVisible(false);
                setDestination(new SearchPoint());
                setMarkerCoordinates(new Coordinate());
            } else {
                clickCount++;
                setTimeout(() => {
                    if (clickCount === 1) {
                        handleClick(e);
                        clickCount = 0;
                    }
                }, 300);
            }
        },
        dblclick: () => {
            clickCount = 0;
        },
    });

    const singleMarker = (
        <Marker
            // @ts-ignore
            position={destination.getLatLng()}
            icon={RedMarker}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    let newDestination = copySearchPoint(destination);
                    newDestination.setLatLng(e.target.getLatLng());
                    newDestination.setName("");
                    setDestination(newDestination);
                    setMarkerCoordinates(newDestination.getCoordinate());
                },
            }}
        >
            <Popup>
                You are at {destination.getLat()},{" "}
                {destination.getLng()}
            </Popup>
        </Marker>
    );

    const greenMarker = (
        <Marker
            // @ts-ignore
            position={origin.getLatLng()}
            icon={GreenMarker}
            interactive={true}
            draggable={true}
            eventHandlers={{
                click: () => {
                    setGreenVisible(false);
                    let newOrigin = copySearchPoint(origin);
                    newOrigin.setName("");
                    newOrigin.resetCoordinate();
                    setOrigin(newOrigin);
                },
                dragend: (e) => {
                    const newPosition = e.target.getLatLng();
                    let newOrigin = copySearchPoint(origin);
                    newOrigin.setLatLng(newPosition);
                    newOrigin.setName("");
                    setOrigin(newOrigin);
                },
            }}
        ></Marker>
    );

    const redMarker = (
        <Marker
            // @ts-ignore
            position={destination.getLatLng()}
            icon={RedMarker}
            interactive={true}
            draggable={true}
            eventHandlers={{
                click: () => {
                    setRedVisible(false);
                    let newDestination = copySearchPoint(destination);
                    newDestination.setName("");
                    newDestination.resetCoordinate();
                    setDestination(newDestination);
                },
                dragend: (e) => {
                    const newPosition = e.target.getLatLng();
                    let newDestination = copySearchPoint(destination);
                    newDestination.setLatLng(newPosition);
                    newDestination.setName("");
                    setDestination(newDestination);
                },
            }}
        ></Marker>
    );

    return (
        <>
            {!routing && redVisible && singleMarker}
            {routing && greenVisible && greenMarker}
            {routing && redVisible && redMarker}
            {routing && blueVisible && blueMarkers}
        </>
    );
}

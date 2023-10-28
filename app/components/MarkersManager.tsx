import { Marker, Popup, useMapEvents } from "react-leaflet";
import RedMarker from "./icons/RedMarker";
import GreenMarker from "./icons/GreenMarker";
import { LatLng } from "leaflet";
import { useState, useEffect } from "react";
import CreatePOIModal from "./CreatePOIModal";
import SavePOIModal from "./SavePOIModal";
export default function MarkersManager({
    setOrigin,
    setDestination,
    creatingRoute,
}: {
    setOrigin: (origin: string) => void;
    setDestination: (destination: string) => void;
    creatingRoute: boolean;
}) {
    // close modal when ESC key is pressed
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            // check which modal is open
            if (isModalOpen) {
                closeModal();
            } else if (isPOIModalOpen) {
                closePOIModal();
            }
        }
    };

    const [redPosition, setRedPosition] = useState<LatLng | null>(null);
    const [greenPosition, setGreenPosition] = useState<LatLng | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isPOIModalOpen, setIsPOIModalOpen] = useState<boolean>(false);

    let [poiLat, setPoiLat] = useState<number>(0);
    let [poiLon, setPoiLon] = useState<number>(0);

    // close modal when btn is clicked
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closePOIModal = () => {
        setIsPOIModalOpen(false);
        closeModal();
    };
    const storePos = (lat: number, lon: number) => {
        setPoiLat(lat);
        setPoiLon(lon);
    };

    const createPOI = () => {
        setIsPOIModalOpen(true);
        closeModal();
    };

    const savePOI = () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const type = (document.getElementById("type") as HTMLInputElement).value;
        closePOIModal();
    };

    /* useEffect modal popup */
    useEffect(() => {
        const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
        if (modal === null) {
            return;
        }
        if (isModalOpen) {
            modal.showModal();
            // if the modal is open, it means i need to store the lat and lon of the POI
            // before clicking the button to create the POI!!!
            storePos(redPosition!.lat, redPosition!.lng);
        } else {
            modal.close();
            setIsModalOpen(false);
        }
    }, [isModalOpen]);

    /* useEffect modal POI */
    useEffect(() => {
        const modal = document.getElementById("my_modal_2") as HTMLDialogElement;
        if (modal === null) {
            return;
        }
        if (isPOIModalOpen) {
            modal.showModal();
            closeModal();
        } else {
            modal.close();
            setIsPOIModalOpen(false);
        }
    }, [isPOIModalOpen]);

    useMapEvents({
        click: (e) => {
            if (creatingRoute) {
                if (greenPosition === null) {
                    setGreenPosition(e.latlng);
                    setOrigin(e.latlng.lat + "," + e.latlng.lng);
                } else {
                    setRedPosition(e.latlng);
                    setDestination(e.latlng.lat + "," + e.latlng.lng);
                }
            } else {
                setRedPosition(e.latlng);
                setIsModalOpen(true);
            }
        },
    });

    if (creatingRoute) {
        const redMarker = redPosition &&
            <Marker
                position={redPosition}
                icon={RedMarker}
                interactive={true}
                draggable={true}
                eventHandlers={{
                    click: () => setRedPosition(null),
                    dragend: (e) => {
                        const newPosition = e.target.getLatLng();
                        setRedPosition(newPosition);
                        setDestination(newPosition.lat + "," + newPosition.lng);
                    },
                }}>
            </Marker>
        const greenMarker = greenPosition &&
            <Marker
                position={greenPosition}
                icon={GreenMarker}
                interactive={true}
                draggable={true}
                eventHandlers={{
                    click: () => setGreenPosition(null),
                    dragend: (e) => {
                        const newPosition = e.target.getLatLng();
                        setGreenPosition(newPosition);
                        setOrigin(newPosition.lat + "," + newPosition.lng);
                    },
                }}>
            </Marker>
        return (
            <>
                {greenMarker}
                {redMarker}
            </>
        );
    } else if (redPosition) {
        return (
            <>
                <Marker
                    position={[poiLat, poiLon]}
                    icon={RedMarker}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const newPosition = marker.getLatLng();
                            setPoiLat(() => {
                                setPoiLat(newPosition.lat);
                                return newPosition.lat;
                            });

                            setPoiLon(() => {
                                setPoiLon(newPosition.lng);
                                return newPosition.lng;
                            });
                            setRedPosition(newPosition);
                        },
                    }}
                >
                    <Popup>
                        You are at {redPosition.lat.toFixed(4)},{" "}
                        {redPosition.lng.toFixed(4)}
                    </Popup>
                </Marker>
                <CreatePOIModal
                    latitude={poiLat}
                    longitude={poiLon}
                    onClose={closeModal}
                    onCreatePOI={createPOI}
                    handleKeyDown={handleKeyDown}
                />
                <SavePOIModal
                    poiLat={poiLat}
                    poiLon={poiLon}
                    onClose={closePOIModal}
                    onSavePOI={savePOI}
                    handleKeyDown={handleKeyDown}
                />
            </>
        );
    }
    return null;
}
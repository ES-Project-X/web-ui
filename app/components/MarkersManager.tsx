import { Marker, Popup, useMapEvents } from "react-leaflet";
import RedMarker from "./markers/RedMarker";
import GreenMarker from "./markers/GreenMarker";
import BlueMarker from "./markers/BlueMarker";
import { LatLng } from "leaflet";
import { useState, useEffect } from "react";
import { stringToLatLng } from "../utils/functions";
import { SearchPoint, copySearchPoint } from "../structs/SearchComponent";

let clickCount = 0;

export default function MarkersManager({
  origin,
  setOrigin,
  destination,
  setDestination,
  intermediates,
  setIntermediates,
  routing,
  togglePOIButton,
  setMarkerCoordinates,
}: {
  origin: SearchPoint;
  setOrigin: (origin: SearchPoint) => void;
  destination: SearchPoint;
  setDestination: (destination: SearchPoint) => void;
  intermediates: SearchPoint[];
  setIntermediates: (intermediate: SearchPoint[]) => void;
  routing: boolean;
  togglePOIButton: (visibility: boolean) => void;
  setMarkerCoordinates: React.Dispatch<
    React.SetStateAction<{ latitude: number; longitude: number }>
  >;
}) {
  const [redVisible, setRedVisible] = useState<boolean>(false);
  const [greenVisible, setGreenVisible] = useState<boolean>(false);
  const [blueVisible, setBlueVisible] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPOIModalOpen, setIsPOIModalOpen] = useState<boolean>(false);
  const [blueMarkers, setBlueMarkers] = useState<any[]>([]);

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

  // close modal when btn is clicked
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closePOIModal = () => {
    setIsPOIModalOpen(false);
    closeModal();
  };

  const createPOI = () => {
    setIsPOIModalOpen(true);
    closeModal();
  };

  const savePOI = () => {
    closePOIModal();
  };

  /* useEffect modal popup */
  useEffect(() => {
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
    if (modal === null) {
      return;
    }
    if (isModalOpen) {
      modal.open = true;
    } else {
      modal.open = false;
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
      modal.open = true;
      closeModal();
    } else {
      modal.open = false;
      setIsPOIModalOpen(false);
    }
  }, [isPOIModalOpen]);

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
      togglePOIButton(false);
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
      if (isModalOpen || isPOIModalOpen) {
        return;
      }
      setRedVisible(false);
      togglePOIButton(false);
    } else {
      setRedVisible(true);
      let newDestination = copySearchPoint(destination);
      newDestination.setLatLng(e.latlng);
      setDestination(newDestination);
      setMarkerCoordinates({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      togglePOIButton(true);
    }
  }

  useMapEvents({
    click: (e) => {
      if (!routing && redVisible) {
        setRedVisible(false);
        togglePOIButton(false);
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
        },
      }}
    >
      <Popup>
        You are at {destination.getLat().toFixed(4)},{" "}
        {destination.getLng().toFixed(4)}
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

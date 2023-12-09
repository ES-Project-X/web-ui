import { Marker, Popup, useMapEvents } from "react-leaflet";
import RedMarker from "./markers/RedMarker";
import GreenMarker from "./markers/GreenMarker";
import { LatLng } from "leaflet";
import { useState, useEffect } from "react";

let clickCount = 0;

export default function MarkersManager({
  setOrigin,
  setDestination,
  creatingRoute,
  togglePOIButton,
  setMarkerCoordinates,
}: {
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  creatingRoute: boolean;
  togglePOIButton: (visibility: boolean) => void;
  setMarkerCoordinates: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number; }>>;
}) {
  

  const [redPosition, setRedPosition] = useState<LatLng | null>(null);
  const [greenPosition, setGreenPosition] = useState<LatLng | null>(null);
  const [visibleSingleMarker, setVisibleSingleMarker] =
    useState<boolean>(false);

  function handleClick(e: any) {
    if (creatingRoute) {
      togglePOIButton(false);
      if (greenPosition === null) {
        setGreenPosition(e.latlng);
        setOrigin(e.latlng.lat + "," + e.latlng.lng);
      } else {
        setRedPosition(e.latlng);
        setDestination(e.latlng.lat + "," + e.latlng.lng);
      }
    } else if (visibleSingleMarker && redPosition) {
      togglePOIButton(false);
      setRedPosition(null);
      setVisibleSingleMarker(false);
    } else {
      setRedPosition(e.latlng);
      setVisibleSingleMarker(true);
      setMarkerCoordinates({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      togglePOIButton(true);
    }
  }

  useMapEvents({
    click: (e) => {
      if (!creatingRoute && visibleSingleMarker) {
        togglePOIButton(false);
        setRedPosition(null);
        setVisibleSingleMarker(false);
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

  if (creatingRoute) {
    const redMarker = redPosition && (
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
        }}
      ></Marker>
    );
    const greenMarker = greenPosition && (
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
        }}
      ></Marker>
    );
    return (
      <>
        {greenMarker}
        {redMarker}
      </>
    );
  } else if (visibleSingleMarker && redPosition) {
    return (
      <>
        <Marker
          position={redPosition}
          icon={RedMarker}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              setRedPosition(e.target.getLatLng());
            },
          }}
        >
          <Popup>
            You are at {redPosition.lat.toFixed(4)},{" "}
            {redPosition.lng.toFixed(4)}
          </Popup>
        </Marker>
      </>
    );
  }
  return null;
}

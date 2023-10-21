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
    setOrigin: (origin: string) => void
    setDestination: (destination: string) => void
    creatingRoute: boolean
                                       }) {

  // close modal when ESC key is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") {
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
    console.log("create POI");
    console.log("lat:", poiLat.toFixed(3));
    console.log("lon:", poiLon.toFixed(3));
    // open modal to create POI
    setIsPOIModalOpen(true);
    closeModal();
  };

  const savePOI = () => {
    console.log("save POI to DB");
    // after saving POI, close modals
    // get name and type from form
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const type = (document.getElementById("type") as HTMLInputElement).value;

    // validate name and type are not empty strings
    if (name === "" || type === "") {
      alert("Name and type cannot be empty!");
      closePOIModal();
      return;
    }

    // validate that name and type are not too long
    if (name.length > 20 || type.length > 20) {
      alert("Name and type cannot be longer than 20 characters!");
      closePOIModal();
      return;
    }

    console.log("name:", name);
    console.log("type:", type);
    console.log("lat:", poiLat.toFixed(3));
    console.log("lon:", poiLon.toFixed(3));
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
      //
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
                    setGreenPosition(e.latlng)
                    setOrigin(e.latlng.lat + "," + e.latlng.lng)
                } else {
                    setRedPosition(e.latlng)
                    setDestination(e.latlng.lat + "," + e.latlng.lng)
                }
            }
            else {
                setRedPosition(e.latlng)
                setIsModalOpen(true);
            }
        }
    })

  if (creatingRoute) {
    if (greenPosition !== null && redPosition !== null) {
      return (
        <>
          <Marker
            position={greenPosition}
            icon={GreenMarker}
            interactive={true}
            eventHandlers={{ click: () => setGreenPosition(null) }}
          ></Marker>
          <Marker
            position={redPosition}
            icon={RedMarker}
            interactive={true}
            eventHandlers={{ click: () => setRedPosition(null) }}
          ></Marker>
        </>
      );
    } else if (greenPosition !== null) {
      return (
        <Marker
          position={greenPosition}
          icon={GreenMarker}
          interactive={true}
          eventHandlers={{ click: () => setGreenPosition(null) }}
        ></Marker>
      );
    } else if (redPosition !== null) {
      return (
        <Marker
          position={redPosition}
          icon={RedMarker}
          interactive={true}
          eventHandlers={{ click: () => setGreenPosition(null) }}
        ></Marker>
      );
    }
    return null;
  }
  return redPosition === null ? null : (
    <>
      <Marker position={redPosition} icon={RedMarker}>
        <Popup>
          You are at {redPosition.lat.toFixed(4)}, {redPosition.lng.toFixed(4)}
        </Popup>
      </Marker>

      {/* Modal with btn to create POI */}

      <CreatePOIModal
        latitude={poiLat}
        longitude={poiLon}
        onClose={closeModal}
        onCreatePOI={createPOI}
      />

      {/* Modal to fill form to save POI */}

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
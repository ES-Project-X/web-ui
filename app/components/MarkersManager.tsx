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
  const [canCreateMarker, setCanCreateMarker] = useState<boolean>(true); // set to true at the beginning

  let [poiLat, setPoiLat] = useState<number>(0);
  let [poiLon, setPoiLon] = useState<number>(0);

  // close modal when btn is clicked
  const closeModal = () => {
    setIsModalOpen(false);
    setCanCreateMarker(false);
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
      return;
    }

    // validate that name and type are not too long
    else if (name.length > 20 || type.length > 20) {
      return;
    }
     
    else {
      console.log("name:", name);
    console.log("type:", type);
    console.log("lat:", poiLat.toFixed(3));
    console.log("lon:", poiLon.toFixed(3));
    closePOIModal();
    }
    
  };

  /* useEffect modal popup */
  useEffect(() => {
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
    if (modal === null) {
      console.log("modal1 is null");
      return;
    }
    if (isModalOpen) {
      console.log("modal is open");
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
      console.log("modal2 is null");
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
        console.log("inhere");
        setIsModalOpen(true);
        setCanCreateMarker(false);
      }
    },
  });

  if (creatingRoute) {
    if (greenPosition !== null && redPosition !== null) {
      return (
        <>
          <Marker
            position={greenPosition}
            icon={GreenMarker}
            interactive={true}
            draggable={true}
            eventHandlers={{
              click: () => setGreenPosition(null),
              dragend: (e) => {
                console.log("hey!!!");
                console.log("coords before:", greenPosition);
                // just need to update the coordinates of the marker here
                const newPosition = e.target.getLatLng();
                setGreenPosition(newPosition);
                setOrigin(newPosition.lat + "," + newPosition.lng);
                console.log("coords after:", greenPosition);
              },
            }}
          ></Marker>
          <Marker
            position={redPosition}
            icon={RedMarker}
            interactive={true}
            draggable={true}
            eventHandlers={{
              click: () => setRedPosition(null),
              dragend: (e) => {
                console.log("hey!!!");
                console.log("coords before:", redPosition);
                // just need to update the coordinates of the marker here
                const newPosition = e.target.getLatLng();
                setRedPosition(newPosition);
                setDestination(newPosition.lat + "," + newPosition.lng);  
                console.log("coords after:", redPosition);


              },
            }}
          ></Marker>
        </>
      );
    } else if (greenPosition !== null) {
      return (
        <Marker
          position={greenPosition}
          icon={GreenMarker}
          interactive={true}
          eventHandlers={{
            click: () => setGreenPosition(null),
            dragend: (e) => {
              console.log("hey!!!");
              
            },
          }}
        ></Marker>
      );
    } else if (redPosition !== null) {
      return (
        <Marker
          position={redPosition}
          icon={RedMarker}
          interactive={true}
          eventHandlers={{
            click: () => setRedPosition(null),
            dragend: (e) => {
              console.log("hey!!!");
              // just need to update the coordinates of the marker here
            },
          }}
        ></Marker>
      );
    }
    return null;
  }
  return redPosition === null ? null : (
    <>
      {canCreateMarker && redPosition && (
        <Marker position={redPosition} icon={RedMarker}>
          <Popup>
            You are at {redPosition.lat.toFixed(4)},{" "}
            {redPosition.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}

      {/* Modal with btn to create POI */}
      {isModalOpen && !isPOIModalOpen && (
        <>
          {/* add the marker */}
          <Marker position={[poiLat, poiLon]} icon={RedMarker}>
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
        </>
      )}

      {!isModalOpen && (
        <>
          {/* add the marker */}

          <Marker
            position={[poiLat, poiLon]}
            icon={RedMarker}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newPosition = marker.getLatLng();

                // Update the poiLat and poiLon using the callback function
                setPoiLat((prevLat) => {
                  console.log("Previous lat:", prevLat.toFixed(3));
                  console.log("New lat:", newPosition.lat.toFixed(3));
                  setPoiLat(newPosition.lat);
                  return newPosition.lat;
                });

                setPoiLon((prevLon) => {
                  console.log("Previous lon:", prevLon.toFixed(3));
                  console.log("New lon:", newPosition.lng.toFixed(3));
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
        </>
      )}

      {/* Modal to fill form to save POI - 2nd modal*/}
      {isPOIModalOpen && (
        <>
          {/* add the marker */}
          <Marker position={[poiLat, poiLon]} icon={RedMarker}>
            <Popup>
              You are at {redPosition.lat.toFixed(4)},{" "}
              {redPosition.lng.toFixed(4)}
            </Popup>
          </Marker>
          <SavePOIModal
            poiLat={poiLat}
            poiLon={poiLon}
            onClose={closePOIModal}
            onSavePOI={savePOI}
            handleKeyDown={handleKeyDown}
          />
        </>
      )}
    </>
  );
}

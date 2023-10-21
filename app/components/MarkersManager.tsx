import { Marker, Popup, useMapEvents } from "react-leaflet";
import RedMarker from "./icons/RedMarker";
import GreenMarker from "./icons/GreenMarker";
import { LatLng } from "leaflet";
import { useEffect, useState } from "react";

export default function MarkersManager({
  creatingRoute = false,
}: {
  creatingRoute?: boolean;
}) {
  const [redPosition, setRedPosition] = useState<LatLng | null>(null);
  const [greenPosition, setGreenPosition] = useState<LatLng | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPOIModalOpen, setIsPOIModalOpen] = useState<boolean>(false);

  var [poiLat, setPoiLat] = useState<number>(0);
  var [poiLon, setPoiLon] = useState<number>(0);

  // close modal when btn is clicked
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closePOIModal = () => {
    setIsPOIModalOpen(false);
    closeModal();
  };

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

  const storePos = (lat: number, lon: number) => {
    console.log("store pos func ");
    console.log("lat:", lat.toFixed(3));
    console.log("lon:", lon.toFixed(3));

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

  /* useEffect modal popup */
  useEffect(() => {
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
    if (modal === null) {
      return;
    }
    if (isModalOpen) {
      modal.showModal();
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
          setGreenPosition(e.latlng);
        } else {
          setRedPosition(e.latlng);
        }
      } else {
        setRedPosition(e.latlng);
        console.log(e.latlng);
        setIsModalOpen(true);
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

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">
            Here are the coordinates of the marker you clicked:
            <br />
            <br />
            Latitude: {redPosition.lat.toFixed(3)}
            <br />
            Longitude: {redPosition.lng.toFixed(3)}
          </p>
          <div className="modal-action">
            <button
              className="btn glass"
              onKeyDown={handleKeyDown}
              // set lat and lon of POI to create in state
              onClick={() => {
                createPOI();
              }}
            >
              Create POI
            </button>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button
                className="btn"
                onClick={closeModal}
                onKeyDown={handleKeyDown}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Modal to fill form to save POI */}

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">Create POI</h3>
          <p className="py-4">
            Here isjhon CENA
            <br />
            Here are the coordinates of the marker you clicked:
            <br />
            <br />
            Latitude: {redPosition.lat.toFixed(3)}
            <br />
            Longitude: {redPosition.lng.toFixed(3)}
            <br />
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}

              <button className="btn glass" onKeyDown={handleKeyDown}>
                Save POI
              </button>
              <button
                className="btn"
                onClick={closePOIModal}
                onKeyDown={handleKeyDown}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

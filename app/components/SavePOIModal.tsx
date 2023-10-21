import React, { useState } from "react";

interface SavePOIModalProps {
  poiLat: number;
  poiLon: number;
  onSavePOI: (name: string, type: string) => void;
  onClose: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const SavePOIModal: React.FC<SavePOIModalProps> = ({
  poiLat,
  poiLon,
  onSavePOI,
  onClose,
  handleKeyDown,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const handleSavePOI = () => {
    onSavePOI(name, type);
  };

  return (
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-center">Create POI</h3>
        <form method="dialog">
          <div className="py-4">
            <div className="mb-4">
              Here are the coordinates of the marker you clicked:
              <br />
              <br />
              Latitude: {poiLat.toFixed(3)}
              <br />
              Longitude: {poiLon.toFixed(3)}
            </div>
            <div className="mb-4">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                placeholder="Type the name here"
                className="input input-bordered w-full max-w-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="type">Type:</label>
              <input
                type="text"
                id="type"
                placeholder="Write the type here"
                className="input input-bordered w-full max-w-xs"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-action">
            <button className="btn glass" onKeyDown={handleKeyDown} onClick={handleSavePOI}>
              Save POI
            </button>
            <button className="btn" onClick={onClose} onKeyDown={handleKeyDown}>
              Close
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default SavePOIModal;

import React from "react";

interface CreatePOIModalProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
  onCreatePOI: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const CreatePOIModal: React.FC<CreatePOIModalProps> = ({
  latitude,
  longitude,
  onClose,
  onCreatePOI,
  handleKeyDown,
}) => {
  return (
    <dialog id="my_modal_1" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Hello!</h3>
        <p className="py-4">
          Here are the coordinates of the marker you clicked:
          <br />
          <br />
          Latitude: {latitude.toFixed(3)}
          <br />
          Longitude: {longitude.toFixed(3)}
        </p>
        <div className="modal-action">
          <button
            className="btn glass"
            onKeyDown={handleKeyDown}
            onClick={onCreatePOI}
          >
            Save POI
          </button>
          <button className="btn" onClick={onClose} onKeyDown={handleKeyDown}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default CreatePOIModal;
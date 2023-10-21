import React from "react";

interface CreatePOIModalProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
  onCreatePOI: () => void;
}

const CreatePOIModal: React.FC<CreatePOIModalProps> = ({
  latitude,
  longitude,
  onClose,
  onCreatePOI,
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
          <button className="btn glass" onClick={onCreatePOI}>
            Create POI
          </button>
          <form method="dialog">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default CreatePOIModal;

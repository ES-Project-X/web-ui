import { useState } from "react";

interface SavePOIModalProps {
    poiLat: number;
    poiLon: number;
    onSavePOI: (name: string, type: string, image: File | null) => void;
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
    const [image, setImage] = useState<File | null>(null);
    const [errors, setErrors] = useState<{ name: string; type: string; image: string }>({
        name: "",
        type: "",
        image: "",
    });

    const handleSavePOI = () => {
        if (validateForm()) {
            onSavePOI(name, type, image);
        }
    };

    const validateForm = () => {
        const newErrors = { name: "", type: "", image: "" };
        let valid = true;

        if (name.trim() === "") {
            newErrors.name = "Name is required";
            valid = false;
        }

        if (type.trim() === "") {
            newErrors.type = "Type is required";
            valid = false;
        }

        if (!image) {
            newErrors.image = "Image is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setImage(selectedFile || null);
    };

    return (
        <dialog id="my_modal_2" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-center">Create POI</h3>
                <form method="dialog" onSubmit={(e) => e.preventDefault()}>
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
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Type the name here"
                                className="input input-bordered w-full max-w-xs"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div className="text-red-500 text-sm">{errors.name}</div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Type:
                            </label>
                            <input
                                type="text"
                                id="type"
                                placeholder="Write the type here"
                                className="input input-bordered w-full max-w-xs"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <div className="text-red-500 text-sm">{errors.type}</div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                Image:
                            </label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div className="text-red-500 text-sm">{errors.image}</div>
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const TOKEN = Cookies.get("COGNITO_TOKEN");
const URL_API = process.env.DATABASE_API_URL;

export default function CreatePOIPage() {
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState("");
    const [image_type, setImageType] = useState("");
    const [image_url, setImageUrl] = useState("");
    const [errors, setErrors] = useState<{
        name: string;
        type: string;
        image: string;
    }>({
        name: "",
        type: "",
        image: "",
    });

    const [poiLat, setPoiLat] = useState<number>(0);
    const [poiLon, setPoiLon] = useState<number>(0);

    function redirect(path: string) {
        window.location.replace(path);
    }

    useEffect(() => {
        if (!TOKEN) {
            redirect("/map");
        }
        // Get query parameters from URL
        const searchParams = new URLSearchParams(window.location.search);
        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");
        if (lat && lon) {
            setPoiLat(parseFloat(lat));
            setPoiLon(parseFloat(lon));
        } else {
            redirect('/map');
        }
    }, []);

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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImage = e.target.files?.[0];

        const maxFileSize = 4 * 1024 * 1024; // file needs to be less than 4MB (change as needed)

        if (!selectedImage) {
            return;
        }

        if (selectedImage && selectedImage.size > maxFileSize) {
            alert("Image must be less than 4MB");
            return;
        }
        setImage(selectedImage);
    };

    const handleUpload = async () => {
        if (!image) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result?.toString();
            if (base64String) {
                setImageType(image.type);
                setImageBase64(base64String);
            }
        }
        reader.readAsDataURL(image);
    };

    useEffect(() => {
        if (!imageBase64) {
            return;
        }
        axios.post(
            URL_API + "s3/upload",
            { base64_image: imageBase64, image_type: image_type },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${TOKEN}`,
                },
            }
        )
            .then((res) => {
                if (res.status === 200) {
                    return res.data;
                } else if (res.status === 400) {
                    throw new Error("Error uploading image");
                }
            })
            .then((data) => {
                setImageUrl(data.image_url);
                submitPOI(data.image_url);
            });
    }, [imageBase64]);

    async function submitPOI(data_image_url: string) {
        fetch(URL_API + "poi/create",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${TOKEN}`,
                },
                body: JSON.stringify({
                    latitude: poiLat,
                    longitude: poiLon,
                    name: name,
                    description: description,
                    type: type,
                    picture_url: data_image_url,
                }),
            })
            .then((response) => {
                if (response.status === 200) {
                    redirect("/map");
                } else {
                    throw new Error("Error creating POI");
                }
            })
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
    };

    return (
        <div className="min-h-screen h-full w-full bg-white text-black bg-gradient-to-b from-0% from-green-500 via-white via-80%  to-white to-100%">
            <div className="p-4">
                <button className="bg-white text-black bg-opacity-20 py-2 px-4 rounded h-10" onClick={() => redirect("/map")}>
                    Back
                </button>
            </div>
            <h2 className="font-extrabold text-4xl text-center">Create POI</h2>
            <div className="container mx-auto pt-8">
                <div className="mx-auto px-4">
                    <div className="py-2">
                        <div className="mb-4">
                            <span className="font-bold">
                                Here are the coordinates of the marker you clicked:
                            </span>
                            <div className="flex flex-col">
                                <br />
                                <span className="font-bold">
                                    Latitude: {poiLat}
                                </span>
                                <span className="font-bold">
                                    Longitude: {poiLon}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-bold text-gray-900 w-full max-x-ws"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Type the name here"
                                    className="input input-bordered w-full bg-slate-800 text-white"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className="text-red-500 text-sm">{errors.name}</div>
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="countries"
                                    className="block mb-2 text-sm font-bold text-gray-900  max-x-ws"
                                >
                                    Select an option for the type
                                </label>
                                <select
                                    id="countries"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={type}
                                    onChange={handleTypeChange}
                                >
                                    <option value="">Choose a type</option>
                                    <option value="bicycle-parking">Bycicle Parking</option>
                                    <option value="bicycle-shop">Bycicle Shop</option>
                                    <option value="drinking-water">Drinking Water</option>
                                    <option value="bench">Bench</option>
                                    <option value="toilets">Toilets</option>
                                </select>
                                <div className="text-red-500 text-sm">{errors.type}</div>
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="description"
                                    className="block mb-2 text-sm font-bold text-gray-900 w-full max-x-ws"
                                >
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    placeholder="Type the description here"
                                    className="input input-bordered w-full bg-slate-800 text-white"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="image"
                                    className="block mb-2 text-sm font-bold text-gray-900 max-x-ws"
                                >
                                    Take a Picture
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div className="text-red-500 text-sm">{errors.image}</div>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    className="bg-green-600 text-white py-2 px-4 rounded h-10"
                                    onClick={() => { if (validateForm()) handleUpload(); }}
                                >
                                    Save POI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

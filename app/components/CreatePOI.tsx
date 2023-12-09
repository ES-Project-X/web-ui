import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function CreatePOIPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState<File | null>(null);
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

  useEffect(() => {
    // Get query parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    // console.log("searchParams", searchParams);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    // console.log("lat", lat);
    // console.log("lng", lng);

    // Set latitude and longitude values
    if (lat && lng) {
      setPoiLat(parseFloat(lat));
      setPoiLon(parseFloat(lng));
    }
  }, []);

  const handleSavePOI = () => {
    if (validateForm()) {
      // Perform save POI action
      console.log("POI saved:", name, type, image);
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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  };

  return (
    <div className="min-h-screen  text-black">
      <section className="relative h-screen/2 pt-32 flex items-center justify-center overflow-hidden">
        {/* Linear gradient overlay for fading effect */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0, 176, 80, 1.5), rgba(0, 0, 255, 0))",
          }}
        >
          <div className="absolute top-0 left-0 p-4">
            <Link href="/map">
              <button className="bg-white text-black bg-opacity-20 py-2 px-4 rounded h-10">
                Back
              </button>
            </Link>
          </div>
          <h3 className="pt-24 font-bold text-lg text-center">Create POI</h3>
        </div>
      </section>
      <main className="container mx-auto py-8">
        <div className="mx-auto px-4">
          <div className="py-2">
            <div className="mb-4">
              Here are the coordinates of the marker you clicked:
              <br />
              <br />
              Latitude: {poiLat.toFixed(3)}
              <br />
              Longitude: {poiLon.toFixed(3)}
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 w-full max-x-ws"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Type the name here"
                  className="input input-bordered w-full max-w-xs bg-slate-800 text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="text-red-500 text-sm">{errors.name}</div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="countries"
                  className="block mb-2 text-sm font-medium text-gray-900  max-x-ws"
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
                  <option value="bpark">Bycicle Parking</option>
                  <option value="bshop">Bycicle Shop</option>
                  <option value="water">Drinking Water</option>
                  <option value="bench">Bench</option>
                  <option value="toilet">Toilets</option>
                </select>
                <div className="text-red-500 text-sm">{errors.type}</div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block mb-2 text-sm font-medium text-gray-900 max-x-ws"
                >
                  Select an Image:
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="text-red-500 text-sm">{errors.image}</div>
              </div>
              <div className="flex justify-center p-3">
                <div className="mr-3">
                  <button
                    className="bg-dark text-white bg-opacity-20 py-2 px-4 rounded h-10"
                    onClick={handleSavePOI}
                  >
                    Save POI
                  </button>
                </div>
                <div>
                  <button
                    className="bg-red-500 border-red-500 text-white py-2 px-6 rounded h-10"
                    onClick={() => window.history.back()}
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

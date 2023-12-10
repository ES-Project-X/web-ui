import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";


const TOKEN = Cookies.get('COGNITO_TOKEN')
const URL_API = process.env.DATABASE_API_URL;

export default function CreatePOIPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
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
  const [poiImageURL, setPoiImageURL] = useState("");
  const [imageIsPosted, setImageIsPosted] = useState(false);

  function redirect(path: string) {
    window.location.replace(path);
  }

  useEffect(() => {
    if (!TOKEN) {
      redirect('/map');
    }
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


  const handleUpload = () => {
    return new Promise((resolve, reject) => {
      if (!image) {
        // Handle case where no image is selected
        reject(new Error("No image selected"));
        return;
      }

      const formData = new FormData();
      formData.append('file', image);

      axios.post(URL_API + 's3/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${TOKEN}`,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            resolve(res.data);
          } else {
            reject(new Error("Error uploading image"));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const handleSavePOI = async () => {
    try {
      if (validateForm()) {
        const uploadedData = await handleUpload();

        const newPOI = {
          latitude: poiLat,
          longitude: poiLon,
          name: name,
          description: description,
          type: type,
          picture_url: (uploadedData as { url: string }).url,
        };

        console.log(newPOI);

        const saveResponse = await axios.post(URL_API + 'poi/create', newPOI, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        if (saveResponse.status === 200) {
          console.log("DONE SAVING POI");
          
          redirect('/map');
          
        } else {
          throw new Error("Error saving POI");
        }
      }
    } catch (err) {
      console.log(err);
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
    const selectedImage = e.target.files?.[0];
    console.log(selectedImage);
    const maxFileSize = 4 * 1024 * 1024; // file needs to be less than 4MB (change as needed)

    if (selectedImage && selectedImage.size > maxFileSize) {
      alert("Image must be less than 4MB");
      return;
    }

    setImage(selectedImage || null);

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
                  className="block mb-2 text-sm font-medium text-gray-900 w-full max-x-ws"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  placeholder="Type the description here"
                  className="input input-bordered w-full max-w-xs bg-slate-800 text-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
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
                  onChange={handleImageChange
                  }
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
                    onClick={() => redirect('/map')}
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

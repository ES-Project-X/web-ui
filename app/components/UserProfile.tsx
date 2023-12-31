import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { UserData } from "../structs/user";
import { isMobile } from "react-device-detect";
import axios from "axios";

const TOKEN = Cookies.get("COGNITO_TOKEN");
const URL_API = process.env.DATABASE_API_URL;

export default function UserProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [total_xp, setTotal_xp] = useState(0);
    const [added_pois_count, setAddedPoiCount] = useState(0);
    const [received_ratings_count, setReceivedRatingCount] = useState(0);
    const [given_ratings_count, setGivenRatingCount] = useState(0);
    const [levelInfo, setLevelInfo] = useState<LevelInfo>({
        currentLevel: 1,
        xpToNextLevel: 500,
        progress: 0,
    });

    const [formUsername, setFormUsername] = useState("");

    const [image, setImage] = useState<File | null>(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [imageBase64, setImageBase64] = useState("");
    const [image_type, setImageType] = useState("");
    let userChanges = {};

    useEffect(() => {
        if (!TOKEN) {
            redirect("/map");
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "user");

        fetch(url.toString(), { headers })
            .then(async (res) => {
                if (res.status !== 200) {
                    redirect("/map");
                }
                const user: UserData = await res.json();

                if (user) {
                    setAvatar(user.image_url);
                    setFname(user.first_name);
                    setLname(user.last_name);
                    setUsername(user.username);
                    setEmail(user.email);
                    setFormUsername(user.username);
                    setTotal_xp(user.total_xp);
                    setAddedPoiCount(user.added_pois_count);
                    setReceivedRatingCount(user.received_ratings_count);
                    setGivenRatingCount(user.given_ratings_count);
                    setLevelInfo(calculateLevelAndXP(user.total_xp));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    function redirect(path: string) {
        window.location.replace(path);
    }

    const updateProfile = () => {
        if (!imageChanged) {
            userChanges = {
                ...userChanges,
                username: formUsername,
            };
        }

        fetch(URL_API + "user/edit", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify(userChanges),
        })
            .then((res) => {
                if (res.status === 200) {
                    return res.json();
                } else if (res.status === 400) {
                    throw new Error("Error updating user");
                }
            })
            .then((data) => {
                localStorage.setItem("user", JSON.stringify(data));
                setUsername(data.username);
                setAvatar(data.image_url);
                setEmail(data.email);
                setFormUsername(data.username);
                setIsEditing(false);
            })
            .catch((err) => {
                console.log("error:", err);
            });

        userChanges = {};
    };

    function logout() {
        Cookies.remove("COGNITO_TOKEN");
        localStorage.removeItem("user");
        window.location.replace("/map");
    }

    function calculateLevelAndXP(totalXP: number): LevelInfo {
        let xp_copy = totalXP;

        // floor division by 500 to get the level
        let level = Math.floor(xp_copy / 500);

        // check if remainder is greater than 0
        let reminder = xp_copy % 500;

        // if remainder is greater than 0, add 1 to level
        if (reminder > 0) {
            level++;
        } else if (reminder === 0) {
            // if remainder is 0, level up

            level++;
            return {
                currentLevel: level,
                xpToNextLevel: level * 500,
                progress: 0,
            };
        }

        let xpToNextLevel = level * 500;

        let abs_xp = Math.abs(xp_copy - xpToNextLevel);
        let progress = Math.floor(((500 - abs_xp) / 500) * 100);

        return {
            currentLevel: level,
            xpToNextLevel: xpToNextLevel,
            progress: progress,
        };
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImage = e.target.files?.[0];

        const maxFileSize = 12 * 1024 * 1024; // file needs to be less than 12MB (change as needed)

        if (!selectedImage) {
            return;
        }

        if (selectedImage && selectedImage.size > maxFileSize) {
            alert("Image must be less than 12MB");
            return;
        }
        setImage(selectedImage);
        setImageChanged(true);

        // Reset the value of the file input field
        e.target.value = "";
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
                setImageBase64(base64String.split(",")[1]);
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
                const newImageUrl = data.image_url;
                userChanges = { ...userChanges, image_url: newImageUrl };
                updateProfile();
            });

        userChanges = {};
        setImageChanged(false);
        setImage(null);
        setIsEditing(false);
    }, [imageBase64]);

    const cancelUpload = () => {
        setImageChanged(false);
        setImage(null);
        setIsEditing(false);

        // Reset the value of the file input field
        (document.getElementById("image") as HTMLInputElement).value = "";
    };

    return (
        <div className="min-h-screen h-fit w-full bg-white text-black bg-gradient-to-b from-0% from-green-500 via-white via-80% to-white to-100%">
            <div className="h-screen/3 flex items-center justify-center overflow-hidden flex-col">
                <div className="flex p-4 w-full">
                    <button className="bg-white text-black bg-opacity-20 py-2 px-4 rounded mr-auto" onClick={() => { redirect("/map") }}>
                        Map
                    </button>
                    <button
                        className="bg-white text-black py-2 px-4 rounded ml-auto"
                        onClick={() => {
                            redirect("/routes");
                        }}
                    >
                        Routes
                    </button>
                </div>
                {/* Content */}
                <div className="text-center z-20 flex flex-col items-center justify-center">
                    {/* Adjusted image and XP bar */}
                    <div className="flex flex-col items-center">
                        {isMobile ? (
                            <div className="flex flex-col items-center relative">
                                <img
                                    src={avatar}
                                    alt={`${fname} ${lname}'s avatar`}
                                    className="w-48 h-48 object-cover rounded-full cursor-pointer border-4 border-white"
                                />
                                {isEditing && (
                                    <div className="flex flex-col items-center mt-2 w-56">
                                        <label className="absolute w-full bg-gray-400 text-white py-2 px-4 rounded cursor-pointer">
                                            Change Profile Picture
                                        </label>
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            className="w-full py-2 rounded cursor-pointer z-10 opacity-0"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex group justify-center">
                                <img
                                    src={avatar}
                                    alt={`${fname} ${lname}`}
                                    className="absolute w-48 h-48 object-cover rounded-full opacity-90 group-hover:opacity-50 border-4 border-white"
                                />
                                <label
                                    className="absolute flex justify-center items-center w-48 h-48 text-white rounded-full opacity-5 group-hover:opacity-70"
                                    htmlFor="image"
                                >
                                    Change Profile Picture
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    className="w-48 h-48 opacity-0 cursor-pointer rounded-full"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}
                        {imageChanged && (
                            <div className="row justify-center">
                                <label className="text-white mt-4">
                                    Accept Profile Picture Changes?
                                </label>
                                <button
                                    className="btn btn-success my-3 w-25 m-2"
                                    onClick={() => handleUpload()}
                                >
                                    Accept
                                </button>
                                <button
                                    className="btn btn-danger my-3 w-25 m-2"
                                    onClick={() => cancelUpload()}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {(!isEditing && (
                            <>
                                <h1 className="text-2xl font-semibold mt-2">
                                    {fname} {lname}
                                </h1>
                                <h2 className="text-sm">{username} - {email}</h2>
                                <div className="w-full bg-gray-300 rounded-full overflow-hidden">
                                    <div
                                        className="bg-green-500 h-4"
                                        style={{ width: `${levelInfo.progress}%` }}
                                    />
                                </div>
                                <p className="mt-2">
                                    XP: {total_xp} / {levelInfo.xpToNextLevel}
                                </p>
                                <p>Level: {levelInfo.currentLevel}</p>
                            </>
                        )) || (
                                <>
                                    <h1 className="text-2xl font-semibold pt-3">
                                        {fname} {lname}{" "}
                                        <h5 className="text-sm pt-3">{formUsername}</h5>
                                    </h1>
                                </>
                            )}
                        {!isEditing && (
                            <button
                                className="bg-green-900 text-black bg-opacity-20 py-2 px-4 rounded"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                Modify Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <main className="container mx-auto py-8">
                <div className="flex justify-center">
                    {!isEditing ? (
                        <>
                            <details className="dropdown bg-white rounded-lg shadow-md p-8 justify-center text-center ">
                                <summary className="flex text-center justify-center text-gray-800 active:border-gray-200 active:border-2 p-2 rounded-lg uppercase">
                                    <div className="flex">
                                        <span className="mr-1">User Statistics</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </summary>
                                <div className="flex flex-col w-full">
                                    <div className="grid h-15 bg-transparent bg-base-300 place-items-center pt-3">
                                        <div className="flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">
                                                Total Added POIs: {added_pois_count}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="grid h-15 bg-transparent bg-base-300 place-items-center">
                                        <div className="flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">
                                                Total Received Ratings: {received_ratings_count}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="grid h-15 bg-transparent bg-base-300 place-items-center">
                                        <div className="flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">
                                                Total Given Ratings: {given_ratings_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </>
                    ) : (
                        <div className="justify-center items-center text-center">
                            <div className="col-md-12 justify-content-center">
                                <div className="mb-4 flex flex-col items-center">
                                    <label className="form-control w-full max-w-md mb-2">
                                        <span className="label-text">Change username</span>
                                        <input
                                            type="text"
                                            placeholder="New username"
                                            className="input input-bordered w-full max-w-md bg-gray-200"
                                            onChange={(e) => setFormUsername(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="flex justify-center mt-4">
                                    {isEditing && (
                                        <>
                                            <button
                                                className="mr-2 bg-green-900 text-black bg-opacity-20 py-2 px-4 rounded"
                                                onClick={() => updateProfile()}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                className="bg-red-500 border-red-500 text-white py-2 px-4 rounded"
                                                onClick={() => cancelUpload()}
                                            >
                                                Cancel Changes
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-4">
                    {!isEditing && (
                        <button
                            className="bg-red-500 border-red-500 text-white py-2 px-4 rounded"
                            onClick={() => {
                                logout();
                            }}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

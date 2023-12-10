import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { UserData } from "../structs/user";
import { isMobile } from "react-device-detect";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faMapMarkerAlt,
  faStar,
  faStarHalfAlt,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Add icons to the library
library.add(faMapMarkerAlt, faStar, faStarHalfAlt);

const TOKEN = Cookies.get("COGNITO_TOKEN");
const URL_API = process.env.DATABASE_API_URL;

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [total_xp, setTotal_xp] = useState(0);
  const [added_pois_count, setAddedPoiCount] = useState(0);
  const [received_ratings_count, setReceivedRatingCount] = useState(0);
  const [given_ratings_count, setGivenRatingCount] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    currentLevel: 1,
    xpToNextLevel: 500,
    xpForCurrentLevel: 0,
    progress: 0,
  });

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  let userChanges = {};

  const updateProfile = () => {
    if (formPassword === "") {
      setFormUsername(username);
      setFormEmail(email);
      setIsEditing(false);
      alert("Password cannot be empty");
      return;
    }

    if (formUsername === username && formEmail === email) {
      setIsEditing(false);
      alert("No changes to be made");
      return;
    }

    if (formUsername !== username) {
      userChanges = { ...userChanges, username: formUsername };
    }

    if (formEmail !== email) {
      userChanges = { ...userChanges, email: formEmail };
    }

    if (formPassword !== "") {
      userChanges = { ...userChanges, password: formPassword };
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
        setEmail(data.email);
        setFormUsername(data.username);
        setFormEmail(data.email);
        setPassword("");
        alert("User updated successfully");
        setIsEditing(false);
      })
      .catch((err) => {
        console.log("error:", err);
      });
  };

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
          return;
        }
        const user: UserData = await res.json();

        if (user) {
          setAvatar(user.image_url);
          setFname(user.first_name);
          setLname(user.last_name);
          setUsername(user.username);
          setEmail(user.email);
          setFormEmail(user.email);
          setFormUsername(user.username);
          setTotal_xp(user.total_xp);
          setAddedPoiCount(user.added_pois_count);
          setReceivedRatingCount(user.received_ratings_count);
          setGivenRatingCount(user.given_ratings_count);
          setLevelInfo(calculateLevelAndXP(user.total_xp));
        }
        console.log(user);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function logout() {
    console.log("logout");
    Cookies.remove("COGNITO_TOKEN");
    localStorage.removeItem("user");
    window.location.replace("/map");
  }


  /* TODO: FIX this */
  function calculateLevelAndXP(totalXP: number): LevelInfo {
    let baseXP = 500;

    let level = Math.floor(totalXP / baseXP);
    let level_count = 1;
    let restXp = totalXP % baseXP;

    if (level * baseXP < totalXP) {
      level++;
      level_count++;
    }
    console.log("restXp:", restXp);
    console.log("level:", level);
    console.log("level_count:", level_count);

    let maxXpNextLevel = baseXP + level_count * 500;
    console.log("maxXpNextLevel:", maxXpNextLevel);

    let xpForCurrentLevel = totalXP - restXp;
    console.log("xpForCurrentLevel:", xpForCurrentLevel);

    let progress = (xpForCurrentLevel / maxXpNextLevel) * 100;
    console.log("progress:", progress);

    return {
      currentLevel: level,
      xpToNextLevel: maxXpNextLevel,
      xpForCurrentLevel: xpForCurrentLevel,
      progress: progress,
    };
  }

  function handleImageChange() {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {" "}
      {/* bg-blue-900 */}
      {/* Banner + Avatar Section */}
      <section className="relative h-screen/3 flex items-center justify-center overflow-hidden">
        {/* Linear gradient overlay for fading effect */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0, 176, 80, 1.5), rgba(0, 0, 255, 0))",
          }}
        >
          {/* Buttons */}
          <div className="absolute top-0 left-0 p-4">
            <Link href="/map">
              <button className="bg-white text-black bg-opacity-20 py-2 px-4 rounded h-10">
                Map
              </button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 p-4">
            <button
              className="bg-white text-black py-2 px-4 rounded h-10"
              onClick={() => {
                console.log("routes btn");
              }}
            >
              Routes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="text-center relative z-20 pt-10 flex flex-col items-center justify-center">
          {/* Adjusted image and XP bar */}
          <div className="flex flex-col items-center relative group">
            {isMobile ? (
              <>
                <img
                  src={avatar}
                  alt={`${fname} ${lname}'s avatar`}
                  className="w-48 h-48 object-cover rounded-full cursor-pointer"
                />
                {isEditing && (
                  <label htmlFor="image" className="mt-2 relative">
                    <button className="bg-gray-300 text-white py-2 px-4 rounded cursor-pointer w-full">
                      Change Profile Picture
                    </button>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </>
            ) : (
              <>
                <img
                  src={avatar}
                  alt={`${fname} ${lname}'s avatar`}
                  className="w-32 h-32 object-cover rounded-full cursor-pointer group-hover:opacity-50"
                />
                <label
                  className="absolute flex justify-center items-center w-48 h-48 text-white bg-gray-300 rounded-full opacity-0 cursor-pointer group-hover:opacity-100"
                  htmlFor="image"
                >
                  Change Profile Picture
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="absolute w-48 h-48 opacity-0"
                  onChange={handleImageChange}
                />
              </>
            )}
            <h1 className="text-2xl font-semibold">
              {fname} {lname}
            </h1>
            <h6 className="pt-2 text-2md">{email}</h6>
            <div className="w-full bg-gray-300 rounded-full overflow-hidden mt-4">
              <div
                className="bg-green-500 h-4"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <p className="mt-2">
              XP: {total_xp} / {levelInfo.xpToNextLevel}
            </p>
            <p>Level: {levelInfo.currentLevel}</p>
            {!isEditing && (
              <button
                className="bg-green-900 text-black bg-opacity-20 py-2 px-4 rounded h-10"
                onClick={() => setIsEditing(!isEditing)}
              >
                Modify Profile
              </button>
            )}
          </div>
        </div>
      </section>
      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="flex justify-center">
          {!isEditing ? (
            <>
              <details className="dropdown bg-white rounded-lg shadow-md p-8 justify-center text-center ">
                <summary className="text-2xl font-semibold text-center m-2 btn justify-center">
                  User Statistics <FontAwesomeIcon icon={faList} />
                </summary>
                {/* User Info */}
                <div className="flex flex-col w-full">
                  <div className="grid h-15 bg-transparent bg-base-300 place-items-center relative pt-3">
                    <p>
                      <FontAwesomeIcon icon="map-marker-alt" /> Total Added
                      POIs: {added_pois_count}
                    </p>
                  </div>
                  <div className="divider"></div>
                  <div className="grid h-15 bg-transparent bg-base-300 place-items-center relative">
                    <p>
                      <FontAwesomeIcon icon="star" /> Total Received Ratings:{" "}
                      {received_ratings_count}
                    </p>
                  </div>
                  <div className="divider"></div>
                  <div className="grid h-15 bg-transparent bg-base-300 place-items-center relative">
                    <p>
                      <FontAwesomeIcon icon="star-half-alt" /> Total Given
                      Ratings: {given_ratings_count}
                    </p>
                  </div>
                </div>
              </details>
            </>
          ) : (
            <div className="justify-center items-center text-center">
              <div className="col-md-12 justify-content-center">
                <div className="mb-4 flex flex-col items-center">
                  <label className="form-control w-full max-w-md mb-2">
                    <span className="label-text">User Name</span>
                    <input
                      type="text"
                      placeholder="Type here the UserName"
                      className="input input-bordered w-full max-w-md bg-gray-200"
                      onChange={(e) => setFormUsername(e.target.value)}
                    />
                  </label>
                  <label className="form-control w-full max-w-md mb-2">
                    <span className="label-text">Email</span>
                    <input
                      type="email"
                      placeholder="Type here the Email"
                      className="input input-bordered w-full max-w-md bg-gray-200"
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </label>
                  <label className="form-control w-full max-w-md mb-2">
                    <span className="label-text">Confirm Password</span>
                    <input
                      type="password"
                      placeholder="Confirm the password"
                      className="input input-bordered w-full max-w-md bg-gray-200"
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex justify-center mt-4">
                  {isEditing && (
                    <>
                      <button
                        className="mr-2 bg-green-900 text-black bg-opacity-20 py-2 px-4 rounded h-10"
                        onClick={() => updateProfile()}
                      >
                        Save Changes
                      </button>
                      <button
                        className="bg-red-500 border-red-500 text-white py-2 px-4 rounded h-10"
                        onClick={() => setIsEditing(!isEditing)}
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
              className="bg-red-500 border-red-500 text-white py-2 px-4 rounded h-10"
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

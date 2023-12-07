import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FloatingLabel, Form } from "react-bootstrap";
import { isMobile } from "react-device-detect";
import { UserData } from "../structs/user";

const TOKEN = Cookies.get('COGNITO_TOKEN')
const URL_API = process.env.DATABASE_API_URL;

export default function UserProfile() {

  function redirect(path: string) {
    window.location.replace(path);
  }

  const nameStyle = {
    fontSize: "24px",
    margin: "10px",
    color: "#f2f2f2",
  };

  const centerText = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const headerHeight = {
    height: '60px', // adjust as needed
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

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

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const [newAvatar, setNewAvatar] = useState(false);

  //create dictionary with all the user info that is changed
  //if the user doesnt change anything, the value is null
  //if the user changes something, the value is the new value

  let userChanges = {};

  const updateProfile = () => {

    if (formPassword === "") {
      setFormUsername(username);
      setFormEmail(email);
      setIsEditing(false);
      return;
    }

    if (formUsername === username && formEmail === email) {
      setIsEditing(false);
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
        }
        else if (res.status === 400) {
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
        setIsEditing(false);
      })
      .catch((err) => {
        console.log("error:", err);
      });
  };

  useEffect(() => {

    if (!TOKEN) {
      redirect('/login');
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    };
    const url = new URL(URL_API + "user");

    fetch(url.toString(), { headers })
      .then(async (res) => {
        if (res.status !== 200) {
          redirect('/map');
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
        }

      })
      .catch((err) => {
        console.log(err);
      });

  });

  function logout() {
    Cookies.remove('COGNITO_TOKEN');
    localStorage.removeItem('user');
    redirect('/map');
  }

  const handleUpload = () => {

  };

  return (
    <div className="map-ui w-screen">
      <div className="mt-2 flex justify-between">
        <div className="ml-2">
          <button
            className="btn btn-secondary"
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
        <div className="justify-end mr-2">
          {isMobile ?
            <button
              className="btn btn-primary"
              onClick={() => redirect('/map')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            :
            <button
              className="btn btn-primary"
              onClick={() => redirect('/map')}
            >
              Go to Map
            </button>
          }
        </div>
      </div>
      <div className="row justify-content-center mt-5">
        <div className="row justify-content-center align-items-center text-center" style={{ maxWidth: "700px" }}>
          <div className="row justify-content-center">
            <div className="relative flex justify-center items-center">
              <div className="group flex justify-center items-center">
                <img
                  src={avatar}
                  alt={`${fname} ${lname}'s avatar`}
                  className="group-hover:opacity-50 w-48 h-48 object-cover rounded-full flex justify-center items-center"
                />
                <button
                  className="absolute flex justify-center items-center opacity-0 group-hover:opacity-100  w-48 h-48 "
                  onClick={() => handleUpload()}
                >
                  Change Profile Picture
                </button>
              </div>
            </div>
            <h1 style={nameStyle}>
              {fname} {lname}
            </h1>
          </div>
          <div className="row mt-3 mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card text-white bg-primary h-100" >
                <div className="card-header" style={headerHeight}>Total XP</div>
                <div className="card-body" style={centerText}>
                  <h5 className="card-title">{total_xp}</h5>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card text-white bg-success h-100">
                <div className="card-header" style={headerHeight}>Added POIs</div>
                <div className="card-body" style={centerText}>
                  <h5 className="card-title">{added_pois_count}</h5>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card text-white bg-info h-100">
                <div className="card-header" style={headerHeight}>Received Ratings</div>
                <div className="card-body" style={centerText}>
                  <h5 className="card-title" >{received_ratings_count}</h5>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3" >
              <div className="card text-white bg-warning h-100">
                <div className="card-header" style={headerHeight}>Given Ratings</div>
                <div className="card-body" style={centerText}>
                  <h5 className="card-title">{given_ratings_count}</h5>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {!isEditing && (
              <button className="btn btn-secondary my-3 w-50" onClick={() => setIsEditing(!isEditing)}>
                Modify Profile
              </button>
            )}</div>
          <div className="col-md-8 justify-content-center">
            <div className="mb-3">
              <FloatingLabel controlId="floatingInput1" label="Username">
                <Form.Control
                  type="text"
                  placeholder="Username"
                  defaultValue={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  readOnly={!isEditing}
                />
              </FloatingLabel>
            </div>
            <div className="mb-3">
              <FloatingLabel controlId="floatingInput2" label="Email">
                <Form.Control
                  type="text"
                  placeholder="Email"
                  defaultValue={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  readOnly={!isEditing}
                />
              </FloatingLabel>
            </div>
            {isEditing && (<div className="mb-3">
              <FloatingLabel controlId="floatingInput3" label="Password(Confirm Changes)">
                <Form.Control
                  type="password"
                  placeholder="Password(Confirm Changes)"
                  defaultValue={password}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </FloatingLabel>
            </div>)}
          </div>
          <div className="row justify-content-center">
            {isEditing && (
              <button className="btn btn-secondary my-3 w-50" onClick={() => updateProfile()}>
                Save Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

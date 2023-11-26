import React, { useEffect, useState } from "react";
import { UserProps } from "../structs/user";
import { Form, FloatingLabel } from "react-bootstrap";
import { Button } from "react-bootstrap";
import Cookies from "js-cookie";

const TOKEN = Cookies.get('COGNITO_TOKEN')
const URL_API = process.env.DATABASE_API_URL;

const UserProfile = ({ user }: { user: UserProps }) => {
  const avatarContainerStyle = {
    padding: "10px",
  };

  const userDetailStyle = {
    flex: 1,
  };

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

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    position: 'absolute',
    top: '0px',
    right: '10px',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [fname, setFname] = useState(user.fname);
  const [lname, setLname] = useState(user.lname);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [password, setPassword] = useState("");
  const [total_xp, setTotal_xp] = useState(0);
  const [added_pois_count, setAddedPoiCount] = useState(0);
  const [received_ratings_count, setReceivedRatingCount] = useState(0);
  const [given_ratings_count, setGivenRatingCount] = useState(0);



  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  //create dictionary with all the user info that is changed
  //if the user doesnt change anything, the value is null
  //if the user changes something, the value is the new value

  let userChanges = {};

  const updateProfile = () => {
    console.log("update profile");
    console.log("username:", username);
    console.log("email:", email);

    // here u need to update the user profile in the DB
    /* @Gonçalo */


    if (formPassword === "") {
      setFormUsername(username); // Reset formUsername
      setFormEmail(email); // Reset formEmail
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


    if (isEditing) {
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
    }
  };

  useEffect(() => {
    console.log("user:", user);
    // get the user from local storage
    const userLS = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("userLS:", userLS);

    if (userLS) {
      if (userLS.image_url) {
        setAvatar(userLS.image_url);
      } else {
        setAvatar("https://i.imgur.com/8Km9tLL.png");
      }
      setFname(userLS.first_name);
      setLname(userLS.last_name);
      setUsername(userLS.username);
      setEmail(userLS.email);
      setFormEmail(userLS.email);
      setFormUsername(userLS.username);
      setTotal_xp(userLS.total_xp);
      setAddedPoiCount(userLS.added_pois_count);
      setReceivedRatingCount(userLS.received_ratings_count);
      setGivenRatingCount(userLS.given_ratings_count);
    }
  }, [user]);

  return (
    <div
      className="row justify-content-center align-items-start w-100 min-h-screen m-0 p-0 bg-dark"
    >
      <div className="row justify-content-end" >
        <Button
          variant="success"
          className="my-3"
          style={{ width: "200px" }}
          onClick={() => (window.location.href = "/map")}
        >
          Go back to Map
        </Button>
      </div>
      <div className="row justify-content-center align-items-center text-center" style={{
        maxWidth: "700px",
      }}>
        <div className="row justify-content-center">
          <img
            src={avatar}
            alt={`${fname} ${lname}'s avatar`}
            style={{
              padding: "0px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
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
            <Button
              variant="secondary"
              className="my-3 w-50"
              onClick={() => setIsEditing(!isEditing)}
            >
              Modify Profile
            </Button>
          )}</div>

        <div className="col-md-8 justify-content-center">
          <div className="mb-3">
            <FloatingLabel controlId="floatingInput1" label="Username">
              <Form.Control
                type="text"
                placeholder="Username"
                value={formUsername}
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
                value={formEmail}
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
                readOnly={!isEditing}
              />
            </FloatingLabel>
          </div>)}
        </div>
        <div className="row justify-content-center">
          {isEditing && (
            <Button variant="primary" className="mt-3 w-50" title="Save Profile" onClick={updateProfile} >
              Save Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

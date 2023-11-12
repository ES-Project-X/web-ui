import React, { useEffect, useState } from "react";
import { UserProps } from "../structs/user";
import { Form, FloatingLabel } from "react-bootstrap";
import { Button } from "react-bootstrap";

const UserProfile = ({ user }: { user: UserProps }) => {
  const avatarContainerStyle = {
    padding: "20px",
  };

  const avatarStyle = {
    width: "200px",
    height: "200px",
    borderRadius: "50%",
  };

  const userDetailStyle = {
    flex: 1,
  };

  const nameStyle = {
    fontSize: "24px",
    margin: "10px 0",
    color: "#f2f2f2",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  //create dictionary with all the user info that is changed
  //if the user doesnt change anything, the value is null
  //if the user changes something, the value is the new value

  let userChanges = {};

  const API_URL = process.env.DATABASE_API_URL;


  const updateProfile = () => {
    console.log("update profile");
    console.log("username:", username);
    console.log("email:", email);

    // here u need to update the user profile in the DB
    /* @Gonçalo */
    const userLS = JSON.parse(localStorage.getItem("user") || "{}");


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
      fetch("http://127.0.0.1:8000/user/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer TOKEN",
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
      if (userLS.image_url === "") {
        setAvatar("https://i.imgur.com/8Km9tLL.png");
      } else {
        setAvatar(userLS.image_url);
      }
      setFname(userLS.first_name);
      setLname(userLS.last_name);
      setUsername(userLS.username);
      setEmail(userLS.email);
      setFormEmail(userLS.email);
      setFormUsername(userLS.username);

    } else {
      setAvatar(user.avatar);
      setFname(user.fname);
      setLname(user.lname);
      setUsername(user.username);
      setEmail(user.email);

    }
  }, [user]);

  return (
    <div
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          left: "50%",
          transform: "translate(-50%, -50%)",
          top: "50%",
          position: "absolute",
        }}
      >
        <Button
          variant="success"
          className="mt-3"
          onClick={() => (window.location.href = "/map")}
        >
          Go back to Map
        </Button>
        <div style={avatarContainerStyle}>
          <img
            src={avatar}
            alt={`${fname} ${lname}'s avatar`}
            style={avatarStyle}
          />
        </div>
        {!isEditing && (
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setIsEditing(!isEditing)}
          >
            Modify Profile
          </Button>
        )}
        <div style={userDetailStyle}>
          <h1 style={nameStyle} className="mb-3">
            {fname} {lname}
          </h1>
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
        {isEditing && (
          <Button variant="primary" className="mt-3" title="Save Profile" onClick={updateProfile} >
            Save Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

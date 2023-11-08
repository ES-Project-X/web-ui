"use client";

import React, { useState } from "react";
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
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const updateProfile = () => {
    console.log("update profile");
    console.log("username:", username);
    console.log("email:", email);
    setIsEditing(false);

    // here u need to update the user profile in the DB
    /* @Gonçalo */
  }
  

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
        <div style={avatarContainerStyle}>
          <img
            src={user.avatar}
            alt={`${user.fname} ${user.lname}'s avatar`}
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
            {user.fname} {user.lname}
          </h1>
          <div className="mb-3">
            <FloatingLabel controlId="floatingInput1" label="Username">
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                readOnly={!isEditing}
              />
            </FloatingLabel>
          </div>
          <div className="mb-3">
            <FloatingLabel controlId="floatingInput2" label="Email">
              <Form.Control
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!isEditing}
              />
            </FloatingLabel>
          </div>
        </div>
        {isEditing && (
          <Button
            variant="primary"
            className="mt-3"
            onClick={updateProfile}
          >
            Save Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

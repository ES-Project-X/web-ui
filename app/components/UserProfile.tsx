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

  const [userChanges, setUserChanges] = useState({});


  const API_URL = process.env.DATABASE_API_URL;


  const updateProfile = () => {
    console.log("update profile");
    console.log("username:", username);
    console.log("email:", email);

    // here u need to update the user profile in the DB
    /* @Gonçalo */
    const userLS = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("userLS:", userLS);


    if (formPassword === "") {
      alert("Please confirm your password!");
      setFormUsername(username); // Reset formUsername
      setFormEmail(email); // Reset formEmail
      setIsEditing(false);
      return;
    }

    if (formUsername === username && formEmail === email) {
      alert("No changes were made!");
      setIsEditing(false);
      return;
    }

    if (formUsername !== username) {
      setUserChanges({ ...userChanges, username: formUsername });
    }

    if (formEmail !== email) {
      setUserChanges({ ...userChanges, email: formEmail });
    }

    if (formPassword !== "") {
      setUserChanges({ ...userChanges, password: formPassword });
    }

    if (isEditing) {
      fetch("http://127.0.0.1:8000/user/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer eyJraWQiOiJSc0d4ckllKzZFXC9SVVlPOUFxU1RVaXJCZ2lvamZFUUZucGpXN0FTQVFDWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODM1YjczYy1hOTQ4LTQwNWItODJhNi00YzdmZTUzMTBjZGQiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9kemdZTDhmUFgiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI1ZzRic2ZzbHFhOTV1NHBkMnBvc2JuMHJudSIsImV2ZW50X2lkIjoiMzJhODg3ZDctMmJhZC00OWIzLTgyZGQtOWYyOWYyYTkxNTljIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwiLCJhdXRoX3RpbWUiOjE2OTk3NDU1MTQsImV4cCI6MTY5OTc0OTExNCwiaWF0IjoxNjk5NzQ1NTE0LCJqdGkiOiIzYWI3MDFmZS04ZjU0LTQzZTItYjcxNC02NTcyZGNiNWM2YjciLCJ1c2VybmFtZSI6IjI4MzViNzNjLWE5NDgtNDA1Yi04MmE2LTRjN2ZlNTMxMGNkZCJ9.CORjsTDrpCj1TcKieTwEe2-T3rKuz1TvfvnpT-91sYKxPfB8gUeq-a_ttO_KirxJ5RseEk16j8k2BLCfLrcN9bIeBOJQSFUPaxDEUgaVPaWDIthm69Ural6mvOZBdZlK4MeTTQMoMyX7ESExoMdVCeLwY9Jugp18rAGy0AjSFCOPE_kT7dnOWhlkUJCwu6i9uVc2Uto75q_WMq07UjgcNO-8HiCqVB9cNuc4Y20jmfNZkc0-a8QJlskY4QNXXmAYyia-7Y6TOml_kmzrF7NSctQAxoFQQK67s9UZaHMvGTPwv3fdACdXg8SDLSdC1namP3jbTfZuRNqxY3Qyz9K1_Q",
        },
        body: JSON.stringify(userChanges),
      })
        .then((res) => {
          console.log("res:", res);
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error("Error updating user");
          }
        })
        .then((data) => {
          alert("User updated successfully!");
          localStorage.setItem("user", JSON.stringify(data));
          setUsername(data.username);
          setEmail(data.email);
          setFormUsername(data.username);
          setFormEmail(data.email);
          setPassword("");
          setIsEditing(false);
          useEffect
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
          <Button variant="primary" className="mt-3" onClick={updateProfile}>
            Save Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;


import UserProfile from "@/app/components/UserProfile";
import React from "react";
import { UserProps } from '../../structs/user';

export default async function Page({ params }: { params: { user: UserProps } }) {
  /* Fetch the user details by username */
  // const res = await fetch(`.../${params.user}`)
  // const data: user = await res.json()
  const data: UserProps = {
    id : 1,
    fname: "John",
    lname: "Doe",
    username: "johndoe",
    email: "johnd@a.b",
    avatar: "https://www.w3schools.com/howto/img_avatar.png",
  };

  const profileStyle = {
    backgroundColor: "#f2f2f2",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    maxWidth: "400px",
    margin: "0 auto",
  };

  const headerStyle = {
    textAlign: "center",
  };

  const avatarStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
  };

  const nameStyle = {
    fontSize: "24px",
    margin: "10px 0",
    color: "#333",
  };

  const infoStyle = {
    fontSize: "16px",
    margin: "10px 0",
    color: "#555",
  };

  return (
    <div>
      <div className="container">
        <UserProfile user={data} />
      </div>
    </div>
  );
}

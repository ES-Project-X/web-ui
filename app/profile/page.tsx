"use client";

import UserProfile from "../../app/components/UserProfile";
import { UserProps } from "../structs/user";

export default function Page() {
  const data: UserProps = {
    id: 1,
    username: "",
    fname: "",
    lname: "",
    email: "",
    avatar: "",
  };

  return (
    <UserProfile user={data} />

  );
}

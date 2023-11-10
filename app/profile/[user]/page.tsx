"use client";
import UserProfile from "@/app/components/UserProfile";
import React, { useEffect, useState } from "react";
import { UserProps } from "../../structs/user";

export default async function Page({
  params,
}: {
  params: { user: UserProps };
}) {

  const data: UserProps = {
    id: 1,
    fname: "John",
    lname: "Doe",
    username: "johndoe",
    email: "johnd@a.b",
    avatar: "https://www.w3schools.com/howto/img_avatar.png",
  };

  return (
    <div>
      <div className="container">
        <UserProfile user={data} />
      </div>
    </div>
  );
}

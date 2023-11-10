"use client";

import UserProfile from "@/app/components/UserProfile";
import React, { useEffect, useState } from "react";
import { UserProps } from "../../structs/user";

export default async function Page({
  params,
}: {
  params: { user: UserProps };
}) {
  console.log("params:", params);
  const data: UserProps = {
    id: 1,
    username: "",
    fname: "",
    lname: "",
    email: "",
    avatar: "",
  };

  return (
    <div>
      <div className="container">
        <UserProfile user={data} />
      </div>
    </div>
  );
}

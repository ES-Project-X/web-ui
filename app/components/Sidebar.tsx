import React from "react";
import { slide as Menu } from "react-burger-menu"; /* maybe stack instead of slide */

import "../globals.css";

export default () => {


  const searchRoute = () => {
    console.log("searching route from origin to destiny: ");
    console.log("org:", (document.getElementById("origin_input") as HTMLInputElement)?.value);
    console.log("dest:", (document.getElementById("dest_input") as HTMLInputElement)?.value);
    // clear inputs after search
    (document.getElementById("origin_input") as HTMLInputElement).value = "";
    (document.getElementById("dest_input") as HTMLInputElement).value = "";
  }

  return (
    <Menu>
      <a className="menu-item">
        <p className="text-2xl font-bold text-left">Origin Point</p>
        <input
          id="origin_input"
          type="text"
          placeholder="Type here"
          className="input input-ghost w-full max-w-xs"
        />
      </a>
      <a className="menu-item">
      <p className="text-2xl font-bold text-left">Destiny</p>
        <input
          id="dest_input"
          type="text"
          placeholder="Type here"
          className="input input-ghost w-full max-w-xs"
        />
      </a>
      <a className="menu-item">
      <button className="btn btn-accent" onClick={searchRoute}>Search route</button>
      </a>
    </Menu>
  );
};

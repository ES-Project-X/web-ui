import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const TOKEN = Cookies.get("COGNITO_TOKEN");
const URL_API = process.env.DATABASE_API_URL;

export default function RoutesComponent() {

    useEffect(() => {
        if (!TOKEN) {
            redirect("/map");
        }
    }, []);

    function redirect(path: string) {
        window.location.replace(path);
    }

    return (
        <div className="min-h-screen bg-white text-black bg-gradient-to-b from-0% from-green-500 via-white via-80% to-white to-100%">
            <div className="absolute top-0 left-0 p-4">
                <button className="bg-white text-black bg-opacity-20 py-2 px-4 rounded h-10" onClick={() => redirect("/profile")}>
                    Back
                </button>
            </div>
            <h2 className="pt-24 font-extrabold text-4xl text-center">My Routes</h2>
        </div>
    )
}
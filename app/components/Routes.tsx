import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Route } from "../structs/route";
import "../globals.css";

const TOKEN = Cookies.get("COGNITO_TOKEN");
const URL_API = process.env.DATABASE_API_URL;

export default function RoutesComponent() {
    const [saved, setSaved] = useState<Route[]>([]);
    const [tracked, setTracked] = useState<Route[]>([]);

    const [openSaved, setOpenSaved] = useState(false);
    const [openTracked, setOpenTracked] = useState(false);

    function drawRoute(route: Route, type: string) {
        const points = route.points;
        sessionStorage.setItem("points", JSON.stringify(points));
        sessionStorage.setItem("type", type);
        redirect("/map");
    }

    function deleteRoute(id: string) {
        const response = confirm("Are you sure you want to delete this route?");
        if (!response) {
            return;
        }
        fetch(`${URL_API}route/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    setSaved(saved.filter((route) => route.id !== id));
                    setTracked(tracked.filter((route) => route.id !== id));
                }
            });
    }

    useEffect(() => {
        if (!TOKEN) {
            redirect("/map");
        }
        fetch(`${URL_API}route/get`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setSaved(data.created);
                setTracked(data.recorded);
            });
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
            <div className="bg-white rounded-xl shadow-md p-8 justify-center m-8 font-bold flex-col">
                <div className="flex cursor-pointer" onClick={() => setOpenSaved(!openSaved)}>
                    <span className="mr-auto">Saved Routes ({saved.length})</span>
                    {openSaved ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                </div>
                {openSaved && (
                    <div className="flex flex-col">
                        {saved.map((route) => (
                            <div className="bg-gray-200 rounded-xl shadow-md p-3 justify-start mt-4 font-bold items-center mr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2" key={route.id}>
                                <div>
                                    {route.name.replaceAll("__", " - ")}
                                </div>
                                <div className="flex items-center ml-auto">
                                    <div>
                                        <button className="btn mr-2 bg-green-500 rounded-lg shadow-md w-12 h-12 p-0" onClick={() => drawRoute(route, "saved")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 8.214l-.46-.46a2.252 2.252 0 01-.422-.586l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.211.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.654-.261a2.25 2.25 0 01-1.384-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.279-2.132z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div>
                                        <button className="btn bg-red-600 rounded-lg shadow-md w-12 h-12 p-0" onClick={() => deleteRoute(route.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 justify-center m-8 font-bold flex flex-col">
                <div className="flex cursor-pointer" onClick={() => setOpenTracked(!openTracked)}>
                    <span className="mr-auto">Tracked Routes ({tracked.length})</span>
                    {openTracked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                </div>
                {openTracked && (
                    <div className="flex flex-col">
                        {tracked.map((route) => (
                            <div className="bg-gray-200 rounded-xl shadow-md p-3 justify-start mt-4 font-bold items-center mr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2" key={route.id}>
                                <div>
                                    {route.name.replaceAll("__", " - ")}
                                </div>
                                <div className="flex ml-auto items-center">
                                    <div>
                                        <button className="btn mr-2 bg-green-500 rounded-lg shadow-md w-12 h-12 p-0" onClick={() => drawRoute(route, "tracked")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 8.214l-.46-.46a2.252 2.252 0 01-.422-.586l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.211.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.654-.261a2.25 2.25 0 01-1.384-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.279-2.132z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div>
                                        <button className="btn bg-red-600 rounded-lg shadow-md w-12 h-12 p-0" onClick={() => deleteRoute(route.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
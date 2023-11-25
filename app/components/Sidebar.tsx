import React, {useEffect} from "react";
import { slide as Menu } from "react-burger-menu";
import "../globals.css";

interface Route {
    name: string;
    points: {latitude: number; longitude: number}[];
}

export default function Sidebar({
    routes,getRoutes,draw}: {
    routes: Route[];
    getRoutes(): void;
    draw(url:string): void;
}) {

    const URL_ROUTING = process.env.URL_ROUTING;

    useEffect(() => {
        getRoutes();
    }, []);

    const drawR = (r:string) => {
        let url = URL_ROUTING;
        let p = routes.find((route) => route.name === r)?.points;
        if (p) {
            p.forEach((point) => {
                let temp = point.latitude + "," + point.longitude;
                url += "&point=" + temp;
            });
        }
        draw(url!);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            let r = e.currentTarget.id;
            drawR(r);
        }
    }

    function show() {
        if (routes.length === 0) {
            return <p>No routes found</p>
        }
        else {
            return (
                routes.map((route) => (
                    <div className="route" key={route.name}>
                        <p id={route.name} onKeyDown={handleKeyDown} onClick={() => drawR(route.name)} style={{fontSize:"20px"}}>{route.name}</p>
                    </div>
                ))
            )
        }
    }

    return (
        <Menu>
            <div className="sidebar">
                <h1>Routes</h1>
                <div className="routes">
                    {show()}
                </div>
            </div>
        </Menu>
    );
}
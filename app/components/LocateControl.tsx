import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { control } from "leaflet";

export default function LocateControl() {

    const map = useMap();
    const [locSetup, setLocSetup] = useState(false);

    const originalAlert = window.alert;
    window.alert = function (message) {
        if (message === "Geolocation error: User denied Geolocation.") {
            if (locSetup) {
                originalAlert("Please allow location access in your browser settings to use this feature");
            }
        }
        else {
            originalAlert(message);
        }
    };

    const lc = control.locate({
        clickBehavior: { inView: "setView" },
        flyTo: true,
        locateOptions: {
            enableHighAccuracy: true,
            watch: true,
        },
    });

    useEffect(() => {
        lc.addTo(map);
        lc.start();
        setLocSetup(true);
    }, []);

    return null;
}
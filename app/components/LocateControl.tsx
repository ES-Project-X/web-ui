import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"

import {useMap} from "react-leaflet";
import {control} from "leaflet";
import {useEffect} from "react";
import "leaflet.locatecontrol"

export default function LocateControl() {
    const map = useMap();
    const lc = control.locate({
        clickBehavior: {inView: 'setView'},
        flyTo: true,
        onLocationError: () => {}
    });

    useEffect(() => {
        lc.addTo(map);
        lc.start();
    }, []);

    return null;
}
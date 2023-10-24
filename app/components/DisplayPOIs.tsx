import { useMapEvents } from "react-leaflet";
import { BasicPOI } from "../structs/poi";

export default function DisplayPOIs({
    markers,
}: {
    markers: BasicPOI[]
}) {

    useMapEvents({

        zoom: (e) => {
            if (markers.length > 0 && e.target.getZoom() < 18 && e.target.getZoom() > 6) {

            }
            else if (e.target.getZoom() < 6) {
                markers = []
            }
        }
    })

    return (
        0
    );
}
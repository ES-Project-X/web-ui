import dynamic from 'next/dynamic'
import MapComponent from '../components/Map';

export default function MapPage() {

    return <>
        <MapComponent tileLayerURL={"https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"}/>
    </>
}
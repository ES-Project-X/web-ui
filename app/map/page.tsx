import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('../components/Map'), {
    ssr: false,
})
export default function MapPage() {
    return <>
        <MapComponent tileLayerURL={"https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"}/>
    </>
}
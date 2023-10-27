import MapComponent from "../../app/components/Map"
import MarkersManager from "../../app/components/MarkersManager";
import {fireEvent, render} from "@testing-library/react"
import {enableFetchMocks} from "jest-fetch-mock";

describe("MarkersManager", () => {

    enableFetchMocks()

    let mapComponent: HTMLElement

    const findByClass = (className: string) => {
        return mapComponent.querySelector(`.${className}`) ?? undefined
    }

    beforeEach(() => {
        global.navigator.geolocation = {
            watchPosition: jest.fn()
                .mockImplementationOnce((success) => Promise.resolve(success({
                    coords: {
                        latitude: 40.64427,
                        longitude: -8.64554
                    }
                })))
        }

        mapComponent = render(<MapComponent
            tileLayerURL={"https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"}/>
            ).container
    })

    it("adds a green marker", () => {

        render(<MarkersManager
            creatingRoute={true}
            setOrigin={() => {}}
            setDestination={() => {}}
            />)

        fireEvent.click(mapComponent!, { clientX: 100, clientY: 100 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()
    })

    it ("adds a green marker and a red marker", () => {

        render(<MarkersManager
            creatingRoute={true}
            setOrigin={() => {}}
            setDestination={() => {}}
            />)

        fireEvent.click(mapComponent!, { clientX: 100, clientY: 100 });
        fireEvent.click(mapComponent!, { clientX: 200, clientY: 200 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()
    })

    it("removes a green marker", () => {

        render(<MarkersManager
            creatingRoute={true}
            setOrigin={() => {}}
            setDestination={() => {}}
            />)

        fireEvent.click(mapComponent!, { clientX: 100, clientY: 100 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()

        fireEvent.click(greenMarker!)

        const greenMarker2 = findByClass("green-marker-icon")
        expect(greenMarker2).toBeUndefined()
    })

    it("removes a red marker", () => {

        render(<MarkersManager
            creatingRoute={true}
            setOrigin={() => {}}
            setDestination={() => {}}
            />)

        fireEvent.click(mapComponent!, { clientX: 100, clientY: 100 });
        fireEvent.click(mapComponent!, { clientX: 200, clientY: 200 });

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)

        const redMarker2 = findByClass("red-marker-icon")
        expect(redMarker2).toBeUndefined()
    })

    it ("add a green marker and a red marker, then removes the green marker", () => {

        render(<MarkersManager
            creatingRoute={true}
            setOrigin={() => {}}
            setDestination={() => {}}
            />)

        fireEvent.click(mapComponent!, { clientX: 100, clientY: 100 });
        fireEvent.click(mapComponent!, { clientX: 200, clientY: 200 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(greenMarker!)

        const greenMarker2 = findByClass("green-marker-icon")
        expect(greenMarker2).toBeUndefined()

        const redMarker2 = findByClass("red-marker-icon")
        expect(redMarker2).toBeDefined()
    })
    
    // TODO: fix when Creating Route is implemented
    /*
    it("add a single red marker", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)

        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()
        render(<MarkersManager creatingRoute={false}/>)

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()
    })

    it("check red marker popup", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()
        render(<MarkersManager creatingRoute={false}/>)

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)

        const popup = screen.getByText(/You are at/i)
        expect(popup).toBeDefined()
    }
    */

})
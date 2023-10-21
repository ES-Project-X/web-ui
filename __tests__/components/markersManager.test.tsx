import MapComponent from "../../app/components/Map"
import {fireEvent, render} from "@testing-library/react"
import {enableFetchMocks} from "jest-fetch-mock";

describe("MarkersManager", () => {

    enableFetchMocks()

    let component: HTMLElement

    const findById = (id: string) => {
        return component.querySelector(`#${id}`) ?? undefined
    }

    const findByClass = (className: string) => {
        return component.querySelector(`.${className}`) ?? undefined
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
        component = render(<MapComponent/>).container
    })

    it("adds a green marker", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)

        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()
        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()
    })

    it ("adds a green marker and a red marker", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)

        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });
        fireEvent.click(mapContainer!, { clientX: 200, clientY: 200 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()
    })

    it("removes a green marker", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)

        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

        const greenMarker = findByClass("green-marker-icon")
        expect(greenMarker).toBeDefined()

        fireEvent.click(greenMarker!)

        const greenMarker2 = findByClass("green-marker-icon")
        expect(greenMarker2).toBeUndefined()
    })

    it("removes a red marker", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)

        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });
        fireEvent.click(mapContainer!, { clientX: 200, clientY: 200 });

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)

        const redMarker2 = findByClass("red-marker-icon")
        expect(redMarker2).toBeUndefined()
    })

    it ("add a green marker and a red marker, then removes the green marker", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)

        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });
        fireEvent.click(mapContainer!, { clientX: 200, clientY: 200 });

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
import AddMarkers from "@/app/components/MarkersManager";
import MapComponent from "@/app/components/Map";
import {fireEvent, render, screen} from "@testing-library/react"

describe("MarkersManager", () => {

    let component: HTMLElement

    const findById = (id: string) => {
        return component.querySelector(`#${id}`) ?? undefined
    }

    const findByClass = (className: string) => {
        return component.querySelector(`.${className}`) ?? undefined
    }

    beforeEach(() => {
        const {container} = render(<MapComponent/>)
        component = container
    })

    it("adds a green marker", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()
        screen.debug(mapContainer)

        fireEvent.click(mapContainer!)
        screen.debug(mapContainer)

        const greenMarker = findByClass("green-marker")
        expect(greenMarker).toBeDefined()
        screen.debug(greenMarker)
    })

    it("adds a red marker", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!)
        fireEvent.click(mapContainer!)

        const redMarker = findByClass("red-marker")
        expect(redMarker).toBeDefined()
    })

    it("removes a green marker", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!)

        const greenMarker = findByClass("green-marker")
        expect(greenMarker).toBeDefined()

        fireEvent.click(greenMarker!)

        const greenMarkerAfterRemoval = findByClass("green-marker")
        expect(greenMarkerAfterRemoval).toBeUndefined()
    })

    it("removes a red marker", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        fireEvent.click(mapContainer!)
        fireEvent.click(mapContainer!)

        const redMarker = findByClass("red-marker")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)

        const redMarkerAfterRemoval = findByClass("red-marker")
        expect(redMarkerAfterRemoval).toBeUndefined()
    })

})
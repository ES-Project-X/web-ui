import MapComponent from "../../app/components/Map"
import {fireEvent, render, screen} from "@testing-library/react"

describe("MapComponent", () => {

    let component: HTMLElement

    const findById = (container: HTMLElement, id: string) => {
        return container.querySelector(`#${id}`) ?? undefined
    }

    const findByClass = (container: HTMLElement, className: string) => {
        return container.querySelector(`.${className}`) ?? undefined
    }

    it("renders", () => {
        const {container} = render(<MapComponent/>)

        const mapContainer = findById(container, "map-container")
        expect(mapContainer).toBeDefined()

        const rotateRight = findById(container, "map-rotate-right-btn")
        expect(rotateRight).toBeDefined()

        const rotateLeft = findById(container, "map-rotate-left-btn")
        expect(rotateLeft).toBeDefined()
    })

    it("rotates to the right", () => {
        const {container} = render(<MapComponent/>)

        const rotateRight = findById(container, "map-rotate-right-btn")
        expect(rotateRight).toBeDefined()

        fireEvent.click(rotateRight!)
    })

    it("rotates to the left", () => {
        const {container} = render(<MapComponent/>)

        const rotateLeft = findById(container, "map-rotate-left-btn")
        expect(rotateLeft).toBeDefined()

        fireEvent.click(rotateLeft!)
    })

    it("location is enabled", () => {
        global.navigator.geolocation = {
            watchPosition: jest.fn()
                .mockImplementationOnce((success) => Promise.resolve(success({
                    coords: {
                        latitude: 40.64427,
                        longitude: -8.64554
                    }
                })))
        }
        const {container} = render(<MapComponent/>)

        const currentLocation = findById(container, "map-user-position")
        expect(currentLocation).toBeDefined()

        expect(currentLocation!.textContent).toContain("Latitude: 40.64427")
        expect(currentLocation!.textContent).toContain("Longitude: -8.64554")
    })

    it("location is not enabled", () => {
        global.navigator.geolocation = {
            watchPosition: jest.fn()
                .mockImplementationOnce((success) => Promise.resolve(success({
                    coords: {
                        latitude: undefined,
                        longitude: undefined
                    }
                })))
        }
        const {container} = render(<MapComponent/>)

        const currentLocation = findById(container, "map-user-position")
        expect(currentLocation).toBeDefined()

        expect(currentLocation!.textContent).toContain("Please enable location to see your current location")
    })
})
import MapComponent from "../../app/components/Map"
import {fireEvent, render} from "@testing-library/react"

describe("MapComponent", () => {

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

    it("renders", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()

        const rotateRight = findById("map-rotate-right-btn")
        expect(rotateRight).toBeDefined()

        const rotateLeft = findById("map-rotate-left-btn")
        expect(rotateLeft).toBeDefined()
    })

    describe("Rotation", () => {

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

        it("to the right", () => {
            const rotateRight = findById("map-rotate-right-btn")
            expect(rotateRight).toBeDefined()

            fireEvent.click(rotateRight!)
        })

        it("to the left", () => {
            const rotateLeft = findById("map-rotate-left-btn")
            expect(rotateLeft).toBeDefined()

            fireEvent.click(rotateLeft!)
        })
    })

    describe("Location", () => {

        it("is enabled", () => {
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

            const currentLocation = findById("map-user-position")
            expect(currentLocation).toBeDefined()

            expect(currentLocation!.textContent).toContain("Latitude: 40.64427")
            expect(currentLocation!.textContent).toContain("Longitude: -8.64554")
        })

        it("is disabled", () => {
            global.navigator.geolocation = {
                watchPosition: jest.fn()
                    .mockImplementationOnce((success) => Promise.resolve(success({
                        coords: {
                            latitude: undefined,
                            longitude: undefined
                        }
                    })))
            }
            component = render(<MapComponent/>).container

            const currentLocation = findById("map-user-position")
            expect(currentLocation).toBeDefined()

            expect(currentLocation!.textContent).toContain("Please enable location to see your current location")
        })
    })
})
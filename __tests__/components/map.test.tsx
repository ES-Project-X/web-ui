import {enableFetchMocks} from 'jest-fetch-mock'
import MapComponent from "../../app/components/Map"
import {fireEvent, render, waitFor} from "@testing-library/react"
import {act} from "react-dom/test-utils";

describe("MapComponent", () => {

    enableFetchMocks()

    let component: HTMLElement

    const findById = (id: string) => {
        return component.querySelector(`#${id}`) ?? undefined
    }

    const findByClass = (className: string) => {
        return component.querySelector(`.${className}`) ?? undefined
    }

    const findAllByClass = (className: string) => {
        return component.querySelectorAll(`.${className}`)
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

        const searchBar = findById("search-bar")
        expect(searchBar).toBeDefined()

        const cardInfo = findById("card-info")
        expect(cardInfo).toBeDefined()

        const filterBoard = findById("filter-board")
        expect(filterBoard).toBeDefined()
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

    describe("Search", () => {

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

        it("searches for an address", () => {
            const searchBar = findById("search-bar")
            expect(searchBar).toBeDefined()

            // mock fetch
            fetchMock.mockResponseOnce(JSON.stringify({
                items: [
                    {
                        position: {
                            lat: 40.64427,
                            lng: -8.64554
                        },
                        address: {
                            label: "Aveiro, Portugal"
                        }
                    }
                ]
            }))

            fireEvent.change(searchBar!, {target: {value: "Aveiro"}})
            fireEvent.keyDown(searchBar!, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13})

            const card = findById("card-info")
            expect(card).toBeDefined()

            const cardbtn = findById("card-btn")
            fireEvent.click(cardbtn!)
        })

        it("searches for coordinates", () => {
            const searchBar = findById("search-bar")
            expect(searchBar).toBeDefined()

            // mock fetch
            fetchMock.mockResponseOnce(JSON.stringify({
                items: [
                    {
                        position: {
                            lat: 40.64427,
                            lng: -8.64554
                        },
                        address: {
                            label: "Aveiro, Portugal"
                        }
                    }
                ]
            }))

            fireEvent.change(searchBar!, {target: {value: "40.64427,-8.64554"}})
            fireEvent.keyDown(searchBar!, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13})

            const card = findById("card-info")
            expect(card).toBeDefined()

            const cardbtn = findById("card-btn")
            fireEvent.click(cardbtn!)
        })

        it("no results", () => {
            window.alert = jest.fn();

            const searchBar = findById("search-bar")
            expect(searchBar).toBeDefined()

            // mock fetch
            fetchMock.mockResponseOnce(JSON.stringify({
                items: []
            }))

            fireEvent.change(searchBar!, {target: {value: "Aveiro"}})
            fireEvent.keyDown(searchBar!, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13})

            expect(window.alert)

        });

        it("returns error", () => {
            console.error = jest.fn();

            const searchBar = findById("search-bar")
            expect(searchBar).toBeDefined()

            // mock fetch
            fetchMock.mockRejectOnce(new Error("error"))

            fireEvent.change(searchBar!, {target: {value: "Aveiro"}})
            fireEvent.keyDown(searchBar!, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13})

            expect(console.error)
        });
    })

    describe("Filter", () => {

        beforeEach(async () => {
            global.navigator.geolocation = {
                watchPosition: jest.fn()
                    .mockImplementationOnce((success) => Promise.resolve(success({
                        coords: {
                            latitude: 40.64427,
                            longitude: -8.64554
                        }
                    })))
            }
            fetchMock.mockResponse(JSON.stringify([
                {
                    id: "0",
                    name: "UA Psycology Department Bicycle Parking",
                    type: "bicycle-parking",
                    latitude: 40.63195,
                    longitude: -8.65799
                },
                {
                    id: "1",
                    name: "UA Environmental Department Bicycle Parking",
                    type: "bicycle-parking",
                    latitude: 40.63265,
                    longitude: -8.65881
                },
                {
                    id: "2",
                    name: "UA Catacumbas Bathroom",
                    type: "toilets",
                    latitude: 40.63071,
                    longitude: -8.65875
                }
            ]))
            await act(async () => {
                component = render(<MapComponent/>).container
            })
        })

        it("fetches POIs", () => {
            const mapContainer = findById("map-container")
            expect(mapContainer).toBeDefined()

            const bicycleParkingMarkers = findAllByClass("bicycle-parking-marker-icon")
            expect(bicycleParkingMarkers.length).toBe(2)

            const toiletsMarkers = findAllByClass("toilets-marker-icon")
            expect(toiletsMarkers.length).toBe(1)
        })

        it("filters POIs", async () => {
            const mapContainer = findById("map-container")
            expect(mapContainer).toBeDefined()

            const bicycleParkingFilter = findById("filter-type-bicycle-parking")
            expect(bicycleParkingFilter).toBeDefined()

            fetchMock.mockResponse(JSON.stringify([
                {
                    id: "2",
                    name: "UA Catacumbas Bathroom",
                    type: "toilets",
                    latitude: 40.63071,
                    longitude: -8.65875
                }
            ]))
            await act(async () => {
                fireEvent.click(bicycleParkingFilter!)
            })

            const bicycleParkingMarkers = findAllByClass("bicycle-parking-marker-icon")
            expect(bicycleParkingMarkers.length).toBe(0)

            const toiletsMarkers = findAllByClass("toilets-marker-icon")
            expect(toiletsMarkers.length).toBe(1)
        })
    });
})
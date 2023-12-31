import { enableFetchMocks } from 'jest-fetch-mock'
import MapComponent from "../../app/components/Map"
import { fireEvent, render, waitFor } from "@testing-library/react"
import { act } from "react-dom/test-utils";

describe.skip("MapComponent", () => {

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
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: () => Promise.resolve({ state: 'granted' })
            },
            writable: true
        });
        component = render(<MapComponent />).container;
    });

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
            component = render(<MapComponent />).container
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

    describe("Search", () => {

        beforeEach(() => {
            component = render(<MapComponent />).container
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

            fireEvent.change(searchBar!, { target: { value: "Aveiro" } })
            fireEvent.keyDown(searchBar!, { key: "Enter", code: "Enter", keyCode: 13, charCode: 13 })

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

            fireEvent.change(searchBar!, { target: { value: "40.64427,-8.64554" } })
            fireEvent.keyDown(searchBar!, { key: "Enter", code: "Enter", keyCode: 13, charCode: 13 })

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

            fireEvent.change(searchBar!, { target: { value: "Aveiro" } })
            fireEvent.keyDown(searchBar!, { key: "Enter", code: "Enter", keyCode: 13, charCode: 13 })

            expect(window.alert)

        });

        it("returns error", () => {
            console.error = jest.fn();

            const searchBar = findById("search-bar")
            expect(searchBar).toBeDefined()

            // mock fetch
            fetchMock.mockRejectOnce(new Error("error"))

            fireEvent.change(searchBar!, { target: { value: "Aveiro" } })
            fireEvent.keyDown(searchBar!, { key: "Enter", code: "Enter", keyCode: 13, charCode: 13 })

            expect(console.error)
        });
    })

    describe.skip("Filter", () => {

        beforeEach(async () => {
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
                component = render(<MapComponent />).container
            })
        })

        it.skip("fetches POIs", async () => {
            const mapContainer = findById("map-container")
            expect(mapContainer).toBeDefined()

            await waitFor(() => {
                expect(findAllByClass("bicycle-parking-marker-icon").length).toBe(2)
            }, { timeout: 10000 })

            await waitFor(() => {
                expect(findAllByClass("toilets-marker-icon").length).toBe(1)
            }, { timeout: 10000 })
        })

        it.skip("filters POIs", async () => {
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

            await waitFor(() => {
                expect(findAllByClass("bicycle-parking-marker-icon").length).toBe(0)
            }, { timeout: 10000 })

            await waitFor(() => {
                expect(findAllByClass("toilets-marker-icon").length).toBe(1)
            }, { timeout: 10000 })
        })
    });

    it("search for origin and destination", () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)
        fireEvent.click(checkMap!)

        const originInput = findById("origin-input")
        expect(originInput).toBeDefined()
        fireEvent.change(originInput!, { target: { value: "Aveiro" } })
        const destinationInput = findById("destination-input")
        expect(destinationInput).toBeDefined()
        fireEvent.change(destinationInput!, { target: { value: "Porto" } })

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

        fetchMock.mockResponseOnce(JSON.stringify({
            paths: [
                {
                    points: {
                        coordinates: [
                            [40.64427, -8.64554],
                            [40.64427, -8.64554]
                        ]
                    }
                }
            ]
        }))

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)

        const cancelRouteBtn = findById("cancel-route-btn")
        expect(cancelRouteBtn).toBeDefined()
        fireEvent.click(cancelRouteBtn!)
    });

    it('search for origin and destination no results geocoding', () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)
        fireEvent.click(checkMap!)

        const originInput = findById("origin-input")
        expect(originInput).toBeDefined()
        fireEvent.change(originInput!, { target: { value: "Aveiro" } })
        const destinationInput = findById("destination-input")
        expect(destinationInput).toBeDefined()
        fireEvent.change(destinationInput!, { target: { value: "Porto" } })

        fetchMock.mockResponseOnce(JSON.stringify({
            items: []
        }))

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)

        const cancelRouteBtn = findById("cancel-route-btn")
        expect(cancelRouteBtn).toBeDefined()
        fireEvent.click(cancelRouteBtn!)
    });

    it('search for origin and destination dont pass arguments', () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)
        fireEvent.click(checkMap!)

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)

        const cancelRouteBtn = findById("cancel-route-btn")
        expect(cancelRouteBtn).toBeDefined()
        fireEvent.click(cancelRouteBtn!)
    });

    it('search for origin and destination, origin is coordinates', () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)
        fireEvent.click(checkMap!)

        const originInput = findById("origin-input")
        expect(originInput).toBeDefined()
        fireEvent.change(originInput!, { target: { value: "40.64427,-8.64554" } })
        const destinationInput = findById("destination-input")
        expect(destinationInput).toBeDefined()
        fireEvent.change(destinationInput!, { target: { value: "Porto" } })

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

        fetchMock.mockResponseOnce(JSON.stringify({
            paths: [
                {
                    points: {
                        coordinates: [
                            [40.64427, -8.64554],
                            [40.64427, -8.64554]
                        ]
                    }
                }
            ]
        }))

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)

        const cancelRouteBtn = findById("cancel-route-btn")
        expect(cancelRouteBtn).toBeDefined()
        fireEvent.click(cancelRouteBtn!)
    });

    it('search for origin and destination, destination is coordinates', () => {
        const routeBtn = findById("ori-dst-btn")
        expect(routeBtn).toBeDefined()
        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        fireEvent.click(routeBtn!)

        const checkMap = findById("mapcbox")
        expect(checkMap).toBeDefined()
        fireEvent.click(checkMap!)
        fireEvent.click(checkMap!)

        const originInput = findById("origin-input")
        expect(originInput).toBeDefined()
        fireEvent.change(originInput!, { target: { value: "Aveiro" } })
        const destinationInput = findById("destination-input")
        expect(destinationInput).toBeDefined()
        fireEvent.change(destinationInput!, { target: { value: "40.64427,-8.64554" } })

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

        fetchMock.mockResponseOnce(JSON.stringify({
            paths: [
                {
                    points: {
                        coordinates: [
                            [40.64427, -8.64554],
                            [40.64427, -8.64554]
                        ]
                    }
                }
            ]
        }))

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)

        const cancelRouteBtn = findById("cancel-route-btn")
        expect(cancelRouteBtn).toBeDefined()
        fireEvent.click(cancelRouteBtn!)
    });

    it('origin and destination in map', () => {
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

        fetchMock.mockResponseOnce(JSON.stringify({
            paths: [
                {
                    points: {
                        coordinates: [
                            [40.64427, -8.64554],
                            [40.64427, -8.64554]
                        ]
                    }
                }
            ]
        }))

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)
    });

    it('origin and destination in map, no results', () => {
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

        fetchMock.mockResponseOnce(JSON.stringify({
            paths: []
        }))

        const getRouteBtn = findById("get-route-btn")
        expect(getRouteBtn).toBeDefined()
        fireEvent.click(getRouteBtn!)
    });

    describe("Show Instructions", () => {

        beforeEach(() => {
            component = render(<MapComponent />).container
        })

        it.skip("show instructions", async () => {
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

            fetchMock.mockResponseOnce(JSON.stringify({
                paths: [
                    {
                        points: {
                            coordinates: [
                                [40.64427, -8.64554],
                                [40.64427, -8.64554]
                            ]
                        },
                        instructions: [
                            {
                                text: "Turn left",
                                distance: 100,
                                time: 123
                            },
                            {
                                text: "Turn Right",
                                distance: 200,
                                time: 342
                            },
                        ]
                    }
                ]
            }))

            const getRouteBtn = findById("get-route-btn")
            expect(getRouteBtn).toBeDefined()
            fireEvent.click(getRouteBtn!)

            await waitFor(() => { }, { timeout: 1000 })

            const showInstructionsCard = findById("ins-card")
            expect(showInstructionsCard).toBeDefined()
            expect(showInstructionsCard!.textContent).toContain("Turn left")

            const nextInsBtn = findById("next-ins-btn")
            expect(nextInsBtn).toBeDefined()
            fireEvent.click(nextInsBtn!)

            const prevInsBtn = findById("before-ins-btn")
            expect(prevInsBtn).toBeDefined()
            fireEvent.click(prevInsBtn!)
        })
    })

    describe("Add Intermediates", () => {
        beforeEach(() => {
            component = render(<MapComponent />).container
        })

        it("add intermediates", async () => {
            const routeBtn = findById("ori-dst-btn")
            expect(routeBtn).toBeDefined()
            fireEvent.click(routeBtn!)

            const addIntermediateBtn = findById("add-intermediate-btn")
            expect(addIntermediateBtn).toBeDefined()
            fireEvent.click(addIntermediateBtn!)
            fireEvent.click(addIntermediateBtn!)

            const removeIntermediateBtn = findById("intermediate-minus-btn-0")
            expect(removeIntermediateBtn).toBeDefined()
            fireEvent.click(removeIntermediateBtn!)

            fireEvent.click(addIntermediateBtn!)

            fireEvent.click(addIntermediateBtn!)

            const originInput = findById("origin-input")
            expect(originInput).toBeDefined()
            fireEvent.change(originInput!, { target: { value: "40.64427,-8.64554" } })

            const intermediateInput = findById("intermediate-input-0")
            expect(intermediateInput).toBeDefined()
            fireEvent.change(intermediateInput!, { target: { value: "40.64427,-8.64554" } })

            const intermediateInput2 = findById("intermediate-input-2")
            expect(intermediateInput2).toBeDefined()
            fireEvent.change(intermediateInput2!, { target: { value: "Viseu" } })

            const destinationInput = findById("destination-input")
            expect(destinationInput).toBeDefined()
            fireEvent.change(destinationInput!, { target: { value: "40.64427,-8.64554" } })

            fetchMock.mockResponseOnce(JSON.stringify({
                paths: [
                    {
                        points: {
                            coordinates: [
                                [40.64427, -8.64554],
                                [40.64427, -8.64554]
                            ]
                        },
                        instructions: [
                            {
                                text: "Turn left",
                                distance: 100,
                                time: 123
                            },
                            {
                                text: "Turn Right",
                                distance: 200,
                                time: 342
                            },
                        ]
                    }
                ]
            }))

            const getRouteBtn = findById("get-route-btn")
            expect(getRouteBtn).toBeDefined()
            fireEvent.click(getRouteBtn!)

            const removeIntermediateBtn1 = findById("intermediate-minus-btn-1")
            expect(removeIntermediateBtn1).toBeDefined()
            fireEvent.click(removeIntermediateBtn1!)
        });
    });
})
import { enableFetchMocks } from 'jest-fetch-mock'
import MapComponent from "../../app/components/Map"
import {fireEvent, render, screen} from "@testing-library/react"

describe("MapComponent", () => {

    enableFetchMocks()

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
    })

    it("rotates to the right", () => {
        const rotateRight = findById("map-rotate-right-btn")
        expect(rotateRight).toBeDefined()

        fireEvent.click(rotateRight!)
    })

    it("rotates to the left", () => {
        const rotateLeft = findById("map-rotate-left-btn")
        expect(rotateLeft).toBeDefined()

        fireEvent.click(rotateLeft!)
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
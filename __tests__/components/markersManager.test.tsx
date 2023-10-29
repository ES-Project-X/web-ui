import { fireEvent, render } from "@testing-library/react";
import MapComponent from "../../app/components/Map";
import { enableFetchMocks } from "jest-fetch-mock";
import FilterBoardComponent from "../../app/components/FilterBoard";

describe("MarkersManager", () => {

    enableFetchMocks();

    let mapContainer: HTMLElement;

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
        mapContainer = render(<MapComponent/>).container;
    });

    it("adds a green marker", () => {
    })

    it("adds a green marker and a red marker", () => {
    })

    it("removes a green marker", () => {
    })

    it("removes a red marker", () => {
    })

    it("add a green marker and a red marker, then removes the green marker", () => {
    })

    it("add a single red marker", () => {
    })

    it("check red marker popup", () => {
    })

    it("remove red marker", () => {
    })
})
import { fireEvent, render, screen } from "@testing-library/react";
import MapComponent from "../../app/components/Map";
import { enableFetchMocks } from "jest-fetch-mock";

describe("MarkersManager", () => {
    enableFetchMocks();

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
        render(<MapComponent/>);
    });

    it("adds a green marker and a red marker", () => {
        const createRouteButton = screen.getByRole("button", {name: "Route"});
        fireEvent.click(createRouteButton!);

        const checkBox = screen.getByRole("checkbox", {name: "Select in Map"});
        fireEvent.click(checkBox!);

        const map = document.getElementById("map-container");
        fireEvent.click(map!, {clientX: 100, clientY: 100});

        const greenMarker = screen.getByRole("button", {name: "Marker"});
        expect(greenMarker).toBeDefined();
        fireEvent.click(map!, {clientX: 10, clientY: 10});

        const redMarker = screen.queryAllByRole("button", {name: "Marker"})[1];
        expect(redMarker).toBeDefined();
    })
/*
    it("add and remove a single marker", () => {
        const map = document.getElementById("map-container");
        fireEvent.click(map!, {clientX: 100, clientY: 100});

        const marker = screen.getByRole("button", {name: "Marker"});
        expect(marker).toBeDefined();
        fireEvent.dblClick(marker);
    })*/

    it("add a green marker and a red marker and drag them", () => {
        const createRouteButton = screen.getByRole("button", {name: "Route"});
        fireEvent.click(createRouteButton!);

        const checkBox = screen.getByRole("checkbox", {name: "Select in Map"});
        fireEvent.click(checkBox!);

        const map = document.getElementById("map-container");
        fireEvent.click(map!, {clientX: 100, clientY: 100});

        const greenMarker = screen.getByRole("button", {name: "Marker"});
        expect(greenMarker).toBeDefined();
        fireEvent.drag(greenMarker!, {clientX: 200, clientY: 200});
        expect(greenMarker).toBeDefined();

        fireEvent.click(map!, {clientX: 10, clientY: 10});

        const redMarker = screen.queryAllByRole("button", {name: "Marker"})[1];
        expect(redMarker).toBeDefined();
        fireEvent.drag(redMarker!, {clientX: 300, clientY: 300});
        expect(redMarker).toBeDefined();
    })
})
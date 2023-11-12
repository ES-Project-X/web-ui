import MapComponent from "../../app/components/Map"
import { fireEvent, render } from "@testing-library/react"
import { enableFetchMocks } from "jest-fetch-mock"

describe('getClusters', () => {

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

    it.skip('should call fetchFunction on move to unexplored map section', () => {
        const map = document.getElementById("map-container");
        expect(map).toBeDefined();

        fireEvent.mouseDown(map!, {clientX: 0, clientY: 0});
        fireEvent.mouseMove(map!, {clientX: 100, clientY: 100});
        fireEvent.mouseUp(map!);

        fireEvent.mouseDown(map!, {clientX: 0, clientY: 0});
        fireEvent.mouseMove(map!, {clientX: 200, clientY: 200});
        fireEvent.mouseUp(map!);
    })
})
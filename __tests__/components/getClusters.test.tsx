import MapComponent from "../../app/components/Map"
import { fireEvent, render } from "@testing-library/react"
import { enableFetchMocks } from "jest-fetch-mock"

describe('getClusters', () => {

    enableFetchMocks();

    beforeEach(() => {
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
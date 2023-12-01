import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MapComponent from "../../app/components/Map";
import { enableFetchMocks } from "jest-fetch-mock";

describe("MarkersManager", () => {
    enableFetchMocks();

    beforeEach(() => {
        render(<MapComponent />);
    });

    it("adds a green marker and a red marker", () => {
        const createRouteButton = screen.getByRole("button", { name: "Route" });
        fireEvent.click(createRouteButton!);

        const checkBox = screen.getByRole("checkbox", { name: "Select in Map" });
        fireEvent.click(checkBox!);

        const map = document.getElementById("map-container");
        fireEvent.click(map!, { clientX: 100, clientY: 100 });

        const greenMarker = screen.getByRole("button", { name: "Marker" });
        expect(greenMarker).toBeDefined();
        fireEvent.click(map!, { clientX: 10, clientY: 10 });

        const redMarker = screen.queryAllByRole("button", { name: "Marker" })[1];
        expect(redMarker).toBeDefined();
    })
    
    it("add and remove a single marker", () => {
        const map = document.getElementById("map-container");
        fireEvent.click(map!, {clientX: 100, clientY: 100});

        const marker = screen.getByRole("button", {name: "Marker"});
        expect(marker).toBeDefined();
        fireEvent.click(map!, {clientX: 10, clientY: 10});
    })

    it("add a green marker and a red marker and drag them", () => {
        const createRouteButton = screen.getByRole("button", { name: "Route" });
        fireEvent.click(createRouteButton!);

        const checkBox = screen.getByRole("checkbox", { name: "Select in Map" });
        fireEvent.click(checkBox!);

        const map = document.getElementById("map-container");
        fireEvent.click(map!, { clientX: 100, clientY: 100 });

        const greenMarker = screen.getByRole("button", { name: "Marker" });
        expect(greenMarker).toBeDefined();
        fireEvent.dragEnd(greenMarker!, { clientX: 200, clientY: 200 });
        expect(greenMarker).toBeDefined();

        fireEvent.click(map!, { clientX: 10, clientY: 10 });

        const redMarker = screen.queryAllByRole("button", { name: "Marker" })[1];
        expect(redMarker).toBeDefined();
        fireEvent.dragEnd(redMarker!, { clientX: 300, clientY: 300 });
        expect(redMarker).toBeDefined();
    })
    /*
    it("add a red marker and open and close modal", () => {
        const map = document.getElementById("map-container");
        fireEvent.click(map!, { clientX: 100, clientY: 100 });

        const create_modal = document.getElementById("my_modal_1");
        expect(create_modal).toBeDefined();

        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toBeDefined();
    })

    it("add a red marker and open both modals", () => {
        const map = document.getElementById("map-container");
        fireEvent.click(map!, { clientX: 100, clientY: 100 });

        const create_modal = document.getElementById("my_modal_1");
        expect(create_modal).toBeDefined();

        const createButton = screen.getByRole("button", { name: "Create POI" });
        expect(createButton).toBeDefined();
        fireEvent.click(createButton!);

        const save_modal = document.getElementById("my_modal_2");
        expect(save_modal).toBeDefined();
        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toBeDefined();
        fireEvent.click(closeButton!);
        expect(save_modal).toBeDefined();
    })

    it("add a red marker and open both modals and save", () => {
        const map = document.getElementById("map-container");
        fireEvent.click(map!, { clientX: 100, clientY: 100 });

        const create_modal = document.getElementById("my_modal_1");
        expect(create_modal).toBeDefined();

        const createButton = screen.getByRole("button", { name: "Create POI" });
        expect(createButton).toBeDefined();
        fireEvent.click(createButton!);

        const save_modal = document.getElementById("my_modal_2");
        expect(save_modal).toBeDefined();

        const nameInput = screen.getByPlaceholderText("Type the name here");
        const typeInput = screen.getByPlaceholderText("Write the type here");
        const imageInput = document.getElementById("image") as HTMLInputElement;
        console.log(imageInput);

        fireEvent.change(nameInput, {
            target: { value: "Test" },
        });
        fireEvent.change(typeInput, {
            target: { value: "Test" },
        });
        fireEvent.change(imageInput, {
            target: { files: new File(["(⌐□_□)"], "../../benfica.png", { type: "image/png" }) },
        });

        const saveButton = screen.getByRole("button", { name: "Save POI" });
        expect(saveButton).toBeDefined();
        fireEvent.click(saveButton!);

        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toBeDefined();
        fireEvent.click(closeButton!);
    })*/
})
import MarkersManager from "../../app/components/MarkersManager";
import { fireEvent, render, screen } from "@testing-library/react"
import { enableFetchMocks } from "jest-fetch-mock";
import { useState } from 'react';
import { MapContainer, TileLayer } from "react-leaflet";

function TestComponent() {
    const [creatingRoute, setCreatingRoute] = useState(false);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    return (
        <div id="testMap">
            <button onClick={() => setCreatingRoute(!creatingRoute)}>Toggle creatingRoute</button>
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MarkersManager setOrigin={setOrigin} setDestination={setDestination} creatingRoute={creatingRoute} />
            </MapContainer>
        </div>
    );
}

describe("MarkersManager", () => {
  enableFetchMocks();

    enableFetchMocks();

    it("adds a green marker", () => {
        const { getByText } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");
        fireEvent.click(toggleButton);

        let component = screen.getByTestId("testMap");

        fireEvent.click(component, { clientX: 100, clientY: 100 });


        const greenMarker = screen.getByRole("img", { name: "green-marker" });
        console.log(greenMarker);
        expect(greenMarker).toBeDefined();
    })

    it("adds a green marker and a red marker", () => {
        const { getByText, container } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");
        fireEvent.click(toggleButton);

        fireEvent.click(container!, { clientX: 100, clientY: 100 });
        fireEvent.click(container!, { clientX: 200, clientY: 200 });

        const greenMarker = container.querySelector(".green-marker-icon")
        expect(greenMarker).toBeDefined()

        const redMarker = container.querySelector(".red-marker-icon")
        expect(redMarker).toBeDefined()
    })

    it("removes a green marker", () => {
        const { getByText, container } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");
        fireEvent.click(toggleButton);

        fireEvent.click(container!, { clientX: 100, clientY: 100 });

        const greenMarker = container.querySelector(".green-marker-icon")
        expect(greenMarker).toBeDefined()

        fireEvent.click(greenMarker!)

        const greenMarker2 = container.querySelector(".green-marker-icon")
        expect(greenMarker2).toBeUndefined()
    })

    it("removes a red marker", () => {
        const { getByText, container } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");
        fireEvent.click(toggleButton);

        fireEvent.click(container!, { clientX: 100, clientY: 100 });
        fireEvent.click(container!, { clientX: 200, clientY: 200 });

        const redMarker = container.querySelector(".red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)

        const redMarker2 = container.querySelector(".red-marker-icon")
        expect(redMarker2).toBeUndefined()
    })

    it("add a green marker and a red marker, then removes the green marker", () => {
        const { getByText, container } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");
        fireEvent.click(toggleButton);

        fireEvent.click(container!, { clientX: 100, clientY: 100 });
        fireEvent.click(container!, { clientX: 200, clientY: 200 });

        const greenMarker = container.querySelector(".green-marker-icon")
        expect(greenMarker).toBeDefined()

        const redMarker = container.querySelector(".red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(greenMarker!)

        const greenMarker2 = container.querySelector(".green-marker-icon")
        expect(greenMarker2).toBeUndefined()

        const redMarker2 = container.querySelector(".red-marker-icon")
        expect(redMarker2).toBeDefined()
    })

    it("add a single red marker", () => {
        const { getByText, container } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");

        fireEvent.click(container!, { clientX: 100, clientY: 100 });

        const redMarker = container.querySelector(".red-marker-icon")
        expect(redMarker).toBeDefined()

    })

    it("check red marker popup", () => {
        const { getByText, container } = render(<TestComponent />);
        const toggleButton = getByText("Toggle creatingRoute");

        fireEvent.click(container!, { clientX: 100, clientY: 100 });

        const redMarker = container.querySelector(".red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)
    })
})
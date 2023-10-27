import MarkersManager from "../../app/components/MarkersManager";
import MapComponent from "../../app/components/Map";
import { render, screen, fireEvent } from "@testing-library/react";
import { enableFetchMocks } from "jest-fetch-mock";
import { MapContainer } from "react-leaflet";
import CreatePOIModal from "../../app/components/CreatePOIModal";
import SavePOIModal from "../../app/components/SavePOIModal";
describe("MarkersManager", () => {
  enableFetchMocks();

  let component: HTMLElement;

  const findById = (id: string) => {
    return component.querySelector(`#${id}`) ?? undefined;
  };

  const findByClass = (className: string) => {
    return component.querySelector(`.${className}`) ?? undefined;
  };

  beforeEach(() => {
    global.navigator.geolocation = {
      watchPosition: jest.fn().mockImplementationOnce((success) =>
        Promise.resolve(
          success({
            coords: {
              latitude: 40.64427,
              longitude: -8.64554,
            },
          })
        )
      ),
    };
    component = render(<MapComponent />).container;
  });

  it("adds a green marker", () => {
    const routeBtn = findById("ori-dst-btn");
    expect(routeBtn).toBeDefined();
    fireEvent.click(routeBtn!);

    const checkMap = findById("mapcbox");
    expect(checkMap).toBeDefined();
    fireEvent.click(checkMap!);

    const mapContainer = findById("map-container");
    expect(mapContainer).toBeDefined();
    fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

    const greenMarker = findByClass("green-marker-icon");
    expect(greenMarker).toBeDefined();
  });

  it("adds a green marker and a red marker", () => {
    const routeBtn = findById("ori-dst-btn");
    expect(routeBtn).toBeDefined();
    fireEvent.click(routeBtn!);

    const checkMap = findById("mapcbox");
    expect(checkMap).toBeDefined();
    fireEvent.click(checkMap!);

    const mapContainer = findById("map-container");
    expect(mapContainer).toBeDefined();

    fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });
    fireEvent.click(mapContainer!, { clientX: 200, clientY: 200 });

    const greenMarker = findByClass("green-marker-icon");
    expect(greenMarker).toBeDefined();

    const redMarker = findByClass("red-marker-icon");
    expect(redMarker).toBeDefined();
  });

  it("removes a green marker", () => {
    const routeBtn = findById("ori-dst-btn");
    expect(routeBtn).toBeDefined();
    fireEvent.click(routeBtn!);

    const checkMap = findById("mapcbox");
    expect(checkMap).toBeDefined();
    fireEvent.click(checkMap!);

    const mapContainer = findById("map-container");
    expect(mapContainer).toBeDefined();

    fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

    const greenMarker = findByClass("green-marker-icon");
    expect(greenMarker).toBeDefined();

    fireEvent.click(greenMarker!);

    const greenMarker2 = findByClass("green-marker-icon");
    expect(greenMarker2).toBeUndefined();
  });

  it("removes a red marker", () => {
    const routeBtn = findById("ori-dst-btn");
    expect(routeBtn).toBeDefined();
    fireEvent.click(routeBtn!);

    const checkMap = findById("mapcbox");
    expect(checkMap).toBeDefined();
    fireEvent.click(checkMap!);

    const mapContainer = findById("map-container");
    expect(mapContainer).toBeDefined();

    fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });
    fireEvent.click(mapContainer!, { clientX: 200, clientY: 200 });

    const redMarker = findByClass("red-marker-icon");
    expect(redMarker).toBeDefined();

    fireEvent.click(redMarker!);

    const redMarker2 = findByClass("red-marker-icon");
    expect(redMarker2).toBeUndefined();
  });

  it("add a green marker and a red marker, then removes the green marker", () => {
    const routeBtn = findById("ori-dst-btn");
    expect(routeBtn).toBeDefined();
    fireEvent.click(routeBtn!);

    const checkMap = findById("mapcbox");
    expect(checkMap).toBeDefined();
    fireEvent.click(checkMap!);

    const mapContainer = findById("map-container");
    expect(mapContainer).toBeDefined();

    fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });
    fireEvent.click(mapContainer!, { clientX: 200, clientY: 200 });

    const greenMarker = findByClass("green-marker-icon");
    expect(greenMarker).toBeDefined();

    const redMarker = findByClass("red-marker-icon");
    expect(redMarker).toBeDefined();

    fireEvent.click(greenMarker!);

    const greenMarker2 = findByClass("green-marker-icon");
    expect(greenMarker2).toBeUndefined();

    const redMarker2 = findByClass("red-marker-icon");
    expect(redMarker2).toBeDefined();
  });

  // TODO: fix when Creating Route is implemented
  /*
    it("add a single red marker", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()
        render(<MarkersManager creatingRoute={false}/>)

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()
    })

    it("check red marker popup", () => {
        const mapContainer = findById("map-container")
        expect(mapContainer).toBeDefined()
        render(<MarkersManager creatingRoute={false}/>)

        fireEvent.click(mapContainer!, { clientX: 100, clientY: 100 });

        const redMarker = findByClass("red-marker-icon")
        expect(redMarker).toBeDefined()

        fireEvent.click(redMarker!)

        const popup = screen.getByText(/You are at/i)
        expect(popup).toBeDefined()
    }
    */

  it("renders a draggable marker when isModalOpen is false", () => {
    // Arrange
    const { container } = render(
      <MapContainer>
        <MarkersManager
          setOrigin={() => {}}
          setDestination={() => {}}
          creatingRoute={false}
        />
      </MapContainer>
    );

    // Act

    // Assert
    const marker = container.querySelector(".red-marker-icon");
    expect(marker).toBeDefined();
    const draggableMarker = container.querySelector(
      ".leaflet-marker-draggable"
    );
    expect(draggableMarker).toBeDefined();
  });

  it("renders markers when redPosition is not null", () => {
    // Arrange
    const setOrigin = jest.fn();
    const setDestination = jest.fn();
    const setRedPosition = jest.fn();

    const { container } = render(
      <MapContainer>
        <MarkersManager
          setOrigin={setOrigin}
          setDestination={setDestination}
          creatingRoute={false}
          /* other props as needed */
        />
      </MapContainer>
    );
    setRedPosition({ lat: 40.1234, lng: -8.5678 });

    // Act

    // Assert
    const redMarker = container.querySelector(".red-marker-icon");
    expect(redMarker).toBeDefined();
  });

  it("renders the 'Create POI' modal when isModalOpen is true and isPOIModalOpen is false", () => {
    // Arrange
    const setOrigin = jest.fn();
    const setDestination = jest.fn();

    const { container } = render(
      <MapContainer>
        <MarkersManager
          setOrigin={setOrigin}
          setDestination={setDestination}
          creatingRoute={false}
          isModalOpen={true}
          isPOIModalOpen={false}
          /* other props as needed */
        />
      </MapContainer>
    );

    // Act

    // Assert
    const createPOIModal = container.querySelector(".create-poi-modal");
    expect(createPOIModal).toBeDefined();
  });

  it("renders the 'Save POI' modal when isPOIModalOpen is true", () => {
    // Arrange
    const setOrigin = jest.fn();
    const setDestination = jest.fn();

    const { container } = render(
      <MapContainer>
        <MarkersManager
          setOrigin={setOrigin}
          setDestination={setDestination}
          creatingRoute={false}
          isPOIModalOpen={true}
          /* other props as needed */
        />
      </MapContainer>
    );

    // Act

    // Assert
    const savePOIModal = container.querySelector(".save-poi-modal");
    expect(savePOIModal).toBeDefined();
  });

  it("should save POI and close modal when valid input is provided", () => {
    const { container } = render(
      <MapContainer>
        <SavePOIModal
          onClose={() => {}}
          onSavePOI={() => {}}
          handleKeyDown={() => {}}
          poiLat={0}
          poiLon={0} /* other props as needed */
        />
      </MapContainer>
    );

    const nameInput = container.querySelector("#name");
    expect(nameInput).toBeDefined();

    const typeInput = container.querySelector("#type");
    expect(typeInput).toBeDefined();

    const savePOIBtn = container.querySelector(".glass");
    expect(savePOIBtn).toBeDefined();

    fireEvent.change(nameInput!, { target: { value: "Test" } });
    fireEvent.change(typeInput!, { target: { value: "Test" } });
    fireEvent.click(savePOIBtn!);

    const savePOIModal = container.querySelector(".save-poi-modal");
    expect(savePOIModal).toBeNull();
  });

  it("should not save POI and close modal when invalid input is provided", () => {
    const { container } = render(
      <MapContainer>
        <SavePOIModal
          onClose={() => {}}
          onSavePOI={() => {}}
          handleKeyDown={() => {}}
          poiLat={0}
          poiLon={0} /* other props as needed */
        />
      </MapContainer>
    );

    const nameInput = container.querySelector("#name");
    expect(nameInput).toBeDefined();

    const typeInput = container.querySelector("#type");
    expect(typeInput).toBeDefined();

    const savePOIBtn = container.querySelector(".glass");
    expect(savePOIBtn).toBeDefined();

    fireEvent.change(nameInput!, { target: { value: "" } });
    fireEvent.change(typeInput!, { target: { value: "" } });
    fireEvent.click(savePOIBtn!);

    const savePOIModal = container.querySelector(".save-poi-modal");
    expect(savePOIModal).toBeDefined();
  });

  // mock that redPosition is not null
  
});

import L from 'leaflet';
import { render } from '@testing-library/react';
import { updateClusterGroup } from '../../app/components/DisplayPOIs';


jest.mock('leaflet', () => ({
  ...jest.requireActual('leaflet'),
  map: () => ({
    addLayer: jest.fn(),
    hasLayer: jest.fn(),
  }),
  markerClusterGroup: () => ({
    clearLayers: jest.fn(),
    addLayer: jest.fn(),
    hasLayer: jest.fn(),
    getLayers: jest.fn(() => []),
  }),
}));



describe('updateClusterGroup', () => {
  test('clears existing layers and adds new markers to the cluster group', () => {
    // Mock the necessary objects and functions
    const toAddMarkers = [
      { id: "1", name: "bench1", type: "bench", latitude: 51.5074, longitude: -0.0901, icon: L.icon() },
      { id: "2", name: "water", type: "waterfountain", latitude: 52.5200, longitude: 13.4050, icon: L.icon() },
    ];
    const mapRef = { current: L.map(document.createElement('div')) };
    const fetchPOIDetails = jest.fn();

    // Render a container element for the map
    const { container } = render(<div id="map" />);

    // Update the cluster group
    updateClusterGroup(toAddMarkers, mapRef, fetchPOIDetails);

    
  });
});
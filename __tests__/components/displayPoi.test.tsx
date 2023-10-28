import L from 'leaflet';
import { render } from '@testing-library/react';
import { updateClusterGroup } from '../../app/components/DisplayPOIs';

describe('updateClusterGroup', () => {
  test('clears existing layers and adds new markers to the cluster group', () => {
    // Mock the necessary objects and functions
    const toAddMarkers = [
      { id: 1, latitude: 51.5074, longitude: -0.0901, icon: L.icon() },
      { id: 2, latitude: 52.5200, longitude: 13.4050, icon: L.icon() },
    ];
    const mapRef = { current: L.map(document.createElement('div')) };
    const fetchPOIDetails = jest.fn();
    const clusterGroup = L.markerClusterGroup();

    // Render a container element for the map
    const { container } = render(<div id="map" />);

    // Update the cluster group
    updateClusterGroup(toAddMarkers, mapRef, fetchPOIDetails);

    // Assertions

    // The cluster group should be added to the map
    expect(mapRef.current.hasLayer(clusterGroup)).toBeTruthy();

    // The cluster group should contain the correct number of markers
    expect(clusterGroup.getLayers().length).toBe(toAddMarkers.length);

    // Each marker in the cluster group should have the correct icon and onClick event
    toAddMarkers.forEach((marker) => {
      const layer = clusterGroup.getLayers().find((l) => l.options.icon === marker.icon);
      expect(layer).toBeDefined();
      expect(layer.options.icon).toBe(marker.icon);

      // Simulate a click event on the marker
      layer.fire('click');
      expect(fetchPOIDetails).toHaveBeenCalledWith(marker.id);
      expect(document.getElementById('poi-sidebar')?.style.display).toBe('block');
    });
  });
});
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import POIsSidebar from '../../app/components/POIsSidebar';

describe('POIsSidebar', () => {
  test('renders the component with selected POI', () => {
    const selectedPOI = {
      name: 'Test POI',
      type: 'Test Type',
      description: 'Test Description',
      rating_positive: 10,
      rating_negative: 5,
    };

    render(<POIsSidebar selectedPOI={selectedPOI} />);

    // Assert that the component renders the selected POI's name
    expect(screen.getByText('Test POI')).toBeInTheDocument();

    // Assert that the component renders the selected POI's type
    expect(screen.getByText('Test Type')).toBeInTheDocument();

    // Assert that the component renders the selected POI's description
    expect(screen.getByText('Test Description')).toBeInTheDocument();

    // Assert that the component renders the selected POI's positive rating
    expect(screen.getByText('10')).toBeInTheDocument();

    // Assert that the component renders the selected POI's negative rating
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  // TEST IS NOT WORKING
  test('hides the card when close button is clicked', () => {
    const selectedPOI = {
      name: 'Test POI',
      type: 'Test Type',
      description: 'Test Description',
      rating_positive: 10,
      rating_negative: 5,
    };

    render(<POIsSidebar selectedPOI={selectedPOI} />);

    // Assert that the component is initially visible
    expect(screen.getByTestId('poi-sidebar')).toBeVisible();

    // Click the close button
    fireEvent.click(screen.getByTestId('close-button'));

    // Assert that the component is hidden after clicking the close button
    expect(screen.queryByTestId('poi-sidebar')).toBeNull();
  });
});
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import POIsSidebar from '../../app/components/POIsSidebar';

describe('POIsSidebar', () => {

  const selectedPOI = {
    name: 'Test POI',
    type: 'Test Type',
    description: 'Test Description',
    picture_url: '../../benfica.png',
  };

  beforeEach(() => {
    render(<POIsSidebar selectedPOI={selectedPOI} rateExistenceFunction={() => { }} ratingPositive={10} ratingNegative={5} setRatingNegative={() => { }} setRatingPositive={() => { }} />);
  })

  it('renders the component with selected POI', () => {


    // Assert that the component renders the selected POI's name
    expect(screen.getByText('Test POI')).toBeInTheDocument();

    // Assert that the component renders the selected POI's type
    expect(screen.getByText('Test Type')).toBeInTheDocument();

    // Assert that the component renders the selected POI's description
    expect(screen.getByText('Test Description')).toBeInTheDocument();

    // Assert that the component renders the selected POI's positive rating (number type)
    expect(screen.getAllByText('10')).toHaveLength(1);

    // Assert that the component renders the selected POI's negative rating
    expect(screen.getAllByText('5')).toHaveLength(1);
  });


  test('hides the card when close button is clicked', () => {

    // Assert that the component is initially visible
    expect(screen.getByTestId('poi-sidebar')).toBeVisible();

    // Click the close button
    fireEvent.click(screen.getByTestId('close-button'));
  });

});
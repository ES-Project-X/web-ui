import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { enableFetchMocks } from 'jest-fetch-mock'
import POIsSidebar from '../../app/components/POIsSidebar';
import { mock } from 'node:test';


describe('POIsSidebar', () => {

    enableFetchMocks();

    const selectedPOI = {
        id: "rtyu",
        name: 'Test POI',
        type: 'Test Type',
        description: 'Test Description',
        picture_url: '../../benfica.png',
        latitude: 40.64427,
        longitude: -8.64554,
        rate: null,
    };

    const selectedPOI2 = {
        id: "rtyu",
        name: 'Test POI',
        type: 'Test Type',
        description: 'Test Description',
        picture_url: '../../benfica.png',
        latitude: 40.64427,
        longitude: -8.64554,
        rate: true,
    };

    const selectedPOI3 = {
        id: "rtyu",
        name: 'Test POI',
        type: 'Test Type',
        description: 'Test Description',
        picture_url: '../../benfica.png',
        latitude: 40.64427,
        longitude: -8.64554,
        rate: false,
    };

    const mockRateExistenceFunction = jest.fn();
    const mockSetRatingPositive = jest.fn();
    const mockSetRatingNegative = jest.fn();

    it('renders the component with selected POI', () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={5}
            setRatingNegative={mockSetRatingNegative}
        />);


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


    it('hides the card when close button is clicked', () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={5}
            setRatingNegative={mockSetRatingNegative}
        />);

        // Assert that the component is initially visible
        expect(screen.getByTestId('poi-sidebar')).toBeVisible();

        // Click the close button
        const close_button = screen.getByRole('button', { name: '' });
        fireEvent.click(close_button);
    });

    it('changes the rating when the positive button is clicked', async () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={5}
            setRatingNegative={mockSetRatingNegative}
        />);

        // Assert that the component is initially visible
        expect(screen.getByTestId('poi-sidebar')).toBeVisible();

        mockRateExistenceFunction.mockReturnValueOnce(true);

        // Click the positive button
        const positive_button = screen.getByRole('button', { name: '10' });
        fireEvent.click(positive_button);

        expect(mockRateExistenceFunction).toHaveBeenCalled();
        expect(mockSetRatingPositive).toHaveBeenCalled();
    });

    it('changes the rating when the negative button is clicked', async () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={6}
            setRatingNegative={mockSetRatingNegative}
        />);

        // Assert that the component is initially visible
        expect(screen.getByTestId('poi-sidebar')).toBeVisible();

        mockRateExistenceFunction.mockReturnValueOnce(true);

        // Click the negative button
        const negative_button = screen.getByText('6');
        console.log(negative_button.innerHTML);
        fireEvent.click(negative_button);

        expect(mockRateExistenceFunction).toHaveBeenCalled();
    });

    it('changes the rating when the positive button is clicked and the POI already has the same rating', async () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI2}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={5}
            setRatingNegative={mockSetRatingNegative}
        />);

        // Assert that the component is initially visible
        expect(screen.getByTestId('poi-sidebar')).toBeVisible();

        mockRateExistenceFunction.mockReturnValueOnce(true);

        // Click the positive button
        const positive_button = screen.getByRole('button', { name: '10' });
        fireEvent.click(positive_button);

        expect(mockRateExistenceFunction).toHaveBeenCalled();
        expect(mockSetRatingPositive).toHaveBeenCalled();
    });

    it('changes the rating when the negative button is clicked and the POI already has a positive rating', async () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI2}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={5}
            setRatingNegative={mockSetRatingNegative}
        />);

        // Assert that the component is initially visible´
        expect(screen.getByTestId('poi-sidebar')).toBeVisible();

        // Click the negative button
        const negative_button = screen.getByText('5');
        fireEvent.click(negative_button);

        mockRateExistenceFunction.mockReturnValueOnce(true);

        expect(mockRateExistenceFunction).toHaveBeenCalled();
        expect(mockSetRatingNegative).toHaveBeenCalled();
    });

    it('changes the rating when the positive button is clicked and the POI already has a negative rating', async () => {

        render(<POIsSidebar
            selectedPOI={selectedPOI3}
            rateExistenceFunction={mockRateExistenceFunction}
            ratingPositive={10}
            setRatingPositive={mockSetRatingPositive}
            ratingNegative={5}
            setRatingNegative={mockSetRatingNegative}
        />);

        // Assert that the component is initially visible
        expect(screen.getByTestId('poi-sidebar')).toBeVisible();

        // Click the positive button
        const positive_button = screen.getByRole('button', { name: '10' });
        fireEvent.click(positive_button);

        mockRateExistenceFunction.mockReturnValueOnce(true);

        expect(mockRateExistenceFunction).toHaveBeenCalled();
        expect(mockSetRatingPositive).toHaveBeenCalled();
    });

});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../src/components/Sidebar';
import { MapViewerProvider } from '../src/context/MapViewerContext';
import { locations } from '../src/data/locations';

describe('Sidebar', () => {
    it('renders the sidebar and toggles its state', () => {
        render(
            <MapViewerProvider>
                <Sidebar />
            </MapViewerProvider>
        );

        // check if the sidebar is initially expanded
        expect(screen.getByText('<')).toBeInTheDocument();

        // check if locations are displayed
        locations.forEach((location) => {
            expect(screen.getByText(location.name)).toBeInTheDocument();
        });

        // toggle the sidebar to collapse
        fireEvent.click(screen.getByText('<'));
        expect(screen.getByText('>')).toBeInTheDocument();

        // toggle the sidebar back to expand
        fireEvent.click(screen.getByText('>'));
        expect(screen.getByText('<')).toBeInTheDocument();
    });

    it('filters locations based on the search input', () => {
        render(
            <MapViewerProvider>
                <Sidebar />
            </MapViewerProvider>
        );

        // check that all locations are rendered initially
        locations.forEach((location) => {
            expect(screen.getByText(location.name)).toBeInTheDocument();
        });

        // enter a search term to filter locations
        const searchInput = screen.getByPlaceholderText('Search locations...');
        fireEvent.change(searchInput, { target: { value: 'Whiterun' } });

        // check that only the filtered location is displayed
        expect(screen.getByText('Whiterun')).toBeInTheDocument();
        locations
            .filter((location) => location.name !== 'Whiterun')
            .forEach((location) => {
                expect(
                    screen.queryByText(location.name)
                ).not.toBeInTheDocument();
            });

        // clear the search input
        fireEvent.change(searchInput, { target: { value: '' } });

        // check that all locations are rendered again
        locations.forEach((location) => {
            expect(screen.getByText(location.name)).toBeInTheDocument();
        });
    });

    it('opens the tutorial popup when "How do I use this?" button is clicked', () => {
        render(
            <MapViewerProvider>
                <Sidebar />
            </MapViewerProvider>
        );

        // check that the tutorial popup is not in the document initially
        expect(
            screen.queryByText('How to Use the Map')
        ).not.toBeInTheDocument();

        // find and click the "How do I use this?" button
        const tutorialButton = screen.getByText('How do I use this?');
        fireEvent.click(tutorialButton);

        // check that the tutorial popup is now in the document
        expect(screen.getByText('How to Use the Map')).toBeInTheDocument();

        // find and click the close button in the popup
        const closeButton = screen.getByLabelText('Close');
        fireEvent.click(closeButton);

        // check that the tutorial popup is no longer in the document
        expect(
            screen.queryByText('How to Use the Map')
        ).not.toBeInTheDocument();
    });
});

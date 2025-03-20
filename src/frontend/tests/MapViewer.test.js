import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapViewerPage from '../src/pages/MapViewerPage';
import { MapViewerProvider } from '../src/contexts/MapViewerContext';
import { pathfinding } from '../src/utils/pathfinding';
import { locations } from '../src/data/locations';

// mock the public URL to avoid issues with image paths (this is where the map image is stored)
beforeAll(() => {
    process.env.PUBLIC_URL = '';
});

// mock the pathfinding function to return a valid path between markarth and whiterun
jest.mock('../src/utils/pathfinding', () => ({
    pathfinding: jest.fn(async (start, destination) => {
        if (start.name === 'Markarth' && destination.name === 'Whiterun') {
            return Promise.resolve(['Markarth', 'Rorikstead', 'Whiterun']);
        }
        return Promise.resolve([]);
    }),
}));

describe('MapViewer', () => {
    it('renders the map image', () => {
        render(
            <MapViewerProvider>
                <MapViewerPage />
            </MapViewerProvider>
        );

        const mapImage = screen.getByAltText('Skyrim Map');
        expect(mapImage).toBeInTheDocument();
        expect(mapImage).toHaveAttribute('src', '/skyrim_map.jpg');
    });

    it('renders pins with appropriate styles and handles clicks', () => {
        render(
            <MapViewerProvider>
                <MapViewerPage />
            </MapViewerProvider>
        );

        // validate pins render
        locations.forEach((location) => {
            const pinElement = screen.getByText(location.name);
            expect(pinElement).toBeInTheDocument();
            expect(pinElement.parentElement).toHaveClass('absolute'); // ensure positioning
        });

        // simulate clicking a pin
        const pinToClick = screen.getByText(locations[0].name); // select the first pin for testing
        fireEvent.click(pinToClick);

        // verify the pin changes to "selected" style
        const pinCircle = pinToClick.previousSibling; // circle element above the name (actual pin)
        expect(pinCircle).toHaveClass('bg-yellow-500'); // selected style

        // simulate clicking again to deselect
        fireEvent.click(pinToClick);
        expect(pinCircle).toHaveClass('bg-red-500'); // default style
    });

    it('finds a valid path between Markarth and Whiterun', async () => {
        render(
            <MapViewerProvider>
                <MapViewerPage />
            </MapViewerProvider>
        );

        const markarthPin = screen.getByText('Markarth');
        const whiterunPin = screen.getByText('Whiterun');

        // Simulate selecting Markarth and Whiterun
        act(() => {
            fireEvent.click(markarthPin);
            fireEvent.click(whiterunPin);
        });

        // Click the "Start" button to trigger pathfinding
        const startButton = screen.getByText('Start');
        await act(async () => {
            fireEvent.click(startButton);
        });

        // Check that the mock pathfinding function was called with the correct arguments
        expect(pathfinding).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Markarth' }),
            expect.objectContaining({ name: 'Whiterun' })
        );

        // Ensure the path was rendered on the map
        const renderedPaths = screen.getAllByRole('img', { hidden: true });
        expect(renderedPaths.length).toBeGreaterThan(0);
    });
});

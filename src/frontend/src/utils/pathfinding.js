import { mapsApi } from '../api/mapsApi';

// pathfinding function using backend API with username passed as a parameter
export async function pathfinding(start, end, username, mapname = 'Skyrim') {
    // ensure username is provided before proceeding
    if (!username) {
        console.error('Username is required to fetch routes.');
        return {
            optimalPath: [],
            optimalVisited: [],
            alternativePath: [],
            alternativeVisited: [],
        };
    }

    try {
        const { optimalPath, alternativePath } = await mapsApi.getRoutesFromMap(
            start,
            end,
            username,
            mapname
        );

        return {
            optimalPath: optimalPath || [],
            optimalVisited: optimalPath || [],
            alternativePath: alternativePath || [],
            alternativeVisited: alternativePath || [],
        };
    } catch (error) {
        console.error('Error fetching paths from backend:', error.message);
        return {
            optimalPath: [],
            optimalVisited: [],
            alternativePath: [],
            alternativeVisited: [],
        };
    }
}

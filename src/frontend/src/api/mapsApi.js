import apiClient from './apiClient';

// list of API calls to simplify the code
export const mapsApi = {
    // gets the map data from the backend for a specific map
    async getMapDataByName(mapname) {
        try {
            const response = await apiClient.get(
                `/maps/getMapDataByName/${mapname}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching map data:', error);
            throw error;
        }
    },

    // gets all available map names
    async getAllMapNames() {
        try {
            const response = await apiClient.get('/maps/getAllMapNames');
            return response.data;
        } catch (error) {
            console.error('Error fetching map names:', error);
            throw error;
        }
    },

    // gets paths from the backend
    async getRoutesFromMap(start, end, username, mapname) {
        try {
            const response = await apiClient.get(
                '/maps/getRoutesFromMapByName',
                {
                    params: { start, end, username, mapname },
                }
            );

            const { optimalPath, alternativePath, routeId } = response.data;

            return {
                optimalPath,
                alternativePath,
                routeId,
            };
        } catch (error) {
            console.error('Error fetching routes:', error);
            throw error;
        }
    },

    // gets paths from the backend using streaming
    async getRoutesFromMapStream(start, end, username, mapname) {
        try {
            const response = await apiClient.get(
                '/maps/getRoutesFromMapStream',
                {
                    params: { start, end, username, mapname },
                }
            );

            const { optimalPath, alternativePath } = response.data;

            return {
                optimalPath,
                alternativePath,
            };
        } catch (error) {
            console.error('Error fetching routes via stream:', error);
            throw error;
        }
    },

    // gets the health status from the backend (healthz)
    async getHealthStatus() {
        try {
            const response = await apiClient.get('/maps/healthz');
            return response.data;
        } catch (error) {
            console.error('Error fetching health status:', error);
            throw error;
        }
    },
};

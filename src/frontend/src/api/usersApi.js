import apiClient from './apiClient';

// list of API calls to simplify the code
export const usersApi = {
    // creates a new user
    async createUser(name) {
        try {
            const response = await apiClient.post('/users/createUser', {
                name,
            });
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async login(name) {
        try {
            const response = await apiClient.post('/users/login', { name });
            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },

    // adds routes to a specific user
    async addRoutesToUser(name, mapname, optimalPath, alternativePath) {
        try {
            const response = await apiClient.put('/users/addRoutesToUser', {
                name,
                mapname,
                optimalPath,
                alternativePath,
            });
            return response.data;
        } catch (error) {
            console.error('Error adding routes to user:', error);
            throw error;
        }
    },

    // deletes a specific route from a user's history
    async deleteSpecificRoute(name, routeId) {
        try {
            const response = await apiClient.delete(
                '/users/deleteSpecificRoute',
                {
                    data: { name, routeId },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting specific route:', error);
            throw error;
        }
    },

    // deletes all routes for a specific user
    async deleteAllRoutes(name) {
        try {
            const response = await apiClient.delete('/users/deleteAllRoutes', {
                data: { name },
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting all routes:', error);
            throw error;
        }
    },

    // search routes for a specific user
    async searchRoutes(name, search, mapname) {
        try {
            const response = await apiClient.get('/users/searchRoutes', {
                params: {
                    name,
                    search,
                    mapname,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error searching routes:', error);
            throw error;
        }
    },

    // sorts routes associated with a user by a given field
    async sortRoutes(name, sortBy, mapname) {
        try {
            const response = await apiClient.get('/users/sortRoutes', {
                params: {
                    name,
                    sortBy,
                    mapname,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error sorting routes:', error);
            throw error;
        }
    },

    // handles navigation service replies
    async handleNavReply(name, start_endpoint, end_endpoint, path) {
        try {
            const response = await apiClient.post('/users/handleNavReply', {
                name,
                start_endpoint,
                end_endpoint,
                path,
            });
            return response.data;
        } catch (error) {
            console.error('Error handling navigation reply:', error);
            throw error;
        }
    },
};

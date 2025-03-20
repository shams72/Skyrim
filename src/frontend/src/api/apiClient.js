import axios from 'axios';

const getApiUrl = () => {
    if (window.runtimeConfig?.REACT_APP_API_URL) {
        return window.runtimeConfig.REACT_APP_API_URL;
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

const apiClient = axios.create({
    baseURL: `${API_URL}/api/`,
    timeout: 160000,
});

export default apiClient;

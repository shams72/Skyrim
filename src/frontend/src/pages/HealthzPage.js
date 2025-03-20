import React, { useEffect, useState } from 'react';
import { api } from '../api/api';

// page to display response from /healthz endpoint
const HealthzPage = () => {
    const [response, setResponse] = useState();

    useEffect(() => {
        const fetchHealthStatus = async () => {
            try {
                const healthStatus = await api.maps.getHealthStatus();
                setResponse(healthStatus);
            } catch (error) {
                console.error('Error fetching health status:', error);
                setResponse({ error: 'Error fetching health status' });
            }
        };

        fetchHealthStatus();
    }, []);

    return (
        <div className="p-4">{response ? JSON.stringify(response) : ''}</div>
    );
};

export default HealthzPage;

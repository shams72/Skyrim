import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import MapViewerPage from './pages/MapViewerPage';
import HealthzPage from './pages/HealthzPage';
import { MapViewerProvider } from './contexts/MapViewerContext';
import { AuthProvider } from './contexts/AuthContext';
import LoginRegisterModal from './modals/LoginRegisterModal';
import NotificationSnackbar from './components/NotificationSnackbar';
import MapSelectionModal from './modals/MapSelectionModal';

function App() {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMapSelectionOpen, setIsMapSelectionOpen] = useState(false);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleLogout = () => {
        // Clear user-related data from local storage
        localStorage.removeItem('username');
        showSnackbar('Logged out successfully!', 'info');
        setIsLoginModalOpen(true); // Force user to log in again
    };

    const handleMapSelect = async (mapId) => {
        // Here you would load the appropriate map data
        showSnackbar(`Map ${mapId} selected successfully!`, 'success');
    };

    // force user to login if no username is stored in local storage
    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            setIsLoginModalOpen(true);
        } else {
            setIsMapSelectionOpen(true);
        }
    }, []);

    const handleLoginClose = () => {
        setIsLoginModalOpen(false);
        setIsMapSelectionOpen(true);
    };

    return (
        <Router>
            <AuthProvider>
                <MapViewerProvider>
                    <div className="h-screen">
                        <Routes>
                            {/* routes with sidebar */}
                            <Route
                                path="/"
                                element={
                                    <div className="flex h-full">
                                        <Sidebar
                                            onOpenLogin={() =>
                                                setIsLoginModalOpen(true)
                                            }
                                            showSnackbar={showSnackbar}
                                        />
                                        <MapViewerPage />
                                    </div>
                                }
                            />
                            {/* Routes without Sidebar */}
                            <Route path="/healthz" element={<HealthzPage />} />
                        </Routes>

                        {/* Login/Register Modal */}
                        <LoginRegisterModal
                            isOpen={isLoginModalOpen}
                            onClose={handleLoginClose}
                            showSnackbar={showSnackbar}
                        />

                        {/* Map Selection Modal */}
                        <MapSelectionModal
                            isOpen={isMapSelectionOpen}
                            onClose={() => setIsMapSelectionOpen(false)}
                        />

                        {/* Notification Snackbar */}
                        <NotificationSnackbar
                            open={snackbarOpen}
                            onClose={() => setSnackbarOpen(false)}
                            message={snackbarMessage}
                            severity={snackbarSeverity}
                        />
                    </div>
                </MapViewerProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;

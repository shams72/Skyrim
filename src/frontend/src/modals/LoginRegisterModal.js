import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

function LoginRegisterModal({ isOpen, onClose, showSnackbar }) {
    const { user, login } = useAuth();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginRegister = async () => {
        if (!username.trim()) {
            showSnackbar('Please enter a valid username.', 'error');
            return;
        }

        try {
            setLoading(true);

            // attempt to log in
            const loginResponse = await api.users.login(username);

            console.log(loginResponse);

            if (loginResponse.success) {
                login(username);
                showSnackbar('Successfully logged in!', 'success');
                onClose();
                return;
            }
        } catch (error) {
            // if login fails, attempt to create the user
            if (error.response?.status === 404) {
                try {
                    const createResponse = await api.users.createUser(username);
                    login(username);
                    showSnackbar(
                        createResponse.message || 'User created successfully!',
                        'success'
                    );
                    onClose();
                } catch (createError) {
                    const errorMessage =
                        createError.response?.data?.message ||
                        'Error creating user.';
                    showSnackbar(errorMessage, 'error');
                }
            } else {
                showSnackbar('Error during login.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-[90%] max-w-sm p-6 bg-white rounded-lg shadow-lg">
                {!user ? (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-gray-800">
                            Login / Register
                        </h2>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 mb-4 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleLoginRegister}
                            disabled={loading}
                            className={`w-full px-4 py-2 text-sm font-semibold text-white rounded ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Welcome, {user}!
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginRegisterModal;

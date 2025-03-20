import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// auth provider to wrap the app with.
// we can expand this later if we need more properties for users. for now its just username
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setIsAuthenticated(true);
            setUser(storedUsername);
        }
    }, []);

    const login = (username) => {
        localStorage.setItem('username', username);
        setIsAuthenticated(true);
        setUser(username);
    };

    const logout = () => {
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

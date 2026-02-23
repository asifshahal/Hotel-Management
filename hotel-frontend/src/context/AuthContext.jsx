import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('hotel_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (username, password) => {
        const res = await authAPI.login({ username, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('hotel_token', token);
        localStorage.setItem('hotel_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('hotel_token');
        localStorage.removeItem('hotel_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

import { createContext, useState, type ReactNode } from 'react';
import api from '../api/apiClient';
import type { User, AuthContextType } from '../types';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        return storedToken;
    });

    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<User>(storedToken);
                return decoded;
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    const login = (userData: User, newToken: string) => {
        try {
            const decoded = jwtDecode<User>(newToken);
            setUser(decoded);
        } catch (e) {
            setUser(userData);
        }
        setToken(newToken);
        localStorage.setItem('token', newToken);
        localStorage.removeItem('user');
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

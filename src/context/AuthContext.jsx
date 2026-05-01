'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api, getStoredToken, setAuthToken } from '@/lib/api';
import { trackEvent } from '@/lib/telemetry';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = getStoredToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setAuthToken(token);
                const profile = await api.getCurrentUser(token);
                setUser(profile);
            } catch (error) {
                setAuthToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        const response = await api.login(email, password);
        if (!response.token) {
            throw new Error('No session token received');
        }

        setAuthToken(response.token);
        setUser(response.user);
        trackEvent('auth_login_success', { role: response.user.role });
        toast.success(`Welcome back, ${response.user.email}`);
        return response.user;
    };

    const register = async (name, email, password) => {
        const response = await api.register(name, email, password);
        if (!response.token) {
            throw new Error('No session token received');
        }

        setAuthToken(response.token);
        setUser(response.user);
        trackEvent('auth_register_success', { role: response.user.role });
        toast.success('Account created successfully');
        return response.user;
    };

    const logout = async () => {
        setAuthToken(null);
        setUser(null);
        trackEvent('auth_logout');
        toast.info('Signed out successfully');
    };

    const value = useMemo(() => ({
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin' || user?.role === 'editor',
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

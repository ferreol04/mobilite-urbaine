import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(() => {
        const hasCache = !!localStorage.getItem('token') && !!localStorage.getItem('user');
        return !hasCache;
    });

    const [pendingContribution, setPendingContribution] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMessage, setAuthModalMessage] = useState('');
    const onAuthSuccessRef = useRef(null);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        api.get('/profile')
            .then(({ data }) => {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        function handleSessionExpired() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, []);

    const login = useCallback(async (credentials) => {
        const { data } = await api.post('/login', credentials);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const loginWithData = useCallback((userData, tokenValue) => {
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    const requireAuth = useCallback(({ contribution, message, onSuccess }) => {
        if (token && user) {
            onSuccess?.();
            return;
        }
        setPendingContribution(contribution || null);
        setAuthModalMessage(message || '');
        onAuthSuccessRef.current = onSuccess || null;
        setShowAuthModal(true);
    }, [token, user]);

    const handleAuthSuccess = useCallback((userData, tokenValue) => {
        loginWithData(userData, tokenValue);
        setShowAuthModal(false);
        const cb = onAuthSuccessRef.current;
        onAuthSuccessRef.current = null;
        cb?.();
    }, [loginWithData]);

    const closeAuthModal = useCallback(() => {
        setShowAuthModal(false);
        setPendingContribution(null);
        onAuthSuccessRef.current = null;
    }, []);

    const isAuthenticated = !!token && !!user;
    const isAdmin = isAuthenticated && user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user, token, login, loginWithData, logout, updateUser,
            isAuthenticated, isAdmin, loading,
            pendingContribution, setPendingContribution,
            showAuthModal, authModalMessage,
            requireAuth, handleAuthSuccess, closeAuthModal,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

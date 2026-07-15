import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import echo from '../echo';

export const AlerteContext = createContext(null);

export function AlerteProvider({ children }) {
    const [alertes, setAlertes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlertes = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const { data } = await api.get('/alertes', { params });
            setAlertes(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlertes();

        const channel = echo.channel('alertes');

        channel.listen('.NouvelleAlerte', (data) => {
            setAlertes((prev) => [data.alerte, ...prev]);
        });

        channel.listen('.AlerteMiseAJour', (data) => {
            setAlertes((prev) =>
                prev.map((a) => (a.id === data.alerte.id ? data.alerte : a))
                    .filter((a) => a.status === 'active')
            );
        });

        channel.listen('.AlerteSupprimee', (data) => {
            setAlertes((prev) => prev.filter((a) => a.id !== data.id));
        });

        return () => {
            echo.leaveChannel('alertes');
        };
    }, [fetchAlertes]);

    return (
        <AlerteContext.Provider value={{ alertes, loading, fetchAlertes }}>
            {children}
        </AlerteContext.Provider>
    );
}

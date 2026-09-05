import { useState, useCallback } from 'react';

export default function useGeolocalisation() {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par ce navigateur.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setPosition({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            // Sans enableHighAccuracy, certains navigateurs renvoient une position
            // approximative (réseau/IP) qui peut retomber dans un quartier voisin
            // au lieu de la position GPS réelle — d'où des quartiers erronés
            // (ex : Togoudo au lieu de Godomey, communes limitrophes).
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    return { position, error, loading, getPosition };
}

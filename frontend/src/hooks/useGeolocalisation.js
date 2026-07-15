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
                setPosition({ latitude: coords.latitude, longitude: coords.longitude });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    }, []);

    return { position, error, loading, getPosition };
}

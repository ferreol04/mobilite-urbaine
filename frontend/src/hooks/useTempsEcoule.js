import { useState, useEffect } from 'react';
import { formatTempsEcoule } from '../utils/formatDate';

export default function useTempsEcoule(dateString) {
    const [, setTick] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 30_000);
        return () => clearInterval(id);
    }, []);

    return formatTempsEcoule(dateString);
}

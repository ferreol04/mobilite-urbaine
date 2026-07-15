import { useContext } from 'react';
import { AlerteContext } from '../context/AlerteContext';

export default function useAlertes() {
    const context = useContext(AlerteContext);
    if (!context) throw new Error('useAlertes must be used inside AlerteProvider');
    return context;
}

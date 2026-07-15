import { useState } from 'react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const TYPES = [
    {
        type: 'confirmation',
        label: 'Confirmer',
        loadingLabel: 'Confirmation…',
        ownerHidden: true,
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        ),
        cls: 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-300',
    },
    {
        type: 'resolved',
        label: 'Signaler comme terminé',
        loadingLabel: 'Envoi…',
        ownerHidden: false,
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        ),
        cls: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300',
    },
    {
        type: 'false',
        label: 'Fausse alerte',
        loadingLabel: 'Envoi…',
        ownerHidden: true,
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        ),
        cls: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300',
    },
];

export default function BoutonInteraction({ alerte, onUpdate, compact = false }) {
    const { isAuthenticated, user, requireAuth } = useAuth();
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState('');

    if (alerte.status !== 'active') return null;

    const isOwner = isAuthenticated && user?.id === alerte.user_id;
    const visibleTypes = TYPES.filter((t) => !(t.ownerHidden && isOwner));

    if (visibleTypes.length === 0) return null;

    async function submitInteraction(type) {
        setLoading(type);
        setError('');
        try {
            const { data } = await api.post(`/alertes/${alerte.id}/interactions`, { type });
            onUpdate?.(data.alerte);
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Erreur lors de l\'interaction.';
            setError(msg);
        } finally {
            setLoading(null);
        }
    }

    function handleClick(type) {
        requireAuth({
            contribution: { type: 'interaction', data: { alerte_id: alerte.id, type } },
            message: 'Afin de garantir la fiabilité des informations publiées sur la plateforme, veuillez renseigner une adresse e-mail.',
            onSuccess: () => submitInteraction(type),
        });
    }

    return (
        <div className="space-y-2">
            <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
                {visibleTypes.map(({ type, label, loadingLabel, icon, cls }) => (
                    <button
                        key={type}
                        onClick={() => handleClick(type)}
                        disabled={loading !== null}
                        className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'}
                            ${cls}`}
                    >
                        {loading === type
                            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : icon}
                        {loading === type ? loadingLabel : label}
                    </button>
                ))}
            </div>
            {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

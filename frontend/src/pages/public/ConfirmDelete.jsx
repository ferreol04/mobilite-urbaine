import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import Navbar from '../../components/common/Navbar';

export default function ConfirmDelete() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const called = useRef(false);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setError('Lien de confirmation invalide.');
            return;
        }

        api.post('/auth/confirm-delete', { token })
            .then(async () => {
                setStatus('success');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            })
            .catch((err) => {
                setStatus('error');
                setError(err.response?.data?.message || 'Le lien de confirmation est invalide ou expiré.');
            });
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                {status === 'loading' && (
                    <div className="text-center">
                        <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-600">Suppression en cours...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Compte supprimé</h2>
                        <p className="text-slate-500 mb-2">
                            Votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir.
                        </p>
                        <p className="text-sm text-slate-400">Redirection vers l'accueil...</p>
                        <div className="mt-4 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Erreur</h2>
                        <p className="text-slate-500 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/', { replace: true })}
                            className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-semibold text-sm transition-colors"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

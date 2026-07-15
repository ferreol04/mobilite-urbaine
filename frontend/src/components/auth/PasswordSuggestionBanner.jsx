import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';

export default function PasswordSuggestionBanner() {
    const { isAuthenticated } = useAuth();
    const [visible, setVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) { setVisible(false); return; }
        if (sessionStorage.getItem('password_banner_dismissed')) return;
        api.get('/auth/password-suggestion')
            .then(({ data }) => {
                if (data.should_suggest_password) setVisible(true);
            })
            .catch(() => {});
    }, [isAuthenticated]);

    async function handleDismiss() {
        setVisible(false);
        sessionStorage.setItem('password_banner_dismissed', '1');
        try { await api.post('/auth/dismiss-password-suggestion'); } catch {}
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!password || !passwordConfirmation) {
            setError('Veuillez remplir les deux champs.');
            return;
        }
        if (password !== passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/set-password', { password, password_confirmation: passwordConfirmation });
            setSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setVisible(false);
            }, 3000);
        } catch (err) {
            const msgs = err.response?.data?.errors?.password;
            setError(Array.isArray(msgs) ? msgs[0] : err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    }

    if (!visible) return null;

    return (
        <>
            <div className="bg-blue-50 border-b border-blue-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <p className="text-sm text-blue-800 flex-1">
                        <strong>Simplifiez vos prochaines connexions.</strong>{' '}
                        Définissez un mot de passe afin de vous connecter plus rapidement à votre compte.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                        >
                            Définir un mot de passe
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                            aria-label="Fermer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 2000 }} onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Définir un mot de passe</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {success ? (
                                <div className="text-center py-2">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-700">
                                        Votre mot de passe a été enregistré avec succès. Vous pourrez désormais vous connecter soit avec votre mot de passe, soit en utilisant un lien de connexion.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                                    )}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmation du mot de passe</label>
                                        <input
                                            type="password"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                                    >
                                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                        Enregistrer
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

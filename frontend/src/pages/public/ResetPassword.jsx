import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        token: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [hasEmailFromQuery, setHasEmailFromQuery] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token') || '';
        const email = searchParams.get('email') || '';
        setForm((prev) => ({ ...prev, token, email }));
        setHasEmailFromQuery(Boolean(email));
    }, [searchParams]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.token) {
            setError('Le lien de réinitialisation est invalide ou incomplet.');
            return;
        }
        if (!form.email.trim()) {
            setError('L’email est requis.');
            return;
        }
        if (!form.password) {
            setError('Le nouveau mot de passe est requis.');
            return;
        }
        if (form.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (form.password !== form.password_confirmation) {
            setError('Les mots de passe doivent correspondre.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/reset-password', {
                token: form.token,
                email: form.email.trim(),
                password: form.password,
                password_confirmation: form.password_confirmation,
            });
            navigate('/connexion', {
                replace: true,
                state: {
                    message: 'Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.',
                },
            });
        } catch (err) {
            const status = err.response?.status;
            if (status === 422) {
                const errors = err.response?.data?.errors;
                setError(
                    errors?.token?.[0] ||
                    errors?.email?.[0] ||
                    errors?.password?.[0] ||
                    'Vérifiez les champs du formulaire.'
                );
            } else {
                setError('Une erreur est survenue. Réessayez plus tard.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            <Link to="/" className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Accueil
            </Link>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 mb-4">
                        <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0l4.994-2.497c.748-.374 1.628.17 1.628 1.006Z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">MobiliAlert</h1>
                    <p className="text-slate-400 text-sm mt-1">Réinitialisez votre mot de passe</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-1">Réinitialisation</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        {hasEmailFromQuery
                            ? 'Saisissez votre nouveau mot de passe pour terminer la réinitialisation.'
                            : 'Saisissez votre email et votre nouveau mot de passe pour terminer la réinitialisation.'
                        }
                    </p>

                    {error && (
                        <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {!hasEmailFromQuery && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Votre email"
                                    autoComplete="email"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nouveau mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 8 caractères"
                                autoComplete="new-password"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmation du mot de passe</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Répéter le mot de passe"
                                autoComplete="new-password"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !form.email.trim() || !form.password || !form.password_confirmation}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Réinitialiser le mot de passe'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-sm">
                            <Link to="/connexion" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Retour à la connexion
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">© 2026 MobiliAlert — Bénin</p>
            </div>
        </div>
    );
}

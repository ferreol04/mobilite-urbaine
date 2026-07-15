import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email.trim()) {
            setError('L’email est requis.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await api.post('/forgot-password', { email: email.trim() });
            setSuccess(data.message || 'Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.');
        } catch (err) {
            const status = err.response?.status;
            if (status === 422) {
                const messages = err.response?.data?.errors?.email;
                setError(messages?.[0] || err.response?.data?.message || 'L’email est invalide.');
            } else if (status === 404) {
                setError(err.response?.data?.message || 'Cet email n’existe pas dans notre base.');
            } else {
                setError(err.response?.data?.message || 'Une erreur est survenue. Réessayez plus tard.');
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
                    <h2 className="text-xl font-semibold text-white mb-1">Mot de passe oublié</h2>
                    <p className="text-slate-400 text-sm mb-6">Entrez l’email associé à votre compte pour recevoir un lien de réinitialisation.</p>

                    {success ? (
                        <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                            {success}
                        </div>
                    ) : null}

                    {error && (
                        <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                    setSuccess('');
                                }}
                                placeholder="Votre email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Envoyer le lien'
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

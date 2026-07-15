import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';

const STEP_EMAIL = 'email';
const STEP_VERIFICATION_SENT = 'verification_sent';
const STEP_PASSWORD = 'password';
const STEP_SUSPENDED = 'suspended';

export default function ContributeAuthModal() {
    const { showAuthModal, authModalMessage, pendingContribution, closeAuthModal, handleAuthSuccess } = useAuth();
    const [step, setStep] = useState(STEP_EMAIL);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!showAuthModal) return null;

    const defaultMessage = pendingContribution?.type === 'alerte'
        ? 'Dernière étape avant l\'enregistrement de votre contribution. Afin de garantir la fiabilité des informations publiées sur la plateforme, veuillez renseigner une adresse e-mail.'
        : 'Afin de garantir la fiabilité des informations publiées sur la plateforme, veuillez renseigner une adresse e-mail.';

    const message = authModalMessage || defaultMessage;

    async function handleIdentify(e) {
        e.preventDefault();
        if (!email.trim()) { setError('Veuillez renseigner votre adresse e-mail.'); return; }
        setLoading(true);
        setError('');
        try {
            const body = { email: email.trim() };
            if (pendingContribution) body.pending_contribution = pendingContribution;
            const { data } = await api.post('/auth/identify', body);

            if (data.status === 'verification_sent') {
                setStep(STEP_VERIFICATION_SENT);
            } else if (data.status === 'has_password') {
                setStep(STEP_PASSWORD);
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError(err.response.data?.message || 'Votre compte a été suspendu.');
                setStep(STEP_SUSPENDED);
            } else if (err.response?.status === 422) {
                const msgs = err.response.data?.errors?.email;
                setError(Array.isArray(msgs) ? msgs[0] : msgs || 'E-mail invalide.');
            } else {
                setError('Une erreur est survenue. Réessayez.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleLoginPassword(e) {
        e.preventDefault();
        if (!password) { setError('Veuillez saisir votre mot de passe.'); return; }
        setLoading(true);
        setError('');
        try {
            const body = { email: email.trim(), password };
            if (pendingContribution) body.pending_contribution = pendingContribution;
            const { data } = await api.post('/auth/login-password', body);
            handleAuthSuccess(data.user, data.token);
        } catch (err) {
            if (err.response?.status === 422 || err.response?.status === 401) {
                setError(err.response.data?.message || 'Identifiants incorrects.');
            } else {
                setError('Une erreur est survenue. Réessayez.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMagicLink() {
        setLoading(true);
        setError('');
        try {
            const body = { email: email.trim() };
            if (pendingContribution) body.pending_contribution = pendingContribution;
            await api.post('/auth/send-magic-link', body);
            setStep(STEP_VERIFICATION_SENT);
        } catch {
            setError('Une erreur est survenue. Réessayez.');
        } finally {
            setLoading(false);
        }
    }

    function handleBack() {
        setStep(STEP_EMAIL);
        setPassword('');
        setError('');
    }

    function handleClose() {
        setStep(STEP_EMAIL);
        setEmail('');
        setPassword('');
        setError('');
        closeAuthModal();
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 2000 }} onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800">Identification</h3>
                        <p className="text-sm text-slate-600 mt-0.5">{message}</p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step: Email */}
                    {step === STEP_EMAIL && (
                        <form onSubmit={handleIdentify} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Adresse e-mail
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="votre@email.com"
                                    autoFocus
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                            >
                                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Continuer
                            </button>
                        </form>
                    )}

                    {/* Step: Verification sent */}
                    {step === STEP_VERIFICATION_SENT && (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Vérifiez votre boîte mail</h4>
                            <p className="text-sm text-slate-600">
                                Nous venons de vous envoyer un lien de vérification à <strong>{email}</strong>. Veuillez confirmer votre identité afin de finaliser votre contribution.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                    Modifier l'adresse
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Password login */}
                    {step === STEP_PASSWORD && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleBack}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                    title="Modifier l'adresse e-mail"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                </button>
                                <p className="text-sm text-slate-600">
                                    Un compte existe avec l'adresse <strong>{email}</strong>.
                                </p>
                            </div>
                            <form onSubmit={handleLoginPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        placeholder="Votre mot de passe"
                                        autoFocus
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                                >
                                    {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Se connecter
                                </button>
                            </form>
                            <div className="text-center">
                                <button
                                    onClick={handleSendMagicLink}
                                    disabled={loading}
                                    className="text-sm text-blue-700 hover:text-blue-600 font-medium transition-colors disabled:opacity-50"
                                >
                                    Recevoir un lien de connexion
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Suspended */}
                    {step === STEP_SUSPENDED && (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Compte suspendu</h4>
                            <p className="text-sm text-slate-600">{error}</p>
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                    Modifier l'adresse
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

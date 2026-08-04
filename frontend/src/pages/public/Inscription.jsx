import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STEPS = ['Identité', 'Contact', 'Sécurité'];

function ProgressBar({ step }) {
    return (
        <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                        i < step  ? 'bg-blue-600 text-white' :
                        i === step ? 'bg-blue-600 text-white ring-4 ring-blue-500/30' :
                                     'bg-white/10 text-slate-500'
                    }`}>
                        {i < step ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        ) : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-px ${i < step ? 'bg-blue-600' : 'bg-white/10'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function FieldError({ msg }) {
    if (!msg) return null;
    return <p className="mt-1 text-xs text-red-400">{msg}</p>;
}

export default function Inscription() {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        last_name: '', first_name: '', gender: '',
        email: '', phone: '',
        password: '', password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    function set(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setGlobalError('');
    }

    // ── Validation par étape ───────────────────────────────────────────────
    function validateStep0() {
        const e = {};
        if (!form.last_name.trim())  e.last_name  = 'Le nom est requis.';
        if (!form.first_name.trim()) e.first_name = 'Le prénom est requis.';
        if (!form.gender)            e.gender     = 'Veuillez sélectionner votre genre.';
        return e;
    }

    function validateStep1() {
        const e = {};
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        const phoneOk = /^\+?[\d\s\-()]{8,}$/.test(form.phone);
        if (!form.email.trim())
            e.email = 'L\'adresse email est requise.';
        else if (!emailOk)
            e.email = 'Adresse email invalide.';
        if (form.phone && !phoneOk)
            e.phone = 'Numéro de téléphone invalide.';
        return e;
    }

    function validateStep2() {
        const e = {};
        if (!form.password)                              e.password = 'Le mot de passe est requis.';
        else if (form.password.length < 8)               e.password = 'Au moins 8 caractères.';
        if (form.password !== form.password_confirmation) e.password_confirmation = 'Les mots de passe ne correspondent pas.';
        return e;
    }

    function nextStep() {
        const validators = [validateStep0, validateStep1];
        const e = validators[step]();
        if (Object.keys(e).length) { setErrors(e); return; }
        setStep((s) => s + 1);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const e2 = validateStep2();
        if (Object.keys(e2).length) { setErrors(e2); return; }

        setLoading(true);
        setGlobalError('');
        try {
            const body = {
                last_name:  form.last_name.trim(),
                first_name: form.first_name.trim(),
                gender:     form.gender,
                password:   form.password,
                password_confirmation: form.password_confirmation,
                email: form.email.trim(),
                ...(form.phone.trim() && { phone: form.phone.trim() }),
            };

            await api.post('/register', body);
            setVerificationSent(true);
        } catch (err) {
            console.error('Erreur inscription:', err.response ?? err);
            if (err.response?.status === 422) {
                const apiErrors = err.response.data.errors || {};
                const mapped = {};
                Object.entries(apiErrors).forEach(([field, msgs]) => {
                    mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
                });
                const step0Fields = ['last_name', 'first_name', 'gender'];
                const step1Fields = ['email', 'phone'];
                const hasStep0Err = step0Fields.some((f) => mapped[f]);
                const hasStep1Err = step1Fields.some((f) => mapped[f]);
                if (hasStep0Err) setStep(0);
                else if (hasStep1Err) setStep(1);
                setErrors(mapped);
            } else {
                const msg = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
                setGlobalError(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    const inputCls = (field) =>
        `w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors[field] ? 'border-red-500/60 bg-red-500/5' : 'border-white/15'
        }`;

    if (verificationSent) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                </div>
                <div className="relative w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Vérifiez votre email</h2>
                        <p className="text-slate-400 text-sm mb-2">
                            Un email de vérification a été envoyé à :
                        </p>
                        <p className="text-blue-400 font-medium mb-4">{form.email}</p>
                        <p className="text-slate-500 text-sm mb-6">
                            Cliquez sur le lien dans l'email pour activer votre compte. Le lien expire dans 30 minutes.
                        </p>
                        <Link
                            to="/connexion"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                        >
                            Aller à la connexion
                        </Link>
                    </div>
                    <p className="text-center text-slate-600 text-xs mt-6">© 2026 MobiliAlert — Bénin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            {/* Retour accueil */}
            <Link to="/" className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Accueil
            </Link>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 mb-4">
                        <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">MobiliAlert</h1>
                    <p className="text-slate-400 text-sm mt-1">Créez votre compte en 3 étapes</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <ProgressBar step={step} />

                    {globalError && (
                        <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className="text-red-300 text-sm">{globalError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        {/* ── Étape 0 : Identité ── */}
                        {step === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom</label>
                                    <input
                                        type="text"
                                        value={form.last_name}
                                        onChange={(e) => set('last_name', e.target.value)}
                                        placeholder="Votre nom de famille"
                                        className={inputCls('last_name')}
                                    />
                                    <FieldError msg={errors.last_name} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom</label>
                                    <input
                                        type="text"
                                        value={form.first_name}
                                        onChange={(e) => set('first_name', e.target.value)}
                                        placeholder="Votre prénom"
                                        className={inputCls('first_name')}
                                    />
                                    <FieldError msg={errors.first_name} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Genre</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ value: 'male', label: 'Homme', icon: '👨' }, { value: 'female', label: 'Femme', icon: '👩' }].map(({ value, label, icon }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => set('gender', value)}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                    form.gender === value
                                                        ? 'bg-blue-600 border-blue-500 text-white'
                                                        : 'bg-white/5 border-white/15 text-slate-400 hover:border-white/30 hover:text-white'
                                                }`}
                                            >
                                                <span>{icon}</span> {label}
                                            </button>
                                        ))}
                                    </div>
                                    <FieldError msg={errors.gender} />
                                </div>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors mt-2"
                                >
                                    Continuer →
                                </button>
                            </div>
                        )}

                        {/* ── Étape 1 : Contact ── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <p className="text-slate-400 text-sm mb-4">
                                    L'email est requis pour la vérification de votre compte.
                                </p>
                                {errors.contact && (
                                    <p className="text-xs text-red-400 -mt-2">{errors.contact}</p>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Email <span className="text-red-400 font-normal">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => set('email', e.target.value)}
                                        placeholder="vous@exemple.com"
                                        className={inputCls('email')}
                                    />
                                    <FieldError msg={errors.email} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Téléphone <span className="text-slate-500 font-normal">(optionnel)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => set('phone', e.target.value)}
                                        placeholder="+229 01 23 45 67"
                                        className={inputCls('phone')}
                                    />
                                    <FieldError msg={errors.phone} />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(0)}
                                        className="flex-1 py-3 rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 font-semibold text-sm transition-colors"
                                    >
                                        ← Retour
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                                    >
                                        Continuer →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Étape 2 : Sécurité ── */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPwd ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={(e) => set('password', e.target.value)}
                                            placeholder="Minimum 8 caractères"
                                            autoComplete="new-password"
                                            className={`${inputCls('password')} pr-11`}
                                        />
                                        <button type="button" onClick={() => setShowPwd((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors" tabIndex={-1}>
                                            <EyeIcon open={showPwd} />
                                        </button>
                                    </div>
                                    <FieldError msg={errors.password} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={form.password_confirmation}
                                            onChange={(e) => set('password_confirmation', e.target.value)}
                                            placeholder="Répétez le mot de passe"
                                            autoComplete="new-password"
                                            className={`${inputCls('password_confirmation')} pr-11`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors" tabIndex={-1}>
                                            <EyeIcon open={showConfirm} />
                                        </button>
                                    </div>
                                    <FieldError msg={errors.password_confirmation} />
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 font-semibold text-sm transition-colors"
                                    >
                                        ← Retour
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Création…
                                            </>
                                        ) : 'Créer mon compte'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-sm">
                            Déjà un compte ?{' '}
                            <Link to="/connexion" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">© 2026 MobiliAlert — Bénin</p>
            </div>
        </div>
    );
}

function EyeIcon({ open }) {
    return open ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
    );
}

function PasswordStrength({ password }) {
    let score = 0;
    if (password.length >= 8)                       score++;
    if (/[A-Z]/.test(password))                     score++;
    if (/[0-9]/.test(password))                     score++;
    if (/[^A-Za-z0-9]/.test(password))              score++;

    const levels = [
        { label: 'Très faible', color: 'bg-red-500',    width: 'w-1/4' },
        { label: 'Faible',      color: 'bg-orange-500', width: 'w-2/4' },
        { label: 'Moyen',       color: 'bg-yellow-400', width: 'w-3/4' },
        { label: 'Fort',        color: 'bg-green-500',  width: 'w-full' },
    ];
    const level = levels[Math.min(score - 1, 3)] || levels[0];

    return (
        <div className="mt-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${level.color} ${level.width}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1">{level.label}</p>
        </div>
    );
}

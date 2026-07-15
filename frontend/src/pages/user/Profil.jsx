import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import useAuth from '../../hooks/useAuth';
import { CLS } from '../../constants/theme';
import api from '../../api/axios';

// ── Avatar selon le genre ─────────────────────────────────────────────────────
function Avatar({ gender, size = 24 }) {
    const isFemale = gender === 'female';
    const bg    = isFemale ? 'bg-pink-100' : 'bg-blue-100';
    const color = isFemale ? 'text-pink-600' : 'text-blue-600';
    return (
        <div className={`w-${size} h-${size} rounded-full ${bg} flex items-center justify-center shrink-0`}>
            <svg className={`w-3/5 h-3/5 ${color}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
        </div>
    );
}

// ── Alerte de feedback ────────────────────────────────────────────────────────
function FeedbackAlert({ message, type, onClose }) {
    if (!message) return null;
    const isSuccess = type === 'success';
    const cls = isSuccess
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800';
    return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${cls}`}>
            <span className="mt-0.5 shrink-0">
                {isSuccess ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                )}
            </span>
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="shrink-0 hover:opacity-70">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ── Squelette de modal ────────────────────────────────────────────────────────
function Modal({ title, subtitle, iconBg, icon, children, footer }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 2000 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-4">{children}</div>
                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">{footer}</div>
            </div>
        </div>
    );
}

// ── Modal modification du profil ──────────────────────────────────────────────
function ModalProfil({ user, onSave, onClose }) {
    const [profil, setProfil]   = useState({
        last_name:  user?.last_name  || '',
        first_name: user?.first_name || '',
        email:      user?.email      || '',
        phone:      user?.phone      || '',
    });
    const [erreurs, setErreurs] = useState({});
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    function valider() {
        const e = {};
        if (!profil.email.trim() && !profil.phone.trim())
            e.contact = 'Au moins un email ou un téléphone est obligatoire.';
        if (profil.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profil.email))
            e.email = "Format d'email invalide.";
        if (profil.phone.trim() && !/^\+?[\d\s\-().]{7,20}$/.test(profil.phone))
            e.phone = 'Numéro de téléphone invalide.';
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = valider();
        if (Object.keys(errs).length) { setErreurs(errs); return; }
        setErreurs({});
        setLoading(true);
        setFeedback(null);
        try {
            const { data } = await api.put('/profile', profil);
            onSave(data.user ?? data);
            setFeedback({ type: 'success', message: 'Profil mis à jour avec succès.' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Une erreur est survenue.';
            setErreurs(err.response?.data?.errors || {});
            setFeedback({ type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            title="Modifier le profil"
            iconBg="bg-blue-100"
            icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
            }
            footer={
                <>
                    <button onClick={onClose} className={CLS.btnGhost} disabled={loading}>Annuler</button>
                    <button form="form-profil" type="submit" className={CLS.btnPrimary} disabled={loading}>
                        {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                        Enregistrer
                    </button>
                </>
            }
        >
            {feedback && <FeedbackAlert message={feedback.message} type={feedback.type} onClose={() => setFeedback(null)} />}
            <form id="form-profil" onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={CLS.label}>Nom</label>
                        <input type="text" value={profil.last_name}
                            onChange={(e) => setProfil(p => ({ ...p, last_name: e.target.value }))}
                            className={erreurs.last_name ? CLS.inputError : CLS.input} placeholder="Votre nom" />
                        {erreurs.last_name && <p className={CLS.fieldError}>{erreurs.last_name}</p>}
                    </div>
                    <div>
                        <label className={CLS.label}>Prénom</label>
                        <input type="text" value={profil.first_name}
                            onChange={(e) => setProfil(p => ({ ...p, first_name: e.target.value }))}
                            className={erreurs.first_name ? CLS.inputError : CLS.input} placeholder="Votre prénom" />
                        {erreurs.first_name && <p className={CLS.fieldError}>{erreurs.first_name}</p>}
                    </div>
                </div>
                {erreurs.contact && <p className={CLS.fieldError}>{erreurs.contact}</p>}
                <div>
                    <label className={CLS.label}>Email</label>
                    <input type="email" value={profil.email}
                        onChange={(e) => setProfil(p => ({ ...p, email: e.target.value }))}
                        className={erreurs.email ? CLS.inputError : CLS.input} placeholder="votre@email.com" />
                    {erreurs.email && <p className={CLS.fieldError}>{Array.isArray(erreurs.email) ? erreurs.email[0] : erreurs.email}</p>}
                </div>
                <div>
                    <label className={CLS.label}>Téléphone</label>
                    <input type="tel" value={profil.phone}
                        onChange={(e) => setProfil(p => ({ ...p, phone: e.target.value }))}
                        className={erreurs.phone ? CLS.inputError : CLS.input} placeholder="+229 XXXXXXXX" />
                    {erreurs.phone && <p className={CLS.fieldError}>{Array.isArray(erreurs.phone) ? erreurs.phone[0] : erreurs.phone}</p>}
                </div>
            </form>
        </Modal>
    );
}

// ── Modal changement/définition de mot de passe ─────────────────────────────
function ModalMotDePasse({ hasPassword = true, onClose, onSuccess }) {
    const [mdp, setMdp]         = useState({ current_password: '', password: '', password_confirmation: '' });
    const [erreurs, setErreurs] = useState({});
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [show, setShow]       = useState({ current: false, new: false, confirm: false });

    function valider() {
        const e = {};
        if (hasPassword && !mdp.current_password) e.current_password = 'Le mot de passe actuel est obligatoire.';
        if (!mdp.password)          e.password = 'Le nouveau mot de passe est obligatoire.';
        else if (mdp.password.length < 8) e.password = 'Minimum 8 caractères.';
        if (!mdp.password_confirmation) e.password_confirmation = 'Confirmez le nouveau mot de passe.';
        else if (mdp.password !== mdp.password_confirmation)
            e.password_confirmation = 'Les mots de passe ne correspondent pas.';
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = valider();
        if (Object.keys(errs).length) { setErreurs(errs); return; }
        setErreurs({});
        setLoading(true);
        setFeedback(null);
        try {
            if (hasPassword) {
                await api.put('/profile/password', mdp);
            } else {
                await api.post('/auth/set-password', { password: mdp.password, password_confirmation: mdp.password_confirmation });
            }
            const msg = hasPassword ? 'Mot de passe modifié avec succès.' : 'Votre mot de passe a été enregistré avec succès.';
            onSuccess(msg);
        } catch (err) {
            const apiErrors = err.response?.data?.errors || {};
            setErreurs(apiErrors);
            if (!Object.keys(apiErrors).length) {
                const msg = err.response?.data?.message || 'Une erreur est survenue.';
                setFeedback({ type: 'error', message: msg });
            }
        } finally {
            setLoading(false);
        }
    }

    const fields = hasPassword
        ? [
            { key: 'current_password',      label: 'Mot de passe actuel',              showKey: 'current', placeholder: '••••••••' },
            { key: 'password',              label: 'Nouveau mot de passe',              showKey: 'new',     placeholder: 'Min. 8 caractères' },
            { key: 'password_confirmation', label: 'Confirmer le nouveau mot de passe', showKey: 'confirm', placeholder: '••••••••' },
        ]
        : [
            { key: 'password',              label: 'Mot de passe',              showKey: 'new',     placeholder: 'Min. 8 caractères' },
            { key: 'password_confirmation', label: 'Confirmer le mot de passe', showKey: 'confirm', placeholder: '••••••••' },
        ];

    return (
        <Modal
            title={hasPassword ? 'Changer le mot de passe' : 'Définir un mot de passe'}
            iconBg="bg-blue-100"
            icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            }
            footer={
                <>
                    <button onClick={onClose} className={CLS.btnGhost} disabled={loading}>Annuler</button>
                    <button form="form-mdp" type="submit" className={CLS.btnPrimary} disabled={loading}>
                        {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                        {hasPassword ? 'Modifier' : 'Enregistrer'}
                    </button>
                </>
            }
        >
            {feedback && <FeedbackAlert message={feedback.message} type={feedback.type} onClose={() => setFeedback(null)} />}
            <form id="form-mdp" onSubmit={handleSubmit} noValidate className="space-y-4">
                {fields.map(({ key, label, showKey, placeholder }) => (
                    <div key={key}>
                        <label className={CLS.label}>{label}</label>
                        <div className="relative">
                            <input
                                type={show[showKey] ? 'text' : 'password'}
                                value={mdp[key]}
                                onChange={(e) => setMdp(p => ({ ...p, [key]: e.target.value }))}
                                className={`${erreurs[key] ? CLS.inputError : CLS.input} pr-10`}
                                placeholder={placeholder}
                            />
                            <button type="button" tabIndex={-1}
                                onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {show[showKey] ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {erreurs[key] && <p className={CLS.fieldError}>{Array.isArray(erreurs[key]) ? erreurs[key][0] : erreurs[key]}</p>}
                    </div>
                ))}
            </form>
        </Modal>
    );
}

// ── Modal suppression de compte ───────────────────────────────────────────────
function ModalSuppression({ hasPassword = true, onConfirm, onRequestEmailVerification, onCancel, loading }) {
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur]         = useState('');
    const [emailSent, setEmailSent]   = useState(false);

    function handleConfirm() {
        if (hasPassword) {
            if (!motDePasse.trim()) { setErreur('Veuillez entrer votre mot de passe pour confirmer.'); return; }
            setErreur('');
            onConfirm(motDePasse);
        } else {
            onRequestEmailVerification();
            setEmailSent(true);
        }
    }

    return (
        <Modal
            title="Supprimer le compte"
            subtitle="Cette action est irréversible"
            iconBg="bg-red-100"
            icon={
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            }
            footer={
                !emailSent ? (
                    <>
                        <button onClick={onCancel} className={CLS.btnGhost} disabled={loading}>Annuler</button>
                        <button onClick={handleConfirm} className={CLS.btnDanger} disabled={loading}>
                            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                            {hasPassword ? 'Confirmer la suppression' : 'Envoyer le lien de confirmation'}
                        </button>
                    </>
                ) : (
                    <button onClick={onCancel} className={CLS.btnGhost}>Fermer</button>
                )
            }
        >
            {emailSent ? (
                <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <p className="text-sm text-slate-600">
                        Un lien de confirmation vous a été envoyé par email. Veuillez cliquer sur ce lien pour finaliser la suppression de votre compte.
                    </p>
                </div>
            ) : hasPassword ? (
                <div>
                    <label className={CLS.label}>Confirmez avec votre mot de passe</label>
                    <input
                        type="password"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        placeholder="Votre mot de passe actuel"
                        className={erreur ? CLS.inputError : CLS.input}
                        autoFocus
                    />
                    {erreur && <p className={CLS.fieldError}>{erreur}</p>}
                </div>
            ) : (
                <p className="text-sm text-slate-600">
                    Pour confirmer la suppression de votre compte, nous allons vous envoyer un lien de vérification par email.
                </p>
            )}
        </Modal>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Profil() {
    const { user, logout, updateUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [modal, setModal]                   = useState(null); // 'profil' | 'mdp' | 'suppression'
    const [loadingSuppression, setLoadingSuppression] = useState(false);
    const [feedbackPage, setFeedbackPage]     = useState(null);

    function showSuccessPage(message) {
        setFeedbackPage({ type: 'success', message });
        setTimeout(() => setFeedbackPage(null), 3000);
    }

    async function handleSupprimerCompte(motDePasse) {
        setLoadingSuppression(true);
        try {
            await api.delete('/profile', { data: { password: motDePasse } });
            await logout();
            navigate('/connexion');
        } catch (err) {
            setLoadingSuppression(false);
            setModal(null);
            const msg = err.response?.data?.message || 'Erreur lors de la suppression.';
            setFeedbackPage({ type: 'error', message: msg });
        }
    }

    async function handleRequestDeleteEmail() {
        setLoadingSuppression(true);
        try {
            await api.post('/profile/request-delete');
            setLoadingSuppression(false);
        } catch (err) {
            setLoadingSuppression(false);
            setModal(null);
            const msg = err.response?.data?.message || 'Erreur lors de l\'envoi du lien.';
            setFeedbackPage({ type: 'error', message: msg });
        }
    }

    if (authLoading) return <Loader />;

    return (
        <div className={CLS.pageWrapper}>
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {feedbackPage && (
                    <FeedbackAlert
                        message={feedbackPage.message}
                        type={feedbackPage.type}
                        onClose={() => setFeedbackPage(null)}
                    />
                )}

                {/* ── En-tête profil ────────────────────────────────────────── */}
                <div className={`${CLS.card} flex items-center gap-5`}>
                    <Avatar gender={user?.gender} size={20} />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-bold text-slate-900 truncate">
                            {user?.first_name} {user?.last_name}
                        </h1>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                            {user?.gender && (
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                    {user.gender === 'female' ? 'Femme' : user.gender === 'male' ? 'Homme' : user.gender}
                                </span>
                            )}
                            {user?.email && (
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    {user.email}
                                </span>
                            )}
                            {user?.phone && (
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    {user.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Préférence d'affichage ─────────────────────────────────── */}
                {user?.pseudo && (user?.first_name || user?.last_name) && (
                    <div className={CLS.card}>
                        <h2 className="text-base font-semibold text-slate-900 mb-2">Nom affiché sur mes signalements</h2>
                        <p className="text-xs text-slate-500 mb-4">Choisissez ce qui sera visible publiquement à côté de vos alertes.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const { data } = await api.put('/profile', { display_name_preference: 'real_name' });
                                        updateUser(data.user ?? data);
                                    } catch {}
                                }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                                    user.display_name_preference === 'real_name'
                                        ? 'bg-blue-700 text-white border-blue-700'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {user.first_name || user.last_name
                                    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                                    : 'Nom & prénom'}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const { data } = await api.put('/profile', { display_name_preference: 'pseudo' });
                                        updateUser(data.user ?? data);
                                    } catch {}
                                }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                                    user.display_name_preference === 'pseudo'
                                        ? 'bg-blue-700 text-white border-blue-700'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {user.pseudo}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Actions ───────────────────────────────────────────────── */}
                <div className={CLS.card}>
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Paramètres du compte</h2>
                    <div className="divide-y divide-slate-100">

                        <button
                            onClick={() => setModal('profil')}
                            className="w-full flex items-center justify-between py-3.5 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-800">Modifier le profil</p>
                            </div>
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setModal('mdp')}
                            className="w-full flex items-center justify-between py-3.5 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-800">
                                    {user?.has_password ? 'Changer le mot de passe' : 'Définir un mot de passe'}
                                </p>
                            </div>
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>

                    </div>
                </div>

                {/* ── Suppression du compte ─────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-red-200 p-6 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">Supprimer mon compte</p>
                        <p className="text-xs text-slate-500 mt-0.5">Action irréversible</p>
                    </div>
                    <button onClick={() => setModal('suppression')} className={`${CLS.btnDanger} shrink-0`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Supprimer
                    </button>
                </div>

            </div>

            {/* ── Modals ────────────────────────────────────────────────────── */}
            {modal === 'profil' && (
                <ModalProfil
                    user={user}
                    onSave={(updated) => { updateUser(updated); setModal(null); showSuccessPage('Profil mis à jour avec succès.'); }}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === 'mdp' && (
                <ModalMotDePasse
                    hasPassword={user?.has_password !== false}
                    onClose={() => setModal(null)}
                    onSuccess={(msg) => { setModal(null); showSuccessPage(msg); updateUser({ ...user, has_password: true }); }}
                />
            )}
            {modal === 'suppression' && (
                <ModalSuppression
                    hasPassword={user?.has_password !== false}
                    onConfirm={handleSupprimerCompte}
                    onRequestEmailVerification={handleRequestDeleteEmail}
                    onCancel={() => setModal(null)}
                    loading={loadingSuppression}
                />
            )}
        </div>
    );
}

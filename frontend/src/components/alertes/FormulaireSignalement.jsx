import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import CarteAlerte from './CarteAlerte';
import api from '../../api/axios';
import { getCategories, getTypeIncidents } from '../../api/cache';
import { COMMUNES } from '../../constants/communes';
import useGeolocalisation from '../../hooks/useGeolocalisation';
import useAuth from '../../hooks/useAuth';
import useAlertes from '../../hooks/useAlertes';

// ── Constantes ────────────────────────────────────────────────────────────────
const STEPS = ['Catégorie & type', 'Localisation', 'Description & photos'];
const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 2;

// ── Barre de progression ──────────────────────────────────────────────────────
function Stepper({ step }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            i < step  ? 'bg-blue-700 text-white' :
                            i === step ? 'bg-blue-700 text-white ring-4 ring-blue-100' :
                                         'bg-slate-200 text-slate-400'
                        }`}>
                            {i < step
                                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                : i + 1}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block whitespace-nowrap ${i === step ? 'text-blue-700' : 'text-slate-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${i < step ? 'bg-blue-700' : 'bg-slate-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function FieldError({ msg }) {
    if (!msg) return null;
    return (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {msg}
        </p>
    );
}

// ── Modal doublon ─────────────────────────────────────────────────────────────
function ModalDoublon({ message, alerte, onConfirmerMemeIncident, onContinuer, onFermer, loading }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 2000 }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-orange-50 border-b border-orange-200 px-6 py-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Incident similaire détecté</h3>
                        <p className="text-sm text-slate-600 mt-0.5">{message}</p>
                    </div>
                </div>

                {/* Alerte existante */}
                <div className="p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Alerte existante dans cette zone
                    </p>
                    <CarteAlerte alerte={alerte} hideActions />
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex flex-col gap-2">
                    <button
                        onClick={onConfirmerMemeIncident}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
                    >
                        {loading === 'confirm' ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        )}
                        Confirmer que c'est le même incident
                    </button>
                    <button
                        onClick={onContinuer}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-blue-700 text-blue-700 hover:bg-blue-50 disabled:opacity-50 font-semibold text-sm transition-colors"
                    >
                        {loading === 'force' ? (
                            <span className="w-4 h-4 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        )}
                        Continuer avec mon signalement
                    </button>
                    <button
                        onClick={onFermer}
                        disabled={loading !== null}
                        className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Prévisualisation photos ───────────────────────────────────────────────────
function PreviewPhotos({ photos, onRemove }) {
    if (photos.length === 0) return null;
    return (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
            {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs rounded px-1">
                        {(p.file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function FormulaireSignalement() {
    const navigate = useNavigate();
    const { position, error: geoError, loading: geoLoading, getPosition } = useGeolocalisation();
    const { isAuthenticated, requireAuth } = useAuth();
    const { fetchAlertes } = useAlertes();

    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);        // true = création
    const [confirmed, setConfirmed] = useState(false);    // true = doublon confirmé
    const [errors, setErrors] = useState({});

    // Données du formulaire
    const [form, setForm] = useState({
        category_id: '',
        type_incident_id: '',
        custom_type: '',
        latitude: '',
        longitude: '',
        city: '',
        district: '',
        location_description: '',
        description: '',
    });
    const [photos, setPhotos] = useState([]); // [{ file, preview }]

    // Données chargées
    const [categories, setCategories] = useState([]);
    const [typesIncident, setTypesIncident] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    // Géocodage inverse
    const [cityFromGPS, setCityFromGPS]         = useState(''); // ville trouvée par Nominatim
    const [districtFromGPS, setDistrictFromGPS] = useState(''); // quartier trouvé par Nominatim
    const [geocoding, setGeocoding]             = useState(false);

    // Gestion doublon
    const [doublon, setDoublon] = useState(null); // { message, alerte }
    const [doublonLoading, setDoublonLoading] = useState(null); // 'confirm' | 'force'

    // Détecter si la catégorie sélectionnée est "Autres"
    const selectedCategory = categories.find((c) => String(c.id) === String(form.category_id));
    const isOtherCategory = selectedCategory?.name === 'Autres';

    // ── Chargement des catégories depuis GET /categories ─────────────────────
    useEffect(() => {
        getCategories().then(setCategories).catch(() => {});
    }, []);

    useEffect(() => {
        if (!form.category_id) { setTypesIncident([]); return; }
        setLoadingTypes(true);
        getTypeIncidents(form.category_id)
            .then(setTypesIncident)
            .catch(() => {})
            .finally(() => setLoadingTypes(false));
    }, [form.category_id]);

    // ── Remplir lat/lng + géocodage inverse ──────────────────────────────────
    useEffect(() => {
        if (!position) return;
        setForm((prev) => ({
            ...prev,
            latitude:  String(position.latitude),
            longitude: String(position.longitude),
        }));
        clearError('latitude');
        setGeocoding(true);
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.latitude}&lon=${position.longitude}&format=json`)
            .then((r) => r.json())
            .then((data) => {
                const addr = data.address ?? {};

                // Normalisation pour comparaison exacte (sans accents, casse uniforme)
                const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
                const communesNorm = new Map(COMMUNES.map((c) => [norm(c), c]));

                // Chercher la commune dans les champs structurés OSM par ordre de priorité.
                // On valide chaque valeur contre la liste officielle des 77 communes —
                // correspondance exacte uniquement, pas de substring.
                const candidats = [
                    addr.municipality,
                    addr.city,
                    addr.town,
                    addr.county,
                ].filter(Boolean);
                const commune = candidats.reduce((found, val) => {
                    return found || communesNorm.get(norm(val)) || '';
                }, '');

                // Localité : suburb > neighbourhood > quarter > village > hamlet
                const localite = addr.suburb || addr.neighbourhood || addr.quarter
                    || addr.village || addr.hamlet || addr.locality || '';

                setCityFromGPS(commune);
                setDistrictFromGPS(localite);
                setForm((prev) => ({
                    ...prev,
                    city:     commune  || prev.city,
                    district: localite || prev.district,
                }));
            })
            .catch(() => {})
            .finally(() => setGeocoding(false));
    }, [position]);

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        clearError(field);
    }

    function clearError(field) {
        setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }

    // ── Validation par étape ──────────────────────────────────────────────────
    function validateStep0() {
        const e = {};
        if (!form.category_id) e.category_id = 'Sélectionnez une catégorie.';
        if (isOtherCategory) {
            if (!form.custom_type.trim()) e.custom_type = 'Décrivez le type d\'incident.';
        } else {
            if (!form.type_incident_id) e.type_incident_id = 'Sélectionnez un type d\'incident.';
        }
        return e;
    }

    function validateStep1() {
        const e = {};
        if (!form.latitude || !form.longitude) e.latitude = 'La localisation GPS est requise. Cliquez sur "Obtenir ma position".';
        if (!form.city.trim()) e.city = 'La ville est requise.';
        if (!form.district.trim()) e.district = 'Le quartier est requis.';
        return e;
    }

    function validateStep2() {
        const e = {};
        if (!form.description.trim()) e.description = 'La description est requise.';
        else if (form.description.length > 1000) e.description = 'Maximum 1000 caractères.';
        return e;
    }

    function nextStep() {
        const validators = [validateStep0, validateStep1];
        const e = validators[step]?.() ?? {};
        if (Object.keys(e).length) { setErrors(e); return; }
        setStep((s) => s + 1);
    }

    // ── Gestion photos ────────────────────────────────────────────────────────
    function handlePhotos(files) {
        const valides = [];
        const errs = [];

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                errs.push(`${file.name} : format non supporté.`);
                return;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                errs.push(`${file.name} : dépasse ${MAX_SIZE_MB}MB.`);
                return;
            }
            valides.push({ file, preview: URL.createObjectURL(file) });
        });

        setPhotos((prev) => {
            const merged = [...prev, ...valides].slice(0, MAX_PHOTOS);
            return merged;
        });

        if (errs.length) setErrors((prev) => ({ ...prev, photos: errs.join(' ') }));
        else clearError('photos');
    }

    function removePhoto(index) {
        setPhotos((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    }

    // ── Construction du FormData ──────────────────────────────────────────────
    function buildFormData() {
        const fd = new FormData();
        fd.append('category_id',      form.category_id);
        if (isOtherCategory) {
            fd.append('custom_type', form.custom_type.trim());
        } else {
            fd.append('type_incident_id', form.type_incident_id);
        }
        fd.append('latitude',         form.latitude);
        fd.append('longitude',        form.longitude);
        fd.append('city',             form.city.trim());
        fd.append('description',      form.description.trim());
        if (form.district.trim())
            fd.append('district', form.district.trim());
        if (form.location_description.trim())
            fd.append('location_description', form.location_description.trim());
        photos.forEach(({ file }) => fd.append('photos[]', file));
        return fd;
    }

    // ── Soumission effective (après auth confirmée) ────────────────────────────
    async function doSubmit() {
        setSubmitting(true);
        try {
            const { data } = await api.post('/alertes', buildFormData(), {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            handleSuccess(data.id);
        } catch (err) {
            if (err.response?.status === 409) {
                setDoublon({
                    message: err.response.data.message,
                    alerte:  err.response.data.alerte,
                });
            } else if (err.response?.status === 422) {
                const apiErrors = err.response.data.errors ?? {};
                const mapped = {};
                Object.entries(apiErrors).forEach(([f, msgs]) => {
                    mapped[f] = Array.isArray(msgs) ? msgs[0] : msgs;
                });
                const step0Fields = ['category_id', 'type_incident_id'];
                const step1Fields = ['latitude', 'longitude', 'city'];
                if (step0Fields.some((f) => mapped[f])) setStep(0);
                else if (step1Fields.some((f) => mapped[f])) setStep(1);
                setErrors(mapped);
            } else {
                setErrors({ global: err.response?.data?.message ?? 'Une erreur est survenue. Réessayez.' });
            }
        } finally {
            setSubmitting(false);
        }
    }

    // ── Soumission principale ─────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        const e2 = validateStep2();
        if (Object.keys(e2).length) { setErrors(e2); return; }

        if (!isAuthenticated) {
            // Upload temporaire des photos avant auth
            let tempPhotos = [];
            let uploadToken = null;
            if (photos.length > 0) {
                try {
                    const fd = new FormData();
                    photos.forEach(({ file }) => fd.append('photos[]', file));
                    const { data } = await api.post('/temp-upload', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    tempPhotos = data.paths;
                    uploadToken = data.upload_token;
                } catch {
                    setErrors({ global: 'Erreur lors de l\'upload des photos. Réessayez.' });
                    return;
                }
            }

            requireAuth({
                contribution: {
                    type: 'alerte',
                    data: {
                        category_id: form.category_id,
                        type_incident_id: isOtherCategory ? null : form.type_incident_id,
                        custom_type: isOtherCategory ? form.custom_type.trim() : null,
                        description: form.description.trim(),
                        latitude: form.latitude,
                        longitude: form.longitude,
                        city: form.city.trim(),
                        district: form.district.trim(),
                        location_description: form.location_description.trim(),
                        temp_photos: tempPhotos.length > 0 ? tempPhotos : null,
                        upload_token: uploadToken,
                    },
                },
                message: 'Dernière étape avant l\'enregistrement de votre contribution. Afin de garantir la fiabilité des informations publiées sur la plateforme, veuillez renseigner une adresse e-mail.',
                onSuccess: doSubmit,
            });
            return;
        }

        doSubmit();
    }

    function handleSuccess(alerteId) {
        setSuccess(true);
        fetchAlertes();
        setTimeout(() => {
            navigate('/signalements', { state: { alerteId }, replace: true });
        }, 2000);
    }

    // ── Gestion doublon : même incident ──────────────────────────────────────
    async function handleConfirmerMeme() {
        setDoublonLoading('confirm');
        const alerteId = doublon.alerte.id;
        try {
            await api.post(`/alertes/${alerteId}/interactions`, { type: 'confirmation' });
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || '';
            const isOwnAlertError = /propre alerte/i.test(message);

            // Si l'utilisateur tente de confirmer un doublon sur sa propre alerte,
            // on ne l'affiche pas comme une erreur : on le redirige comme un cas de confirmation valide.
            if (!isOwnAlertError && status !== 422) {
                setErrors({ global: err.response?.data?.message || 'Erreur lors de la confirmation.' });
                setDoublon(null);
                setDoublonLoading(null);
                return;
            }
        }
        // Succès, déjà confirmé récemment, ou confirmation sur sa propre alerte → écran confirmation + redirect
        setDoublon(null);
        setDoublonLoading(null);
        setConfirmed(true);
        setTimeout(() => {
            navigate('/signalements', { state: { alerteId }, replace: true });
        }, 2000);
    }

    // ── Gestion doublon : forcer la création ──────────────────────────────────
    async function handleForcer() {
        setDoublonLoading('force');
        try {
            const { data } = await api.post('/alertes/force', buildFormData(), {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDoublon(null);
            handleSuccess(data.id);
        } catch (err) {
            setErrors({ global: err.response?.data?.message ?? 'Une erreur est survenue.' });
            setDoublon(null);
        } finally {
            setDoublonLoading(null);
        }
    }

    const inputCls = (field) =>
        `w-full px-4 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 text-sm
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
         ${errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`;

    // ── Écran confirmation doublon ────────────────────────────────────────────
    if (confirmed) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirmation enregistrée</h2>
                        <p className="text-slate-500 mb-2">Merci d'avoir confirmé cet incident existant.</p>
                        <p className="text-sm text-slate-400">Redirection en cours…</p>
                        <div className="mt-4 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Écran succès ──────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Signalement envoyé !</h2>
                        <p className="text-slate-500 mb-2">Votre incident a été signalé avec succès.</p>
                        <p className="text-sm text-slate-400">Redirection en cours…</p>
                        <div className="mt-4 w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

                {/* Titre */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Signaler un incident</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Aidez la communauté en signalant un incident sur la route.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <Stepper step={step} />

                    {/* Erreur globale */}
                    {errors.global && (
                        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className="text-red-700 text-sm">{errors.global}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ══ Étape 0 : Catégorie & type ══════════════════════ */}
                        {step === 0 && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Catégorie d'incident <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) => { setField('category_id', e.target.value); setField('type_incident_id', ''); setField('custom_type', ''); }}
                                        className={inputCls('category_id')}
                                    >
                                        <option value="">Sélectionnez une catégorie…</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <FieldError msg={errors.category_id} />
                                </div>

                                {isOtherCategory ? (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Type d'incident <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.custom_type}
                                            onChange={(e) => setField('custom_type', e.target.value)}
                                            placeholder="Décrivez le type d'incident…"
                                            maxLength={150}
                                            className={inputCls('custom_type')}
                                        />
                                        <FieldError msg={errors.custom_type} />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Type d'incident <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={form.type_incident_id}
                                                onChange={(e) => setField('type_incident_id', e.target.value)}
                                                disabled={!form.category_id || loadingTypes}
                                                className={`${inputCls('type_incident_id')} disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <option value="">
                                                    {!form.category_id
                                                        ? 'Sélectionnez d\'abord une catégorie'
                                                        : loadingTypes ? 'Chargement…'
                                                        : typesIncident.length === 0 ? 'Aucun type disponible'
                                                        : 'Sélectionnez un type…'}
                                                </option>
                                                {typesIncident.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            {loadingTypes && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                        <FieldError msg={errors.type_incident_id} />
                                    </div>
                                )}

                                <NavButtons step={step} onNext={nextStep} />
                            </div>
                        )}

                        {/* ══ Étape 1 : Localisation ══════════════════════════ */}
                        {step === 1 && (
                            <div className="space-y-5">
                                {/* GPS */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Position GPS <span className="text-red-500">*</span>
                                    </label>

                                    {!position && !geoLoading && (
                                        <button
                                            type="button"
                                            onClick={getPosition}
                                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                            </svg>
                                            Obtenir ma position GPS
                                        </button>
                                    )}

                                    {geoLoading && (
                                        <div className="flex items-center gap-3 py-3.5 px-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                                            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                                            Récupération de votre position en cours…
                                        </div>
                                    )}

                                    {geoError && (
                                        <div className="py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                            {geoError}
                                            <button type="button" onClick={getPosition} className="ml-2 font-semibold underline">Réessayer</button>
                                        </div>
                                    )}

                                    {position && (
                                        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-green-50 border border-green-200">
                                            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                            <div className="text-sm">
                                                <p className="font-semibold text-green-800">Position obtenue</p>
                                                <p className="text-green-600 font-mono text-xs mt-0.5">
                                                    {Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={getPosition}
                                                className="ml-auto text-xs text-green-700 hover:text-green-900 underline"
                                            >
                                                Actualiser
                                            </button>
                                        </div>
                                    )}

                                    <FieldError msg={errors.latitude} />
                                </div>

                                {geocoding && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                        <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                        Identification de la ville et du quartier…
                                    </div>
                                )}

                                {/* Ville */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.city}
                                        onChange={(e) => setField('city', e.target.value)}
                                        className={inputCls('city')}
                                    >
                                        <option value="">Sélectionnez une commune…</option>
                                        {COMMUNES.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                    <FieldError msg={errors.city} />
                                </div>

                                {/* Quartier */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Quartier <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.district}
                                        onChange={(e) => setField('district', e.target.value)}
                                        placeholder={districtFromGPS ? districtFromGPS : 'Ex : Cadjehoun, Akpakpa…'}
                                        className={inputCls('district')}
                                    />
                                    <FieldError msg={errors.district} />
                                </div>

                                {/* Description de l'emplacement */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Description de l'emplacement
                                        <span className="text-slate-400 font-normal ml-1">(optionnel)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location_description}
                                        onChange={(e) => setField('location_description', e.target.value)}
                                        placeholder="Ex : Carrefour Cadjehoun, près du marché…"
                                        className={inputCls('location_description')}
                                    />
                                </div>

                                <NavButtons step={step} onPrev={() => setStep(0)} onNext={nextStep} />
                            </div>
                        )}

                        {/* ══ Étape 2 : Description & photos ══════════════════ */}
                        {step === 2 && (
                            <div className="space-y-5">
                                {/* Description */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <span className={`text-xs font-medium ${form.description.length > 950 ? 'text-red-600' : 'text-slate-400'}`}>
                                            {form.description.length} / 1000
                                        </span>
                                    </div>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setField('description', e.target.value)}
                                        rows={5}
                                        maxLength={1000}
                                        placeholder="Décrivez l'incident : nature, gravité, impact sur la circulation…"
                                        className={`${inputCls('description')} resize-none leading-relaxed`}
                                    />
                                    <FieldError msg={errors.description} />
                                </div>

                                {/* Upload photos */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Photos
                                        <span className="text-slate-400 font-normal ml-1">
                                            (optionnel — max {MAX_PHOTOS} photos, {MAX_SIZE_MB}MB chacune)
                                        </span>
                                    </label>

                                    {photos.length < MAX_PHOTOS && (
                                        <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                            </svg>
                                            <span className="text-sm text-slate-500">
                                                Cliquez pour ajouter des photos
                                                <span className="text-slate-400 ml-1">
                                                    ({photos.length}/{MAX_PHOTOS})
                                                </span>
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => handlePhotos(e.target.files)}
                                            />
                                        </label>
                                    )}

                                    <FieldError msg={errors.photos} />
                                    <PreviewPhotos photos={photos} onRemove={removePhoto} />
                                </div>

                                {/* Récapitulatif */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
                                    <p className="font-semibold text-slate-600 text-xs uppercase tracking-wider mb-3">Récapitulatif</p>
                                    <RecapItem label="Catégorie" value={categories.find((c) => String(c.id) === form.category_id)?.name} />
                                    <RecapItem label="Type" value={typesIncident.find((t) => String(t.id) === form.type_incident_id)?.name} />
                                    <RecapItem label="Ville" value={form.city} />
                                    {form.district && <RecapItem label="Quartier" value={form.district} />}
                                    {form.location_description && <RecapItem label="Lieu" value={form.location_description} />}
                                    <RecapItem label="Coordonnées" value={`${Number(form.latitude).toFixed(5)}, ${Number(form.longitude).toFixed(5)}`} />
                                </div>

                                <NavButtons
                                    step={step}
                                    onPrev={() => setStep(1)}
                                    isSubmit
                                    loading={submitting}
                                />
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Modal doublon */}
            {doublon && (
                <ModalDoublon
                    message={doublon.message}
                    alerte={doublon.alerte}
                    onConfirmerMemeIncident={handleConfirmerMeme}
                    onContinuer={handleForcer}
                    onFermer={() => setDoublon(null)}
                    loading={doublonLoading}
                />
            )}
        </div>
    );
}

// ── Boutons de navigation ─────────────────────────────────────────────────────
function NavButtons({ step, onPrev, onNext, isSubmit = false, loading = false }) {
    return (
        <div className="flex gap-3 pt-2">
            {step > 0 && (
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                    ← Retour
                </button>
            )}
            {isSubmit ? (
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors shadow-sm shadow-orange-500/30"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Envoi en cours…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                            Envoyer le signalement
                        </>
                    )}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm transition-colors"
                >
                    Continuer →
                </button>
            )}
        </div>
    );
}

function RecapItem({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 shrink-0">{label}</span>
            <span className="font-medium text-slate-700 text-right truncate">{value}</span>
        </div>
    );
}

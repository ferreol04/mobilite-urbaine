import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import FormulaireModification from '../../components/alertes/FormulaireModification';
import Loader from '../../components/common/Loader';
import useTempsEcoule from '../../hooks/useTempsEcoule';
import { STATUS_BADGE, STATUS_LABEL } from '../../constants/theme';
import api from '../../api/axios';
import { getConfig } from '../../api/cache';

const MEDIA_BASE = 'http://127.0.0.1:8000/storage/';

// ── Statut avec bordure gauche colorée ───────────────────────────────────────
const BORDER_COLOR = {
    active:   'border-l-green-500',
    expired:  'border-l-slate-400',
    resolved: 'border-l-blue-500',
    false:    'border-l-red-500',
};

const STATUS_DOT = {
    active:   'bg-green-500',
    expired:  'bg-slate-400',
    resolved: 'bg-blue-500',
    false:    'bg-red-500',
};

// ── Modal galerie photos ──────────────────────────────────────────────────────
function GaleriePhotos({ photos, onClose }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape')      onClose();
            if (e.key === 'ArrowRight')  setIndex((i) => (i + 1) % photos.length);
            if (e.key === 'ArrowLeft')   setIndex((i) => (i - 1 + photos.length) % photos.length);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [photos.length, onClose]);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
             style={{ zIndex: 2000 }} onClick={onClose}>
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
                 onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <span className="text-slate-400 text-sm">{index + 1} / {photos.length}</span>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">✕</button>
                </div>
                <div className="relative aspect-video bg-black">
                    <img src={`${MEDIA_BASE}${photos[index].url}`} alt=""
                         className="w-full h-full object-contain" />
                    {photos.length > 1 && (
                        <>
                            <button onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white text-xl rounded-full flex items-center justify-center">‹</button>
                            <button onClick={() => setIndex((i) => (i + 1) % photos.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white text-xl rounded-full flex items-center justify-center">›</button>
                        </>
                    )}
                </div>
                {photos.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                        {photos.map((p, i) => (
                            <button key={p.id} onClick={() => setIndex(i)}
                                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === index ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                                <img src={`${MEDIA_BASE}${p.url}`} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Carte d'une alerte ────────────────────────────────────────────────────────
function CarteMonSignalement({ alerte, config, onModifier, onDelete }) {
    const tempsEcoule = useTempsEcoule(alerte.reported_at);
    const [showGalerie, setShowGalerie]     = useState(false);
    const [expanded, setExpanded]           = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting]           = useState(false);
    const [deleteError, setDeleteError]     = useState('');

    const photos  = alerte.medias ?? [];
    const status  = alerte.status;
    const ageMin  = (Date.now() - new Date(alerte.reported_at).getTime()) / 60000;
    const canEdit = status === 'active'
        && ageMin < (config?.delai_modification ?? 15)
        && alerte.confirmation_count < (config?.seuil_confirmation_modification ?? 5);
    const canDelete = status !== 'active';

    async function handleDelete() {
        setDeleting(true);
        setDeleteError('');
        try {
            await api.delete(`/alertes/${alerte.id}`);
            onDelete(alerte.id);
        } catch (err) {
            setDeleteError(err.response?.data?.message ?? 'Erreur lors de la suppression.');
            setDeleting(false);
            setConfirmDelete(false);
        }
    }

    return (
        <>
            <article className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${BORDER_COLOR[status] ?? 'border-l-slate-300'} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className="p-5 space-y-4">

                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                                {alerte.category?.name}
                            </span>
                            <h3 className="font-bold text-slate-800 text-base leading-tight mt-0.5 truncate">
                                {alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                            <span className={STATUS_BADGE[status] ?? STATUS_BADGE.expired}>
                                {STATUS_LABEL[status] ?? status}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {alerte.description && (
                        <div className="text-sm text-slate-600 leading-relaxed">
                            <p className={!expanded && alerte.description.length > 150 ? 'line-clamp-2' : ''}>
                                {alerte.description}
                            </p>
                            {alerte.description.length > 150 && (
                                <button onClick={() => setExpanded((v) => !v)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-0.5 transition-colors">
                                    {expanded ? 'Voir moins ↑' : 'Voir plus ↓'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Lieu + temps */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {alerte.district ? `${alerte.district}, ` : ''}{alerte.city}{alerte.location_description ? ` — ${alerte.location_description}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {tempsEcoule}
                        </span>
                    </div>

                    {/* Compteurs */}
                    <div className="grid grid-cols-3 gap-2">
                        <Compteur value={alerte.confirmation_count}    label="Confirmations" color="green" />
                        <Compteur value={alerte.resolved_report_count} label="Terminées"     color="blue" />
                        <Compteur value={alerte.false_report_count}    label="Fausses"       color="red" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                        {/* Voir les photos */}
                        {photos.length > 0 && (
                            <button
                                onClick={() => setShowGalerie(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                                {photos.length} photo{photos.length > 1 ? 's' : ''}
                            </button>
                        )}

                        {/* Modifier */}
                        {canEdit && (
                            <button
                                onClick={() => onModifier(alerte)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                </svg>
                                Modifier
                            </button>
                        )}

                        {/* Supprimer */}
                        {canDelete && !confirmDelete && (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                Supprimer
                            </button>
                        )}
                    </div>

                    {/* Confirmation suppression inline */}
                    {confirmDelete && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                            <p className="text-sm text-red-700 font-medium">
                                Supprimer ce signalement définitivement ?
                            </p>
                            {deleteError && (
                                <p className="text-xs text-red-600">{deleteError}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setConfirmDelete(false); setDeleteError(''); }}
                                    disabled={deleting}
                                    className="flex-1 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                                >
                                    {deleting
                                        ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : 'Confirmer la suppression'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </article>

            {showGalerie && (
                <GaleriePhotos photos={photos} onClose={() => setShowGalerie(false)} />
            )}
        </>
    );
}

function Compteur({ value, label, color }) {
    const cls = {
        green: 'bg-green-50 text-green-700',
        blue:  'bg-blue-50 text-blue-700',
        red:   'bg-red-50 text-red-700',
    };
    return (
        <div className={`${cls[color]} rounded-xl px-3 py-2.5 text-center`}>
            <p className="text-xl font-bold">{value ?? 0}</p>
            <p className="text-xs mt-0.5 opacity-80">{label}</p>
        </div>
    );
}

// ── Drawer modification ────────────────────────────────────────────────────────
function DrawerModification({ alerte, onClose, onUpdate }) {
    return (
        <div className="fixed inset-0 flex" style={{ zIndex: 1000 }}>
            <div className="flex-1 bg-black/40" onClick={onClose} />
            <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
                <FormulaireModification alerte={alerte} onClose={onClose} onUpdate={onUpdate} />
            </div>
        </div>
    );
}

// ── Filtres par statut ────────────────────────────────────────────────────────
const STATUTS = [
    { key: '',         label: 'Tous' },
    { key: 'active',   label: 'Actifs' },
    { key: 'expired',  label: 'Expirés' },
    { key: 'resolved', label: 'Résolus' },
    { key: 'false',    label: 'Faux' },
];

// ── Page principale ────────────────────────────────────────────────────────────
export default function MesSignalements() {
    const [alertes, setAlertes]             = useState([]);
    const [loading, setLoading]             = useState(true);
    const [filtreStatut, setFiltreStatut]   = useState('');
    const [alerteAModifier, setAlerteAModifier] = useState(null);
    const [config, setConfig]               = useState({ seuil_confirmation_modification: 5, delai_modification: 15 });
    const [page, setPage]                   = useState(1);
    const PAR_PAGE = 9;

    useEffect(() => {
        Promise.all([
            api.get('/my-alertes'),
            getConfig().catch(() => null),
        ]).then(([{ data: myAlertes }, cfg]) => {
            setAlertes(myAlertes);
            if (cfg) setConfig(cfg);
        }).finally(() => setLoading(false));
    }, []);

    const handleUpdate = useCallback((updated) => {
        setAlertes((prev) =>
            prev.map((a) => a.id === updated.id ? { ...a, ...updated } : a)
        );
        setAlerteAModifier(null);
    }, []);

    const handleDelete = useCallback((id) => {
        setAlertes((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const filtrees = filtreStatut
        ? alertes.filter((a) => a.status === filtreStatut)
        : alertes;

    const totalPages = Math.ceil(filtrees.length / PAR_PAGE);
    const affichees  = filtrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

    // Reset page quand le filtre change
    useEffect(() => { setPage(1); }, [filtreStatut]);

    // Compteurs par statut
    const counts = alertes.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* En-tête */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl font-bold text-slate-800">Mes signalements</h1>
                </div>
            </div>

            {/* Filtres statut */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-1 overflow-x-auto">
                    {STATUTS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFiltreStatut(key)}
                            className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filtreStatut === key
                                    ? 'bg-blue-700 text-white'
                                    : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {label}
                            {key && counts[key] ? (
                                <span className={`ml-1.5 text-xs font-semibold ${filtreStatut === key ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {counts[key]}
                                </span>
                            ) : null}
                        </button>
                    ))}
                    <Link to="/signaler"
                        className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Signaler
                    </Link>
                </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
                {loading && (
                    <div className="py-16"><Loader /><p className="text-center text-slate-400 text-sm mt-2">Chargement…</p></div>
                )}

                {!loading && affichees.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">
                            {filtreStatut ? `Aucun signalement ${STATUS_LABEL[filtreStatut]?.toLowerCase()}` : 'Aucun signalement'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            {filtreStatut
                                ? 'Aucun signalement correspond à ce filtre.'
                                : 'Vous n\'avez pas encore signalé d\'incident.'}
                        </p>
                        {filtreStatut ? (
                            <button onClick={() => setFiltreStatut('')}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                                Voir tous les signalements
                            </button>
                        ) : (
                            <a href="/signaler"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Signaler un incident
                            </a>
                        )}
                    </div>
                )}

                {!loading && affichees.length > 0 && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {affichees.map((alerte) => (
                                <CarteMonSignalement
                                    key={alerte.id}
                                    alerte={alerte}
                                    config={config}
                                    onModifier={setAlerteAModifier}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage((p) => p - 1)}
                                    disabled={page === 1}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                    </svg>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                                            n === page
                                                ? 'bg-blue-700 text-white'
                                                : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page === totalPages}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Drawer modification */}
            {alerteAModifier && (
                <DrawerModification
                    alerte={alerteAModifier}
                    onClose={() => setAlerteAModifier(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}

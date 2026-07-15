import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { getCategories, getTypeIncidents } from '../../api/cache';

const MEDIA_BASE = 'http://127.0.0.1:8000/storage/';

// ── Badge statut ──────────────────────────────────────────────────────────────
function BadgeStatut({ status }) {
    const cls = {
        active:   'bg-green-100 text-green-700',
        resolved: 'bg-blue-100 text-blue-700',
        false:    'bg-red-100 text-red-700',
        expired:  'bg-slate-100 text-slate-600',
    };
    const labels = { active: 'Active', resolved: 'Résolue', false: 'Fausse', expired: 'Expirée' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls[status] ?? cls.expired}`}>
            {labels[status] ?? status}
        </span>
    );
}

// ── Modal confirmation action ─────────────────────────────────────────────────
function ModalConfirm({ titre, message, labelConfirm, colorConfirm, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-6 py-5">
                    <h3 className="text-base font-semibold text-slate-900">{titre}</h3>
                    <p className="text-sm text-slate-500 mt-1">{message}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">
                        Annuler
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm text-white font-semibold transition-colors disabled:opacity-50 ${colorConfirm}`}>
                        {loading ? 'En cours…' : labelConfirm}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Lightbox photos ───────────────────────────────────────────────────────────
function Lightbox({ photos, index, onChange, onClose }) {
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft')  onChange((index - 1 + photos.length) % photos.length);
            if (e.key === 'ArrowRight') onChange((index + 1) % photos.length);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [index, photos.length, onChange, onClose]);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4" style={{ zIndex: 2000 }} onClick={onClose}>
            <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <img src={`${MEDIA_BASE}${photos[index].url}`} alt="" className="w-full max-h-[75vh] object-contain rounded-xl" />
                <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm">✕</button>
                {photos.length > 1 && (
                    <>
                        <button onClick={() => onChange((index - 1 + photos.length) % photos.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center">‹</button>
                        <button onClick={() => onChange((index + 1) % photos.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center">›</button>
                    </>
                )}
                <p className="text-center text-slate-400 text-sm mt-2">{index + 1} / {photos.length}</p>
            </div>
        </div>
    );
}

// ── Modal détail alerte ───────────────────────────────────────────────────────
function ModalDetailAlerte({ alerteId, onClose, onUpdated }) {
    const [alerte, setAlerte]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState(null); // { action: 'false'|'resolved' }
    const [acting, setActing]   = useState(false);
    const [photoIndex, setPhotoIndex] = useState(null);

    useEffect(() => {
        api.get(`/admin/alertes/${alerteId}`)
            .then(({ data }) => setAlerte(data))
            .finally(() => setLoading(false));
    }, [alerteId]);

    async function handleAction(status) {
        setActing(true);
        try {
            await api.patch(`/admin/alertes/${alerteId}/status`, { status });
            onUpdated(alerteId, status);
            onClose();
        } finally {
            setActing(false);
            setConfirm(null);
        }
    }

    const photos = alerte?.medias ?? [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-base font-semibold text-slate-900">Détail de l'alerte</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {alerte && (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {/* Type + catégorie */}
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{alerte.category?.name}</p>
                                <p className="text-lg font-bold text-slate-800">{alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}</p>
                                <BadgeStatut status={alerte.status} />
                            </div>

                            {/* Localisation */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-400 mb-0.5">Ville</p>
                                    <p className="font-medium text-slate-700">{alerte.city}</p>
                                </div>
                                {alerte.district && (
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-0.5">Quartier</p>
                                        <p className="font-medium text-slate-700">{alerte.district}</p>
                                    </div>
                                )}
                                {alerte.location_description && (
                                    <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                                        <p className="text-xs text-slate-400 mb-0.5">Description du lieu</p>
                                        <p className="font-medium text-slate-700">{alerte.location_description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {alerte.description && (
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Description</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">{alerte.description}</p>
                                </div>
                            )}

                            {/* Auteur + date */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-400 mb-0.5">Auteur</p>
                                    <p className="font-medium text-slate-700">
                                        {`${alerte.user?.first_name ?? ''} ${alerte.user?.last_name ?? ''}`.trim() || alerte.user?.pseudo || 'Inconnu'}
                                    </p>
                                    {alerte.user?.pseudo && <p className="text-xs text-slate-400">{alerte.user.pseudo}</p>}
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-400 mb-0.5">Signalé le</p>
                                    <p className="font-medium text-slate-700">
                                        {new Date(alerte.reported_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        {' '}{new Date(alerte.reported_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Compteurs */}
                            <div className="grid grid-cols-3 gap-3 text-sm text-center">
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-xl font-bold text-green-700">{alerte.confirmation_count}</p>
                                    <p className="text-xs text-green-600 mt-0.5">Confirmations</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xl font-bold text-blue-700">{alerte.resolved_report_count ?? 0}</p>
                                    <p className="text-xs text-blue-600 mt-0.5">Terminées</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-xl font-bold text-red-700">{alerte.false_report_count}</p>
                                    <p className="text-xs text-red-600 mt-0.5">Fausses</p>
                                </div>
                            </div>

                            {/* Photos */}
                            {photos.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Photos ({photos.length})</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {photos.map((p, i) => (
                                            <button key={p.id} onClick={() => setPhotoIndex(i)}
                                                className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
                                                <img src={`${MEDIA_BASE}${p.url}`} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {alerte.status === 'active' && (
                            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                                <button
                                    onClick={() => setConfirm({ action: 'resolved' })}
                                    className="flex-1 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                                >
                                    Forcer la résolution
                                </button>
                                <button
                                    onClick={() => setConfirm({ action: 'false' })}
                                    className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                                >
                                    Marquer fausse
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {confirm && (
                <ModalConfirm
                    titre={confirm.action === 'resolved' ? 'Forcer la résolution' : 'Marquer comme fausse'}
                    message={confirm.action === 'resolved'
                        ? 'Cette alerte sera marquée comme résolue. Cette action est immédiate.'
                        : 'Cette alerte sera marquée comme fausse et retirée de la carte.'}
                    labelConfirm={confirm.action === 'resolved' ? 'Confirmer' : 'Marquer fausse'}
                    colorConfirm={confirm.action === 'resolved' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-red-600 hover:bg-red-700'}
                    onConfirm={() => handleAction(confirm.action)}
                    onCancel={() => setConfirm(null)}
                    loading={acting}
                />
            )}

            {photoIndex !== null && (
                <Lightbox
                    photos={photos}
                    index={photoIndex}
                    onChange={setPhotoIndex}
                    onClose={() => setPhotoIndex(null)}
                />
            )}
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function GestionAlertes() {
    const [alertes, setAlertes]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    // Filtres
    const [categories, setCategories]       = useState([]);
    const [typeIncidents, setTypeIncidents] = useState([]);
    const [categoryId, setCategoryId]       = useState('');
    const [typeIncidentId, setTypeIncidentId] = useState('');
    const [search, setSearch]               = useState('');

    // Charger les catégories au montage
    useEffect(() => {
        getCategories().then(setCategories).catch(() => {});
    }, []);

    // Charger les types quand la catégorie change
    useEffect(() => {
        if (categoryId) {
            getTypeIncidents(categoryId).then(setTypeIncidents).catch(() => {});
        } else {
            setTypeIncidents([]);
        }
        setTypeIncidentId('');
    }, [categoryId]);

    // Recherche avec debounce
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Charger les alertes avec filtres
    const fetchAlertes = useCallback(() => {
        setLoading(true);
        const params = { status: 'active' };
        if (categoryId) params.category_id = categoryId;
        if (typeIncidentId) params.type_incident_id = typeIncidentId;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        api.get('/admin/alertes', { params })
            .then(({ data }) => setAlertes(Array.isArray(data) ? data : data.data ?? []))
            .finally(() => setLoading(false));
    }, [categoryId, typeIncidentId, debouncedSearch]);

    useEffect(() => {
        fetchAlertes();
    }, [fetchAlertes]);

    const handleUpdated = useCallback((id, newStatus) => {
        setAlertes((prev) => prev.filter((a) => a.id !== id));
    }, []);

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Gestion des alertes</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Alertes actives en cours</p>
                    </div>
                    <span className="text-sm text-slate-400">{alertes.length} alerte{alertes.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        value={typeIncidentId}
                        onChange={(e) => setTypeIncidentId(e.target.value)}
                        disabled={!categoryId}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <option value="">Tous les types</option>
                        {typeIncidents.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>

                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par auteur (nom, prénom, pseudo)..."
                            className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {!loading && alertes.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                        <p className="text-slate-500 font-medium">Aucune alerte trouvée</p>
                    </div>
                )}

                {!loading && alertes.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Incident</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Localisation</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Auteur</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date</th>
                                    <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Votes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {alertes.map((a) => (
                                    <tr key={a.id}
                                        onClick={() => setSelectedId(a.id)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors">
                                        <td className="px-4 py-3.5">
                                            <p className="font-medium text-slate-800 truncate max-w-[180px]">{a.type_incident?.name ?? a.custom_type ?? '—'}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{a.category?.name}</p>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            <p className="text-slate-700">{a.city}</p>
                                            {a.district && <p className="text-xs text-slate-400">{a.district}</p>}
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell text-slate-600">
                                            <p>{a.user?.first_name} {a.user?.last_name}</p>
                                            {a.user?.pseudo && <p className="text-xs text-slate-400">{a.user.pseudo}</p>}
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 text-xs whitespace-nowrap">
                                            {new Date(a.reported_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            {' '}{new Date(a.reported_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2 text-xs">
                                                <span className="text-green-600 font-semibold">✓ {a.confirmation_count}</span>
                                                <span className="text-red-500 font-semibold">✗ {a.false_report_count}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedId && (
                <ModalDetailAlerte
                    alerteId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onUpdated={handleUpdated}
                />
            )}
        </AdminLayout>
    );
}

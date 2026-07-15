import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import CarteAlerte from '../../components/alertes/CarteAlerte';
import DetailAlerte from '../../components/alertes/DetailAlerte';
import Loader from '../../components/common/Loader';
import useAlertes from '../../hooks/useAlertes';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import { getCategories, getTypeIncidents } from '../../api/cache';
import useTempsEcoule from '../../hooks/useTempsEcoule';
import { COMMUNES } from '../../constants/communes';

const PERIODES = [
    { label: 'Toutes les périodes', value: '' },
    { label: 'Dernière heure',      value: '1' },
    { label: '3 dernières heures',  value: '3' },
    { label: '6 dernières heures',  value: '6' },
    { label: '12 dernières heures', value: '12' },
    { label: 'Dernières 24h',       value: '24' },
];

function filtrerParPeriode(alertes, h) {
    if (!h) return alertes;
    const depuis = Date.now() - Number(h) * 3600 * 1000;
    return alertes.filter((a) => new Date(a.reported_at).getTime() >= depuis);
}

// ── Barre de filtres ──────────────────────────────────────────────────────────
function SectionFiltres({ filtres, onChange, categories, typesIncident, total }) {
    const actif = filtres.category_id || filtres.type_incident_id || filtres.city || filtres.periode;
    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <select
                    value={filtres.category_id}
                    onChange={(e) => onChange({ ...filtres, category_id: e.target.value, type_incident_id: '' })}
                    className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-0 flex-1 sm:flex-none"
                >
                    <option value="">Catégorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select
                    value={filtres.type_incident_id}
                    onChange={(e) => onChange({ ...filtres, type_incident_id: e.target.value })}
                    disabled={!filtres.category_id || typesIncident.length === 0}
                    className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 min-w-0 flex-1 sm:flex-none hidden sm:block"
                >
                    <option value="">{!filtres.category_id ? 'Type' : 'Tous les types'}</option>
                    {typesIncident.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <select
                    value={filtres.city}
                    onChange={(e) => onChange({ ...filtres, city: e.target.value })}
                    className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-0 flex-1 sm:flex-none"
                >
                    <option value="">Ville</option>
                    {COMMUNES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>

                <select
                    value={filtres.periode}
                    onChange={(e) => onChange({ ...filtres, periode: e.target.value })}
                    className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-0 flex-1 sm:flex-none"
                >
                    {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>

                {actif && (
                    <button
                        onClick={() => onChange({ category_id: '', type_incident_id: '', city: '', periode: '' })}
                        className="flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-700 transition-colors shrink-0"
                    >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Réinitialiser</span>
                    </button>
                )}

                <span className="ml-auto text-xs sm:text-sm text-slate-400 shrink-0">
                    {total} incident{total !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Signalements() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { alertes, loading, fetchAlertes } = useAlertes();

    const [filtres, setFiltres]   = useState({ category_id: '', type_incident_id: '', city: '', periode: '' });
    const [categories, setCategories]       = useState([]);
    const [typesIncident, setTypesIncident] = useState([]);
    const [alertesLocales, setAlertesLocales] = useState([]);
    const [selectedAlerte, setSelectedAlerte] = useState(null);

    const highlightId  = location.state?.alerteId ?? null;
    const highlightRef = useRef(null);

    useEffect(() => { setAlertesLocales(alertes); }, [alertes]);

    // Catégories
    useEffect(() => {
        getCategories().then(setCategories).catch(() => {});
    }, []);

    // Types dynamiques
    useEffect(() => {
        if (!filtres.category_id) { setTypesIncident([]); return; }
        getTypeIncidents(filtres.category_id).then(setTypesIncident).catch(() => {});
    }, [filtres.category_id]);

    // Ferme le panneau détail à chaque changement de filtre
    useEffect(() => {
        setSelectedAlerte(null);
    }, [filtres]);

    // Appel API sur filtres
    useEffect(() => {
        const params = {};
        if (filtres.category_id)      params.category_id      = filtres.category_id;
        if (filtres.type_incident_id) params.type_incident_id = filtres.type_incident_id;
        if (filtres.city)             params.city             = filtres.city;
        fetchAlertes(params);
    }, [filtres.category_id, filtres.type_incident_id, filtres.city, fetchAlertes]);

    // Ferme le panneau détail si l'alerte sélectionnée n'est plus présente
    useEffect(() => {
        if (!selectedAlerte) return;
        const keepSelected = alertesLocales.some((alerte) => alerte.id === selectedAlerte.id);
        if (!keepSelected) setSelectedAlerte(null);
    }, [alertesLocales, selectedAlerte]);

    // Ouvrir l'alerte mise en avant puis effacer le state pour éviter
    // la réouverture automatique au refresh
    useEffect(() => {
        if (!highlightId || alertesLocales.length === 0) return;
        const cible = alertesLocales.find((a) => a.id === highlightId);
        if (cible) {
            setSelectedAlerte(cible);
            // Remplace l'entrée courante de l'historique sans l'alerteId
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [highlightId, alertesLocales]);

    useEffect(() => {
        if (highlightRef.current)
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [alertesLocales]);

    const handleUpdate = useCallback((updated) => {
        setAlertesLocales((prev) =>
            prev.map((a) => a.id === updated.id ? { ...a, ...updated } : a)
                .filter((a) => a.status === 'active')
        );
        setSelectedAlerte((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev);
    }, []);

    // Liste triée + filtre période côté client
    const triees    = [...alertesLocales].sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));
    const affichees = filtres.periode ? filtrerParPeriode(triees, filtres.periode) : triees;
    const sorted = highlightId
        ? [...affichees].sort((a, b) => a.id === highlightId ? -1 : b.id === highlightId ? 1 : 0)
        : affichees;

    return (
        <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
            <Navbar />

            <SectionFiltres
                filtres={filtres}
                onChange={setFiltres}
                categories={categories}
                typesIncident={typesIncident}
                total={sorted.length}
            />

            {/* Layout principal : liste | panneau détail */}
            <div className="flex-1 flex h-full min-h-0 overflow-hidden max-w-screen-2xl mx-auto w-full">

                {/* ── Colonne gauche : liste ── */}
                <div className={`flex flex-col h-full min-h-0 bg-white border-r border-slate-200 overflow-hidden transition-all duration-200
                    ${selectedAlerte ? 'w-full md:w-96 lg:w-110 shrink-0' : 'w-full'}`}>

                    {/* En-tête liste */}
                    <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <span className="text-xs text-slate-400">Temps réel</span>
                            </div>
                        </div>
                        {isAuthenticated && (
                            <Link to="/signaler"
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Signaler
                            </Link>
                        )}
                    </div>

                    {/* Liste scrollable */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {loading && (
                            <div className="py-12"><Loader /><p className="text-center text-slate-400 text-sm mt-2">Chargement…</p></div>
                        )}

                        {!loading && sorted.length === 0 && (
                            <div className="py-16 text-center px-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-slate-600 mb-1">Aucun incident actif</p>
                                <p className="text-slate-400 text-sm">La route est dégagée pour le moment.</p>
                            </div>
                        )}

                        {!loading && sorted.map((alerte) => (
                            <div
                                key={alerte.id}
                                ref={alerte.id === highlightId ? highlightRef : null}
                                onClick={() => setSelectedAlerte(alerte)}
                                className={`border-b border-slate-100 cursor-pointer transition-colors
                                    ${selectedAlerte?.id === alerte.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                            >
                                {/* Ligne compacte dans la liste */}
                                <ListeItem
                                    alerte={alerte}
                                    selected={selectedAlerte?.id === alerte.id}
                                    highlight={alerte.id === highlightId}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Colonne droite : panneau de détail (visible seulement après clic) ── */}
                {selectedAlerte && (
                    <div className="flex-1 hidden md:flex h-full min-h-0 flex-col bg-white overflow-hidden border-l border-slate-200">
                        <DetailAlerte
                            key={selectedAlerte.id}
                            alerte={selectedAlerte}
                            onClose={() => setSelectedAlerte(null)}
                            onUpdate={handleUpdate}
                        />
                    </div>
                )}
            </div>

            {/* Drawer mobile (md et moins) */}
            {selectedAlerte && (
                <div className="md:hidden fixed inset-0 flex" style={{ zIndex: 1000 }}>
                    <div className="flex-1 bg-black/40" onClick={() => setSelectedAlerte(null)} />
                    <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
                        <DetailAlerte
                            key={selectedAlerte.id}
                            alerte={selectedAlerte}
                            onClose={() => setSelectedAlerte(null)}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Item compact dans la liste ────────────────────────────────────────────────
function ListeItem({ alerte, selected, highlight }) {
    const tempsEcoule = useTempsEcoule(alerte.reported_at);

    return (
        <div className={`px-4 py-3.5 ${highlight ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <span className="text-xs text-slate-400 block truncate">{alerte.category?.name}</span>
                    <p className={`text-sm font-semibold truncate mt-0.5 ${selected ? 'text-blue-700' : 'text-slate-800'}`}>
                        {alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}
                    </p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    alerte.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                    {alerte.status === 'active' ? 'Actif' : alerte.status}
                </span>
            </div>

            {alerte.description && (
                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{alerte.description}</p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {alerte.district ? `${alerte.district}, ` : ''}{alerte.city}
                </span>
                <span>{tempsEcoule}</span>
                <span className="flex items-center gap-1 text-green-600">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {alerte.confirmation_count}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    {alerte.false_report_count}
                </span>
            </div>
        </div>
    );
}

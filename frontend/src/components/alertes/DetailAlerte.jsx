import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useTempsEcoule from '../../hooks/useTempsEcoule';
import { STATUS_BADGE, STATUS_LABEL } from '../../constants/theme';
import BoutonInteraction from './BoutonInteraction';
import FormulaireModification from './FormulaireModification';
import useAuth from '../../hooks/useAuth';
import { getConfig } from '../../api/cache';

const MEDIA_BASE = 'http://127.0.0.1:8000/storage/';

export default function DetailAlerte({ alerte: initialAlerte, onClose, onUpdate }) {
    const { isAuthenticated, user } = useAuth();
    const [alerte, setAlerte] = useState(initialAlerte);
    const [photoIndex, setPhotoIndex] = useState(null);
    const [editing, setEditing] = useState(false);
    const [config, setConfig] = useState({ delai_modification: 15, seuil_confirmation_modification: 5 });
    const tempsEcoule = useTempsEcoule(alerte.reported_at);
    const photos = alerte.medias ?? [];
    const isOwner = user?.id === alerte.user_id;

    useEffect(() => {
        getConfig().then((cfg) => { if (cfg) setConfig(cfg); }).catch(() => {});
    }, []);

    function handleUpdate(updated) {
        const merged = { ...alerte, ...updated };
        setAlerte(merged);
        onUpdate?.(merged);
    }

    const ageMin = (Date.now() - new Date(alerte.reported_at).getTime()) / 60000;
    const canEdit = isOwner
        && alerte.status === 'active'
        && ageMin < (config?.delai_modification ?? 15)
        && alerte.confirmation_count < (config?.seuil_confirmation_modification ?? 5);

    if (editing) {
        return (
            <FormulaireModification
                alerte={alerte}
                onClose={() => setEditing(false)}
                onUpdate={(updated) => { handleUpdate(updated); setEditing(false); }}
            />
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-5 space-y-5">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-5">
                        <div className="min-w-0">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                {alerte.category?.name}
                            </span>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight mt-0.5 truncate">
                                {alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={STATUS_BADGE[alerte.status] ?? STATUS_BADGE.active}>
                                {STATUS_LABEL[alerte.status] ?? alerte.status}
                            </span>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Localisation</p>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <ClockIcon />
                                {tempsEcoule}
                            </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                            <span className="mt-0.5 text-slate-400 shrink-0"><PinIcon /></span>
                            <div>
                                <span className="font-medium text-slate-800">{alerte.city}</span>
                                {alerte.district && <span className="text-slate-500"> · {alerte.district}</span>}
                                {alerte.location_description && (
                                    <p className="text-slate-500 text-xs mt-0.5">{alerte.location_description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {alerte.description && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">
                                {alerte.description}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                            <UserIcon />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400">Signalé par</p>
                            <p className="text-sm font-medium text-slate-700 truncate">
                                {alerte.user?.display_name || `${alerte.user?.first_name ?? ''} ${alerte.user?.last_name ?? ''}`.trim() || 'Inconnu'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Counter value={alerte.confirmation_count} label="Confirmations" color="green" />
                        <Counter value={alerte.resolved_report_count} label="Terminées" color="blue" />
                        <Counter value={alerte.false_report_count} label="Fausses" color="red" />
                    </div>

                    {photos.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Photos ({photos.length})</p>
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map((p, i) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPhotoIndex(i)}
                                        className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity"
                                    >
                                        <img src={`${MEDIA_BASE}${p.url}`} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {alerte.status === 'active' && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Votre avis sur cet incident</p>
                            <BoutonInteraction alerte={alerte} onUpdate={handleUpdate} />
                        </div>
                    )}

                    {isOwner && (
                        <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                            {canEdit && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                    </svg>
                                    Modifier
                                </button>
                            )}
                            <Link
                                to="/mes-signalements"
                                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                            >
                                Mes signalements
                            </Link>
                        </div>
                    )}
                </div>
            </div>

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

function MetaItem({ icon, label, value, className = '' }) {
    return (
        <div className={`flex items-start gap-2 ${className}`}>
            <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
            </div>
        </div>
    );
}

function Counter({ value, label, color }) {
    const colors = { green: 'bg-green-50 text-green-800', blue: 'bg-blue-50 text-blue-800', red: 'bg-red-50 text-red-800' };
    return (
        <div className={`${colors[color]} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-0.5 opacity-80">{label}</p>
        </div>
    );
}

function Lightbox({ photos, index, onChange, onClose }) {
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

const PinIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

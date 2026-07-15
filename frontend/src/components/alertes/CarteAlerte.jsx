import { useState } from 'react';
import useTempsEcoule from '../../hooks/useTempsEcoule';
import { STATUS_BADGE, STATUS_LABEL } from '../../constants/theme';
import BoutonInteraction from './BoutonInteraction';

const MEDIA_BASE = 'http://127.0.0.1:8000/storage/';

function borderColor(iconName = '') {
    const k = iconName.toLowerCase();
    if (k.includes('accident') || k.includes('collision')) return 'border-l-red-500';
    if (k.includes('embouteillage') || k.includes('congestion')) return 'border-l-orange-500';
    if (k.includes('inondation') || k.includes('flood')) return 'border-l-blue-500';
    if (k.includes('travaux')) return 'border-l-yellow-500';
    if (k.includes('incendie')) return 'border-l-red-600';
    return 'border-l-slate-400';
}

export default function CarteAlerte({ alerte, highlight = false, onUpdate, onClick, hideActions = false }) {
    const [expanded, setExpanded] = useState(false);
    const [showPhotos, setShowPhotos] = useState(false);
    const tempsEcoule = useTempsEcoule(alerte.reported_at);

    const iconName = alerte.type_incident?.icon ?? '';
    const photos = alerte.medias ?? [];
    const descLong = alerte.description && alerte.description.length > 120;

    return (
        <>
            <article
                className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor(iconName)}
                            overflow-hidden transition-shadow hover:shadow-md cursor-pointer
                            ${highlight ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md' : 'shadow-sm'}`}
                onClick={onClick}
            >
                <div className="p-4 space-y-3">
                    {/* En-tête : catégorie + statut */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block truncate">
                                {alerte.category?.name}
                            </span>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight mt-0.5 truncate">
                                {alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}
                            </h3>
                        </div>
                        <span className={`${STATUS_BADGE[alerte.status] ?? STATUS_BADGE.active} shrink-0`}>
                            {STATUS_LABEL[alerte.status] ?? alerte.status}
                        </span>
                    </div>

                    {/* Description avec "Voir plus" */}
                    {alerte.description && (
                        <div className="text-sm text-slate-600 leading-relaxed" onClick={(e) => e.stopPropagation()}>
                            <p className={!expanded && descLong ? 'line-clamp-2' : ''}>
                                {alerte.description}
                            </p>
                            {descLong && (
                                <button
                                    onClick={() => setExpanded((v) => !v)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-0.5 transition-colors"
                                >
                                    {expanded ? 'Voir moins ↑' : 'Voir plus ↓'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Lieu + temps */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            <span className="truncate">
                                {alerte.city}{alerte.location_description ? ` — ${alerte.location_description}` : ''}
                            </span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {tempsEcoule}
                        </span>
                    </div>

                    {/* Compteurs */}
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-green-700">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            <strong>{alerte.confirmation_count}</strong> confirmation{alerte.confirmation_count !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-red-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            <strong>{alerte.false_report_count}</strong> fausse{alerte.false_report_count !== 1 ? 's' : ''}
                        </span>

                        {/* Bouton photos — visible pour tous, connexion requise pour voir */}
                        {photos.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowPhotos(true); }}
                                className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                                {photos.length} photo{photos.length > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>

                    {/* Boutons d'interaction — masqués dans le modal doublon */}
                    {!hideActions && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <BoutonInteraction alerte={alerte} onUpdate={onUpdate} compact />
                        </div>
                    )}
                </div>
            </article>

            {/* Modal photos */}
            {showPhotos && (
                <PhotoModal photos={photos} alerte={alerte} tempsEcoule={tempsEcoule} onClose={() => setShowPhotos(false)} />
            )}
        </>
    );
}

function PhotoModal({ photos, alerte, tempsEcoule, onClose }) {
    const [index, setIndex] = useState(0);

    return (
        <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
            style={{ zIndex: 2000 }}
            onClick={onClose}
        >
            <div
                className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <div>
                        <p className="text-white font-semibold text-sm">{alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}</p>
                        <p className="text-slate-400 text-xs">{alerte.city} · {tempsEcoule}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">{index + 1} / {photos.length}</span>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">✕</button>
                    </div>
                </div>

                <div className="relative aspect-video bg-black">
                    <img
                        src={`${MEDIA_BASE}${photos[index].url}`}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-contain"
                    />
                    {photos.length > 1 && (
                        <>
                            <button onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white text-xl transition-colors">‹</button>
                            <button onClick={() => setIndex((i) => (i + 1) % photos.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white text-xl transition-colors">›</button>
                        </>
                    )}
                </div>

                {photos.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                        {photos.map((p, i) => (
                            <button key={p.id} onClick={() => setIndex(i)}
                                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === index ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                                <img src={`${MEDIA_BASE}${p.url}`} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


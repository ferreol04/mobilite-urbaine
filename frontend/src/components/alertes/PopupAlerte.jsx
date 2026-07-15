import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useTempsEcoule from '../../hooks/useTempsEcoule';

const MEDIA_BASE = 'http://127.0.0.1:8000/storage/';

export default function PopupAlerte({ alerte, onClose }) {
    const [showPhotos, setShowPhotos] = useState(false);
    const ref = useRef(null);
    const photos = alerte.medias ?? [];
    const tempsEcoule = useTempsEcoule(alerte.reported_at);

    // Fermer en cliquant dehors
    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <>
            {/* Popup carte */}
            <div
                ref={ref}
                className="absolute bottom-4 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-80 z-1000
                           bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden
                           animate-in fade-in slide-in-from-bottom-3 duration-200"
                style={{ zIndex: 1000 }}
            >
                {/* En-tête coloré */}
                <div className="bg-linear-to-r from-blue-700 to-blue-600 px-4 py-3 flex items-start justify-between gap-2">
                    <div>
                        <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                            {alerte.category?.name ?? 'Incident'}
                        </span>
                        <h3 className="text-white font-bold text-sm leading-tight mt-0.5">
                            {alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-xs transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-4 py-3 space-y-2.5">
                    {/* Lieu + temps */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            <span>
                                {alerte.district ? `${alerte.district}, ` : ''}{alerte.city}
                                {alerte.location_description && ` — ${alerte.location_description}`}
                            </span>
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {tempsEcoule}
                        </span>
                    </div>

                    {/* Description */}
                    {alerte.description && (
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                            {alerte.description}
                        </p>
                    )}

                    {/* Compteurs */}
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            {alerte.confirmation_count} confirmations
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            {alerte.false_report_count} fausses
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        {photos.length > 0 && (
                            <button
                                onClick={() => setShowPhotos(true)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                                {photos.length} photo{photos.length > 1 ? 's' : ''}
                            </button>
                        )}
                        <Link
                            to="/signalements"
                            state={{ alerteId: alerte.id }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                        >
                            Voir les détails
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal photos */}
            {showPhotos && photos.length > 0 && (
                <PhotoModal photos={photos} onClose={() => setShowPhotos(false)} alerte={alerte} />
            )}
        </>
    );
}

function PhotoModal({ photos, onClose, alerte, tempsEcoule }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        function handler(e) {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length);
            if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length);
        }
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [photos.length, onClose]);

    return (
        <div
            className="fixed inset-0 z-2000 bg-black/85 flex items-center justify-center p-4"
            style={{ zIndex: 2000 }}
            onClick={onClose}
        >
            <div
                className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
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

                {/* Image */}
                <div className="relative aspect-video bg-black">
                    <img
                        src={`${MEDIA_BASE}${photos[index].url}`}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-contain"
                    />

                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                            >
                                ‹
                            </button>
                            <button
                                onClick={() => setIndex((i) => (i + 1) % photos.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>

                {/* Miniatures */}
                {photos.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                        {photos.map((p, i) => (
                            <button
                                key={p.id}
                                onClick={() => setIndex(i)}
                                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === index ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-90'}`}
                            >
                                <img src={`${MEDIA_BASE}${p.url}`} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

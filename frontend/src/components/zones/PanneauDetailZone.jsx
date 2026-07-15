import { useState, useEffect } from 'react';
import { TYPE_CONFIG } from './CarteZone';
import api from '../../api/axios';

const PERIODS_CONFIG = {
    morning:   { label: 'Matin',       hours: '6h–12h' },
    afternoon: { label: 'Après-midi',  hours: '12h–18h' },
    evening:   { label: 'Soir',        hours: '18h–22h' },
    night:     { label: 'Nuit',        hours: '22h–6h' },
};


// ── Item incident simplifié ───────────────────────────────────────────────────
function IncidentItem({ alerte }) {
    const heure = new Date(alerte.reported_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit',
    });
    const date = new Date(alerte.reported_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
        <div className="flex gap-3 py-3.5 border-b border-slate-100 last:border-0">
            {/* Indicateur vertical */}
            <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-px flex-1 bg-slate-200" />
            </div>

            {/* Contenu */}
            <div className="min-w-0 flex-1 space-y-1.5 pb-1">
                {/* Type d'incident */}
                <p className="font-semibold text-slate-800 text-sm leading-tight">
                    {alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'}
                </p>

                {/* Ville + quartier */}
                <div className="flex items-start gap-1.5 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span>
                        {alerte.city}
                        {alerte.district && ` · ${alerte.district}`}
                    </span>
                </div>

                {/* Description de l'emplacement */}
                {alerte.location_description && (
                    <p className="text-xs text-slate-400 pl-5">{alerte.location_description}</p>
                )}

                {/* Date + heure */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        {date}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {heure}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Panneau principal ─────────────────────────────────────────────────────────
export default function PanneauDetailZone({ zone, onClose }) {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading]     = useState(true);

    const cfg = TYPE_CONFIG[zone.zone_type] ?? TYPE_CONFIG.accident_prone;
    const dist = zone.periods_distribution ?? {};

    useEffect(() => {
        setLoading(true);
        api.get(`/zones-a-risque/${zone.id}/alertes`)
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : (data?.data ?? data?.alertes ?? []);
                setIncidents(list);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [zone.id]);

    return (
        <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-white">
            {/* Header */}
            <div className={`${cfg.bg} border-b border-slate-200 px-5 py-4`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0`}>
                            {cfg.icon}
                        </div>
                        <div>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                                {cfg.label}
                            </span>
                            <h2 className="font-bold text-slate-800 text-base mt-1">
                                {zone.city}
                                {zone.district && (
                                    <span className="font-normal text-slate-500 text-sm"> — {zone.district}</span>
                                )}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 text-slate-500 transition-colors shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Stats synthèse */}
                <div className="mt-4 space-y-2">
                    <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 text-center">
                        <p className="text-xl font-bold text-slate-800">
                            {loading ? zone.incident_count : incidents.length}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Signalements</p>
                    </div>
                    {Object.keys(dist).length > 0 && (
                        <div className="bg-white rounded-lg px-4 py-3 border border-slate-200 space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Répartition des accidents</p>
                            {Object.entries(PERIODS_CONFIG).map(([key, { label, hours }]) => (
                                <div key={key} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{label} <span className="text-xs text-slate-400">({hours})</span></span>
                                    <span className="font-semibold text-slate-800">{dist[key] ?? 0}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Corps — liste des incidents */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-slate-700">Incidents liés</h3>
                    {!loading && (
                        <span className="text-xs text-slate-400">
                            {incidents.length} signalement{incidents.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    Incidents ayant généré cette zone
                </p>

                {loading && (
                    <div className="py-8 flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-400">Chargement…</p>
                    </div>
                )}

                {!loading && incidents.length === 0 && (
                    <div className="py-10 text-center bg-slate-50 rounded-xl border border-slate-200">
                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                        </svg>
                        <p className="text-sm text-slate-500 font-medium">Aucun incident trouvé</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Aucun incident de ce type n'a été signalé dans cette ville.
                        </p>
                    </div>
                )}

                {!loading && incidents.length > 0 && (
                    <div>
                        {incidents.map((alerte) => (
                            <IncidentItem key={alerte.id} alerte={alerte} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

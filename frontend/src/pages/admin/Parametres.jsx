import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { invalidate } from '../../api/cache';

const PARAM_CONFIG = {
    seuil_confirmation_modification: {
        label:       'Seuil de confirmation pour modification',
        description: "Nombre de confirmations au-delà duquel un utilisateur ne peut plus modifier son alerte.",
        unite:       'confirmations',
    },
    seuil_signalement_termine: {
        label:       'Seuil de signalement terminé',
        description: "Nombre de votes 'terminé' nécessaires pour résoudre automatiquement une alerte.",
        unite:       'votes',
    },
    seuil_signalement_fausse: {
        label:       'Seuil de signalement faux',
        description: "Nombre de votes 'fausse alerte' nécessaires pour invalider automatiquement une alerte.",
        unite:       'votes',
    },
    rayon_zone_risque: {
        label:       'Rayon de zone à risque',
        description: "Distance en mètres autour d'un point pour délimiter une zone à risque.",
        unite:       'mètres',
    },
    seuil_accidents_zone: {
        label:       "Seuil d'accidents pour une zone",
        description: "Nombre minimum d'accidents sur une période pour qu'une zone soit identifiée comme à risque.",
        unite:       'accidents',
    },
    jours_analyse_zone: {
        label:       "Fenêtre d'analyse des zones",
        description: "Nombre de jours passés pris en compte pour l'analyse des zones à risque.",
        unite:       'jours',
    },
    jours_distincts_accidents: {
        label:       'Jours distincts avec accidents',
        description: "Nombre de jours distincts minimum avec au moins un accident pour qualifier une zone.",
        unite:       'jours',
    },
    delai_modification: {
        label:       'Délai de modification',
        description: "Durée en minutes après signalement pendant laquelle l'utilisateur peut modifier son alerte.",
        unite:       'minutes',
    },
    delai_interaction: {
        label:       "Délai entre interactions",
        description: "Durée minimale en minutes entre deux interactions d'un même utilisateur sur une alerte.",
        unite:       'minutes',
    },
    rayon_doublon: {
        label:       'Rayon de détection de doublon',
        description: "Distance en mètres en deçà de laquelle deux signalements similaires sont considérés comme doublons.",
        unite:       'mètres',
    },
};

const CLES_AFFICHEES = Object.keys(PARAM_CONFIG);

// ── Modal modification ────────────────────────────────────────────────────────
function ModalEditParametre({ param, onSaved, onClose }) {
    const cfg = PARAM_CONFIG[param.key] ?? { label: param.key, description: '', unite: '' };
    const [valeur, setValeur]   = useState(String(param.value ?? ''));
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur]   = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const num = Number(valeur);
        if (!valeur.trim() || isNaN(num) || num <= 0) {
            setErreur('Valeur numérique positive requise.');
            return;
        }
        setErreur('');
        setLoading(true);
        try {
            const { data } = await api.put(`/admin/parametres/${param.id}`, { value: num });
            onSaved(data);
            onClose();
        } catch (err) {
            setErreur(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">Modifier le paramètre</h3>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-55 truncate">{cfg.label}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="px-6 py-5 space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Valeur{cfg.unite ? ` (${cfg.unite})` : ''}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={valeur}
                                onChange={(e) => setValeur(e.target.value)}
                                autoFocus
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {erreur && <p className="text-xs text-red-600 mt-1.5">{erreur}</p>}
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm text-white font-semibold bg-blue-700 hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {loading && (
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                            )}
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Parametres() {
    const [params, setParams]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [erreur, setErreur]     = useState(false);
    const [selected, setSelected] = useState(null);
    const [saved, setSaved]       = useState(null);

    useEffect(() => {
        api.get('/admin/parametres')
            .then(({ data }) => {
                const liste = Array.isArray(data) ? data : data.data ?? [];
                setParams(liste.filter((p) => CLES_AFFICHEES.includes(p.key)));
            })
            .catch(() => setErreur(true))
            .finally(() => setLoading(false));
    }, []);

    function handleSaved(updated) {
        setParams((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
        setSaved(updated.id);
        setTimeout(() => setSaved(null), 2500);
        invalidate('config');
        invalidate('parametres');
    }

    const sorted = [...params].sort(
        (a, b) => CLES_AFFICHEES.indexOf(a.key) - CLES_AFFICHEES.indexOf(b.key)
    );

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-xl font-bold text-slate-800">Paramètres</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Configuration du système de signalement</p>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {erreur && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                        Impossible de charger les paramètres.
                    </div>
                )}

                {!loading && sorted.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Paramètre</th>
                                    <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 w-36">Valeur</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sorted.map((p) => {
                                    const cfg = PARAM_CONFIG[p.key] ?? { label: p.key, description: '', unite: '' };
                                    const isNew = saved === p.id;
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-slate-800">{cfg.label}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{cfg.description}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className={`text-base font-bold ${isNew ? 'text-green-600' : 'text-slate-700'}`}>
                                                        {p.value}
                                                    </span>
                                                    {isNew && (
                                                        <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {cfg.unite && (
                                                    <span className="block text-xs text-slate-400 mt-0.5">{cfg.unite}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => setSelected(p)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <ModalEditParametre
                    param={selected}
                    onSaved={handleSaved}
                    onClose={() => setSelected(null)}
                />
            )}
        </AdminLayout>
    );
}

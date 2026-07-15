import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import CarteZone from '../../components/zones/CarteZone';
import PanneauDetailZone from '../../components/zones/PanneauDetailZone';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { COMMUNES } from '../../constants/communes';

export default function ZonesARisque() {
    const [zones, setZones]                       = useState([]);
    const [allZones, setAllZones]                 = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [filtres, setFiltres]                   = useState({ city: '', district: '' });
    const [zoneSelectionnee, setZoneSelectionnee] = useState(null);

    // Quartiers disponibles selon la ville sélectionnée
    const quartiersDispo = filtres.city
        ? [...new Set(
            allZones
                .filter((z) => z.city === filtres.city && z.district)
                .map((z) => z.district)
          )].sort()
        : [];

    useEffect(() => {
        api.get('/zones-a-risque').then(({ data }) => setAllZones(data)).catch(() => {});
    }, []);

    useEffect(() => {
        setZoneSelectionnee(null);
    }, [filtres]);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (filtres.city)     params.city     = filtres.city;
        if (filtres.district) params.district = filtres.district;
        api.get('/zones-a-risque', { params })
            .then(({ data }) => setZones(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [filtres]);

    const triees    = [...zones].sort((a, b) => b.incident_count - a.incident_count);
    const hasFilter = filtres.city || filtres.district;

    return (
        <div className="h-screen min-h-0 bg-slate-50 flex flex-col overflow-hidden">
            <Navbar />

            {/* En-tête */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-5">
                    <h1 className="text-2xl font-bold text-slate-800">Zones à risque</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Zones identifiées à forte densité d'incidents
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">

                    <select
                        value={filtres.city}
                        onChange={(e) => setFiltres((f) => ({ ...f, city: e.target.value, district: '' }))}
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">Toutes les villes</option>
                        {COMMUNES.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>

                    {filtres.city && quartiersDispo.length > 0 && (
                        <select
                            value={filtres.district}
                            onChange={(e) => setFiltres((f) => ({ ...f, district: e.target.value }))}
                            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">Tous les quartiers</option>
                            {quartiersDispo.map((q) => <option key={q} value={q}>{q}</option>)}
                        </select>
                    )}

                    {hasFilter && (
                        <button
                            onClick={() => setFiltres({ city: '', district: '' })}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Réinitialiser
                        </button>
                    )}

                    <Link to="/signaler"
                        className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Signaler
                    </Link>
                </div>
            </div>

            {/* Layout : grille | panneau détail */}
            <div className="flex-1 h-full min-h-0 flex overflow-hidden max-w-screen-2xl mx-auto w-full">

                {/* Colonne gauche — liste */}
                <div className={`flex flex-col h-full min-h-0 bg-white border-r border-slate-200 overflow-hidden transition-all duration-200
                    ${zoneSelectionnee ? 'w-full md:w-96 lg:w-110 shrink-0' : 'w-full'}`}>

                    <div className="flex-1 min-h-0 overflow-y-auto p-4">
                        {loading && (
                            <div className="py-16">
                                <Loader />
                                <p className="text-center text-slate-400 text-sm mt-2">Chargement des zones…</p>
                            </div>
                        )}

                        {!loading && triees.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-slate-600 mb-1">Aucune zone trouvée</p>
                                <p className="text-slate-400 text-sm mb-4">
                                    {hasFilter ? 'Aucune zone ne correspond à ces filtres.' : 'Aucune zone à risque enregistrée.'}
                                </p>
                                {hasFilter && (
                                    <button onClick={() => setFiltres({ city: '', district: '' })}
                                        className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        )}

                        {!loading && triees.length > 0 && (
                            <div className={`grid gap-4 ${zoneSelectionnee ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                                {triees.map((zone) => (
                                    <CarteZone
                                        key={zone.id}
                                        zone={zone}
                                        selected={zoneSelectionnee?.id === zone.id}
                                        onClick={() => {
                                            setZoneSelectionnee(zone);
                                            api.get('/zones-a-risque').then(({ data }) => {
                                                const fresh = data.find((z) => z.city === zone.city && z.district === zone.district && z.zone_type === zone.zone_type);
                                                if (fresh) setZoneSelectionnee(fresh);
                                            }).catch(() => {});
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne droite — panneau détail */}
                {zoneSelectionnee && (
                    <div className="flex-1 hidden md:flex h-full min-h-0 flex-col overflow-hidden bg-white border-l border-slate-200">
                        <PanneauDetailZone
                            key={zoneSelectionnee.id}
                            zone={zoneSelectionnee}
                            onClose={() => setZoneSelectionnee(null)}
                        />
                    </div>
                )}
            </div>

            {/* Drawer mobile */}
            {zoneSelectionnee && (
                <div className="md:hidden fixed inset-0 flex" style={{ zIndex: 1000 }}>
                    <div className="flex-1 bg-black/40" onClick={() => setZoneSelectionnee(null)} />
                    <div className="w-full max-w-lg bg-white flex flex-col overflow-hidden shadow-2xl">
                        <PanneauDetailZone
                            key={zoneSelectionnee.id}
                            zone={zoneSelectionnee}
                            onClose={() => setZoneSelectionnee(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CarteInteractive from '../../components/carte/CarteInteractive';
import FiltresCarte from '../../components/carte/FiltresCarte';
import Navbar from '../../components/common/Navbar';
import useAuth from '../../hooks/useAuth';
import useAlertes from '../../hooks/useAlertes';
import api from '../../api/axios';

export default function Accueil() {
    const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
    const { alertes, loading: loadingAlertes, fetchAlertes } = useAlertes();
    const [zones, setZones] = useState([]);
    const navigate = useNavigate();

    // Chargement initial des zones — seulement pour les utilisateurs connectés
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            api.get('/zones-a-risque').then(({ data }) => setZones(data)).catch(() => setZones([]));
        } else if (!authLoading && !isAuthenticated) {
            setZones([]);
        }
    }, [authLoading, isAuthenticated]);

    const [villeSelectionnee, setVilleSelectionnee] = useState('');

    const handleFilter = useCallback((params) => {
        fetchAlertes(params);
        setVilleSelectionnee(params.city || '');
    }, [fetchAlertes]);

    return (
        <div className="flex flex-col h-screen bg-slate-900">
            <Navbar />

            {/* Zone principale */}
            <div className="relative flex-1 overflow-hidden">

                {/* Carte plein écran */}
                <div className="absolute inset-0">
                    <CarteInteractive
                        alertes={alertes}
                        zones={zones}
                        ville={villeSelectionnee}
                        onFiltreChange={handleFilter}
                    />
                </div>

                {/* Overlay supérieur — filtres + compteur */}
                <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-500 flex flex-col sm:flex-row items-start gap-2 sm:gap-3 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
                        <FiltresCarte onFilter={handleFilter} />

                        {/* Badge compteur */}
                        <div className="bg-white shadow-md border border-slate-200 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${loadingAlertes ? 'bg-slate-400 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                {loadingAlertes ? '…' : alertes.length}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-500 hidden xs:inline">
                                incident{alertes.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Indicateur temps réel */}
                    <div className="sm:ml-auto pointer-events-auto bg-white shadow-md border border-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span className="text-xs font-medium text-slate-600 hidden sm:block">Temps réel</span>
                    </div>
                </div>

                {/* Bouton flottant Signaler — toujours visible (sauf admin) */}
                {!authLoading && !isAdmin && (
                    <button
                        onClick={() => navigate('/signaler')}
                        className="absolute bottom-6 right-4 sm:bottom-8 sm:right-6 z-500 flex items-center gap-2
                                   bg-orange-500 hover:bg-orange-400 active:bg-orange-600
                                   text-white font-bold text-sm px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl
                                   shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60
                                   transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="hidden sm:inline">Signaler un incident</span>
                        <span className="sm:hidden">Signaler</span>
                    </button>
                )}

            </div>
        </div>
    );
}

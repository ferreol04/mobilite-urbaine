import { useState, useEffect } from 'react';
import { getCategories } from '../../api/cache';
import { COMMUNES } from '../../constants/communes';

export default function FiltresCarte({ onFilter }) {
    const [categories, setCategories] = useState([]);
    const [filtres, setFiltres] = useState({ category_id: '', city: '' });
    const [open, setOpen] = useState(false); // 'categorie' | 'ville' | ''

    useEffect(() => {
        getCategories().then(setCategories).catch(() => {});
    }, []);

    function apply(newFiltres) {
        setFiltres(newFiltres);
        const params = {};
        if (newFiltres.category_id) params.category_id = newFiltres.category_id;
        if (newFiltres.city)        params.city        = newFiltres.city;
        onFilter(params);
        setOpen(false);
    }

    function reset() {
        apply({ category_id: '', city: '' });
    }

    const catLabel  = categories.find((c) => String(c.id) === String(filtres.category_id))?.name;
    const hasFilter = filtres.category_id || filtres.city;

    return (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">

            {/* ── Filtre catégorie ── */}
            <div className="relative">
                <button
                    onClick={() => setOpen((v) => v === 'categorie' ? '' : 'categorie')}
                    className={`flex items-center gap-1.5 sm:gap-2 shadow-md border rounded-xl px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors
                        ${filtres.category_id
                            ? 'bg-blue-700 border-blue-700 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${filtres.category_id ? 'text-white' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591L15.75 12.5v5.25a2.25 2.25 0 0 1-1.342 2.053l-3 1.334A.75.75 0 0 1 10.5 20.5V12.5L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    <span className="max-w-20 sm:max-w-32 truncate">{catLabel || 'Catégorie'}</span>
                    <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${open === 'categorie' ? 'rotate-180' : ''} ${filtres.category_id ? 'text-white/70' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                {open === 'categorie' && (
                    <div className="absolute left-0 top-full mt-1 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto" style={{ zIndex: 1100 }}>
                        <DropItem
                            active={!filtres.category_id}
                            onClick={() => apply({ ...filtres, category_id: '' })}
                        >
                            Toutes les catégories
                        </DropItem>
                        {categories.map((cat) => (
                            <DropItem
                                key={cat.id}
                                active={String(filtres.category_id) === String(cat.id)}
                                onClick={() => apply({ ...filtres, category_id: String(cat.id) })}
                            >
                                {cat.name}
                            </DropItem>
                        ))}
                        {categories.length === 0 && (
                            <p className="px-4 py-3 text-sm text-slate-400">Aucune catégorie</p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Filtre ville ── */}
            <div className="relative">
                <button
                    onClick={() => setOpen((v) => v === 'ville' ? '' : 'ville')}
                    className={`flex items-center gap-1.5 sm:gap-2 shadow-md border rounded-xl px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors
                        ${filtres.city
                            ? 'bg-blue-700 border-blue-700 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${filtres.city ? 'text-white' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span className="max-w-20 sm:max-w-none truncate">{filtres.city || 'Ville'}</span>
                    <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${open === 'ville' ? 'rotate-180' : ''} ${filtres.city ? 'text-white/70' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                {open === 'ville' && (
                    <div className="absolute left-0 top-full mt-1 w-44 sm:w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto" style={{ zIndex: 1100 }}>
                        <DropItem active={!filtres.city} onClick={() => apply({ ...filtres, city: '' })}>
                            Toutes les villes
                        </DropItem>
                        {COMMUNES.map((v) => (
                            <DropItem
                                key={v}
                                active={filtres.city === v}
                                onClick={() => apply({ ...filtres, city: v })}
                            >
                                {v}
                            </DropItem>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Réinitialiser ── */}
            {hasFilter && (
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 bg-white shadow-md border border-slate-200 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

function DropItem({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
        >
            {children}
        </button>
    );
}

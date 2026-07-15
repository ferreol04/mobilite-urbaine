export const TYPE_CONFIG = {
    accident_prone: {
        label:     'Accidentogène',
        bg:        'bg-red-50',
        border:    'border-l-red-500',
        badge:     'bg-red-100 text-red-700',
        iconBg:    'bg-red-100',
        iconColor: 'text-red-600',
        ring:      'ring-red-400',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
        ),
    },
    congested: {
        label:     'Embouteillée',
        bg:        'bg-orange-50',
        border:    'border-l-orange-500',
        badge:     'bg-orange-100 text-orange-700',
        iconBg:    'bg-orange-100',
        iconColor: 'text-orange-600',
        ring:      'ring-orange-400',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
        ),
    },
    flood_prone: {
        label:     'Inondable',
        bg:        'bg-blue-50',
        border:    'border-l-blue-500',
        badge:     'bg-blue-100 text-blue-700',
        iconBg:    'bg-blue-100',
        iconColor: 'text-blue-600',
        ring:      'ring-blue-400',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.444 4.338-6 7.018-6 9a6 6 0 0 0 12 0c0-1.982-1.556-4.662-6-9Z" />
            </svg>
        ),
    },
};

export default function CarteZone({ zone, selected = false, onClick }) {
    const cfg = TYPE_CONFIG[zone.zone_type] ?? TYPE_CONFIG.accident_prone;

    return (
        <article
            onClick={onClick}
            className={`${cfg.bg} rounded-xl border border-slate-200 border-l-4 ${cfg.border}
                        shadow-sm hover:shadow-md transition-all cursor-pointer
                        ${selected ? `ring-2 ${cfg.ring} ring-offset-1 shadow-md` : ''}`}
        >
            <div className="p-4 space-y-3">
                {/* En-tête */}
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0`}>
                        {cfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800 text-sm">
                            {zone.district || zone.city}
                        </h3>
                        {zone.district && (
                            <p className="text-xs text-slate-500 mt-0.5">{zone.city}</p>
                        )}
                    </div>
                </div>

                {/* Incidents */}
                <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 text-center">
                    <p className="text-xl font-bold text-slate-800">{zone.incident_count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">incidents</p>
                </div>

                {/* Voir les incidents */}
                <div className="flex items-center justify-end">
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        Voir les incidents
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </span>
                </div>
            </div>
        </article>
    );
}

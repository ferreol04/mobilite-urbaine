import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, UserX, Tag, MapPin, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

function StatCard({ label, value, sub, icon: Icon, colorClass, to }) {
    const navigate = useNavigate();
    const clickable = !!to;

    return (
        <div
            onClick={() => clickable && navigate(to)}
            className={`group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 transition-all duration-150
                ${clickable ? 'cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''}`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass.iconBg}`}>
                <Icon size={22} strokeWidth={1.8} className={colorClass.iconColor} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">{label}</p>
                <p className={`text-3xl font-bold mt-0.5 leading-none ${colorClass.value}`}>{value ?? '—'}</p>
                {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
            </div>

            {clickable && (
                <ChevronRight size={16} className="text-slate-300 shrink-0 group-hover:text-slate-500 transition-colors" />
            )}
        </div>
    );
}

const COLORS = {
    blue:   { iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   value: 'text-slate-800' },
    green:  { iconBg: 'bg-green-50',  iconColor: 'text-green-600',  value: 'text-slate-800' },
    orange: { iconBg: 'bg-orange-50', iconColor: 'text-orange-500', value: 'text-slate-800' },
    violet: { iconBg: 'bg-violet-50', iconColor: 'text-violet-600', value: 'text-slate-800' },
    red:    { iconBg: 'bg-red-50',    iconColor: 'text-red-500',    value: 'text-slate-800' },
};

export default function Dashboard() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur]   = useState(false);

    useEffect(() => {
        api.get('/admin/dashboard')
            .then(({ data }) => setData(data))
            .catch(() => setErreur(true))
            .finally(() => setLoading(false));
    }, []);

    const topCards = data ? [
        {
            label:      'Alertes actives',
            value:      data.alertes?.active,
            icon:       AlertTriangle,
            colorClass: COLORS.blue,
            to:         '/admin/alertes',
        },
        {
            label:      'Utilisateurs inscrits',
            value:      data.users?.total,
            sub:        `${data.users?.active ?? 0} actifs`,
            icon:       Users,
            colorClass: COLORS.green,
            to:         '/admin/utilisateurs',
        },
        {
            label:      'Catégories actives',
            value:      data.categories?.total_actives,
            sub:        `${data.categories?.total_types_actifs ?? 0} types actifs`,
            icon:       Tag,
            colorClass: COLORS.violet,
            to:         '/admin/categories',
        },
    ] : [];

    const bottomCards = data ? [
        {
            label:      'Comptes suspendus',
            value:      data.users?.suspended,
            icon:       UserX,
            colorClass: COLORS.orange,
            to:         null,
        },
        {
            label:      'Zones à risque',
            value:      data.zones_a_risque?.total,
            icon:       MapPin,
            colorClass: COLORS.red,
            to:         null,
        },
    ] : [];

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                <div>
                    <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Vue d'ensemble de l'activité</p>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {erreur && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                        Impossible de charger les données.
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {topCards.map((card) => (
                                <StatCard key={card.label} {...card} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {bottomCards.map((card) => (
                                <StatCard key={card.label} {...card} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

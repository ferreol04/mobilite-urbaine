import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import { USER_STATUS_LABEL } from '../../constants/theme';
import api from '../../api/axios';

function BadgeStatut({ status }) {
    const cls = {
        active:    'bg-green-100 text-green-700',
        suspended: 'bg-orange-100 text-orange-700',
        banned:    'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {USER_STATUS_LABEL[status] ?? status}
        </span>
    );
}

function ModalConfirm({ titre, message, labelConfirm, colorConfirm, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-6 py-5">
                    <h3 className="text-base font-semibold text-slate-900">{titre}</h3>
                    <p className="text-sm text-slate-500 mt-1">{message}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">
                        Annuler
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm text-white font-semibold transition-colors disabled:opacity-50 ${colorConfirm}`}>
                        {loading ? 'En cours…' : labelConfirm}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalUtilisateur({ userId, onClose, onUpdated }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState(null);
    const [acting, setActing]   = useState(false);

    useEffect(() => {
        api.get(`/admin/users/${userId}`)
            .then(({ data }) => setUser(data))
            .finally(() => setLoading(false));
    }, [userId]);

    async function handleAction(status) {
        setActing(true);
        try {
            await api.patch(`/admin/users/${userId}/status`, { status });
            onUpdated(userId, status);
            onClose();
        } finally {
            setActing(false);
            setConfirm(null);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-base font-semibold text-slate-900">Profil utilisateur</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {user && (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ${user.gender === 'female' ? 'bg-pink-500' : (user.first_name || user.last_name) ? 'bg-blue-600' : 'bg-slate-500'}`}>
                                    {(user.first_name || user.last_name) ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : 'CA'}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-800">
                                        {`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.pseudo || 'Sans nom'}
                                    </p>
                                    {user.pseudo && <p className="text-sm text-slate-400">{user.pseudo}</p>}
                                    <BadgeStatut status={user.status} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm">
                                {user.email && (
                                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                                        <p className="text-xs text-slate-400 mb-0.5">Email</p>
                                        <p className="font-medium text-slate-700">{user.email}</p>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                                        <p className="text-xs text-slate-400 mb-0.5">Téléphone</p>
                                        <p className="font-medium text-slate-700">{user.phone}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                                        <p className="text-xs text-slate-400 mb-0.5">Sexe</p>
                                        <p className="font-medium text-slate-700">
                                            {user.gender === 'female' ? 'Femme' : user.gender === 'male' ? 'Homme' : 'Non précisé'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                                        <p className="text-xs text-slate-400 mb-0.5">Inscrit le</p>
                                        <p className="font-medium text-slate-700">
                                            {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                                        <p className="text-xs text-slate-400 mb-0.5">Alertes publiées</p>
                                        <p className="font-bold text-slate-800 text-lg">{user.alertes_count ?? 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                            {user.status === 'active' && (
                                <button onClick={() => setConfirm({ action: 'suspended' })}
                                    className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
                                    Suspendre le compte
                                </button>
                            )}
                            {user.status === 'suspended' && (
                                <button onClick={() => setConfirm({ action: 'active' })}
                                    className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                                    Réactiver le compte
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {confirm && (
                <ModalConfirm
                    titre={confirm.action === 'suspended' ? 'Suspendre le compte' : 'Réactiver le compte'}
                    message={confirm.action === 'suspended'
                        ? "L'utilisateur ne pourra plus se connecter ni signaler d'incidents."
                        : "L'utilisateur pourra à nouveau accéder à son compte."}
                    labelConfirm={confirm.action === 'suspended' ? 'Suspendre' : 'Réactiver'}
                    colorConfirm={confirm.action === 'suspended' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}
                    onConfirm={() => handleAction(confirm.action)}
                    onCancel={() => setConfirm(null)}
                    loading={acting}
                />
            )}
        </div>
    );
}

export default function GestionUtilisateurs() {
    const [users, setUsers]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filtre, setFiltre]       = useState('');
    const [search, setSearch]       = useState('');
    const [selectedId, setSelectedId] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = useCallback(() => {
        setLoading(true);
        const params = {};
        if (filtre) params.status = filtre;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        api.get('/admin/users', { params })
            .then(({ data }) => setUsers(Array.isArray(data) ? data : data.data ?? []))
            .finally(() => setLoading(false));
    }, [filtre, debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdated = useCallback((id, newStatus) => {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
    }, []);

    const affiches = users;

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Utilisateurs</h1>
                        <p className="text-slate-500 text-sm mt-0.5">{affiches.length} utilisateur{affiches.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {[
                            { val: '',          label: 'Tous' },
                            { val: 'active',    label: USER_STATUS_LABEL.active },
                            { val: 'suspended', label: USER_STATUS_LABEL.suspended },
                        ].map(({ val, label }) => (
                            <button key={val} onClick={() => setFiltre(val)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtre === val ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recherche */}
                <div className="relative max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, prénom ou pseudo..."
                        className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {!loading && affiches.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                        <p className="text-slate-500 font-medium">Aucun utilisateur trouvé</p>
                    </div>
                )}

                {!loading && affiches.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Utilisateur</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Contact</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Statut</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Inscrit le</th>
                                    <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Alertes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {affiches.map((u) => (
                                    <tr key={u.id} onClick={() => setSelectedId(u.id)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.gender === 'female' ? 'bg-pink-500' : u.first_name || u.last_name ? 'bg-blue-600' : 'bg-slate-500'}`}>
                                                    {(u.first_name || u.last_name) ? `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() : 'CA'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.pseudo || 'Sans nom'}
                                                    </p>
                                                    {u.pseudo && (u.first_name || u.last_name) && (
                                                        <p className="text-xs text-slate-400">{u.pseudo}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell text-slate-500">{u.email || u.phone}</td>
                                        <td className="px-4 py-3.5"><BadgeStatut status={u.status} /></td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                                            {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell text-center text-slate-700 font-semibold">
                                            {u.alertes_count ?? 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedId && (
                <ModalUtilisateur
                    userId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onUpdated={handleUpdated}
                />
            )}
        </AdminLayout>
    );
}

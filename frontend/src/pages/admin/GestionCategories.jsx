import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { invalidate } from '../../api/cache';

const DISPARITION_LABELS = {
    automatic: 'Automatique',
    report:    'Par signalement',
};

// ── Composants réutilisables ──────────────────────────────────────────────────
function BadgeActif({ active }) {
    return active
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Actif</span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inactif</span>;
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

// ── Modal formulaire catégorie ────────────────────────────────────────────────
function ModalCategorie({ categorie, onClose, onSaved }) {
    const [nom, setNom]         = useState(categorie?.name ?? '');
    const [erreur, setErreur]   = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!nom.trim()) { setErreur('Le nom est obligatoire.'); return; }
        setLoading(true);
        try {
            const { data } = categorie
                ? await api.put(`/admin/categories/${categorie.id}`, { name: nom.trim() })
                : await api.post('/admin/categories', { name: nom.trim() });
            onSaved(data);
            onClose();
        } catch (err) {
            setErreur(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900">
                        {categorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} autoFocus
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {erreur && <p className="mt-1 text-xs text-red-600">{erreur}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm bg-blue-700 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50">
                            {loading ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal formulaire type d'incident ─────────────────────────────────────────
function ModalTypeIncident({ type, categorieId, onClose, onSaved }) {
    const [form, setForm] = useState({
        name:                 type?.name ?? '',
        disappearance_mode:   type?.disappearance_mode ?? 'automatic',
        validity_duration:    type?.validity_duration ?? '',
    });
    const [erreur, setErreur]   = useState('');
    const [loading, setLoading] = useState(false);

    function setField(k, v) { setForm((p) => ({ ...p, [k]: v })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) { setErreur('Le nom est obligatoire.'); return; }
        setLoading(true);
        const payload = {
            name:               form.name.trim(),
            disappearance_mode: form.disappearance_mode,
            category_id:        categorieId,
            validity_duration:  form.disappearance_mode === 'automatic' && form.validity_duration
                ? Number(form.validity_duration) : null,
        };
        try {
            const { data } = type
                ? await api.put(`/admin/type-incidents/${type.id}`, payload)
                : await api.post('/admin/type-incidents', payload);
            onSaved(data);
            onClose();
        } catch (err) {
            setErreur(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900">
                        {type ? "Modifier le type" : "Nouveau type d'incident"}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom <span className="text-red-500">*</span></label>
                        <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} autoFocus
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mode de disparition</label>
                        <select value={form.disappearance_mode} onChange={(e) => setField('disappearance_mode', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="automatic">Automatique</option>
                            <option value="report">Par signalement</option>
                        </select>
                    </div>
                    {form.disappearance_mode === 'automatic' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Durée de validité (minutes)</label>
                            <input type="number" min="1" value={form.validity_duration}
                                onChange={(e) => setField('validity_duration', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    )}
                    {erreur && <p className="text-xs text-red-600">{erreur}</p>}
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm bg-blue-700 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50">
                            {loading ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal types d'une catégorie ───────────────────────────────────────────────
function ModalTypes({ cat, onClose, onAddType, onEditType, onToggleType }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Types d'incidents</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onAddType(cat.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Ajouter
                        </button>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {(!cat.type_incidents || cat.type_incidents.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Aucun type d'incident pour cette catégorie</p>
                    )}
                    {cat.type_incidents?.map((ti) => (
                        <div key={ti.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{ti.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {DISPARITION_LABELS[ti.disappearance_mode] ?? ti.disappearance_mode}
                                    {ti.validity_duration && ` · ${ti.validity_duration} min`}
                                </p>
                            </div>
                            <BadgeActif active={ti.active ?? true} />
                            <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => onEditType(cat.id, ti)}
                                    className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                    </svg>
                                </button>
                                <button onClick={() => onToggleType(cat.id, ti)}
                                    className={`p-1.5 rounded-lg transition-colors ${(ti.active ?? true) ? 'hover:bg-red-50 text-slate-400 hover:text-red-600' : 'hover:bg-green-50 text-slate-400 hover:text-green-600'}`}>
                                    {(ti.active ?? true) ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function GestionCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [catTypes, setCatTypes]     = useState(null); // catégorie dont on affiche les types
    const [modal, setModal]           = useState(null); // { type, data? }
    const [confirm, setConfirm]       = useState(null);
    const [acting, setActing]         = useState(false);

    useEffect(() => {
        api.get('/admin/categories')
            .then(({ data }) => setCategories(Array.isArray(data) ? data : data.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    // ── Actions catégorie ─────────────────────────────────────────────────────
    async function handleCatAction() {
        const { action, id } = confirm;
        setActing(true);
        try {
            if (action === 'delete')   await api.delete(`/admin/categories/${id}`);
            if (action === 'restore')  await api.patch(`/admin/categories/${id}/restore`);
            setCategories((prev) => prev.map((c) =>
                c.id === id ? { ...c, active: action === 'restore' } : c
            ));
            invalidate('categories');
        } finally {
            setActing(false);
            setConfirm(null);
        }
    }

    // ── Actions type ──────────────────────────────────────────────────────────
    async function handleTypeAction() {
        const { action, catId, typeId } = confirm;
        setActing(true);
        try {
            if (action === 'delete')  await api.delete(`/admin/type-incidents/${typeId}`);
            if (action === 'restore') await api.patch(`/admin/type-incidents/${typeId}/restore`);
            const updateTypes = (types) => types?.map((t) =>
                t.id === typeId ? { ...t, active: action === 'restore' } : t
            );
            setCategories((prev) => prev.map((c) => c.id !== catId ? c : {
                ...c, type_incidents: updateTypes(c.type_incidents),
            }));
            setCatTypes((prev) => prev?.id === catId
                ? { ...prev, type_incidents: updateTypes(prev.type_incidents) }
                : prev
            );
            invalidate('categories');
            invalidate(`types-${catId}`);
        } finally {
            setActing(false);
            setConfirm(null);
        }
    }

    function onCatSaved(saved) {
        setCategories((prev) => {
            const idx = prev.findIndex((c) => c.id === saved.id);
            if (idx >= 0) return prev.map((c) => c.id === saved.id ? { ...c, ...saved } : c);
            return [...prev, { ...saved, type_incidents: [] }];
        });
        invalidate('categories');
    }

    function onTypeSaved(catId, saved) {
        setCategories((prev) => prev.map((c) => c.id !== catId ? c : {
            ...c,
            type_incidents: c.type_incidents?.some((t) => t.id === saved.id)
                ? c.type_incidents.map((t) => t.id === saved.id ? { ...t, ...saved } : t)
                : [...(c.type_incidents ?? []), saved],
        }));
        invalidate('categories');
        invalidate(`types-${catId}`);
        setCatTypes((prev) => prev?.id === catId ? {
            ...prev,
            type_incidents: prev.type_incidents?.some((t) => t.id === saved.id)
                ? prev.type_incidents.map((t) => t.id === saved.id ? { ...t, ...saved } : t)
                : [...(prev.type_incidents ?? []), saved],
        } : prev);
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Catégories et types</h1>
                        <p className="text-slate-500 text-sm mt-0.5">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setModal({ type: 'cat' })}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nouvelle catégorie
                    </button>
                </div>

                {loading && <div className="py-12"><Loader /></div>}

                {!loading && categories.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                        <p className="text-slate-500 font-medium">Aucune catégorie</p>
                    </div>
                )}

                {!loading && categories.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Catégorie</th>
                                    <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 w-28">Types</th>
                                    <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 w-24">Statut</th>
                                    <th className="px-4 py-3 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3.5 font-medium text-slate-800">{cat.name}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button onClick={() => setCatTypes(cat)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-medium transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                </svg>
                                                {cat.type_incidents?.length ?? 0} type{(cat.type_incidents?.length ?? 0) !== 1 ? 's' : ''}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <BadgeActif active={cat.active ?? true} />
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setModal({ type: 'cat', data: cat })}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="Modifier">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                    </svg>
                                                </button>
                                                {(cat.active ?? true) ? (
                                                    <button onClick={() => setConfirm({ type: 'cat', action: 'delete', id: cat.id })}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Désactiver">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setConfirm({ type: 'cat', action: 'restore', id: cat.id })}
                                                        className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                                                        title="Réactiver">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {catTypes && (
                <ModalTypes
                    cat={catTypes}
                    onClose={() => setCatTypes(null)}
                    onAddType={(catId) => setModal({ type: 'ti', catId })}
                    onEditType={(catId, ti) => setModal({ type: 'ti', catId, data: ti })}
                    onToggleType={(catId, ti) => setConfirm({
                        type: 'ti',
                        action: (ti.active ?? true) ? 'delete' : 'restore',
                        catId,
                        typeId: ti.id,
                    })}
                />
            )}

            {/* Modals */}
            {modal?.type === 'cat' && (
                <ModalCategorie
                    categorie={modal.data}
                    onClose={() => setModal(null)}
                    onSaved={onCatSaved}
                />
            )}
            {modal?.type === 'ti' && (
                <ModalTypeIncident
                    type={modal.data}
                    categorieId={modal.catId}
                    onClose={() => setModal(null)}
                    onSaved={(saved) => onTypeSaved(modal.catId, saved)}
                />
            )}
            {confirm?.type === 'cat' && (
                <ModalConfirm
                    titre={confirm.action === 'delete' ? 'Désactiver la catégorie' : 'Réactiver la catégorie'}
                    message={confirm.action === 'delete'
                        ? 'Cette catégorie et tous ses types d\'incidents seront désactivés.'
                        : 'Cette catégorie sera réactivée.'}
                    labelConfirm={confirm.action === 'delete' ? 'Désactiver' : 'Réactiver'}
                    colorConfirm={confirm.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    onConfirm={handleCatAction}
                    onCancel={() => setConfirm(null)}
                    loading={acting}
                />
            )}
            {confirm?.type === 'ti' && (
                <ModalConfirm
                    titre={confirm.action === 'delete' ? "Désactiver le type" : "Réactiver le type"}
                    message={confirm.action === 'delete'
                        ? "Ce type d'incident sera désactivé et ne pourra plus être utilisé pour les signalements."
                        : "Ce type d'incident sera réactivé."}
                    labelConfirm={confirm.action === 'delete' ? 'Désactiver' : 'Réactiver'}
                    colorConfirm={confirm.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    onConfirm={handleTypeAction}
                    onCancel={() => setConfirm(null)}
                    loading={acting}
                />
            )}
        </AdminLayout>
    );
}

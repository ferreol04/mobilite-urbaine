import { useState } from 'react';
import api from '../../api/axios';

const MEDIA_BASE = 'http://127.0.0.1:8000/storage/';
const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 2;

function FieldError({ msg }) {
    if (!msg) return null;
    return (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {msg}
        </p>
    );
}

export default function FormulaireModification({ alerte, onClose, onUpdate }) {
    const [description, setDescription]               = useState(alerte.description ?? '');
    const [locationDescription, setLocationDescription] = useState(alerte.location_description ?? '');
    const [newPhotos, setNewPhotos]                   = useState([]); // { file, preview }
    const [photosToDelete, setPhotosToDelete]         = useState([]); // ids
    const [errors, setErrors]                         = useState({});
    const [submitting, setSubmitting]                 = useState(false);
    const [globalError, setGlobalError]               = useState('');

    const existingPhotos = (alerte.medias ?? []).filter((p) => !photosToDelete.includes(p.id));

    function toggleDeletePhoto(id) {
        setPhotosToDelete((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function handleNewPhotos(files) {
        const total = existingPhotos.length + newPhotos.length;
        const slots = MAX_PHOTOS - total;
        if (slots <= 0) return;

        const valid = [];
        const errs  = [];
        Array.from(files).slice(0, slots).forEach((file) => {
            if (!file.type.startsWith('image/')) { errs.push(`${file.name} : format invalide.`); return; }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) { errs.push(`${file.name} : dépasse ${MAX_SIZE_MB}MB.`); return; }
            valid.push({ file, preview: URL.createObjectURL(file) });
        });

        setNewPhotos((prev) => [...prev, ...valid]);
        if (errs.length) setErrors((e) => ({ ...e, photos: errs.join(' ') }));
        else setErrors((e) => { const n = { ...e }; delete n.photos; return n; });
    }

    function removeNewPhoto(i) {
        setNewPhotos((prev) => {
            URL.revokeObjectURL(prev[i].preview);
            return prev.filter((_, idx) => idx !== i);
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!description.trim()) {
            setErrors({ description: 'La description est requise.' });
            return;
        }
        if (description.length > 1000) {
            setErrors({ description: 'Maximum 1000 caractères.' });
            return;
        }

        setSubmitting(true);
        setGlobalError('');
        try {
            const fd = new FormData();
            fd.append('description', description.trim());
            if (locationDescription.trim())
                fd.append('location_description', locationDescription.trim());
            photosToDelete.forEach((id) => fd.append('photos_to_delete[]', id));
            newPhotos.forEach(({ file }) => fd.append('photos[]', file));
            // Laravel attend PUT mais FormData nécessite POST + _method
            fd.append('_method', 'PUT');

            const { data } = await api.post(`/alertes/${alerte.id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUpdate?.(data);
            onClose?.();
        } catch (err) {
            const status = err.response?.status;
            if (status === 422) {
                const msg = err.response.data?.message ?? 'Erreur de validation.';
                setGlobalError(msg);
            } else if (status === 403) {
                setGlobalError('Vous n\'êtes pas autorisé à modifier cette alerte.');
            } else {
                setGlobalError(err.response?.data?.message ?? 'Une erreur est survenue.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    const totalPhotos = existingPhotos.length + newPhotos.length;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
                <div>
                    <h3 className="font-bold text-slate-800">Modifier le signalement</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{alerte.type_incident?.name ?? alerte.custom_type ?? 'Incident'} — {alerte.city}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Corps */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
                {globalError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        {globalError}
                    </div>
                )}

                {/* Description */}
                <div>
                    <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-xs font-medium ${description.length > 950 ? 'text-red-500' : 'text-slate-400'}`}>
                            {description.length} / 1000
                        </span>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setErrors((err) => { const n = {...err}; delete n.description; return n; }); }}
                        rows={4}
                        maxLength={1000}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 resize-none
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                            ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                    />
                    <FieldError msg={errors.description} />
                </div>

                {/* Emplacement */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        Description de l'emplacement
                        <span className="text-slate-400 font-normal ml-1">(optionnel)</span>
                    </label>
                    <input
                        type="text"
                        value={locationDescription}
                        onChange={(e) => setLocationDescription(e.target.value)}
                        placeholder="Ex : Carrefour Cadjehoun, près du marché…"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* Photos existantes */}
                {(alerte.medias ?? []).length > 0 && (
                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                            Photos actuelles
                            <span className="text-slate-400 font-normal ml-1 text-xs">(cliquez pour supprimer)</span>
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {(alerte.medias ?? []).map((p) => {
                                const marked = photosToDelete.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => toggleDeletePhoto(p.id)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all
                                            ${marked ? 'border-red-500 opacity-50' : 'border-transparent hover:border-red-400'}`}
                                    >
                                        <img src={`${MEDIA_BASE}${p.url}`} alt="" className="w-full h-full object-cover" />
                                        {marked && (
                                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {photosToDelete.length > 0 && (
                            <p className="text-xs text-red-600 mt-1">{photosToDelete.length} photo(s) sera supprimée(s)</p>
                        )}
                    </div>
                )}

                {/* Nouvelles photos */}
                <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                        Ajouter des photos
                        <span className="text-slate-400 font-normal ml-1 text-xs">({totalPhotos}/{MAX_PHOTOS})</span>
                    </p>

                    {newPhotos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {newPhotos.map((p, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-300 group">
                                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewPhoto(i)}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPhotos < MAX_PHOTOS && (
                        <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-sm text-slate-500">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            Ajouter des photos
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleNewPhotos(e.target.files)} />
                        </label>
                    )}
                    <FieldError msg={errors.photos} />
                </div>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex gap-3 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    form="form-modification"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
                >
                    {submitting ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enregistrement…</>
                    ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Enregistrer</>
                    )}
                </button>
            </div>
        </div>
    );
}

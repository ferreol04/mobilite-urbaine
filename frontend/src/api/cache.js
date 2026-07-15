import api from './axios';

// Cache mémoire — vit tant que l'onglet est ouvert
// TTL en ms : 5 minutes pour les données semi-statiques
const TTL = 5 * 60 * 1000;
const store = {};

async function cached(key, fetcher) {
    const hit = store[key];
    if (hit && Date.now() - hit.ts < TTL) return hit.data;
    const data = await fetcher();
    store[key] = { data, ts: Date.now() };
    return data;
}

export function invalidate(key) {
    delete store[key];
}

export const getCategories = () =>
    cached('categories', async () => {
        const { data } = await api.get('/categories');
        return data;
    });

export const getTypeIncidents = (categoryId) =>
    cached(`types-${categoryId}`, async () => {
        const { data } = await api.get(`/categories/${categoryId}/type-incidents`);
        return data;
    });


export const getParametres = () =>
    cached('parametres', async () => {
        const { data } = await api.get('/admin/parametres');
        return data;
    });

export const getConfig = () =>
    cached('config', async () => {
        const { data } = await api.get('/config');
        return data;
    });

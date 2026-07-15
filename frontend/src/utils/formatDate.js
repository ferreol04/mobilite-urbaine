export function formatTempsEcoule(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

    if (diff < 60)     return 'il y a quelques secondes';
    if (diff < 3600) {
        const min = Math.floor(diff / 60);
        return `il y a ${min} minute${min > 1 ? 's' : ''}`;
    }
    if (diff < 86400) {
        const h   = Math.floor(diff / 3600);
        const min = Math.floor((diff % 3600) / 60);
        return min > 0 ? `il y a ${h}h ${min}min` : `il y a ${h}h`;
    }
    const jours = Math.floor(diff / 86400);
    return `il y a ${jours} jour${jours > 1 ? 's' : ''}`;
}

export const COLORS = {
    primary:   { DEFAULT: '#1d4ed8', light: '#3b82f6', dark: '#1e3a8a', bg: '#eff6ff' },
    secondary: { DEFAULT: '#f97316', light: '#fb923c', dark: '#c2410c', bg: '#fff7ed' },
    accent:    { DEFAULT: '#22c55e', light: '#4ade80', dark: '#15803d', bg: '#f0fdf4' },
    danger:    { DEFAULT: '#ef4444', light: '#f87171', dark: '#b91c1c', bg: '#fef2f2' },
    warning:   { DEFAULT: '#eab308', light: '#facc15', dark: '#a16207', bg: '#fefce8' },
    neutral: {
        50:  '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },
};

// Classes Tailwind réutilisables
export const CLS = {
    // Boutons
    btnPrimary:   'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
    btnSecondary: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
    btnOutline:   'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
    btnDanger:    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
    btnGhost:     'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors duration-150',

    // Champs de formulaire
    input:        'w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
    inputError:   'w-full px-4 py-2.5 rounded-lg border border-red-400 bg-red-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition',
    label:        'block text-sm font-medium text-slate-700 mb-1',
    fieldError:   'mt-1 text-xs text-red-600',

    // Cartes
    card:         'bg-white rounded-xl shadow-sm border border-slate-200 p-6',
    cardHover:    'bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200',

    // Badges de statut
    badgeActive:   'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    badgeExpired:  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600',
    badgeResolved: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    badgeFalse:    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700',

    // Sections
    pageWrapper:  'min-h-screen bg-slate-50',
    container:    'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};

export const STATUS_BADGE = {
    active:   CLS.badgeActive,
    expired:  CLS.badgeExpired,
    resolved: CLS.badgeResolved,
    false:    CLS.badgeFalse,
};

export const STATUS_LABEL = {
    active:   'Active',
    expired:  'Expirée',
    resolved: 'Résolue',
    false:    'Fausse',
};

export const GENDER_LABEL = {
    male:   'Homme',
    female: 'Femme',
};

export const USER_STATUS_LABEL = {
    active:    'Actif',
    suspended: 'Suspendu',
    banned:    'Banni',
};

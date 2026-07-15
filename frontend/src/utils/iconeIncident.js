import L from 'leaflet';

// ── Table des icônes par nom de type d'incident ───────────────────────────────
// Chaque entrée : couleur + pictogramme SVG inline (style Waze)
const ICONS = {
    // ── Accidents ────────────────────────────────────────────────────────────
    accident: {
        bg: '#ef4444', border: '#b91c1c',
        pic: `<g transform="translate(15,13)">
          <!-- Voiture de profil -->
          <rect x="-8" y="-2" width="16" height="7" rx="2" fill="white" opacity="0.95"/>
          <rect x="-6" y="-5" width="10" height="5" rx="1.5" fill="white" opacity="0.85"/>
          <circle cx="-5" cy="5.5" r="2" fill="#ef4444"/>
          <circle cx="5" cy="5.5" r="2" fill="#ef4444"/>
          <!-- Éclair collision -->
          <text x="10" y="-4" font-size="8" fill="white" font-weight="bold">!</text>
        </g>`,
    },
    collision: {
        bg: '#ef4444', border: '#b91c1c',
        pic: `<g transform="translate(15,13)">
          <!-- Deux voitures face à face -->
          <rect x="-12" y="0" width="10" height="6" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="2" y="0" width="10" height="6" rx="1.5" fill="white" opacity="0.9"/>
          <!-- Étoile impact -->
          <circle cx="0" cy="3" r="3" fill="#fbbf24"/>
          <line x1="-2" y1="1" x2="2" y2="5" stroke="#b91c1c" stroke-width="1.5"/>
          <line x1="2" y1="1" x2="-2" y2="5" stroke="#b91c1c" stroke-width="1.5"/>
        </g>`,
    },

    // ── Véhicule renversé ───────────────────────────────────────────────────────
    car_overturned: {
        bg: '#ef4444', border: '#b91c1c',
        pic: `<g transform="translate(15,13)">
          <rect x="-8" y="-4" width="16" height="7" rx="2" fill="white" opacity="0.9" transform="rotate(180,0,0)"/>
          <circle cx="-5" cy="-5" r="2" fill="#ef4444"/>
          <circle cx="5" cy="-5" r="2" fill="#ef4444"/>
          <path d="M-6,2 L0,8 L6,2" stroke="white" stroke-width="2" fill="none" opacity="0.7"/>
        </g>`,
    },

    // ── Incendie de véhicule ─────────────────────────────────────────────────
    car_fire: {
        bg: '#dc2626', border: '#7f1d1d',
        pic: `<g transform="translate(15,13)">
          <rect x="-8" y="2" width="16" height="6" rx="2" fill="white" opacity="0.85"/>
          <circle cx="-5" cy="8.5" r="2" fill="#dc2626"/>
          <circle cx="5" cy="8.5" r="2" fill="#dc2626"/>
          <path d="M0,-10 C-3,-5 -5,0 -3,3 C-2,5 0,5 0,5 C0,5 2,5 3,3 C5,0 3,-5 0,-10Z" fill="white" opacity="0.95"/>
          <path d="M0,-4 C-1,-1 -2,1 -1,3 C0,4 1,3 2,1 C2,0 1,-2 0,-4Z" fill="#fbbf24" opacity="0.9"/>
        </g>`,
    },

    // ── Véhicule en panne ────────────────────────────────────────────────────
    car_breakdown: {
        bg: '#f59e0b', border: '#b45309',
        pic: `<g transform="translate(15,13)">
          <rect x="-8" y="0" width="16" height="7" rx="2" fill="white" opacity="0.9"/>
          <rect x="-6" y="-3" width="10" height="5" rx="1.5" fill="white" opacity="0.8"/>
          <circle cx="-5" cy="7.5" r="2" fill="#f59e0b"/>
          <circle cx="5" cy="7.5" r="2" fill="#f59e0b"/>
          <path d="M5,-8 L8,-5 M8,-8 L5,-5" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </g>`,
    },

    // ── Camion bloqué ────────────────────────────────────────────────────────
    truck_blocked: {
        bg: '#f97316', border: '#c2410c',
        pic: `<g transform="translate(15,13)">
          <rect x="-10" y="-2" width="14" height="9" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="4" y="1" width="7" height="6" rx="1" fill="white" opacity="0.85"/>
          <circle cx="-6" cy="8" r="2" fill="#f97316"/>
          <circle cx="7" cy="8" r="2" fill="#f97316"/>
          <line x1="-3" y1="-6" x2="3" y2="-6" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <line x1="0" y1="-9" x2="0" y2="-3" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </g>`,
    },

    // ── Objet dangereux sur la chaussée ──────────────────────────────────────
    road_hazard: {
        bg: '#ef4444', border: '#b91c1c',
        pic: `<g transform="translate(15,13)">
          <path d="M0,-10 L12,8 L-12,8 Z" fill="white" opacity="0.9"/>
          <path d="M0,-5 L7,5 L-7,5 Z" fill="#ef4444"/>
          <text x="0" y="4" text-anchor="middle" font-size="8" font-weight="bold" fill="white">!</text>
        </g>`,
    },

    // ── Véhicule mal stationné ───────────────────────────────────────────────
    wrong_parking: {
        bg: '#6366f1', border: '#4338ca',
        pic: `<g transform="translate(15,13)">
          <rect x="-8" y="0" width="16" height="7" rx="2" fill="white" opacity="0.9"/>
          <circle cx="-5" cy="7.5" r="2" fill="#6366f1"/>
          <circle cx="5" cy="7.5" r="2" fill="#6366f1"/>
          <circle cx="0" cy="-5" r="5" fill="white" opacity="0.9"/>
          <text x="0" y="-2.5" text-anchor="middle" font-size="7" font-weight="bold" fill="#6366f1">P</text>
          <line x1="-4" y1="-9" x2="4" y2="-1" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        </g>`,
    },

    // ── Travaux en cours ─────────────────────────────────────────────────────
    road_works: {
        bg: '#eab308', border: '#a16207',
        pic: `<g transform="translate(15,13)">
          <rect x="-10" y="-2" width="20" height="8" rx="1.5" fill="white" opacity="0.9"/>
          <line x1="-8" y1="-2" x2="-2" y2="6" stroke="#a16207" stroke-width="2.5"/>
          <line x1="-1" y1="-2" x2="5" y2="6" stroke="#a16207" stroke-width="2.5"/>
          <line x1="6" y1="-2" x2="12" y2="6" stroke="#a16207" stroke-width="2.5"/>
          <circle cx="0" cy="-7" r="3.5" fill="white" opacity="0.9"/>
          <rect x="-4" y="-5.5" width="8" height="2.5" rx="1" fill="#a16207"/>
        </g>`,
    },

    // ── Route déviée ─────────────────────────────────────────────────────────
    road_detour: {
        bg: '#f97316', border: '#c2410c',
        pic: `<g transform="translate(15,13)">
          <path d="M-8,8 L-8,-2 L0,-2 L0,-8 L8,-8" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5,-11 L10,-8 L5,-5" fill="white" opacity="0.9"/>
        </g>`,
    },

    // ── Chaussée endommagée ──────────────────────────────────────────────────
    damaged_road: {
        bg: '#78716c', border: '#44403c',
        pic: `<g transform="translate(15,13)">
          <rect x="-12" y="-2" width="24" height="10" rx="2" fill="white" opacity="0.85"/>
          <path d="M-6,-1 L-4,3 L-2,-1 L0,4 L2,0 L4,4 L6,0" stroke="#78716c" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="-3" cy="5" r="2" fill="#78716c" opacity="0.5"/>
          <circle cx="4" cy="4" r="1.5" fill="#78716c" opacity="0.4"/>
        </g>`,
    },

    // ── Caniveau ouvert ──────────────────────────────────────────────────────
    open_drain: {
        bg: '#78716c', border: '#44403c',
        pic: `<g transform="translate(15,13)">
          <rect x="-10" y="-4" width="20" height="12" rx="2" fill="white" opacity="0.85"/>
          <rect x="-7" y="-1" width="14" height="7" rx="1" fill="#78716c" opacity="0.6"/>
          <line x1="-5" y1="0" x2="-5" y2="5" stroke="white" stroke-width="1.5"/>
          <line x1="-1" y1="0" x2="-1" y2="5" stroke="white" stroke-width="1.5"/>
          <line x1="3" y1="0" x2="3" y2="5" stroke="white" stroke-width="1.5"/>
          <path d="M-3,4 Q0,7 3,4" stroke="#3b82f6" stroke-width="1.5" fill="none" opacity="0.7"/>
        </g>`,
    },

    // ── Route inondée ────────────────────────────────────────────────────────
    flooded_road: {
        bg: '#3b82f6', border: '#1d4ed8',
        pic: `<g transform="translate(15,13)">
          <path d="M-12,2 Q-8,-3 -4,2 Q0,7 4,2 Q8,-3 12,2" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M-10,7 Q-6,3 -2,7 Q2,11 6,7 Q10,3 12,7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
          <rect x="-8" y="-8" width="16" height="4" rx="1" fill="white" opacity="0.6"/>
          <line x1="-6" y1="-6" x2="6" y2="-6" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3,2"/>
        </g>`,
    },

    // ── Feux tricolores en panne ─────────────────────────────────────────────
    traffic_light_down: {
        bg: '#64748b', border: '#334155',
        pic: `<g transform="translate(15,13)">
          <rect x="-4" y="-11" width="8" height="18" rx="2" fill="white" opacity="0.9"/>
          <circle cx="0" cy="-7" r="2.5" fill="#ef4444" opacity="0.4"/>
          <circle cx="0" cy="-1" r="2.5" fill="#f59e0b" opacity="0.4"/>
          <circle cx="0" cy="5" r="2.5" fill="#22c55e" opacity="0.4"/>
          <line x1="-3" y1="-10" x2="3" y2="8" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="3" y1="-10" x2="-3" y2="8" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
        </g>`,
    },

    // ── Embouteillages / trafic ───────────────────────────────────────────────
    traffic_jam: {
        bg: '#f97316', border: '#c2410c',
        pic: `<g transform="translate(15,13)">
          <rect x="-12" y="-1" width="7" height="5" rx="1" fill="white" opacity="0.95"/>
          <rect x="-3" y="-1" width="7" height="5" rx="1" fill="white" opacity="0.8"/>
          <rect x="6"  y="-1" width="7" height="5" rx="1" fill="white" opacity="0.65"/>
          <line x1="-13" y1="7" x2="13" y2="7" stroke="white" stroke-width="1.5" opacity="0.6"/>
        </g>`,
    },
    embouteillage: {
        bg: '#f97316', border: '#c2410c',
        pic: `<g transform="translate(15,13)">
          <!-- 3 voitures en file -->
          <rect x="-12" y="-1" width="7" height="5" rx="1" fill="white" opacity="0.95"/>
          <rect x="-3" y="-1" width="7" height="5" rx="1" fill="white" opacity="0.8"/>
          <rect x="6"  y="-1" width="7" height="5" rx="1" fill="white" opacity="0.65"/>
          <!-- Flèche bloquée -->
          <line x1="-13" y1="7" x2="13" y2="7" stroke="white" stroke-width="1.5" opacity="0.6"/>
        </g>`,
    },
    congestion: {
        bg: '#f97316', border: '#c2410c',
        pic: `<g transform="translate(15,13)">
          <rect x="-12" y="-1" width="7" height="5" rx="1" fill="white" opacity="0.95"/>
          <rect x="-3" y="-1" width="7" height="5" rx="1" fill="white" opacity="0.8"/>
          <rect x="6"  y="-1" width="7" height="5" rx="1" fill="white" opacity="0.65"/>
          <line x1="-13" y1="7" x2="13" y2="7" stroke="white" stroke-width="1.5" opacity="0.6"/>
        </g>`,
    },
    trafic: {
        bg: '#f97316', border: '#c2410c',
        pic: `<g transform="translate(15,13)">
          <rect x="-10" y="-1" width="8" height="5" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="2"   y="-1" width="8" height="5" rx="1.5" fill="white" opacity="0.7"/>
          <text x="0" y="10" text-anchor="middle" font-size="6" fill="white" opacity="0.8">▸▸</text>
        </g>`,
    },

    // ── Inondations ───────────────────────────────────────────────────────────
    inondation: {
        bg: '#3b82f6', border: '#1d4ed8',
        pic: `<g transform="translate(15,13)">
          <!-- Vagues -->
          <path d="M-12,2 Q-8,-3 -4,2 Q0,7 4,2 Q8,-3 12,2" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M-10,7 Q-6,3 -2,7 Q2,11 6,7 Q10,3 12,7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
          <!-- Maison submergée -->
          <path d="M-4,-7 L0,-11 L4,-7 L4,-4 L-4,-4 Z" fill="white" opacity="0.7"/>
        </g>`,
    },
    flood: {
        bg: '#3b82f6', border: '#1d4ed8',
        pic: `<g transform="translate(15,13)">
          <path d="M-12,2 Q-8,-3 -4,2 Q0,7 4,2 Q8,-3 12,2" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M-10,7 Q-6,3 -2,7 Q2,11 6,7 Q10,3 12,7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
        </g>`,
    },

    // ── Travaux ───────────────────────────────────────────────────────────────
    travaux: {
        bg: '#eab308', border: '#a16207',
        pic: `<g transform="translate(15,13)">
          <!-- Panneau travaux + ouvrier -->
          <rect x="-10" y="-2" width="20" height="8" rx="1.5" fill="white" opacity="0.9"/>
          <!-- Rayures diagonales -->
          <clipPath id="clip-travaux"><rect x="-10" y="-2" width="20" height="8" rx="1.5"/></clipPath>
          <g clip-path="url(#clip-travaux)">
            <line x1="-12" y1="-2" x2="-6" y2="6" stroke="#a16207" stroke-width="2.5"/>
            <line x1="-5"  y1="-2" x2="1"  y2="6" stroke="#a16207" stroke-width="2.5"/>
            <line x1="2"   y1="-2" x2="8"  y2="6" stroke="#a16207" stroke-width="2.5"/>
          </g>
          <!-- Casque -->
          <circle cx="0" cy="-7" r="3.5" fill="white" opacity="0.9"/>
          <rect x="-4" y="-5.5" width="8" height="2.5" rx="1" fill="#a16207"/>
        </g>`,
    },
    construction: {
        bg: '#eab308', border: '#a16207',
        pic: `<g transform="translate(15,13)">
          <rect x="-10" y="-2" width="20" height="8" rx="1.5" fill="white" opacity="0.9"/>
          <g>
            <line x1="-12" y1="-2" x2="-6" y2="6" stroke="#a16207" stroke-width="2.5"/>
            <line x1="-5"  y1="-2" x2="1"  y2="6" stroke="#a16207" stroke-width="2.5"/>
            <line x1="2"   y1="-2" x2="8"  y2="6" stroke="#a16207" stroke-width="2.5"/>
          </g>
        </g>`,
    },

    // ── Incendies ─────────────────────────────────────────────────────────────
    incendie: {
        bg: '#dc2626', border: '#7f1d1d',
        pic: `<g transform="translate(15,12)">
          <!-- Flamme principale -->
          <path d="M0,-12 C-4,-6 -7,0 -5,5 C-3,9 -1,10 0,10
                   C1,10 3,9 5,5 C7,0 4,-6 0,-12Z"
                fill="white" opacity="0.95"/>
          <!-- Cœur de flamme -->
          <path d="M0,-4 C-2,0 -3,3 -2,6 C-1,8 0,8 0,8
                   C0,8 1,8 2,6 C3,3 2,0 0,-4Z"
                fill="#fbbf24" opacity="0.9"/>
          <!-- Petite flamme gauche -->
          <path d="M-6,-4 C-8,-1 -8,3 -6,5 C-5,6 -4,5 -5,3
                   C-5,1 -4,-1 -6,-4Z"
                fill="white" opacity="0.6"/>
        </g>`,
    },
    fire: {
        bg: '#dc2626', border: '#7f1d1d',
        pic: `<g transform="translate(15,12)">
          <path d="M0,-12 C-4,-6 -7,0 -5,5 C-3,9 -1,10 0,10
                   C1,10 3,9 5,5 C7,0 4,-6 0,-12Z"
                fill="white" opacity="0.95"/>
          <path d="M0,-4 C-2,0 -3,3 -2,6 C-1,8 0,8 0,8
                   C0,8 1,8 2,6 C3,3 2,0 0,-4Z"
                fill="#fbbf24" opacity="0.9"/>
        </g>`,
    },
    feu: {
        bg: '#dc2626', border: '#7f1d1d',
        pic: `<g transform="translate(15,12)">
          <path d="M0,-12 C-4,-6 -7,0 -5,5 C-3,9 -1,10 0,10
                   C1,10 3,9 5,5 C7,0 4,-6 0,-12Z"
                fill="white" opacity="0.95"/>
          <path d="M0,-4 C-2,0 -3,3 -2,6 C-1,8 0,8 0,8
                   C0,8 1,8 2,6 C3,3 2,0 0,-4Z"
                fill="#fbbf24" opacity="0.9"/>
        </g>`,
    },

    // ── Route bloquée ────────────────────────────────────────────────────────
    road_blocked: {
        bg: '#dc2626', border: '#991b1b',
        pic: `<g transform="translate(15,13)">
          <rect x="-12" y="-1" width="24" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="-12" y="-1" width="6" height="4" fill="#ef4444" opacity="0.7"/>
          <rect x="0"   y="-1" width="6" height="4" fill="#ef4444" opacity="0.7"/>
          <rect x="-11" y="-6" width="2.5" height="5" rx="1" fill="white" opacity="0.7"/>
          <rect x="8.5" y="-6" width="2.5" height="5" rx="1" fill="white" opacity="0.7"/>
          <circle cx="0" cy="-8" r="4" fill="white" opacity="0.9"/>
          <line x1="-2" y1="-10" x2="2" y2="-6" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
          <line x1="2" y1="-10" x2="-2" y2="-6" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
        </g>`,
    },

    // ── Manifestation ────────────────────────────────────────────────────────
    protest: {
        bg: '#ec4899', border: '#be185d',
        pic: `<g transform="translate(15,13)">
          <circle cx="-5" cy="-3" r="3" fill="white" opacity="0.9"/>
          <circle cx="5" cy="-3" r="3" fill="white" opacity="0.9"/>
          <circle cx="0" cy="-6" r="3" fill="white" opacity="0.8"/>
          <rect x="-2" y="-12" width="4" height="7" rx="1" fill="white" opacity="0.85"/>
          <rect x="-4" y="-13" width="8" height="4" rx="1" fill="white" opacity="0.9"/>
          <line x1="-3" y1="-12" x2="3" y2="-12" stroke="#ec4899" stroke-width="1.5"/>
          <line x1="-3" y1="-11" x2="3" y2="-11" stroke="#ec4899" stroke-width="1"/>
          <rect x="-8" y="2" width="16" height="3" rx="1" fill="white" opacity="0.5"/>
        </g>`,
    },

    // ── Rassemblement ────────────────────────────────────────────────────────
    gathering: {
        bg: '#8b5cf6', border: '#6d28d9',
        pic: `<g transform="translate(15,13)">
          <circle cx="0" cy="-4" r="3.5" fill="white" opacity="0.95"/>
          <circle cx="-7" cy="-2" r="3" fill="white" opacity="0.8"/>
          <circle cx="7" cy="-2" r="3" fill="white" opacity="0.8"/>
          <circle cx="-4" cy="4" r="2.5" fill="white" opacity="0.7"/>
          <circle cx="4" cy="4" r="2.5" fill="white" opacity="0.7"/>
          <circle cx="0" cy="7" r="2.5" fill="white" opacity="0.6"/>
        </g>`,
    },

    // ── Police / barrage ──────────────────────────────────────────────────────
    police: {
        bg: '#8b5cf6', border: '#5b21b6',
        pic: `<g transform="translate(15,13)">
          <!-- Gyrophare -->
          <rect x="-9" y="0" width="18" height="7" rx="2" fill="white" opacity="0.9"/>
          <rect x="-6" y="-5" width="12" height="6" rx="1.5" fill="white" opacity="0.8"/>
          <rect x="-9" y="0" width="8"  height="7" rx="0" fill="#ef4444" opacity="0.5" clip-path="url(#clip-p)"/>
          <clipPath id="clip-p"><rect x="-9" y="0" width="18" height="7" rx="2"/></clipPath>
          <!-- Badge P -->
          <circle cx="0" cy="-8" r="4" fill="white" opacity="0.9"/>
          <text x="0" y="-5.5" text-anchor="middle" font-size="6" font-weight="bold" fill="#8b5cf6">P</text>
        </g>`,
    },
    controle: {
        bg: '#8b5cf6', border: '#5b21b6',
        pic: `<g transform="translate(15,13)">
          <rect x="-9" y="0" width="18" height="7" rx="2" fill="white" opacity="0.9"/>
          <rect x="-6" y="-5" width="12" height="6" rx="1.5" fill="white" opacity="0.8"/>
          <circle cx="0" cy="-8" r="4" fill="white" opacity="0.9"/>
          <text x="0" y="-5.5" text-anchor="middle" font-size="6" font-weight="bold" fill="#8b5cf6">P</text>
        </g>`,
    },
    barrage: {
        bg: '#8b5cf6', border: '#5b21b6',
        pic: `<g transform="translate(15,13)">
          <!-- Barre de barrage -->
          <rect x="-12" y="-1" width="24" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="-12" y="-1" width="6" height="4" fill="#ef4444" opacity="0.6" rx="0"/>
          <rect x="0"   y="-1" width="6" height="4" fill="#ef4444" opacity="0.6"/>
          <!-- Poteaux -->
          <rect x="-11" y="-6" width="2.5" height="5" rx="1" fill="white" opacity="0.7"/>
          <rect x="8.5" y="-6" width="2.5" height="5" rx="1" fill="white" opacity="0.7"/>
        </g>`,
    },

    // ── Obstacle / animal ─────────────────────────────────────────────────────
    obstacle: {
        bg: '#10b981', border: '#065f46',
        pic: `<g transform="translate(15,13)">
          <!-- Triangle avertissement -->
          <path d="M0,-12 L13,8 L-13,8 Z" fill="white" opacity="0.9"/>
          <path d="M0,-7 L8,5 L-8,5 Z" fill="#10b981"/>
          <text x="0" y="4" text-anchor="middle" font-size="8" font-weight="bold" fill="white">!</text>
        </g>`,
    },
    animal: {
        bg: '#10b981', border: '#065f46',
        pic: `<g transform="translate(15,13)">
          <!-- Silhouette animal -->
          <ellipse cx="0" cy="2" rx="8" ry="5" fill="white" opacity="0.9"/>
          <circle cx="-5" cy="-3" r="4" fill="white" opacity="0.9"/>
          <!-- Oreilles -->
          <path d="M-8,-3 L-9,-8 L-5,-5 Z" fill="white" opacity="0.8"/>
          <path d="M-2,-3 L-1,-8 L2,-5 Z" fill="white" opacity="0.8"/>
          <!-- Pattes -->
          <rect x="-7" y="6" width="2" height="4" rx="1" fill="white" opacity="0.7"/>
          <rect x="-2" y="6" width="2" height="4" rx="1" fill="white" opacity="0.7"/>
          <rect x="3"  y="6" width="2" height="4" rx="1" fill="white" opacity="0.7"/>
        </g>`,
    },

    // ── Défaut ────────────────────────────────────────────────────────────────
    default: {
        bg: '#64748b', border: '#334155',
        pic: `<g transform="translate(15,13)">
          <circle cx="0" cy="-2" r="8" fill="white" opacity="0.9"/>
          <text x="0" y="1.5" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">?</text>
        </g>`,
    },
};

function resolve(iconName) {
    if (!iconName) return ICONS.default;
    const key = iconName.toLowerCase().trim();
    if (ICONS[key]) return ICONS[key];
    for (const [k, def] of Object.entries(ICONS)) {
        if (key.includes(k) || k.includes(key)) return def;
    }
    return ICONS.default;
}

function makeSVG(def) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Goupille style Waze -->
  <path d="M17 0C8.163 0 1 7.163 1 16
           c0 5.637 2.891 10.604 7.278 13.493
           L17 44 l8.722-14.507
           C30.109 26.604 33 21.637 33 16
           C33 7.163 25.837 0 17 0Z"
        fill="${def.bg}" stroke="${def.border}" stroke-width="1"
        filter="url(#shadow)"/>
  <!-- Cercle blanc intérieur -->
  <circle cx="17" cy="15" r="11" fill="white" opacity="0.15"/>
  ${def.pic}
</svg>`;
}

const cache  = {};
const cacheP = {};

export function getIconeIncident(iconName) {
    const k = iconName || 'default';
    if (cache[k]) return cache[k];
    const def  = resolve(iconName);
    const icon = L.divIcon({
        html:       makeSVG(def),
        className:  '',
        iconSize:   [34, 44],
        iconAnchor: [17, 44],
        popupAnchor:[0, -46],
    });
    cache[k] = icon;
    return icon;
}

export function getIconeIncidentPulse(iconName) {
    const k = (iconName || 'default') + '_pulse';
    if (cacheP[k]) return cacheP[k];
    const def = resolve(iconName);
    const html = `<div style="position:relative;width:42px;height:52px;">
  <div style="position:absolute;top:0;left:4px;width:34px;height:34px;border-radius:50%;
              background:${def.bg};opacity:0.22;animation:pulse 1.6s ease-out infinite;"></div>
  <div style="position:absolute;top:4px;left:4px;">${makeSVG(def)}</div>
</div>`;
    const icon = L.divIcon({
        html,
        className:  '',
        iconSize:   [42, 52],
        iconAnchor: [21, 52],
        popupAnchor:[0, -54],
    });
    cacheP[k] = icon;
    return icon;
}

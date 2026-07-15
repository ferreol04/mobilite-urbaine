import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { getIconeIncident, getIconeIncidentPulse } from '../../utils/iconeIncident';
import PopupAlerte from '../alertes/PopupAlerte';
import useAuth from '../../hooks/useAuth';

const COTONOU = [6.3654, 2.4183];

// ── Contrôle de la map depuis l'extérieur ─────────────────────────────────────
function MapController({ onMapReady }) {
    const map = useMap();
    useEffect(() => { onMapReady(map); }, [map, onMapReady]);
    return null;
}

// ── Recentrage sur une ville via Nominatim ────────────────────────────────────
function VilleRecentrer({ ville }) {
    const map = useMap();

    useEffect(() => {
        if (!ville) {
            // Retour sur Cotonou quand le filtre est réinitialisé
            map.flyTo(COTONOU, 13, { animate: true, duration: 1.2 });
            return;
        }
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ville + ', Bénin')}&format=json&limit=1`)
            .then((r) => r.json())
            .then((data) => {
                if (data.length === 0) return;
                const { lat, lon } = data[0];
                map.flyTo([parseFloat(lat), parseFloat(lon)], 14, { animate: true, duration: 1.2 });
            })
            .catch(() => {});
    }, [ville, map]);

    return null;
}

// ── Couche de coloration rouge transparente zones accidentogènes ──────────────
function ZonesLayer({ zones }) {
    const map    = useMap();
    const layersRef = useRef([]);

    useEffect(() => {
        // Création du pane au-dessus des marqueurs (650 > 600 = markerPane)
        if (!map.getPane('zonesPane')) {
            const pane = map.createPane('zonesPane');
            pane.style.zIndex = '650';
            pane.style.pointerEvents = 'none';
        }
    }, [map]);

    useEffect(() => {
        layersRef.current.forEach((c) => map.removeLayer(c));
        layersRef.current = [];

        zones.forEach((z) => {
            if (!z.latitude || !z.longitude) return;
            const max    = Math.max(...zones.map((x) => x.incident_count), 1);
            const ratio  = z.incident_count / max;
            // Rayon entre 300 m et 900 m selon densité
            const radius = 300 + ratio * 600;
            const circle = L.circle([z.latitude, z.longitude], {
                radius,
                pane:        'zonesPane',
                color:       '#ef4444',
                weight:      1,
                opacity:     0.5,
                fillColor:   '#ef4444',
                fillOpacity: 0.12 + ratio * 0.18,
            }).addTo(map);
            layersRef.current.push(circle);
        });

        return () => {
            layersRef.current.forEach((c) => map.removeLayer(c));
            layersRef.current = [];
        };
    }, [zones, map]);

    return null;
}

// ── Couche cluster + marqueurs ─────────────────────────────────────────────────
function ClusterLayer({ alertes, newIds, onMarkerClick }) {
    const map       = useRef(null);
    const groupRef  = useRef(null);
    const mapHook   = useMap();

    // Garde une ref stable de la map
    useEffect(() => { map.current = mapHook; }, [mapHook]);

    // Crée le groupe cluster une seule fois
    useEffect(() => {
        const group = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction(cluster) {
                const count = cluster.getChildCount();
                const size  = count < 10 ? 36 : count < 50 ? 42 : 50;
                return L.divIcon({
                    html: `<div style="
                        width:${size}px;height:${size}px;border-radius:50%;
                        background:#1d4ed8;border:3px solid white;
                        box-shadow:0 2px 8px rgba(29,78,216,0.5);
                        display:flex;align-items:center;justify-content:center;
                        color:white;font-weight:bold;font-size:${count < 10 ? 14 : 12}px;
                        font-family:system-ui,sans-serif;">
                      ${count}
                    </div>`,
                    className: '',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                });
            },
        });
        groupRef.current = group;
        mapHook.addLayer(group);
        return () => { mapHook.removeLayer(group); };
    }, [mapHook]);

    // Reconstruit les marqueurs quand alertes change
    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;
        group.clearLayers();

        alertes.forEach((alerte) => {
            const isNew  = newIds.has(alerte.id);
            const icon   = isNew
                ? getIconeIncidentPulse(alerte.type_incident?.icon)
                : getIconeIncident(alerte.type_incident?.icon);

            const marker = L.marker([alerte.latitude, alerte.longitude], { icon });
            marker.on('click', () => onMarkerClick(alerte));
            group.addLayer(marker);
        });
    }, [alertes, newIds, onMarkerClick]);

    return null;
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function CarteInteractive({ alertes, zones, ville = '', onFiltreChange }) {
    const { isAuthenticated } = useAuth();
    const navigate   = useNavigate();
    const mapRef     = useRef(null);
    const prevIdsRef = useRef(new Set());

    const [selectedAlerte, setSelectedAlerte] = useState(null);
    const [newIds, setNewIds]                 = useState(new Set());

    // Détecte les nouvelles alertes (temps réel) pour l'animation pulse
    useEffect(() => {
        const currentIds = new Set(alertes.map((a) => a.id));
        const added      = new Set([...currentIds].filter((id) => !prevIdsRef.current.has(id)));
        if (added.size > 0) {
            setNewIds(added);
            setTimeout(() => setNewIds(new Set()), 4000);
        }
        prevIdsRef.current = currentIds;
    }, [alertes]);

    const handleMarkerClick = useCallback((alerte) => {
        setSelectedAlerte(alerte);
        if (mapRef.current) {
            mapRef.current.setView(
                [alerte.latitude, alerte.longitude],
                Math.max(mapRef.current.getZoom(), 15),
                { animate: true }
            );
        }
    }, []);


    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={COTONOU}
                zoom={13}
                className="w-full h-full"
                zoomControl={false}
            >
                <MapController onMapReady={(m) => (mapRef.current = m)} />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <VilleRecentrer ville={ville} />

                {zones.length > 0 && <ZonesLayer zones={zones} />}

                <ClusterLayer
                    alertes={alertes}
                    newIds={newIds}
                    onMarkerClick={handleMarkerClick}
                />
            </MapContainer>

            {/* Contrôles zoom */}
            <div className="absolute bottom-24 right-4 sm:bottom-28 z-500 flex flex-col gap-1">
                <button
                    onClick={() => mapRef.current?.zoomIn()}
                    className="w-9 h-9 bg-white border border-slate-200 rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-lg font-light leading-none"
                    title="Zoom avant"
                >
                    +
                </button>
                <button
                    onClick={() => mapRef.current?.zoomOut()}
                    className="w-9 h-9 bg-white border border-slate-200 rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-lg font-light leading-none"
                    title="Zoom arrière"
                >
                    −
                </button>
            </div>

            {selectedAlerte && (
                <PopupAlerte
                    alerte={selectedAlerte}
                    onClose={() => setSelectedAlerte(null)}
                />
            )}
        </div>
    );
}

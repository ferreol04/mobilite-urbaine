import { Marker } from 'react-leaflet';
import { getIconeIncident, getIconeIncidentPulse } from '../../utils/iconeIncident';

export default function MarqueurIncident({ alerte, isNew = false, onClick }) {
    const iconName = alerte.type_incident?.icon;
    const icon = isNew ? getIconeIncidentPulse(iconName) : getIconeIncident(iconName);

    return (
        <Marker
            position={[alerte.latitude, alerte.longitude]}
            icon={icon}
            eventHandlers={{ click: onClick }}
        />
    );
}

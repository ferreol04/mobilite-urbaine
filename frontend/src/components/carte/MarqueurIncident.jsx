import { Marker } from 'react-leaflet';
import { getIconeIncident, getIconeIncidentPulse } from '../../utils/iconeIncident';

export default function MarqueurIncident({ alerte, isNew = false, onClick }) {
    const iconName = alerte.type_incident?.icon;
    const categoryName = alerte.category?.name;
    const icon = isNew ? getIconeIncidentPulse(iconName, categoryName) : getIconeIncident(iconName, categoryName);

    return (
        <Marker
            position={[alerte.latitude, alerte.longitude]}
            icon={icon}
            eventHandlers={{ click: onClick }}
        />
    );
}

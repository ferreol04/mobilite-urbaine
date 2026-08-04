import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

export function RouteUtilisateur() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    if (loading) return <Loader />;
    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/connexion" replace state={{ from: location }} />;
}

export function RouteAdmin() {
    const { isAdmin, loading } = useAuth();
    const location = useLocation();
    if (loading) return <Loader />;
    return isAdmin
        ? <Outlet />
        : <Navigate to="/connexion" replace state={{ from: location }} />;
}

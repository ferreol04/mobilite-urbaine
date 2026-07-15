import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlerteProvider } from './context/AlerteContext';
import { RouteUtilisateur, RouteAdmin } from './components/common/RouteProtegee';
import ContributeAuthModal from './components/auth/ContributeAuthModal';
import PasswordSuggestionBanner from './components/auth/PasswordSuggestionBanner';

import Accueil from './pages/public/Accueil';
import Signalements from './pages/public/Signalements';
import Connexion from './pages/public/Connexion';
import Inscription from './pages/public/Inscription';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Verify from './pages/public/Verify';

import Profil from './pages/user/Profil';
import MesSignalements from './pages/user/MesSignalements';
import ZonesARisque from './pages/user/ZonesARisque';

import Dashboard from './pages/admin/Dashboard';
import GestionAlertes from './pages/admin/GestionAlertes';
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs';
import GestionCategories from './pages/admin/GestionCategories';
import Parametres from './pages/admin/Parametres';

import FormulaireSignalement from './components/alertes/FormulaireSignalement';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AlerteProvider>
                    <PasswordSuggestionBanner />
                    <Routes>
                        {/* Routes publiques */}
                        <Route path="/" element={<Accueil />} />
                        <Route path="/connexion" element={<Connexion />} />
                        <Route path="/inscription" element={<Inscription />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/verify" element={<Verify />} />

                        {/* Routes accessibles sans authentification (auth au moment de l'action) */}
                        <Route path="/signaler" element={<FormulaireSignalement />} />
                        <Route path="/signalements" element={<Signalements />} />
                        <Route path="/zones-a-risque" element={<ZonesARisque />} />

                        {/* Routes utilisateur connecté */}
                        <Route element={<RouteUtilisateur />}>
                            <Route path="/mes-signalements" element={<MesSignalements />} />
                            <Route path="/profil" element={<Profil />} />
                        </Route>

                        {/* Routes admin */}
                        <Route element={<RouteAdmin />}>
                            <Route path="/admin" element={<Dashboard />} />
                            <Route path="/admin/alertes" element={<GestionAlertes />} />
                            <Route path="/admin/utilisateurs" element={<GestionUtilisateurs />} />
                            <Route path="/admin/categories" element={<GestionCategories />} />
                            <Route path="/admin/parametres" element={<Parametres />} />
                        </Route>
                    </Routes>
                    <ContributeAuthModal />
                </AlerteProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

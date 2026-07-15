import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        navigate('/connexion', { replace: true });
        await logout();
    }

    const linkCls = ({ isActive }) =>
        `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`;

    return (
        <nav className="relative z-600 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-base tracking-tight hidden sm:block">MobiliAlert</span>
                </Link>

                {/* Liens desktop */}
                <div className="hidden md:flex items-center gap-6">
                    <NavLink to="/" end className={linkCls}>Carte</NavLink>
                    <NavLink to="/signalements" className={linkCls}>Signalements</NavLink>
                    <NavLink to="/zones-a-risque" className={linkCls}>Zones à risque</NavLink>
                    {isAuthenticated && !isAdmin && (
                        <NavLink to="/mes-signalements" className={linkCls}>Mes signalements</NavLink>
                    )}
                    {isAdmin && (
                        <NavLink to="/admin" className={linkCls}>Administration</NavLink>
                    )}
                </div>

                {/* Actions droite */}
                <div className="flex items-center gap-2 shrink-0">
                    {!authLoading && isAuthenticated && (
                        <>
                            {/* Avatar + menu — caché sur mobile */}
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setAvatarOpen((v) => !v)}
                                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <Avatar user={user} size={7} />
                                    <span className="text-sm text-slate-300 max-w-28 truncate">
                                        {user?.first_name}
                                    </span>
                                    <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${avatarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>

                                {avatarOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-700">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-white text-sm font-semibold truncate">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-slate-400 text-xs truncate mt-0.5">{user?.email || user?.phone}</p>
                                        </div>
                                        <div className="py-1">
                                            <MenuItem to="/profil" onClick={() => setAvatarOpen(false)}>Mon profil</MenuItem>
                                        </div>
                                        <div className="border-t border-white/10 py-1">
                                            <button
                                                onClick={handleLogout}
                                                disabled={loggingOut}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                                </svg>
                                                {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!authLoading && !isAuthenticated && (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/connexion"
                                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                            >
                                Connexion
                            </Link>
                        </div>
                    )}

                    {/* Burger mobile */}
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        {mobileOpen ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Menu mobile déroulant */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 bg-slate-900 px-4 py-3 space-y-1">
                    <MobileLink to="/" onClick={() => setMobileOpen(false)}>Carte</MobileLink>
                    <MobileLink to="/signalements" onClick={() => setMobileOpen(false)}>Signalements</MobileLink>
                    <MobileLink to="/zones-a-risque" onClick={() => setMobileOpen(false)}>Zones à risque</MobileLink>
                    <MobileLink to="/signaler" onClick={() => setMobileOpen(false)}>Signaler un incident</MobileLink>
                    {isAuthenticated && !isAdmin && (
                        <>
                            <MobileLink to="/mes-signalements" onClick={() => setMobileOpen(false)}>Mes signalements</MobileLink>
                            <MobileLink to="/profil" onClick={() => setMobileOpen(false)}>Mon profil</MobileLink>
                        </>
                    )}
                    {isAdmin && (
                        <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>Administration</MobileLink>
                    )}
                    {isAuthenticated && (
                        <button
                            onClick={() => { setMobileOpen(false); handleLogout(); }}
                            disabled={loggingOut}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                            {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
                        </button>
                    )}
                    {!isAuthenticated && (
                        <MobileLink to="/connexion" onClick={() => setMobileOpen(false)}>Connexion</MobileLink>
                    )}
                </div>
            )}
        </nav>
    );
}

function Avatar({ user, size = 8 }) {
    const hasName = user?.first_name || user?.last_name;
    const initials = hasName
        ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
        : 'CA';
    const bg = !hasName ? 'bg-slate-500' : user?.gender === 'female' ? 'bg-pink-500' : 'bg-blue-600';
    return (
        <div className={`w-${size} h-${size} rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {initials}
        </div>
    );
}

function MenuItem({ to, onClick, children }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
        >
            {children}
        </Link>
    );
}

function MobileLink({ to, onClick, children }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            }
        >
            {children}
        </NavLink>
    );
}

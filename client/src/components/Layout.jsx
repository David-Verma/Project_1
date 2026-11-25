import { Link, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function Layout() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  return <><header className="topbar"><div className="nav-inner"><Link to="/" className="brand"><span className="brand-mark">h.</span><span>hashnode</span></Link><nav className="nav-links"><NavLink to="/tags">Topics</NavLink>{user ? <><NavLink to="/dashboard">My writing</NavLink><NavLink to="/settings">Settings</NavLink><button className="text-button" onClick={() => { logout(); navigate('/'); }}>Log out</button><Link className="avatar-small" to={`/profile/${user._id}`}>{user.avatarUrl ? <img src={user.avatarUrl} alt=""/> : user.name?.[0]}</Link></> : <><NavLink to="/login">Log in</NavLink><Link className="button button-dark button-small" to="/register">Start writing</Link></>}</nav></div></header><main className="site-main"><Outlet /></main><footer className="footer"><Link to="/" className="brand"><span className="brand-mark">h.</span><span>hashnode</span></Link><span>A quiet corner of the internet for developers.</span></footer></>;
}
export function ProtectedRoute({ children }) { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <div className="center-state">Checking your session…</div>; if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />; return children; }
export function Loading({ label = 'Loading…' }) { return <div className="center-state">{label}</div>; }
export function ErrorNotice({ children }) { return <div className="notice notice-error" role="alert">{children}</div>; }

import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/Ordenes';
import OrdenDetail from './pages/OrdenDetail';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Flujos from './pages/Flujos';
import Estados from './pages/Estados';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import './App.css';

const AUTH_STORAGE_KEY = 'fluxe_auth';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedOrdenId, setSelectedOrdenId] = useState(null);
  const [auth, setAuth] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  });

  const roles = auth?.user?.roles || [];
  const normalizeRoleName = (name) => {
    if (!name) {
      return '';
    }
    return name
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };
  const normalizedRoles = roles.map((rol) => normalizeRoleName(rol?.nombre_rol));
  const hasOwnerRole = normalizedRoles.some((role) => role.includes('dueno'));
  const hasAdminRole = normalizedRoles.some(
    (role) => role.includes('admin') || role.includes('administrador')
  );
  const hasTechnicianRole = normalizedRoles.some((role) => role.includes('tecnico'));
  const hasReceptionistRole = normalizedRoles.some(
    (role) => role.includes('recepcionista')
  );
  const allViews = [
    'dashboard',
    'ordenes',
    'orden-detail',
    'clientes',
    'productos',
    'flujos',
    'estados',
    'usuarios',
  ];
  const staffViews = ['ordenes', 'orden-detail', 'clientes', 'productos'];
  const defaultViews = ['ordenes', 'orden-detail'];
  const allowedViews =
    hasOwnerRole || hasAdminRole
      ? allViews
      : hasTechnicianRole || hasReceptionistRole
        ? staffViews
        : defaultViews;
  const isAuthenticated = Boolean(auth?.user);

  const handleSetActiveView = (view) => {
    if (!allowedViews.includes(view)) {
      return;
    }
    setActiveView(view);
  };

  const handleVerOrden = (ordenId) => {
    setSelectedOrdenId(ordenId);
    handleSetActiveView('orden-detail');
  };

  const handleVolverOrdenes = () => {
    setSelectedOrdenId(null);
    handleSetActiveView('ordenes');
  };

  const handleLogin = (payload) => {
    setAuth(payload);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    setActiveView('ordenes');
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSelectedOrdenId(null);
    setActiveView('ordenes');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!allowedViews.includes(activeView)) {
      setActiveView('ordenes');
    }
  }, [activeView, allowedViews, isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        setActiveView={handleSetActiveView}
        user={auth.user}
        onLogout={handleLogout}
        allowedViews={allowedViews}
      />
      <main className="main-content">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'ordenes' && <Ordenes onVerOrden={handleVerOrden} />}
        {activeView === 'orden-detail' && (
          <OrdenDetail
            ordenId={selectedOrdenId}
            onVolver={handleVolverOrdenes}
          />
        )}
        {activeView === 'clientes' && <Clientes />}
        {activeView === 'productos' && <Productos />}
        {activeView === 'flujos' && <Flujos />}
        {activeView === 'estados' && <Estados />}
        {activeView === 'usuarios' && <Usuarios />}
      </main>
    </div>
  );
}

export default App;

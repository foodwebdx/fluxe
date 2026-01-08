import './Sidebar.css';

const Sidebar = ({ activeView, setActiveView, user, onLogout, allowedViews }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'ordenes', label: 'Ordenes', icon: '📦' },
    { id: 'consulta-orden', label: 'Consulta', icon: '🔍' },
    { id: 'encuesta-orden', label: 'Encuesta', icon: '📝' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'flujos', label: 'Flujos', icon: '🌊' },
    { id: 'estados', label: 'Estados', icon: '⚙️' },
    { id: 'usuarios', label: 'Usuarios', icon: '🧑‍💼' },
  ];

  const visibleItems = Array.isArray(allowedViews) && allowedViews.length > 0
    ? navItems.filter((item) => allowedViews.includes(item.id))
    : navItems;

  const displayName = user?.nombre || user?.usuario_login || 'Usuario';
  const rolesLabel = (user?.roles || [])
    .map((rol) => rol.nombre_rol)
    .filter(Boolean)
    .join(', ');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Fluxe</h2>
      </div>
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{displayName}</div>
          {rolesLabel && <div className="sidebar-user-role">{rolesLabel}</div>}
        </div>
        {onLogout && (
          <button className="logout-button" onClick={onLogout}>
            Salir
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

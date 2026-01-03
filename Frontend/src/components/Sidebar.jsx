import './Sidebar.css';

const Sidebar = ({ activeView, setActiveView }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Fluxe</h2>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <span className="icon">📊</span>
          <span>Dashboard</span>
        </button>
        <button
          className={`nav-item ${activeView === 'ordenes' ? 'active' : ''}`}
          onClick={() => setActiveView('ordenes')}
        >
          <span className="icon">📦</span>
          <span>Órdenes</span>
        </button>
        <button
          className={`nav-item ${activeView === 'clientes' ? 'active' : ''}`}
          onClick={() => setActiveView('clientes')}
        >
          <span className="icon">👥</span>
          <span>Clientes</span>
        </button>
        <button
          className={`nav-item ${activeView === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveView('productos')}
        >
          <span className="icon">📦</span>
          <span>Productos</span>
        </button>
        <button
          className={`nav-item ${activeView === 'flujos' ? 'active' : ''}`}
          onClick={() => setActiveView('flujos')}
        >
          <span className="icon">🌊</span>
          <span>Flujos</span>
        </button>
        <button
          className={`nav-item ${activeView === 'estados' ? 'active' : ''}`}
          onClick={() => setActiveView('estados')}
        >
          <span className="icon">⚙️</span>
          <span>Estados</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;

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
      </nav>
    </aside>
  );
};

export default Sidebar;

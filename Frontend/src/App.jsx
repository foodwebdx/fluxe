import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/Ordenes';
import OrdenDetail from './pages/OrdenDetail';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Flujos from './pages/Flujos';
import Estados from './pages/Estados';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedOrdenId, setSelectedOrdenId] = useState(null);

  const handleVerOrden = (ordenId) => {
    setSelectedOrdenId(ordenId);
    setActiveView('orden-detail');
  };

  const handleVolverOrdenes = () => {
    setSelectedOrdenId(null);
    setActiveView('ordenes');
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
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
      </main>
    </div>
  );
}

export default App;

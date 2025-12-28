import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/Ordenes';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Flujos from './pages/Flujos';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'ordenes' && <Ordenes />}
        {activeView === 'clientes' && <Clientes />}
        {activeView === 'productos' && <Productos />}
        {activeView === 'flujos' && <Flujos />}
      </main>
    </div>
  );
}

export default App;

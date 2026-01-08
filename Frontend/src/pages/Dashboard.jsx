import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../config/api';
import './Dashboard.css';

const Dashboard = () => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/ordenes/dashboard/metrics'));
      
      if (!response.ok) {
        throw new Error('Error al cargar las métricas del dashboard');
      }

      const data = await response.json();
      
      if (data.success) {
        setMetricas(data.data);
      } else {
        throw new Error(data.message || 'Error al cargar las métricas');
      }
    } catch (err) {
      console.error('Error al cargar métricas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    if (!metricas) return;

    // Crear contenido CSV con BOM UTF-8 para soportar tildes
    let csv = 'REPORTE DE KPIs - DASHBOARD\n';
    csv += `Fecha de generación: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'TOTALES\n';
    csv += 'Métrica,Valor\n';
    csv += `Órdenes Activas,${metricas.totales.ordenesActivas}\n`;
    csv += `Total Clientes,${metricas.totales.clientes}\n`;
    csv += `Productos Registrados,${metricas.totales.productos}\n`;
    csv += `Órdenes Cerradas (mes actual),${metricas.totales.ordenesCerradas}\n`;
    csv += `Total Órdenes,${metricas.totales.ordenes}\n\n`;
    
    csv += 'CAMBIOS ÚLTIMOS 30 DÍAS\n';
    csv += 'Métrica,Cambio %\n';
    csv += `Órdenes Activas,${metricas.cambios.ordenesActivas}%\n`;
    csv += `Clientes,${metricas.cambios.clientes}%\n\n`;
    
    csv += 'DISTRIBUCIÓN POR ESTADO\n';
    csv += 'Estado,Cantidad\n';
    metricas.distribucionPorEstado.forEach(item => {
      csv += `${item.estado},${item.cantidad}\n`;
    });
    csv += '\n';
    
    csv += 'ÓRDENES POR MES\n';
    csv += 'Mes,Órdenes\n';
    metricas.ordenesPorMes.forEach(item => {
      csv += `${item.name},${item.ordenes}\n`;
    });
    csv += '\n';
    
    csv += 'ACTIVIDAD SEMANAL\n';
    csv += 'Día,Cambios de Estado\n';
    metricas.actividadSemanal.forEach(item => {
      csv += `${item.name},${item.actividad}\n`;
    });

    // Agregar BOM UTF-8 para que Excel reconozca las tildes correctamente
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kpis_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarJSON = () => {
    if (!metricas) return;

    const dataExport = {
      fecha_generacion: new Date().toISOString(),
      metricas: metricas
    };

    const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kpis_dashboard_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="subtitle">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="subtitle" style={{color: 'red'}}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!metricas) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Bienvenido a tu panel de control</p>
          </div>
          <div className="export-buttons">
            <button onClick={exportarCSV} className="btn-export" title="Exportar a CSV">
              📊 Exportar CSV
            </button>
            <button onClick={exportarJSON} className="btn-export" title="Exportar a JSON">
              📄 Exportar JSON
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-label">Órdenes Activas</p>
            <h3 className="stat-value">{metricas.totales.ordenesActivas.toLocaleString()}</h3>
            <span className={`stat-change ${parseFloat(metricas.cambios.ordenesActivas) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(metricas.cambios.ordenesActivas) >= 0 ? '+' : ''}{metricas.cambios.ordenesActivas}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Clientes</p>
            <h3 className="stat-value">{metricas.totales.clientes.toLocaleString()}</h3>
            <span className={`stat-change ${parseFloat(metricas.cambios.clientes) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(metricas.cambios.clientes) >= 0 ? '+' : ''}{metricas.cambios.clientes}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <p className="stat-label">Productos Registrados</p>
            <h3 className="stat-value">{metricas.totales.productos.toLocaleString()}</h3>
            <span className="stat-change neutral">
              {metricas.totales.ordenes} órdenes totales
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Órdenes Cerradas</p>
            <h3 className="stat-value">{metricas.totales.ordenesCerradas.toLocaleString()}</h3>
            <span className="stat-change neutral">
              Este mes
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Órdenes Creadas por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricas.ordenesPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="ordenes" stroke="#667eea" strokeWidth={2} name="Órdenes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Actividad Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricas.actividadSemanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="actividad" fill="#667eea" radius={[8, 8, 0, 0]} name="Cambios de Estado" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {metricas.distribucionPorEstado.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Distribución por Estado</h3>
            <div className="estados-list">
              {metricas.distribucionPorEstado.map((item, index) => (
                <div key={index} className="estado-item">
                  <div className="estado-info">
                    <span className="estado-nombre">{item.estado}</span>
                    <span className="estado-cantidad">{item.cantidad}</span>
                  </div>
                  <div className="estado-bar">
                    <div 
                      className="estado-bar-fill" 
                      style={{ 
                        width: `${(item.cantidad / metricas.totales.ordenesActivas) * 100}%`,
                        backgroundColor: '#667eea'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

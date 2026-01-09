import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { apiUrl } from '../config/api';
import './Dashboard.css';

const Dashboard = () => {
  const [metricas, setMetricas] = useState(null);
  const [tiempoPromedio, setTiempoPromedio] = useState(null);
  const [satisfaccion, setSatisfaccion] = useState(null);
  const [flujos, setFlujos] = useState([]);
  const [flujoSeleccionado, setFlujoSeleccionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarKPIs();
  }, [flujoSeleccionado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [metricasRes, flujosRes] = await Promise.all([
        fetch(apiUrl('/api/ordenes/dashboard/metrics')),
        fetch(apiUrl('/api/flujos'))
      ]);
      
      if (!metricasRes.ok || !flujosRes.ok) {
        throw new Error('Error al cargar los datos del dashboard');
      }

      const metricasData = await metricasRes.json();
      const flujosData = await flujosRes.json();
      
      if (metricasData.success) {
        setMetricas(metricasData.data);
      }
      
      if (flujosData.success) {
        setFlujos(flujosData.data);
      }

      // Cargar KPIs generales (sin filtro)
      await cargarKPIs();
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarKPIs = async () => {
    try {
      const filtro = flujoSeleccionado ? `?id_flujo=${flujoSeleccionado}` : '';
      
      const [tiempoRes, satisfaccionRes] = await Promise.all([
        fetch(apiUrl(`/api/ordenes/kpis/tiempo-promedio${filtro}`)),
        fetch(apiUrl(`/api/ordenes/kpis/satisfaccion${filtro}`))
      ]);

      if (tiempoRes.ok) {
        const tiempoData = await tiempoRes.json();
        if (tiempoData.success) {
          setTiempoPromedio(tiempoData.data);
        }
      }

      if (satisfaccionRes.ok) {
        const satisfaccionData = await satisfaccionRes.json();
        if (satisfaccionData.success) {
          setSatisfaccion(satisfaccionData.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar KPIs:', err);
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
    csv += '\n';

    // Agregar KPIs si están disponibles
    if (tiempoPromedio && tiempoPromedio.total_ordenes > 0) {
      csv += 'TIEMPO PROMEDIO DE FINALIZACIÓN\n';
      csv += `Promedio General (días),${tiempoPromedio.promedio_general_dias}\n`;
      csv += `Promedio General (horas),${tiempoPromedio.promedio_general_horas.toFixed(2)}\n`;
      csv += `Total Órdenes,${tiempoPromedio.total_ordenes}\n\n`;
      csv += 'Por Flujo\n';
      csv += 'Flujo,Promedio (días),Órdenes\n';
      tiempoPromedio.por_flujo.forEach(f => {
        csv += `${f.nombre_flujo},${f.promedio_dias},${f.total_ordenes}\n`;
      });
      csv += '\n';
    }

    if (satisfaccion && satisfaccion.total_encuestas > 0) {
      csv += 'SATISFACCIÓN DEL CLIENTE\n';
      csv += `Satisfacción General,${satisfaccion.promedios_generales.satisfaccion_general}\n`;
      csv += `Satisfacción Servicio,${satisfaccion.promedios_generales.satisfaccion_servicio}\n`;
      csv += `Satisfacción Tiempo,${satisfaccion.promedios_generales.satisfaccion_tiempo}\n`;
      csv += `Total Encuestas,${satisfaccion.total_encuestas}\n\n`;
      csv += 'Por Flujo\n';
      csv += 'Flujo,General,Servicio,Tiempo,Encuestas\n';
      satisfaccion.por_flujo.forEach(f => {
        csv += `${f.nombre_flujo},${f.promedios.satisfaccion_general},${f.promedios.satisfaccion_servicio},${f.promedios.satisfaccion_tiempo},${f.total_encuestas}\n`;
      });
      csv += '\n';
    }

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
      metricas: metricas,
      kpis: {
        tiempo_promedio: tiempoPromedio,
        satisfaccion: satisfaccion
      },
      filtro_aplicado: flujoSeleccionado ? 
        flujos.find(f => f.id_flujo === parseInt(flujoSeleccionado))?.nombre_flujo : 
        'Todos los flujos'
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
          <div className="header-actions">
            <select 
              value={flujoSeleccionado} 
              onChange={(e) => setFlujoSeleccionado(e.target.value)}
              className="flujo-filter"
            >
              <option value="">Todos los flujos</option>
              {flujos.map(flujo => (
                <option key={flujo.id_flujo} value={flujo.id_flujo}>
                  {flujo.nombre_flujo}
                </option>
              ))}
            </select>
            <div className="export-buttons">
              <button onClick={exportarCSV} className="btn-export" title="Exportar a CSV">
                <span className="material-icons">bar_chart</span> Exportar CSV
              </button>
              <button onClick={exportarJSON} className="btn-export" title="Exportar a JSON">
                <span className="material-icons">description</span> Exportar JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">inventory</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Órdenes Activas</p>
            <h3 className="stat-value">{metricas.totales.ordenesActivas.toLocaleString()}</h3>
            <span className={`stat-change ${parseFloat(metricas.cambios.ordenesActivas) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(metricas.cambios.ordenesActivas) >= 0 ? '+' : ''}{metricas.cambios.ordenesActivas}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">group</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Clientes</p>
            <h3 className="stat-value">{metricas.totales.clientes.toLocaleString()}</h3>
            <span className={`stat-change ${parseFloat(metricas.cambios.clientes) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(metricas.cambios.clientes) >= 0 ? '+' : ''}{metricas.cambios.clientes}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">business</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Productos Registrados</p>
            <h3 className="stat-value">{metricas.totales.productos.toLocaleString()}</h3>
            <span className="stat-change neutral">
              {metricas.totales.ordenes} órdenes totales
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">check_circle</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Órdenes Cerradas</p>
            <h3 className="stat-value">{metricas.totales.ordenesCerradas.toLocaleString()}</h3>
            <span className="stat-change neutral">
              Este mes
            </span>
          </div>
        </div>
      </div>

      {/* Nuevas KPIs */}
      <div className="kpis-section">
        <h2 className="section-title">KPIs de Rendimiento</h2>
        
        <div className="kpis-grid">
          {/* Tiempo Promedio de Finalización */}
          <div className="kpi-card">
            <h3>
              <span className="material-icons">timer</span> Tiempo Promedio de Finalización
            </h3>
            {tiempoPromedio && tiempoPromedio.total_ordenes > 0 ? (
              <>
                <div className="kpi-summary">
                  <div className="kpi-main">
                    <span className="kpi-value">{tiempoPromedio.promedio_general_dias}</span>
                    <span className="kpi-unit">días</span>
                  </div>
                  <div className="kpi-secondary">
                    <span>{tiempoPromedio.promedio_general_horas.toFixed(1)} horas</span>
                  </div>
                  <div className="kpi-meta">
                    {tiempoPromedio.total_ordenes} órdenes cerradas
                  </div>
                </div>
                
                {tiempoPromedio.por_flujo.length > 1 && (
                  <div className="kpi-breakdown">
                    <h4>Por Flujo</h4>
                    {tiempoPromedio.por_flujo.map((flujo, index) => (
                      <div key={index} className="breakdown-item">
                        <span className="breakdown-label">{flujo.nombre_flujo}</span>
                        <span className="breakdown-value">
                          {flujo.promedio_dias} días
                          <small> ({flujo.total_ordenes} órdenes)</small>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="kpi-empty">
                <p>
                  <span className="material-icons">mail</span> No hay órdenes cerradas {flujoSeleccionado ? 'para el flujo seleccionado' : 'disponibles'}
                </p>
                <small>Las estadísticas aparecerán cuando haya órdenes finalizadas</small>
              </div>
            )}
          </div>

          {/* Satisfacción */}
          <div className="kpi-card">
            <h3>
              <span className="material-icons">star</span> Satisfacción del Cliente
            </h3>
            {satisfaccion && satisfaccion.total_encuestas > 0 ? (
              <>
                <div className="kpi-summary">
                  <div className="satisfaction-scores">
                    <div className="score-item">
                      <span className="score-label">General</span>
                      <span className="score-value">{satisfaccion.promedios_generales.satisfaccion_general}/5</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${(satisfaccion.promedios_generales.satisfaccion_general / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Servicio</span>
                      <span className="score-value">{satisfaccion.promedios_generales.satisfaccion_servicio}/5</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${(satisfaccion.promedios_generales.satisfaccion_servicio / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Tiempo</span>
                      <span className="score-value">{satisfaccion.promedios_generales.satisfaccion_tiempo}/5</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${(satisfaccion.promedios_generales.satisfaccion_tiempo / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="kpi-meta">
                    {satisfaccion.total_encuestas} encuestas respondidas
                  </div>
                </div>

                {satisfaccion.por_flujo.length > 1 && (
                  <div className="kpi-breakdown">
                    <h4>Por Flujo</h4>
                    {satisfaccion.por_flujo.map((flujo, index) => (
                      <div key={index} className="breakdown-item">
                        <span className="breakdown-label">{flujo.nombre_flujo}</span>
                        <span className="breakdown-value">
                          {flujo.promedios.satisfaccion_general}/5
                          <small> ({flujo.total_encuestas} encuestas)</small>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="kpi-empty">
                <p>
                  <span className="material-icons">mail</span> No hay encuestas respondidas {flujoSeleccionado ? 'para el flujo seleccionado' : 'disponibles'}
                </p>
                <small>Las estadísticas aparecerán cuando los clientes completen encuestas</small>
              </div>
            )}
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

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  // Datos de ejemplo para las gráficas
  const salesData = [
    { name: 'Ene', ventas: 4000, usuarios: 2400 },
    { name: 'Feb', ventas: 3000, usuarios: 1398 },
    { name: 'Mar', ventas: 2000, usuarios: 9800 },
    { name: 'Abr', ventas: 2780, usuarios: 3908 },
    { name: 'May', ventas: 1890, usuarios: 4800 },
    { name: 'Jun', ventas: 2390, usuarios: 3800 },
    { name: 'Jul', ventas: 3490, usuarios: 4300 },
  ];

  const activityData = [
    { name: 'Lun', actividad: 65 },
    { name: 'Mar', actividad: 59 },
    { name: 'Mié', actividad: 80 },
    { name: 'Jue', actividad: 81 },
    { name: 'Vie', actividad: 56 },
    { name: 'Sáb', actividad: 55 },
    { name: 'Dom', actividad: 40 },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Bienvenido a tu panel de control</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Usuarios Totales</p>
            <h3 className="stat-value">24,586</h3>
            <span className="stat-change positive">+12.5%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Ingresos</p>
            <h3 className="stat-value">$18,245</h3>
            <span className="stat-change positive">+8.2%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-label">Productos</p>
            <h3 className="stat-value">1,423</h3>
            <span className="stat-change negative">-3.1%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Calificación</p>
            <h3 className="stat-value">4.8</h3>
            <span className="stat-change positive">+0.3</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Ventas y Usuarios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
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
              <Line type="monotone" dataKey="ventas" stroke="#667eea" strokeWidth={2} />
              <Line type="monotone" dataKey="usuarios" stroke="#764ba2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Actividad Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
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
              <Bar dataKey="actividad" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import './Dashboard.css';

const Flujos = () => {
  const [flujos, setFlujos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedFlujo, setSelectedFlujo] = useState(null);
  const [formData, setFormData] = useState({
    nombre_flujo: '',
    descripcion_flujo: '',
    activo: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchFlujos();
  }, []);

  const fetchFlujos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/flujos');
      
      if (!response.ok) {
        throw new Error('Error al cargar los flujos');
      }
      
      const data = await response.json();
      setFlujos(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalMode('create');
    setSelectedFlujo(null);
    setShowModal(true);
    setFormError(null);
  };

  const handleViewFlujo = (flujo) => {
    setModalMode('view');
    setSelectedFlujo(flujo);
    setFormData({
      nombre_flujo: flujo.nombre_flujo || '',
      descripcion_flujo: flujo.descripcion_flujo || '',
      activo: flujo.activo
    });
    setShowModal(true);
    setFormError(null);
  };

  const handleEditFlujo = (flujo) => {
    setModalMode('edit');
    setSelectedFlujo(flujo);
    setFormData({
      nombre_flujo: flujo.nombre_flujo || '',
      descripcion_flujo: flujo.descripcion_flujo || '',
      activo: flujo.activo
    });
    setShowModal(true);
    setFormError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('create');
    setSelectedFlujo(null);
    setFormData({
      nombre_flujo: '',
      descripcion_flujo: '',
      activo: true
    });
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let response;
      
      if (modalMode === 'edit') {
        response = await fetch(`http://localhost:3000/api/flujos/${selectedFlujo.id_flujo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch('http://localhost:3000/api/flujos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${modalMode === 'edit' ? 'actualizar' : 'crear'} el flujo`);
      }

      await fetchFlujos();
      handleCloseModal();
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este flujo?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/flujos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el flujo');
      }

      await fetchFlujos();
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Flujos</h1>
          <p className="subtitle">Cargando flujos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Flujos</h1>
          <p className="subtitle" style={{color: '#ef4444'}}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Flujos</h1>
            <p className="subtitle">Gestión de flujos de trabajo</p>
          </div>
          <button className="btn-add" onClick={handleOpenModal}>
            <span className="btn-icon">+</span>
            Agregar Flujo
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌊</div>
          <div className="stat-content">
            <p className="stat-label">Total Flujos</p>
            <h3 className="stat-value">{flujos.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Flujos Activos</p>
            <h3 className="stat-value">{flujos.filter(f => f.activo).length}</h3>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card full-width">
          <h3>Lista de Flujos</h3>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {flujos.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>
                      No hay flujos registrados
                    </td>
                  </tr>
                ) : (
                  flujos.map((flujo) => (
                    <tr key={flujo.id_flujo}>
                      <td>#{flujo.id_flujo}</td>
                      <td>{flujo.nombre_flujo}</td>
                      <td>{flujo.descripcion_flujo || 'Sin descripción'}</td>
                      <td>
                        <span className={`badge ${flujo.activo ? 'badge-success' : 'badge-danger'}`}>
                          {flujo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-sm btn-primary" onClick={() => handleViewFlujo(flujo)}>Ver</button>
                        <button className="btn-sm btn-secondary" onClick={() => handleEditFlujo(flujo)}>Editar</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(flujo.id_flujo)}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Agregar Nuevo Flujo'}
                {modalMode === 'view' && 'Detalles del Flujo'}
                {modalMode === 'edit' && 'Editar Flujo'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="nombre_flujo">Nombre del Flujo *</label>
                <input
                  type="text"
                  id="nombre_flujo"
                  name="nombre_flujo"
                  value={formData.nombre_flujo}
                  onChange={handleInputChange}
                  required={modalMode !== 'view'}
                  disabled={modalMode === 'view'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion_flujo">Descripción</label>
                <textarea
                  id="descripcion_flujo"
                  name="descripcion_flujo"
                  value={formData.descripcion_flujo}
                  onChange={handleInputChange}
                  rows="4"
                  disabled={modalMode === 'view'}
                  placeholder="Descripción del flujo de trabajo..."
                />
              </div>

              <div className="form-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: modalMode === 'view' ? 'default' : 'pointer'}}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    style={{cursor: modalMode === 'view' ? 'default' : 'pointer'}}
                  />
                  <span>Flujo activo</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className="btn-submit" disabled={formLoading}>
                    {formLoading 
                      ? (modalMode === 'edit' ? 'Actualizando...' : 'Creando...') 
                      : (modalMode === 'edit' ? 'Actualizar Flujo' : 'Crear Flujo')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flujos;

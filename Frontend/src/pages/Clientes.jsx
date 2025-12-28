import { useState, useEffect } from 'react';
import './Dashboard.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    tipo_identificacion: '',
    numero_identificacion: '',
    nombre_completo: '',
    telefono_contacto: '',
    correo_electronico: '',
    tipo_direccion: '',
    direccion: '',
    notas_cliente: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/clientes');
      
      if (!response.ok) {
        throw new Error('Error al cargar los clientes');
      }
      
      const data = await response.json();
      setClientes(data.data || []);
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
    setSelectedCliente(null);
    setShowModal(true);
    setFormError(null);
  };

  const handleViewCliente = (cliente) => {
    setModalMode('view');
    setSelectedCliente(cliente);
    setFormData({
      tipo_identificacion: cliente.tipo_identificacion || '',
      numero_identificacion: cliente.numero_identificacion || '',
      nombre_completo: cliente.nombre_completo || '',
      telefono_contacto: cliente.telefono_contacto || '',
      correo_electronico: cliente.correo_electronico || '',
      tipo_direccion: cliente.tipo_direccion || '',
      direccion: cliente.direccion || '',
      notas_cliente: cliente.notas_cliente || ''
    });
    setShowModal(true);
    setFormError(null);
  };

  const handleEditCliente = (cliente) => {
    setModalMode('edit');
    setSelectedCliente(cliente);
    setFormData({
      tipo_identificacion: cliente.tipo_identificacion || '',
      numero_identificacion: cliente.numero_identificacion || '',
      nombre_completo: cliente.nombre_completo || '',
      telefono_contacto: cliente.telefono_contacto || '',
      correo_electronico: cliente.correo_electronico || '',
      tipo_direccion: cliente.tipo_direccion || '',
      direccion: cliente.direccion || '',
      notas_cliente: cliente.notas_cliente || ''
    });
    setShowModal(true);
    setFormError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('create');
    setSelectedCliente(null);
    setFormData({
      tipo_identificacion: '',
      numero_identificacion: '',
      nombre_completo: '',
      telefono_contacto: '',
      correo_electronico: '',
      tipo_direccion: '',
      direccion: '',
      notas_cliente: ''
    });
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let response;
      
      if (modalMode === 'edit') {
        response = await fetch(`http://localhost:3000/api/clientes/${selectedCliente.id_cliente}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch('http://localhost:3000/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${modalMode === 'edit' ? 'actualizar' : 'crear'} el cliente`);
      }

      await fetchClientes();
      handleCloseModal();
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el cliente');
      }

      await fetchClientes();
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Clientes</h1>
          <p className="subtitle">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Clientes</h1>
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
            <h1>Clientes</h1>
            <p className="subtitle">Gestión de clientes del sistema</p>
          </div>
          <button className="btn-add" onClick={handleOpenModal}>
            <span className="btn-icon">+</span>
            Agregar Cliente
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Clientes</p>
            <h3 className="stat-value">{clientes.length}</h3>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card full-width">
          <h3>Lista de Clientes</h3>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Identificación</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td>#{cliente.id_cliente}</td>
                      <td>{cliente.nombre_completo}</td>
                      <td>{cliente.tipo_identificacion} - {cliente.numero_identificacion}</td>
                      <td>{cliente.correo_electronico}</td>
                      <td>{cliente.telefono_contacto}</td>
                      <td>
                        <button className="btn-sm btn-primary" onClick={() => handleViewCliente(cliente)}>Ver</button>
                        <button className="btn-sm btn-secondary" onClick={() => handleEditCliente(cliente)}>Editar</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(cliente.id_cliente)}>Eliminar</button>
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
                {modalMode === 'create' && 'Agregar Nuevo Cliente'}
                {modalMode === 'view' && 'Detalles del Cliente'}
                {modalMode === 'edit' && 'Editar Cliente'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo_identificacion">Tipo de Identificación *</label>
                  <select
                    id="tipo_identificacion"
                    name="tipo_identificacion"
                    value={formData.tipo_identificacion}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Seleccione</option>
                    <option value="CC">CC - Cédula de Ciudadanía</option>
                    <option value="CE">CE - Cédula de Extranjería</option>
                    <option value="NIT">NIT - Número de Identificación Tributaria</option>
                    <option value="TI">TI - Tarjeta de Identidad</option>
                    <option value="PP">PP - Pasaporte</option>
                    <option value="PEP">PEP - Permiso Especial de Permanencia</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="numero_identificacion">Número de Identificación *</label>
                  <input
                    type="text"
                    id="numero_identificacion"
                    name="numero_identificacion"
                    value={formData.numero_identificacion}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nombre_completo">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  required={modalMode !== 'view'}
                  disabled={modalMode === 'view'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="correo_electronico">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="correo_electronico"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono_contacto">Teléfono *</label>
                  <input
                    type="text"
                    id="telefono_contacto"
                    name="telefono_contacto"
                    value={formData.telefono_contacto}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo_direccion">Tipo de Dirección</label>
                  <input
                    type="text"
                    id="tipo_direccion"
                    name="tipo_direccion"
                    value={formData.tipo_direccion}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Casa, Oficina, etc."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notas_cliente">Notas</label>
                <textarea
                  id="notas_cliente"
                  name="notas_cliente"
                  value={formData.notas_cliente}
                  onChange={handleInputChange}
                  rows="3"
                  disabled={modalMode === 'view'}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className="btn-submit" disabled={formLoading}>
                    {formLoading 
                      ? (modalMode === 'edit' ? 'Actualizando...' : 'Creando...') 
                      : (modalMode === 'edit' ? 'Actualizar Cliente' : 'Crear Cliente')}
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

export default Clientes;

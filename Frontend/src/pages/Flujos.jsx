import { useState, useEffect } from 'react';
import './Dashboard.css';
import { apiUrl } from '../config/api';


const Flujos = () => {
  const [flujos, setFlujos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedFlujo, setSelectedFlujo] = useState(null);
  const [expandedFlujo, setExpandedFlujo] = useState(null);
  const [estadosFlujo, setEstadosFlujo] = useState([]);
  const [formData, setFormData] = useState({
    nombre_flujo: '',
    descripcion_flujo: '',
    activo: true
  });
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState({
    nombre_estado: '',
    descripcion_estado: ''
  });
  const [estadoModalLoading, setEstadoModalLoading] = useState(false);
  const [estadoModalError, setEstadoModalError] = useState(null);

  useEffect(() => {
    fetchFlujos();
    fetchEstados();
  }, []);

  const fetchFlujos = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/flujos'));
      
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

  const fetchEstados = async () => {
    try {
      const response = await fetch(apiUrl('/api/estados'));
      const data = await response.json();
      setEstados(data.data || []);
    } catch (err) {
      console.error('Error al cargar estados:', err);
    }
  };

  const fetchEstadosFlujo = async (idFlujo) => {
    try {
      const response = await fetch(apiUrl(`/api/flujos/${idFlujo}/estados`));
      const data = await response.json();
      setEstadosFlujo(data.data || []);
    } catch (err) {
      console.error('Error al cargar estados del flujo:', err);
    }
  };

  const toggleExpandFlujo = async (flujo) => {
    if (expandedFlujo === flujo.id_flujo) {
      setExpandedFlujo(null);
      setEstadosFlujo([]);
    } else {
      setExpandedFlujo(flujo.id_flujo);
      await fetchEstadosFlujo(flujo.id_flujo);
    }
  };

  const handleOpenModal = () => {
    setModalMode('create');
    setSelectedFlujo(null);
    setEstadosSeleccionados([]);
    setShowModal(true);
    setFormError(null);
  };

  const handleViewFlujo = async (flujo) => {
    setModalMode('view');
    setSelectedFlujo(flujo);
    setFormData({
      nombre_flujo: flujo.nombre_flujo || '',
      descripcion_flujo: flujo.descripcion_flujo || '',
      activo: flujo.activo
    });
    // Cargar estados del flujo
    const response = await fetch(apiUrl(`/api/flujos/${flujo.id_flujo}/estados`));
    const data = await response.json();
    // Mapear los estados con su información completa
    const estadosMapeados = (data.data || []).map(ef => ({
      id_estado: ef.id_estado,
      posicion: ef.posicion,
      obligatorio: ef.obligatorio,
      nombre_estado: ef.estado?.nombre_estado || ef.estados?.nombre_estado,
      estado: ef.estado,
      estados: ef.estados
    }));
    setEstadosSeleccionados(estadosMapeados);
    setShowModal(true);
    setFormError(null);
  };

  const handleEditFlujo = async (flujo) => {
    setModalMode('edit');
    setSelectedFlujo(flujo);
    setFormData({
      nombre_flujo: flujo.nombre_flujo || '',
      descripcion_flujo: flujo.descripcion_flujo || '',
      activo: flujo.activo
    });
    // Cargar estados del flujo
    const response = await fetch(apiUrl(`/api/flujos/${flujo.id_flujo}/estados`));
    const data = await response.json();
    // Mapear los estados con su información completa
    const estadosMapeados = (data.data || []).map(ef => ({
      id_estado: ef.id_estado,
      posicion: ef.posicion,
      obligatorio: ef.obligatorio,
      nombre_estado: ef.estado?.nombre_estado || ef.estados?.nombre_estado,
      estado: ef.estado,
      estados: ef.estados
    }));
    setEstadosSeleccionados(estadosMapeados);
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
    setEstadosSeleccionados([]);
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
        // Actualizar flujo
        response = await fetch(`http://localhost:3000/api/flujos/${selectedFlujo.id_flujo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error al actualizar el flujo');
        }

        // Actualizar estados del flujo
        const estadosPayload = estadosSeleccionados.map((est, index) => ({
          id_estado: est.id_estado,
          posicion: index + 1,
          obligatorio: est.obligatorio !== false
        }));

        const estadosResponse = await fetch(`http://localhost:3000/api/flujos/${selectedFlujo.id_flujo}/estados`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estados: estadosPayload })
        });

        if (!estadosResponse.ok) {
          const data = await estadosResponse.json();
          throw new Error(data.message || 'Error al actualizar los estados del flujo');
        }
      } else {
        // Crear flujo
        response = await fetch('http://localhost:3000/api/flujos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al crear el flujo');
        }

        // Si hay estados seleccionados, configurarlos
        if (estadosSeleccionados.length > 0) {
          const estadosPayload = estadosSeleccionados.map((est, index) => ({
            id_estado: est.id_estado,
            posicion: index + 1,
            obligatorio: est.obligatorio !== false
          }));

          const estadosResponse = await fetch(`http://localhost:3000/api/flujos/${data.data.id_flujo}/estados`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estados: estadosPayload })
          });

          if (!estadosResponse.ok) {
            const estadosData = await estadosResponse.json();
            throw new Error(estadosData.message || 'Error al configurar los estados del flujo');
          }
        }
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

  const handleAgregarEstado = () => {
    if (estados.length === 0) return;
    
    // Agregar el primer estado disponible que no esté ya en la lista
    const estadoDisponible = estados.find(e => 
      !estadosSeleccionados.some(es => es.id_estado === e.id_estado)
    );
    
    if (estadoDisponible) {
      setEstadosSeleccionados([...estadosSeleccionados, {
        id_estado: estadoDisponible.id_estado,
        nombre_estado: estadoDisponible.nombre_estado,
        posicion: estadosSeleccionados.length + 1,
        obligatorio: true
      }]);
    }
  };

  const handleRemoverEstado = (index) => {
    const nuevosEstados = estadosSeleccionados.filter((_, i) => i !== index);
    setEstadosSeleccionados(nuevosEstados);
  };

  const handleCambiarEstado = (index, nuevoIdEstado) => {
    const estadoSeleccionado = estados.find(e => e.id_estado === parseInt(nuevoIdEstado));
    if (estadoSeleccionado) {
      const nuevosEstados = [...estadosSeleccionados];
      nuevosEstados[index] = {
        ...nuevosEstados[index],
        id_estado: estadoSeleccionado.id_estado,
        nombre_estado: estadoSeleccionado.nombre_estado
      };
      setEstadosSeleccionados(nuevosEstados);
    }
  };

  const handleMoverEstado = (index, direccion) => {
    if (
      (direccion === 'arriba' && index === 0) ||
      (direccion === 'abajo' && index === estadosSeleccionados.length - 1)
    ) {
      return;
    }

    const nuevosEstados = [...estadosSeleccionados];
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    
    [nuevosEstados[index], nuevosEstados[nuevoIndex]] = [nuevosEstados[nuevoIndex], nuevosEstados[index]];
    
    setEstadosSeleccionados(nuevosEstados);
  };

  const handleToggleObligatorio = (index) => {
    const nuevosEstados = [...estadosSeleccionados];
    nuevosEstados[index].obligatorio = !nuevosEstados[index].obligatorio;
    setEstadosSeleccionados(nuevosEstados);
  };

  const handleOpenEstadoModal = () => {
    setNuevoEstado({
      nombre_estado: '',
      descripcion_estado: ''
    });
    setEstadoModalError(null);
    setShowEstadoModal(true);
  };

  const handleCloseEstadoModal = () => {
    setShowEstadoModal(false);
    setNuevoEstado({
      nombre_estado: '',
      descripcion_estado: ''
    });
    setEstadoModalError(null);
  };

  const handleEstadoInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoEstado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCrearEstado = async (e) => {
    e.preventDefault();
    setEstadoModalLoading(true);
    setEstadoModalError(null);

    try {
      const response = await fetch('http://localhost:3000/api/estados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoEstado)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el estado');
      }

      // Recargar estados
      await fetchEstados();

      // Agregar el nuevo estado a la lista de seleccionados
      setEstadosSeleccionados([...estadosSeleccionados, {
        id_estado: data.data.id_estado,
        nombre_estado: data.data.nombre_estado,
        posicion: estadosSeleccionados.length + 1,
        obligatorio: true
      }]);

      handleCloseEstadoModal();
    } catch (err) {
      console.error('Error:', err);
      setEstadoModalError(err.message);
    } finally {
      setEstadoModalLoading(false);
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
                  <th style={{width: '50px'}}></th>
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
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                      No hay flujos registrados
                    </td>
                  </tr>
                ) : (
                  flujos.map((flujo) => (
                    <>
                      <tr key={flujo.id_flujo}>
                        <td>
                          <button 
                            onClick={() => toggleExpandFlujo(flujo)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '0.25rem',
                              transition: 'transform 0.2s'
                            }}
                          >
                            {expandedFlujo === flujo.id_flujo ? '▼' : '▶'}
                          </button>
                        </td>
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
                      {expandedFlujo === flujo.id_flujo && (
                        <tr>
                          <td colSpan="6" style={{padding: '0', background: '#f9fafb'}}>
                            <div style={{padding: '1rem 2rem'}}>
                              <h4 style={{marginBottom: '1rem', color: '#374151'}}>Estados del Flujo (en orden)</h4>
                              {estadosFlujo.length === 0 ? (
                                <p style={{color: '#6b7280', fontStyle: 'italic'}}>Este flujo no tiene estados configurados</p>
                              ) : (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                  {estadosFlujo.map((ef, idx) => (
                                    <div 
                                      key={`${ef.id_estado}-${ef.posicion}`}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem 1rem',
                                        background: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb'
                                      }}
                                    >
                                      <span style={{
                                        fontWeight: 'bold',
                                        color: '#6366f1',
                                        minWidth: '30px'
                                      }}>
                                        {ef.posicion}.
                                      </span>
                                      <span style={{flex: 1, fontWeight: '500'}}>
                                        {ef.estado?.nombre_estado || ef.estados?.nombre_estado || ef.nombre_estado || 'Estado desconocido'}
                                      </span>
                                      <span className={`badge ${ef.obligatorio ? 'badge-warning' : 'badge-info'}`}>
                                        {ef.obligatorio ? 'Obligatorio' : 'Opcional'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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

              <div className="form-group" style={{marginTop: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                  <label style={{marginBottom: 0}}>Estados del Flujo (en orden)</label>
                  {modalMode !== 'view' && (
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        type="button" 
                        className="btn-sm btn-secondary"
                        onClick={handleOpenEstadoModal}
                      >
                        ⊕ Crear Estado
                      </button>
                      <button 
                        type="button" 
                        className="btn-sm btn-primary"
                        onClick={handleAgregarEstado}
                        disabled={estadosSeleccionados.length >= estados.length}
                      >
                        + Agregar Estado
                      </button>
                    </div>
                  )}
                </div>
                
                {estadosSeleccionados.length === 0 ? (
                  <p style={{color: '#6b7280', fontStyle: 'italic', fontSize: '0.9rem'}}>
                    {modalMode === 'view' ? 'Este flujo no tiene estados configurados' : 'Agregue estados al flujo'}
                  </p>
                ) : (
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {estadosSeleccionados.map((estado, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          background: index % 2 === 0 ? 'white' : '#f9fafb',
                          borderBottom: index < estadosSeleccionados.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}
                      >
                        <span style={{
                          fontWeight: 'bold',
                          color: '#6366f1',
                          minWidth: '30px',
                          fontSize: '0.9rem'
                        }}>
                          {index + 1}.
                        </span>
                        
                        {modalMode === 'view' ? (
                          <span style={{flex: 1, fontWeight: '500'}}>
                            {estado.estado?.nombre_estado || estado.estados?.nombre_estado || estado.nombre_estado}
                          </span>
                        ) : (
                          <select
                            value={estado.id_estado}
                            onChange={(e) => handleCambiarEstado(index, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.9rem'
                            }}
                          >
                            {estados.map(e => (
                              <option key={e.id_estado} value={e.id_estado}>
                                {e.nombre_estado}
                              </option>
                            ))}
                          </select>
                        )}

                        {modalMode === 'view' ? (
                          <span className={`badge ${estado.obligatorio ? 'badge-warning' : 'badge-info'}`}>
                            {estado.obligatorio ? 'Obligatorio' : 'Opcional'}
                          </span>
                        ) : (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}>
                            <input
                              type="checkbox"
                              checked={estado.obligatorio}
                              onChange={() => handleToggleObligatorio(index)}
                              style={{cursor: 'pointer'}}
                            />
                            Obligatorio
                          </label>
                        )}
                        
                        {modalMode !== 'view' && (
                          <div style={{display: 'flex', gap: '0.25rem'}}>
                            <button
                              type="button"
                              onClick={() => handleMoverEstado(index, 'arriba')}
                              disabled={index === 0}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid #d1d5db',
                                background: 'white',
                                borderRadius: '4px',
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                opacity: index === 0 ? 0.5 : 1
                              }}
                              title="Mover arriba"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoverEstado(index, 'abajo')}
                              disabled={index === estadosSeleccionados.length - 1}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid #d1d5db',
                                background: 'white',
                                borderRadius: '4px',
                                cursor: index === estadosSeleccionados.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: index === estadosSeleccionados.length - 1 ? 0.5 : 1
                              }}
                              title="Mover abajo"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoverEstado(index)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid #ef4444',
                                background: 'white',
                                color: '#ef4444',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

      {showEstadoModal && (
        <div className="modal-overlay" onClick={handleCloseEstadoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h2>Crear Nuevo Estado</h2>
              <button className="modal-close" onClick={handleCloseEstadoModal}>&times;</button>
            </div>
            
            <form onSubmit={handleCrearEstado} className="modal-form">
              {estadoModalError && (
                <div className="form-error">
                  {estadoModalError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="nombre_estado">Nombre del Estado *</label>
                <input
                  type="text"
                  id="nombre_estado"
                  name="nombre_estado"
                  value={nuevoEstado.nombre_estado}
                  onChange={handleEstadoInputChange}
                  required
                  placeholder="Ej: En revisión, Aprobado, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion_estado">Descripción</label>
                <textarea
                  id="descripcion_estado"
                  name="descripcion_estado"
                  value={nuevoEstado.descripcion_estado}
                  onChange={handleEstadoInputChange}
                  rows="3"
                  placeholder="Descripción del estado..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEstadoModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={estadoModalLoading}>
                  {estadoModalLoading ? 'Creando...' : 'Crear Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flujos;

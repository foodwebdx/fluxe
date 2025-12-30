import { useState, useEffect } from 'react';
import './Dashboard.css';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'view', 'edit'
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [flujos, setFlujos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_producto: '',
    id_flujo: '',
    id_estado_actual: '',
    descripcion_servicio: '',
    condiciones_pago: '',
    fecha_estimada_entrega: '',
    notas_orden: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Estados para evidencia (cambio de estado)
  const [evidenciaComentario, setEvidenciaComentario] = useState('');
  const [evidenciaArchivo, setEvidenciaArchivo] = useState(null);
  const [evidenciaPreview, setEvidenciaPreview] = useState(null);
  
  // Estados para ver evidencias de la orden
  const [evidencias, setEvidencias] = useState([]);
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    cliente: '',
    fecha: ''
  });

  useEffect(() => {
    fetchOrdenes();
    fetchFormData(); // Cargar datos para filtros
  }, []);

  const fetchFormData = async () => {
    try {
      const [clientesRes, productosRes, flujosRes, estadosRes] = await Promise.all([
        fetch('http://localhost:3000/api/clientes'),
        fetch('http://localhost:3000/api/productos'),
        fetch('http://localhost:3000/api/flujos'),
        fetch('http://localhost:3000/api/estados')
      ]);

      const clientesData = await clientesRes.json();
      const productosData = await productosRes.json();
      const flujosData = await flujosRes.json();
      const estadosData = await estadosRes.json();

      setClientes(clientesData.data || []);
      setProductos(productosData.data || []);
      setFlujos(flujosData.data || []);
      setEstados(estadosData.data || []);
    } catch (err) {
      console.error('Error al cargar datos del formulario:', err);
    }
  };

  const handleOpenModal = () => {
    setModalMode('create');
    setSelectedOrden(null);
    setShowModal(true);
    fetchFormData();
    setFormError(null);
  };

  const handleViewOrden = async (orden) => {
    setModalMode('view');
    setSelectedOrden(orden);
    setFormData({
      id_cliente: orden.id_cliente,
      id_producto: orden.id_producto,
      id_flujo: orden.id_flujo,
      id_estado_actual: orden.id_estado_actual,
      descripcion_servicio: orden.descripcion_servicio || '',
      condiciones_pago: orden.condiciones_pago || '',
      fecha_estimada_entrega: orden.fecha_estimada_entrega ? orden.fecha_estimada_entrega.split('T')[0] : '',
      notas_orden: orden.notas_orden || ''
    });
    setShowModal(true);
    fetchFormData();
    setFormError(null);
    
    // Cargar evidencias de la orden
    await fetchEvidencias(orden.id_orden);
  };

  const handleEditOrden = (orden) => {
    setModalMode('edit');
    setSelectedOrden(orden);
    setFormData({
      id_cliente: orden.id_cliente,
      id_producto: orden.id_producto,
      id_flujo: orden.id_flujo,
      id_estado_actual: orden.id_estado_actual,
      descripcion_servicio: orden.descripcion_servicio || '',
      condiciones_pago: orden.condiciones_pago || '',
      fecha_estimada_entrega: orden.fecha_estimada_entrega ? orden.fecha_estimada_entrega.split('T')[0] : '',
      notas_orden: orden.notas_orden || ''
    });
    setShowModal(true);
    fetchFormData();
    setFormError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('create');
    setSelectedOrden(null);
    setFormData({
      id_cliente: '',
      id_producto: '',
      id_flujo: '',
      id_estado_actual: '',
      descripcion_servicio: '',
      condiciones_pago: '',
      fecha_estimada_entrega: '',
      notas_orden: ''
    });
    setFormError(null);
    setEvidenciaComentario('');
    setEvidenciaArchivo(null);
    setEvidenciaPreview(null);
    setEvidencias([]);
  };

  const fetchEvidencias = async (idOrden) => {
    try {
      setLoadingEvidencias(true);
      const response = await fetch(`http://localhost:3000/api/evidencias/orden/${idOrden}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar evidencias');
      }
      
      const data = await response.json();
      setEvidencias(data.data || []);
    } catch (err) {
      console.error('Error al cargar evidencias:', err);
      setEvidencias([]);
    } finally {
      setLoadingEvidencias(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      cliente: '',
      fecha: ''
    });
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenciaArchivo(file);
      
      // Crear preview si es imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvidenciaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setEvidenciaPreview(null);
      }
    }
  };

  const removeArchivo = () => {
    setEvidenciaArchivo(null);
    setEvidenciaPreview(null);
  };

  // Filtrar órdenes según los filtros aplicados
  const ordenesFiltradas = ordenes.filter(orden => {
    let cumpleFiltros = true;

    // Filtro por estado
    if (filtros.estado) {
      cumpleFiltros = cumpleFiltros && orden.id_estado_actual === parseInt(filtros.estado);
    }

    // Filtro por cliente
    if (filtros.cliente) {
      cumpleFiltros = cumpleFiltros && orden.id_cliente === parseInt(filtros.cliente);
    }

    // Filtro por fecha
    if (filtros.fecha) {
      const fechaOrden = new Date(orden.fecha_creacion).toISOString().split('T')[0];
      cumpleFiltros = cumpleFiltros && fechaOrden === filtros.fecha;
    }

    return cumpleFiltros;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let response;
      
      if (modalMode === 'edit') {
        // Actualizar el estado
        response = await fetch(`http://localhost:3000/api/ordenes/${selectedOrden.id_orden}/estado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_estado: parseInt(formData.id_estado_actual)
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al actualizar el estado');
        }

        // Si hay comentario o archivo, crear evidencia
        if (evidenciaComentario || evidenciaArchivo) {
          // Por ahora, crear evidencia con s3_key temporal
          // TODO: Implementar subida real a S3
          const evidenciaData = {
            id_orden: selectedOrden.id_orden,
            id_estado: parseInt(formData.id_estado_actual),
            id_usuario: 1, // TODO: Obtener del usuario logueado
            tipo_evidencia: evidenciaArchivo ? (evidenciaArchivo.type.startsWith('image/') ? 'image' : 'document') : 'other',
            s3_key: evidenciaArchivo ? `evidencias/${selectedOrden.id_orden}/${Date.now()}_${evidenciaArchivo.name}` : 'sin-archivo',
            nombre_archivo_original: evidenciaArchivo ? evidenciaArchivo.name : null,
            comentario: evidenciaComentario || null
          };

          const evidenciaResponse = await fetch('http://localhost:3000/api/evidencias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(evidenciaData)
          });

          if (!evidenciaResponse.ok) {
            const evidenciaError = await evidenciaResponse.json();
            console.warn('Error al guardar evidencia:', evidenciaError.message);
            // No lanzar error, solo advertir
          }
        }
      } else {
        // Crear nueva orden
        response = await fetch('http://localhost:3000/api/ordenes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_cliente: parseInt(formData.id_cliente),
            id_producto: parseInt(formData.id_producto),
            id_flujo: parseInt(formData.id_flujo),
            id_estado_actual: parseInt(formData.id_estado_actual),
            descripcion_servicio: formData.descripcion_servicio,
            condiciones_pago: formData.condiciones_pago || null,
            fecha_estimada_entrega: formData.fecha_estimada_entrega || null,
            notas_orden: formData.notas_orden || null
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al crear la orden');
        }
      }

      // Recargar órdenes y cerrar modal
      await fetchOrdenes();
      handleCloseModal();
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/ordenes');
      
      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }
      
      const data = await response.json();
      setOrdenes(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estadoNombre) => {
    const badges = {
      'Completada': 'badge-success',
      'Completado': 'badge-success',
      'En proceso': 'badge-warning',
      'En Proceso': 'badge-warning',
      'Pendiente': 'badge-info',
      'Cancelada': 'badge-danger',
      'Cancelado': 'badge-danger'
    };
    return badges[estadoNombre] || 'badge-info';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Órdenes</h1>
          <p className="subtitle">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Órdenes</h1>
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
            <h1>Órdenes</h1>
            <p className="subtitle">Gestión de órdenes del sistema</p>
          </div>
          <button className="btn-add" onClick={handleOpenModal}>
            <span className="btn-icon">+</span>
            Agregar Orden
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="filter-estado">📊 Estado</label>
            <select
              id="filter-estado"
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
            >
              <option value="">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado.id_estado} value={estado.id_estado}>
                  {estado.nombre_estado}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-cliente">👥 Cliente</label>
            <select
              id="filter-cliente"
              name="cliente"
              value={filtros.cliente}
              onChange={handleFiltroChange}
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-fecha">📅 Fecha</label>
            <input
              type="date"
              id="filter-fecha"
              name="fecha"
              value={filtros.fecha}
              onChange={handleFiltroChange}
            />
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button className="btn-clear-filters" onClick={limpiarFiltros}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-label">Total Órdenes</p>
            <h3 className="stat-value">{ordenesFiltradas.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Completadas</p>
            <h3 className="stat-value">
              {ordenesFiltradas.filter(o => 
                o.estado_actual?.nombre_estado?.toUpperCase() === 'COMPLETADO'
              ).length}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <p className="stat-label">Pendientes</p>
            <h3 className="stat-value">
              {ordenesFiltradas.filter(o => 
                o.estado_actual?.nombre_estado?.toUpperCase() === 'PENDIENTE'
              ).length}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">En Proceso</p>
            <h3 className="stat-value">
              {ordenesFiltradas.filter(o => {
                const estado = o.estado_actual?.nombre_estado?.toUpperCase();
                return estado && estado !== 'COMPLETADO' && estado !== 'PENDIENTE';
              }).length}
            </h3>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card full-width">
          <h3>Lista de Órdenes</h3>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                      {filtros.estado || filtros.cliente || filtros.fecha 
                        ? 'No hay órdenes que coincidan con los filtros' 
                        : 'No hay órdenes registradas'}
                    </td>
                  </tr>
                ) : (
                  ordenesFiltradas.map((orden) => (
                    <tr key={orden.id_orden}>
                      <td>#{orden.id_orden}</td>
                      <td>{orden.cliente?.nombre_completo || 'Sin cliente'}</td>
                      <td>{orden.producto?.nombre_producto || 'Sin producto'}</td>
                      <td>
                        <span className={`badge ${getEstadoBadge(orden.estado_actual?.nombre_estado)}`}>
                          {orden.estado_actual?.nombre_estado || 'Sin estado'}
                        </span>
                      </td>
                      <td>{formatDate(orden.fecha_creacion)}</td>
                      <td>
                        <button className="btn-sm btn-primary" onClick={() => handleViewOrden(orden)}>Ver</button>
                        <button className="btn-sm btn-secondary" onClick={() => handleEditOrden(orden)}>Editar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para agregar/ver/editar orden */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Agregar Nueva Orden'}
                {modalMode === 'view' && 'Detalles de la Orden'}
                {modalMode === 'edit' && 'Editar Estado de la Orden'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              {modalMode !== 'edit' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="id_cliente">Cliente *</label>
                      <select
                        id="id_cliente"
                        name="id_cliente"
                        value={formData.id_cliente}
                        onChange={handleInputChange}
                        required={modalMode === 'create'}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id_cliente} value={cliente.id_cliente}>
                            {cliente.nombre_completo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="id_producto">Producto *</label>
                      <select
                        id="id_producto"
                        name="id_producto"
                        value={formData.id_producto}
                        onChange={handleInputChange}
                        required={modalMode === 'create'}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccione un producto</option>
                        {productos.map(producto => (
                          <option key={producto.id_producto} value={producto.id_producto}>
                            {producto.nombre_producto} {producto.modelo && `- ${producto.modelo}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="id_flujo">Flujo *</label>
                      <select
                        id="id_flujo"
                        name="id_flujo"
                        value={formData.id_flujo}
                        onChange={handleInputChange}
                        required={modalMode === 'create'}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccione un flujo</option>
                        {flujos.map(flujo => (
                          <option key={flujo.id_flujo} value={flujo.id_flujo}>
                            {flujo.nombre_flujo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="id_estado_actual">
                        {modalMode === 'create' ? 'Estado Inicial *' : 'Estado Actual'}
                      </label>
                      <select
                        id="id_estado_actual"
                        name="id_estado_actual"
                        value={formData.id_estado_actual}
                        onChange={handleInputChange}
                        required={modalMode === 'create'}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccione un estado</option>
                        {estados.map(estado => (
                          <option key={estado.id_estado} value={estado.id_estado}>
                            {estado.nombre_estado}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="descripcion_servicio">Descripción del Servicio *</label>
                    <textarea
                      id="descripcion_servicio"
                      name="descripcion_servicio"
                      value={formData.descripcion_servicio}
                      onChange={handleInputChange}
                      rows="3"
                      required={modalMode === 'create'}
                      disabled={modalMode === 'view'}
                      placeholder="Describe el servicio a realizar..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="condiciones_pago">Condiciones de Pago</label>
                      <input
                        type="text"
                        id="condiciones_pago"
                        name="condiciones_pago"
                        value={formData.condiciones_pago}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="Ej: 50% adelantado, 50% contra entrega"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fecha_estimada_entrega">Fecha Estimada de Entrega</label>
                      <input
                        type="date"
                        id="fecha_estimada_entrega"
                        name="fecha_estimada_entrega"
                        value={formData.fecha_estimada_entrega}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notas_orden">Notas Adicionales</label>
                    <textarea
                      id="notas_orden"
                      name="notas_orden"
                      value={formData.notas_orden}
                      onChange={handleInputChange}
                      rows="2"
                      disabled={modalMode === 'view'}
                      placeholder="Notas u observaciones adicionales..."
                    />
                  </div>

                  {/* Sección de evidencias - Solo en modo view */}
                  {modalMode === 'view' && (
                    <div style={{
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        📋 Historial de Evidencias
                      </h3>
                      
                      {loadingEvidencias ? (
                        <p style={{color: '#6b7280', fontStyle: 'italic'}}>Cargando evidencias...</p>
                      ) : evidencias.length === 0 ? (
                        <p style={{color: '#6b7280', fontStyle: 'italic'}}>No hay evidencias registradas para esta orden</p>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                          {evidencias.map((evidencia) => (
                            <div 
                              key={evidencia.id_evidencia}
                              style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.75rem'
                              }}>
                                <div>
                                  <span className={`badge ${getEstadoBadge(evidencia.estados?.nombre_estado)}`}>
                                    {evidencia.estados?.nombre_estado || 'Estado desconocido'}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '0.875rem',
                                  color: '#6b7280'
                                }}>
                                  {formatDate(evidencia.fecha_subida)}
                                </span>
                              </div>

                              {evidencia.comentario && (
                                <div style={{
                                  padding: '0.75rem',
                                  background: '#f3f4f6',
                                  borderRadius: '4px',
                                  marginBottom: '0.75rem'
                                }}>
                                  <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    lineHeight: '1.5'
                                  }}>
                                    💬 {evidencia.comentario}
                                  </p>
                                </div>
                              )}

                              {evidencia.s3_key && evidencia.s3_key !== 'sin-archivo' && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  padding: '0.75rem',
                                  background: '#f0f9ff',
                                  borderRadius: '4px',
                                  border: '1px solid #bfdbfe'
                                }}>
                                  {evidencia.tipo_evidencia === 'image' ? (
                                    <>
                                      <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: '#dbeafe',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                      }}>
                                        🖼️
                                      </div>
                                      <div style={{flex: 1}}>
                                        <p style={{
                                          margin: 0,
                                          fontWeight: '500',
                                          fontSize: '0.9rem',
                                          color: '#1e40af'
                                        }}>
                                          {evidencia.nombre_archivo_original || 'Imagen'}
                                        </p>
                                        <p style={{
                                          margin: '0.25rem 0 0 0',
                                          fontSize: '0.8rem',
                                          color: '#64748b'
                                        }}>
                                          Tipo: Imagen
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: '#dbeafe',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                      }}>
                                        📄
                                      </div>
                                      <div style={{flex: 1}}>
                                        <p style={{
                                          margin: 0,
                                          fontWeight: '500',
                                          fontSize: '0.9rem',
                                          color: '#1e40af'
                                        }}>
                                          {evidencia.nombre_archivo_original || 'Documento'}
                                        </p>
                                        <p style={{
                                          margin: '0.25rem 0 0 0',
                                          fontSize: '0.8rem',
                                          color: '#64748b'
                                        }}>
                                          Tipo: {evidencia.tipo_evidencia}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              {evidencia.usuarios && (
                                <div style={{
                                  marginTop: '0.75rem',
                                  paddingTop: '0.75rem',
                                  borderTop: '1px solid #e5e7eb'
                                }}>
                                  <p style={{
                                    margin: 0,
                                    fontSize: '0.8rem',
                                    color: '#6b7280'
                                  }}>
                                    👤 Subido por: <strong>{evidencia.usuarios.nombre}</strong>
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {modalMode === 'edit' && (
                <>
                  <div className="form-group">
                    <label htmlFor="id_estado_actual">Cambiar Estado *</label>
                    <select
                      id="id_estado_actual"
                      name="id_estado_actual"
                      value={formData.id_estado_actual}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione un estado</option>
                      {estados.map(estado => (
                        <option key={estado.id_estado} value={estado.id_estado}>
                          {estado.nombre_estado}
                        </option>
                      ))}
                    </select>
                    <p style={{fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem'}}>
                      Estado actual: <strong>{selectedOrden?.estado_actual?.nombre_estado}</strong>
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="evidencia_comentario">Comentario del Cambio</label>
                    <textarea
                      id="evidencia_comentario"
                      value={evidenciaComentario}
                      onChange={(e) => setEvidenciaComentario(e.target.value)}
                      rows="3"
                      placeholder="Agrega un comentario sobre este cambio de estado..."
                      style={{width: '100%'}}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="evidencia_archivo">Imagen/Documento de Evidencia</label>
                    {!evidenciaArchivo ? (
                      <div style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.backgroundColor = 'transparent';
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          setEvidenciaArchivo(file);
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEvidenciaPreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                      onClick={() => document.getElementById('evidencia_archivo').click()}
                      >
                        <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>📎</div>
                        <p style={{margin: 0, color: '#6b7280'}}>
                          Haz clic o arrastra un archivo aquí
                        </p>
                        <p style={{margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#9ca3af'}}>
                          Imágenes, PDFs o documentos
                        </p>
                      </div>
                    ) : (
                      <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        {evidenciaPreview ? (
                          <img 
                            src={evidenciaPreview} 
                            alt="Preview" 
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100px',
                            height: '100px',
                            background: '#f3f4f6',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                          }}>
                            📄
                          </div>
                        )}
                        <div style={{flex: 1}}>
                          <p style={{margin: 0, fontWeight: '500'}}>{evidenciaArchivo.name}</p>
                          <p style={{margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280'}}>
                            {(evidenciaArchivo.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeArchivo}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      id="evidencia_archivo"
                      onChange={handleArchivoChange}
                      accept="image/*,.pdf,.doc,.docx"
                      style={{display: 'none'}}
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className="btn-submit" disabled={formLoading}>
                    {formLoading 
                      ? (modalMode === 'edit' ? 'Actualizando...' : 'Creando...') 
                      : (modalMode === 'edit' ? 'Actualizar Estado' : 'Crear Orden')}
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

export default Ordenes;

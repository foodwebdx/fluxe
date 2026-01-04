import { useState, useEffect } from 'react';
import './Dashboard.css';

const Ordenes = ({ onVerOrden }) => {
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

  // Estados para lógica de correcciones (Estados por flujo y Evidencias independientes)
  const [modalEstados, setModalEstados] = useState([]); // Estados específicos del flujo de la orden
  const [siguienteEstado, setSiguienteEstado] = useState(null); // Siguiente estado secuencial
  const [estadoAnterior, setEstadoAnterior] = useState(null); // Estado anterior secuencial
  const [evidenceMode, setEvidenceMode] = useState('list'); // 'list', 'create', 'edit'
  const [selectedEvidencia, setSelectedEvidencia] = useState(null); // Evidencia seleccionada para editar
  const [isEvidenceSubmitting, setIsEvidenceSubmitting] = useState(false);

  // Estados para creación inline de cliente y producto
  const [createClienteMode, setCreateClienteMode] = useState(false);
  const [createProductoMode, setCreateProductoMode] = useState(false);
  const [nuevoClienteData, setNuevoClienteData] = useState({
    tipo_identificacion: '',
    numero_identificacion: '',
    nombre_completo: '',
    telefono_contacto: '',
    correo_electronico: ''
  });
  const [nuevoProductoData, setNuevoProductoData] = useState({
    nombre_producto: '',
    modelo: '',
    numero_serie: '',
    descripcion: ''
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
    setEvidenceMode('list'); // Reset evidence mode
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

    // Cargar evidencias de la orden
    fetchEvidencias(orden.id_orden);

    // Cargar estados del flujo para mostrar nombres correctos si es necesario
    fetchEstadosFlujo(orden.id_flujo);

    setShowModal(true);
    fetchFormData(); // Refrescar datos generales por si acaso
    setFormError(null);
  };

  const handleEditOrden = async (orden) => {
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

    // Cargar estados del flujo y determinar el siguiente
    await fetchEstadosFlujo(orden.id_flujo, orden.id_estado_actual);

    setShowModal(true);
    fetchFormData();
    setFormError(null);
  };

  const fetchEstadosFlujo = async (idFlujo, idEstadoActual = null) => {
    try {
      const response = await fetch(`http://localhost:3000/api/flujos/${idFlujo}/estados`);
      const data = await response.json();
      const estadosFlujo = data.data || [];

      // Ordenar por posición
      estadosFlujo.sort((a, b) => a.posicion - b.posicion);
      setModalEstados(estadosFlujo);

      if (idEstadoActual) {
        // Lógica de transición secuencial (Siguiente y Anterior)
        const currentStateIndex = estadosFlujo.findIndex(e => e.id_estado === idEstadoActual);

        let nextState = null;
        let prevState = null;

        if (currentStateIndex !== -1) {
          // Calcular siguiente estado
          if (currentStateIndex < estadosFlujo.length - 1) {
            nextState = estadosFlujo[currentStateIndex + 1];
            setSiguienteEstado({
              id_estado: nextState.id_estado,
              nombre_estado: nextState.estado?.nombre_estado || nextState.estados?.nombre_estado
            });
          } else {
            setSiguienteEstado(null);
          }

          // Calcular estado anterior
          if (currentStateIndex > 0) {
            prevState = estadosFlujo[currentStateIndex - 1];
            setEstadoAnterior({
              id_estado: prevState.id_estado,
              nombre_estado: prevState.estado?.nombre_estado || prevState.estados?.nombre_estado
            });
          } else {
            setEstadoAnterior(null);
          }

          // Pre-seleccionar el siguiente estado por defecto, si existe
          if (nextState) {
            setFormData(prev => ({
              ...prev,
              id_estado_actual: nextState.id_estado
            }));
          } else if (prevState) {
            // Si es el último estado, quizás no seleccionar nada por defecto o dejar el anterior para corregir
            // Por seguridad, dejemos que el usuario elija si quiere retroceder
            setFormData(prev => ({ ...prev, id_estado_actual: '' }));
          }

        }
      }
    } catch (err) {
      console.error('Error al cargar estados del flujo:', err);
      setModalEstados([]);
    }
  };

  // Handlers para creación inline de cliente
  const handleToggleClienteForm = () => {
    setCreateClienteMode(!createClienteMode);
    if (createClienteMode) {
      // Reset data when closing
      setNuevoClienteData({
        tipo_identificacion: '',
        numero_identificacion: '',
        nombre_completo: '',
        telefono_contacto: '',
        correo_electronico: ''
      });
    }
  };

  const handleClienteInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoClienteData(prev => ({ ...prev, [name]: value }));
  };

  // Handlers para creación inline de producto
  const handleToggleProductoForm = () => {
    setCreateProductoMode(!createProductoMode);
    if (createProductoMode) {
      // Reset data when closing
      setNuevoProductoData({
        nombre_producto: '',
        modelo: '',
        numero_serie: '',
        descripcion: ''
      });
    }
  };

  const handleProductoInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProductoData(prev => ({ ...prev, [name]: value }));
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

    // Reset inline creation states
    setCreateClienteMode(false);
    setCreateProductoMode(false);
    setNuevoClienteData({
      tipo_identificacion: '',
      numero_identificacion: '',
      nombre_completo: '',
      telefono_contacto: '',
      correo_electronico: ''
    });
    setNuevoProductoData({
      nombre_producto: '',
      modelo: '',
      numero_serie: '',
      descripcion: ''
    });
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

  // --- Manejo de Evidencias CRUD ---

  const handleSaveEvidenciaIndependent = async (e) => {
    e.preventDefault();
    setIsEvidenceSubmitting(true);

    try {
      const isEdit = evidenceMode === 'edit';
      const url = isEdit
        ? `http://localhost:3000/api/evidencias/${selectedEvidencia.id_evidencia}`
        : 'http://localhost:3000/api/evidencias';

      const method = isEdit ? 'PUT' : 'POST';

      const evidenciaData = {
        id_orden: selectedOrden.id_orden,
        id_estado: selectedOrden.id_estado_actual, // Mantiene el estado actual
        id_usuario: 1, // TODO: Obtener del usuario logueado
        tipo_evidencia: evidenciaArchivo ? (evidenciaArchivo.type.startsWith('image/') ? 'image' : 'document') : (isEdit ? selectedEvidencia.tipo_evidencia : 'other'),
        s3_key: evidenciaArchivo ? `evidencias/${selectedOrden.id_orden}/${Date.now()}_${evidenciaArchivo.name}` : (isEdit ? selectedEvidencia.s3_key : 'sin-archivo'),
        nombre_archivo_original: evidenciaArchivo ? evidenciaArchivo.name : (isEdit ? selectedEvidencia.nombre_archivo_original : null),
        comentario: evidenciaComentario || null
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evidenciaData)
      });

      if (!response.ok) {
        throw new Error(`Error al ${isEdit ? 'actualizar' : 'crear'} la evidencia`);
      }

      // Reiniciar form y recargar lista
      setEvidenciaComentario('');
      setEvidenciaArchivo(null);
      setEvidenciaPreview(null);
      setEvidenceMode('list');
      setSelectedEvidencia(null);
      await fetchEvidencias(selectedOrden.id_orden);

    } catch (err) {
      console.error('Error saving evidence:', err);
      alert(err.message);
    } finally {
      setIsEvidenceSubmitting(false);
    }
  };

  const handleEditEvidenciaClick = (evidencia) => {
    setEvidenceMode('edit');
    setSelectedEvidencia(evidencia);
    setEvidenciaComentario(evidencia.comentario || '');
    // No podemos "cargar" el archivo en el input file, pero mantenemos la referencia si no lo cambian
  };

  const handleDeleteEvidencia = async (idEvidencia) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/evidencias/${idEvidencia}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la evidencia');
      }

      await fetchEvidencias(selectedOrden.id_orden);
    } catch (err) {
      console.error('Error deleting evidence:', err);
      alert(err.message);
    }
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
        const payload = {
          id_flujo: parseInt(formData.id_flujo),
          descripcion_servicio: formData.descripcion_servicio,
          condiciones_pago: formData.condiciones_pago || null,
          fecha_estimada_entrega: formData.fecha_estimada_entrega || null,
          notas_orden: formData.notas_orden || null
        };

        // Agregar cliente (existente o nuevo)
        if (createClienteMode && nuevoClienteData.nombre_completo) {
          // Crear cliente inline
          payload.cliente = nuevoClienteData;
        } else if (formData.id_cliente) {
          // Cliente existente
          payload.id_cliente = parseInt(formData.id_cliente);
        } else {
          throw new Error('Debe seleccionar un cliente existente o crear uno nuevo');
        }

        // Agregar producto (existente o nuevo)
        if (createProductoMode && nuevoProductoData.nombre_producto) {
          // Crear producto inline
          payload.producto = nuevoProductoData;
        } else if (formData.id_producto) {
          // Producto existente
          payload.id_producto = parseInt(formData.id_producto);
        } else {
          throw new Error('Debe seleccionar un producto existente o crear uno nuevo');
        }

        // NO enviar id_estado_actual - el backend lo asigna automáticamente

        response = await fetch('http://localhost:3000/api/ordenes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
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
          <p className="subtitle" style={{ color: '#ef4444' }}>Error: {error}</p>
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
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
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
                        <button className="btn-sm btn-primary" onClick={() => onVerOrden && onVerOrden(orden.id_orden)}>Ver</button>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label htmlFor="id_cliente">Cliente *</label>
                        {modalMode === 'create' && !createClienteMode && (
                          <button
                            type="button"
                            onClick={handleToggleClienteForm}
                            className="btn-sm btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            + Crear Nuevo
                          </button>
                        )}
                      </div>

                      {!createClienteMode ? (
                        <select
                          id="id_cliente"
                          name="id_cliente"
                          value={formData.id_cliente}
                          onChange={handleInputChange}
                          required={modalMode === 'create' && !createClienteMode}
                          disabled={modalMode === 'view'}
                        >
                          <option value="">Seleccione un cliente</option>
                          {clientes.map(cliente => (
                            <option key={cliente.id_cliente} value={cliente.id_cliente}>
                              {cliente.nombre_completo}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ padding: '1rem', background: '#f0f4ff', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <strong style={{ fontSize: '0.875rem', color: '#475569' }}>Crear Nuevo Cliente</strong>
                            <button
                              type="button"
                              onClick={handleToggleClienteForm}
                              className="btn-sm btn-danger"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Tipo *</label>
                                <select
                                  name="tipo_identificacion"
                                  value={nuevoClienteData.tipo_identificacion}
                                  onChange={handleClienteInputChange}
                                  required={createClienteMode}
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                >
                                  <option value="">-</option>
                                  <option value="CC">CC</option>
                                  <option value="NIT">NIT</option>
                                  <option value="CE">CE</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Número *</label>
                                <input
                                  type="text"
                                  name="numero_identificacion"
                                  value={nuevoClienteData.numero_identificacion}
                                  onChange={handleClienteInputChange}
                                  required={createClienteMode}
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                />
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Nombre Completo *</label>
                              <input
                                type="text"
                                name="nombre_completo"
                                value={nuevoClienteData.nombre_completo}
                                onChange={handleClienteInputChange}
                                required={createClienteMode}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Email *</label>
                                <input
                                  type="email"
                                  name="correo_electronico"
                                  value={nuevoClienteData.correo_electronico}
                                  onChange={handleClienteInputChange}
                                  required={createClienteMode}
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Teléfono *</label>
                                <input
                                  type="text"
                                  name="telefono_contacto"
                                  value={nuevoClienteData.telefono_contacto}
                                  onChange={handleClienteInputChange}
                                  required={createClienteMode}
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label htmlFor="id_producto">Producto *</label>
                        {modalMode === 'create' && !createProductoMode && (
                          <button
                            type="button"
                            onClick={handleToggleProductoForm}
                            className="btn-sm btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            + Crear Nuevo
                          </button>
                        )}
                      </div>

                      {!createProductoMode ? (
                        <select
                          id="id_producto"
                          name="id_producto"
                          value={formData.id_producto}
                          onChange={handleInputChange}
                          required={modalMode === 'create' && !createProductoMode}
                          disabled={modalMode === 'view'}
                        >
                          <option value="">Seleccione un producto</option>
                          {productos.map(producto => (
                            <option key={producto.id_producto} value={producto.id_producto}>
                              {producto.nombre_producto} {producto.modelo && `- ${producto.modelo}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ padding: '1rem', background: '#fff4f0', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <strong style={{ fontSize: '0.875rem', color: '#475569' }}>Crear Nuevo Producto</strong>
                            <button
                              type="button"
                              onClick={handleToggleProductoForm}
                              className="btn-sm btn-danger"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Nombre *</label>
                              <input
                                type="text"
                                name="nombre_producto"
                                value={nuevoProductoData.nombre_producto}
                                onChange={handleProductoInputChange}
                                required={createProductoMode}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Modelo</label>
                                <input
                                  type="text"
                                  name="modelo"
                                  value={nuevoProductoData.modelo}
                                  onChange={handleProductoInputChange}
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>N° Serie</label>
                                <input
                                  type="text"
                                  name="numero_serie"
                                  value={nuevoProductoData.numero_serie}
                                  onChange={handleProductoInputChange}
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                />
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Descripción</label>
                              <textarea
                                name="descripcion"
                                value={nuevoProductoData.descripcion}
                                onChange={handleProductoInputChange}
                                rows="2"
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
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

                    {/* Ocultar estado inicial en modo create - se asigna automáticamente */}
                    {modalMode !== 'create' && (
                      <div className="form-group">
                        <label htmlFor="id_estado_actual">Estado Actual</label>
                        <select
                          id="id_estado_actual"
                          name="id_estado_actual"
                          value={formData.id_estado_actual}
                          onChange={handleInputChange}
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
                    )}
                    {modalMode === 'create' && (
                      <div className="form-group">
                        <label>Estado Inicial</label>
                        <div style={{ padding: '0.75rem', background: '#f0f4ff', borderRadius: '6px', color: '#667eea', fontSize: '0.875rem' }}>
                          ℹ️ El estado inicial será asignado automáticamente al crear la orden
                        </div>
                      </div>
                    )}
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

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          📋 Historial de Evidencias
                        </h3>

                        {evidenceMode === 'list' && (
                          <button
                            type="button"
                            className="btn-sm btn-primary"
                            onClick={() => {
                              setEvidenceMode('create');
                              setEvidenciaComentario('');
                              setEvidenciaArchivo(null);
                              setEvidenciaPreview(null);
                            }}
                          >
                            + Agregar Evidencia
                          </button>
                        )}
                      </div>

                      {(evidenceMode === 'create' || evidenceMode === 'edit') && (
                        <div style={{
                          marginBottom: '1.5rem',
                          padding: '1rem',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid #c7d2fe'
                        }}>
                          <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#4338ca' }}>
                            {evidenceMode === 'create' ? 'Nueva Evidencia' : 'Editar Evidencia'}
                          </h4>
                          <div className="form-group">
                            <label style={{ fontSize: '0.9rem' }}>Comentario</label>
                            <textarea
                              value={evidenciaComentario}
                              onChange={(e) => setEvidenciaComentario(e.target.value)}
                              rows="2"
                              style={{ width: '100%', marginBottom: '0.5rem' }}
                              placeholder="Escribe un comentario..."
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: '0.9rem' }}>Archivo (Opcional)</label>
                            <input
                              type="file"
                              onChange={handleArchivoChange}
                              accept="image/*,.pdf,.doc,.docx"
                              style={{ display: 'block', fontSize: '0.9rem' }}
                            />
                            {evidenciaPreview && (
                              <img src={evidenciaPreview} alt="Preview" style={{ height: '60px', marginTop: '0.5rem', borderRadius: '4px' }} />
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                              type="button"
                              className="btn-sm btn-secondary"
                              onClick={() => setEvidenceMode('list')}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn-sm btn-primary"
                              onClick={handleSaveEvidenciaIndependent}
                              disabled={isEvidenceSubmitting}
                            >
                              {isEvidenceSubmitting ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      )}

                      {loadingEvidencias ? (
                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Cargando evidencias...</p>
                      ) : evidencias.length === 0 ? (
                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No hay evidencias registradas para esta orden</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                  <span style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                  }}>
                                    {formatDate(evidencia.fecha_subida)}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                      type="button"
                                      className="btn-sm"
                                      style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                                      onClick={() => handleEditEvidenciaClick(evidencia)}
                                      title="Editar evidencia"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-sm"
                                      style={{ padding: '2px 6px', fontSize: '0.8rem', color: '#ef4444' }}
                                      onClick={() => handleDeleteEvidencia(evidencia.id_evidencia)}
                                      title="Eliminar evidencia"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
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
                                      <div style={{ flex: 1 }}>
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
                                      <div style={{ flex: 1 }}>
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
                    <label htmlFor="id_estado_actual">Seleccionar Transición *</label>

                    {(siguienteEstado || estadoAnterior) ? (
                      <select
                        id="id_estado_actual"
                        name="id_estado_actual"
                        value={formData.id_estado_actual}
                        onChange={handleInputChange}
                        required
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          width: '100%',
                          backgroundColor: '#f9fafb',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="">Seleccione una acción...</option>

                        {siguienteEstado && (
                          <option value={siguienteEstado.id_estado}>
                            ➡️ Avanzar a: {siguienteEstado.nombre_estado}
                          </option>
                        )}

                        {estadoAnterior && (
                          <option value={estadoAnterior.id_estado}>
                            ⬅️ Retroceder a: {estadoAnterior.nombre_estado}
                          </option>
                        )}
                      </select>
                    ) : (
                      <div style={{
                        padding: '0.75rem',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        Esta orden está en el estado inicial o final y no tiene transiciones disponibles en este momento.
                      </div>
                    )}

                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
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
                      style={{ width: '100%' }}
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
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📎</div>
                        <p style={{ margin: 0, color: '#6b7280' }}>
                          Haz clic o arrastra un archivo aquí
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#9ca3af' }}>
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
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: '500' }}>{evidenciaArchivo.name}</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
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
                      style={{ display: 'none' }}
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={formLoading || (modalMode === 'edit' && !siguienteEstado && !estadoAnterior)}
                  >
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

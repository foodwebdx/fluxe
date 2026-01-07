import { useState, useEffect } from 'react';
import './Dashboard.css';
import { apiUrl } from '../config/api';


const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    id_cliente: '',
    nombre_producto: '',
    identificador_interno: '',
    descripcion: '',
    modelo: '',
    numero_serie: '',
    identificador_unico_adicional: '',
    notas_producto: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchProductos();
    fetchClientes();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/productos'));

      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }

      const data = await response.json();
      setProductos(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(apiUrl('/api/clientes'));
      const data = await response.json();
      setClientes(data.data || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const handleOpenModal = () => {
    setModalMode('create');
    setSelectedProducto(null);
    setShowModal(true);
    setFormError(null);
  };

  const handleViewProducto = (producto) => {
    setModalMode('view');
    setSelectedProducto(producto);
    setFormData({
      id_cliente: producto.id_cliente || '',
      nombre_producto: producto.nombre_producto || '',
      identificador_interno: producto.identificador_interno || '',
      descripcion: producto.descripcion || '',
      modelo: producto.modelo || '',
      numero_serie: producto.numero_serie || '',
      identificador_unico_adicional: producto.identificador_unico_adicional || '',
      notas_producto: producto.notas_producto || ''
    });
    setShowModal(true);
    setFormError(null);
  };

  const handleEditProducto = (producto) => {
    setModalMode('edit');
    setSelectedProducto(producto);
    setFormData({
      id_cliente: producto.id_cliente || '',
      nombre_producto: producto.nombre_producto || '',
      identificador_interno: producto.identificador_interno || '',
      descripcion: producto.descripcion || '',
      modelo: producto.modelo || '',
      numero_serie: producto.numero_serie || '',
      identificador_unico_adicional: producto.identificador_unico_adicional || '',
      notas_producto: producto.notas_producto || ''
    });
    setShowModal(true);
    setFormError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('create');
    setSelectedProducto(null);
    setFormData({
      id_cliente: '',
      nombre_producto: '',
      identificador_interno: '',
      descripcion: '',
      modelo: '',
      numero_serie: '',
      identificador_unico_adicional: '',
      notas_producto: ''
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

      const payload = {
        ...formData,
        id_cliente: parseInt(formData.id_cliente)
      };

      if (modalMode === 'edit') {
        response = await fetch(`http://localhost:3000/api/productos/${selectedProducto.id_producto}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:3000/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${modalMode === 'edit' ? 'actualizar' : 'crear'} el producto`);
      }

      await fetchProductos();
      handleCloseModal();
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/productos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el producto');
      }

      await fetchProductos();
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Productos</h1>
          <p className="subtitle">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Productos</h1>
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
            <h1>Productos</h1>
            <p className="subtitle">Gestión de productos del sistema</p>
          </div>
          <button className="btn-add" onClick={handleOpenModal}>
            <span className="btn-icon">+</span>
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-label">Total Productos</p>
            <h3 className="stat-value">{productos.length}</h3>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card full-width">
          <h3>Lista de Productos</h3>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Modelo</th>
                  <th>Número de Serie</th>
                  <th>Cliente</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.id_producto}>
                      <td>#{producto.id_producto}</td>
                      <td>{producto.nombre_producto}</td>
                      <td>{producto.modelo || 'N/A'}</td>
                      <td>{producto.numero_serie || 'N/A'}</td>
                      <td>{producto.clientes?.nombre_completo || 'Sin cliente'}</td>
                      <td>
                        <button className="btn-sm btn-primary" onClick={() => handleViewProducto(producto)}>Ver</button>
                        <button className="btn-sm btn-secondary" onClick={() => handleEditProducto(producto)}>Editar</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(producto.id_producto)}>Eliminar</button>
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
                {modalMode === 'create' && 'Agregar Nuevo Producto'}
                {modalMode === 'view' && 'Detalles del Producto'}
                {modalMode === 'edit' && 'Editar Producto'}
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
                <label htmlFor="id_cliente">Cliente *</label>
                <select
                  id="id_cliente"
                  name="id_cliente"
                  value={formData.id_cliente}
                  onChange={handleInputChange}
                  required={modalMode !== 'view'}
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
                <label htmlFor="nombre_producto">Nombre del Producto *</label>
                <input
                  type="text"
                  id="nombre_producto"
                  name="nombre_producto"
                  value={formData.nombre_producto}
                  onChange={handleInputChange}
                  required={modalMode !== 'view'}
                  disabled={modalMode === 'view'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modelo">Modelo</label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="numero_serie">Número de Serie</label>
                  <input
                    type="text"
                    id="numero_serie"
                    name="numero_serie"
                    value={formData.numero_serie}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              {/* Mostrar identificador_interno solo en modo view o edit (generado automáticamente) */}
              {modalMode !== 'create' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="identificador_interno">Identificador Interno (Auto-generado)</label>
                    <input
                      type="text"
                      id="identificador_interno"
                      name="identificador_interno"
                      value={formData.identificador_interno}
                      disabled
                      style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="identificador_unico_adicional">ID Adicional</label>
                    <input
                      type="text"
                      id="identificador_unico_adicional"
                      name="identificador_unico_adicional"
                      value={formData.identificador_unico_adicional}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              )}

              {/* Mostrar solo ID Adicional en modo create */}
              {modalMode === 'create' && (
                <div className="form-group">
                  <label htmlFor="identificador_unico_adicional">ID Adicional (Opcional)</label>
                  <input
                    type="text"
                    id="identificador_unico_adicional"
                    name="identificador_unico_adicional"
                    value={formData.identificador_unico_adicional}
                    onChange={handleInputChange}
                    placeholder="Ingrese un identificador adicional si es necesario"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  disabled={modalMode === 'view'}
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="notas_producto">Notas</label>
                <textarea
                  id="notas_producto"
                  name="notas_producto"
                  value={formData.notas_producto}
                  onChange={handleInputChange}
                  rows="2"
                  disabled={modalMode === 'view'}
                  placeholder="Notas adicionales..."
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
                      : (modalMode === 'edit' ? 'Actualizar Producto' : 'Crear Producto')}
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

export default Productos;

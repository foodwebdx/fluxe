import { useState, useEffect } from 'react';
import './Dashboard.css';
import { apiUrl } from '../config/api';


const Estados = () => {
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [formData, setFormData] = useState({
        nombre_estado: '',
        descripcion_estado: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        fetchEstados();
    }, []);

    const fetchEstados = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl('/api/estados'));

            if (!response.ok) {
                throw new Error('Error al cargar los estados');
            }

            const data = await response.json();
            setEstados(data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
        setModalMode('create');
        setSelectedEstado(null);
        setFormData({
            nombre_estado: '',
            descripcion_estado: ''
        });
        setFormError(null);
        setShowModal(true);
    };

    const handleEdit = (estado) => {
        setModalMode('edit');
        setSelectedEstado(estado);
        setFormData({
            nombre_estado: estado.nombre_estado || '',
            descripcion_estado: estado.descripcion_estado || ''
        });
        setFormError(null);
        setShowModal(true);
    };

    const handleDelete = async (estado) => {
        if (!confirm(`¿Está seguro de eliminar el estado "${estado.nombre_estado}"?\n\nNota: No se puede eliminar un estado que esté actualmente en uso.`)) {
            return;
        }

        try {
            const response = await fetch(apiUrl(`/api/estados/${estado.id_estado}`), {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar el estado');
            }

            alert('Estado eliminado exitosamente');
            await fetchEstados();
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar estado: ' + err.message);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEstado(null);
        setFormData({
            nombre_estado: '',
            descripcion_estado: ''
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
            const url = modalMode === 'create'
                ? apiUrl('/api/estados')
                : apiUrl(`/api/estados/${selectedEstado.id_estado}`);

            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al procesar la solicitud');
            }

            alert(modalMode === 'create' ? 'Estado creado exitosamente' : 'Estado actualizado exitosamente');
            handleCloseModal();
            await fetchEstados();
        } catch (err) {
            console.error('Error:', err);
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>⚙️ Configuración de Estados</h1>
                    <p className="subtitle">Cargando estados...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>⚙️ Configuración de Estados</h1>
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
                        <h1>⚙️ Configuración de Estados</h1>
                        <p className="subtitle">Gestión de estados del sistema</p>
                    </div>
                    <button className="btn-add" onClick={handleNew}>
                        <span className="btn-icon">+</span>
                        Nuevo Estado
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⚙️</div>
                    <div className="stat-content">
                        <p className="stat-label">Total Estados</p>
                        <h3 className="stat-value">{estados.length}</h3>
                    </div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card full-width">
                    <h3>Lista de Estados</h3>
                    <div className="table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre del Estado</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estados.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No hay estados registrados
                                        </td>
                                    </tr>
                                ) : (
                                    estados.map((estado) => (
                                        <tr key={estado.id_estado}>
                                            <td>#{estado.id_estado}</td>
                                            <td>
                                                <strong>{estado.nombre_estado}</strong>
                                            </td>
                                            <td>{estado.descripcion_estado || '-'}</td>
                                            <td>
                                                <button
                                                    className="btn-sm btn-secondary"
                                                    onClick={() => handleEdit(estado)}
                                                    title="Editar estado"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn-sm btn-danger"
                                                    onClick={() => handleDelete(estado)}
                                                    title="Eliminar estado"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para crear/editar estado */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? '➕ Nuevo Estado' : '✏️ Editar Estado'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            {formError && <div className="error-message">{formError}</div>}

                            <div className="form-group">
                                <label htmlFor="nombre_estado">Nombre del Estado *</label>
                                <input
                                    type="text"
                                    id="nombre_estado"
                                    name="nombre_estado"
                                    value={formData.nombre_estado}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ej: Iniciado, En Proceso, Completado"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="descripcion_estado">Descripción</label>
                                <textarea
                                    id="descripcion_estado"
                                    name="descripcion_estado"
                                    value={formData.descripcion_estado}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Descripción opcional del estado"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit" disabled={formLoading}>
                                    {formLoading
                                        ? (modalMode === 'create' ? 'Creando...' : 'Actualizando...')
                                        : (modalMode === 'create' ? 'Crear Estado' : 'Actualizar Estado')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Estados;

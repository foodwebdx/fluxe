import { useState } from 'react';
import { apiUrl } from '../../config/api';


const OrdenInfoCard = ({ orden, isInFinalState, onFechaEntregaChange }) => {
    const [editingFecha, setEditingFecha] = useState(false);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [loading, setLoading] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleEditFecha = () => {
        setNuevaFecha(formatDateInput(orden.fecha_estimada_entrega));
        setEditingFecha(true);
    };

    const handleCancelEdit = () => {
        setEditingFecha(false);
        setNuevaFecha('');
    };

    const handleSaveFecha = async () => {
        if (!nuevaFecha) {
            alert('Por favor selecciona una fecha');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(apiUrl(`/api/ordenes/${orden.id_orden}/fecha-entrega`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fecha_estimada_entrega: nuevaFecha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar la fecha');
            }

            alert(data.whatsapp?.sent 
                ? 'Fecha actualizada y notificación enviada por WhatsApp ✅' 
                : 'Fecha actualizada correctamente'
            );
            
            setEditingFecha(false);
            setNuevaFecha('');
            
            // Llamar al callback para recargar los datos
            if (onFechaEntregaChange) {
                onFechaEntregaChange();
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="orden-info-card">
            <h2>📋 Información de la Orden</h2>

            <div className="info-grid">
                {/* Cliente */}
                <div className="info-section">
                    <div className="info-label">👤 Cliente</div>
                    <div className="info-value">{orden.cliente?.nombre_completo || 'N/A'}</div>
                    {orden.cliente?.telefono_contacto && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            📞 {orden.cliente.telefono_contacto}
                        </div>
                    )}
                    {orden.cliente?.correo_electronico && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            ✉️ {orden.cliente.correo_electronico}
                        </div>
                    )}
                </div>

                {/* Producto */}
                <div className="info-section">
                    <div className="info-label">📦 Producto</div>
                    <div className="info-value">{orden.producto?.nombre_producto || 'N/A'}</div>
                    {orden.producto?.modelo && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Modelo: {orden.producto.modelo}
                        </div>
                    )}
                    {orden.producto?.numero_serie && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Serie: {orden.producto.numero_serie}
                        </div>
                    )}
                </div>

                {/* Flujo */}
                <div className="info-section">
                    <div className="info-label">🌊 Flujo de Trabajo</div>
                    <div className="info-value">{orden.flujo?.nombre_flujo || orden.flujos?.nombre_flujo || 'N/A'}</div>
                    {(orden.flujo?.descripcion_flujo || orden.flujos?.descripcion_flujo) && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {orden.flujo?.descripcion_flujo || orden.flujos?.descripcion_flujo}
                        </div>
                    )}
                </div>

                {/* Estado Actual */}
                <div className="info-section">
                    <div className="info-label">📊 Estado Actual</div>
                    <div className="info-value">
                        {orden.estado_actual?.nombre_estado || orden.estados?.nombre_estado || 'N/A'}
                    </div>
                </div>
            </div>

            {/* Descripción del Servicio */}
            {orden.descripcion_servicio && (
                <div className="info-section" style={{ marginTop: '1.5rem' }}>
                    <div className="info-label">📝 Descripción del Servicio</div>
                    <div className="info-value" style={{ whiteSpace: 'pre-wrap' }}>
                        {orden.descripcion_servicio}
                    </div>
                </div>
            )}

            {/* Condiciones de Pago */}
            {orden.condiciones_pago && (
                <div className="info-section">
                    <div className="info-label">💰 Condiciones de Pago</div>
                    <div className="info-value">{orden.condiciones_pago}</div>
                </div>
            )}

            <div className="info-grid" style={{ marginTop: '1.5rem' }}>
                {/* Fecha de Creación */}
                <div className="info-section">
                    <div className="info-label">📅 Fecha de Creación</div>
                    <div className="info-value">{formatDate(orden.fecha_creacion)}</div>
                </div>

                {/* Fecha Estimada de Entrega */}
                <div className="info-section">
                    <div className="info-label">
                        🎯 Fecha Estimada de Entrega
                        {!editingFecha && !isInFinalState && (
                            <button 
                                onClick={handleEditFecha}
                                className="btn-icon"
                                style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}
                                title="Editar fecha de entrega"
                            >
                                ✏️
                            </button>
                        )}
                    </div>
                    {editingFecha ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                            <input
                                type="date"
                                value={nuevaFecha}
                                onChange={(e) => setNuevaFecha(e.target.value)}
                                className="comentario-input"
                                style={{ flex: 1 }}
                                disabled={loading}
                            />
                            <button 
                                onClick={handleSaveFecha}
                                className="btn-sm btn-primary"
                                disabled={loading}
                            >
                                {loading ? '⏳' : '💾'}
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                className="btn-sm btn-secondary"
                                disabled={loading}
                            >
                                ✖️
                            </button>
                        </div>
                    ) : (
                        <div className="info-value">
                            {orden.fecha_estimada_entrega ? formatDate(orden.fecha_estimada_entrega) : 'No establecida'}
                        </div>
                    )}
                </div>

                {/* Fecha de Cierre - Solo mostrar si está en el último estado */}
                {orden.fecha_cierre && isInFinalState && (
                    <div className="info-section">
                        <div className="info-label">✅ Fecha de Cierre</div>
                        <div className="info-value">{formatDate(orden.fecha_cierre)}</div>
                    </div>
                )}
            </div>

            {/* Notas */}
            {orden.notas_orden && (
                <div className="info-section" style={{ marginTop: '1.5rem' }}>
                    <div className="info-label">📌 Notas Adicionales</div>
                    <div className="info-value" style={{ whiteSpace: 'pre-wrap' }}>
                        {orden.notas_orden}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdenInfoCard;

import { useState, useEffect } from 'react';
import OrdenInfoCard from '../components/orden/OrdenInfoCard';
import EstadosTimeline from '../components/orden/EstadosTimeline';
import '../components/orden/OrdenDetail.css';

const OrdenDetail = ({ ordenId, onVolver }) => {
    const [orden, setOrden] = useState(null);
    const [estadosFlujo, setEstadosFlujo] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [evidencias, setEvidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isClientInfoExpanded, setIsClientInfoExpanded] = useState(false);
    const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(false);

    useEffect(() => {
        if (ordenId) {
            loadAllData();
        }
    }, [ordenId]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Cargar orden
            const ordenRes = await fetch(`http://localhost:3000/api/ordenes/${ordenId}`);
            if (!ordenRes.ok) throw new Error('Error al cargar la orden');
            const ordenData = await ordenRes.json();
            setOrden(ordenData.data);

            // 2. Cargar estados del flujo
            const flujoRes = await fetch(`http://localhost:3000/api/flujos/${ordenData.data.id_flujo}/estados`);
            if (!flujoRes.ok) throw new Error('Error al cargar estados del flujo');
            const flujoData = await flujoRes.json();
            setEstadosFlujo(flujoData.data || []);

            // 3. Cargar historial
            const historialRes = await fetch(`http://localhost:3000/api/historial/orden/${ordenId}`);
            if (!historialRes.ok) throw new Error('Error al cargar historial');
            const historialData = await historialRes.json();
            setHistorial(historialData.data || []);

            // 4. Cargar evidencias
            const evidenciasRes = await fetch(`http://localhost:3000/api/evidencias/orden/${ordenId}`);
            if (!evidenciasRes.ok) throw new Error('Error al cargar evidencias');
            const evidenciasData = await evidenciasRes.json();
            setEvidencias(evidenciasData.data || []);

        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEstadoChange = async () => {
        // Recargar todos los datos después de cambiar estado
        await loadAllData();
    };

    const handleRefresh = async () => {
        // Recargar historial y evidencias
        try {
            const [historialRes, evidenciasRes] = await Promise.all([
                fetch(`http://localhost:3000/api/historial/orden/${ordenId}`),
                fetch(`http://localhost:3000/api/evidencias/orden/${ordenId}`)
            ]);

            if (historialRes.ok) {
                const historialData = await historialRes.json();
                setHistorial(historialData.data || []);
            }

            if (evidenciasRes.ok) {
                const evidenciasData = await evidenciasRes.json();
                setEvidencias(evidenciasData.data || []);
            }
        } catch (err) {
            console.error('Error refrescando datos:', err);
        }
    };

    if (loading) {
        return (
            <div className="orden-detail-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando orden...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orden-detail-container">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={onVolver} style={{ marginTop: '1rem' }}>
                        Volver a Órdenes
                    </button>
                </div>
            </div>
        );
    }

    if (!orden) {
        return (
            <div className="orden-detail-container">
                <div className="error-container">
                    <h2>Orden no encontrada</h2>
                    <button className="btn-secondary" onClick={onVolver} style={{ marginTop: '1rem' }}>
                        Volver a Órdenes
                    </button>
                </div>
            </div>
        );
    }

    // Verificar si está en el último estado del flujo
    const isInFinalState = estadosFlujo.length > 0 &&
        estadosFlujo[estadosFlujo.length - 1]?.id_estado === orden.id_estado_actual;

    return (
        <div className="orden-detail-container">
            {/* Header con botón de regreso */}
            <div className="orden-detail-header">
                <button className="btn-back" onClick={onVolver}>
                    <span>←</span>
                    <span>Volver a Órdenes</span>
                </button>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Orden #{orden.id_orden}</h1>
            </div>

            {/* Información de la orden */}
            <div className="orden-detail-grid">
                <OrdenInfoCard 
                    orden={orden} 
                    isInFinalState={isInFinalState}
                    onFechaEntregaChange={loadAllData}
                />
            </div>

            {/* Información del Cliente */}
            {(orden.clientes || orden.cliente) && (
                <div className="product-info-section">
                    <div className="product-info-header" onClick={() => setIsClientInfoExpanded(!isClientInfoExpanded)}>
                        <h2>👤 Información del Cliente</h2>
                        <button className="expand-button">
                            {isClientInfoExpanded ? '▼' : '▶'}
                        </button>
                    </div>
                    {isClientInfoExpanded && (
                        <div className="product-info-content">
                            <div className="product-info-grid">
                                <div className="product-info-item">
                                    <span className="product-info-label">Nombre Completo:</span>
                                    <span className="product-info-value">{(orden.clientes || orden.cliente).nombre_completo}</span>
                                </div>
                                <div className="product-info-item">
                                    <span className="product-info-label">Tipo de Identificación:</span>
                                    <span className="product-info-value">{(orden.clientes || orden.cliente).tipo_identificacion}</span>
                                </div>
                                <div className="product-info-item">
                                    <span className="product-info-label">Número de Identificación:</span>
                                    <span className="product-info-value">{(orden.clientes || orden.cliente).numero_identificacion}</span>
                                </div>
                                <div className="product-info-item">
                                    <span className="product-info-label">Teléfono de Contacto:</span>
                                    <span className="product-info-value">{(orden.clientes || orden.cliente).telefono_contacto}</span>
                                </div>
                                <div className="product-info-item">
                                    <span className="product-info-label">Correo Electrónico:</span>
                                    <span className="product-info-value">{(orden.clientes || orden.cliente).correo_electronico}</span>
                                </div>
                                {(orden.clientes || orden.cliente).tipo_direccion && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Tipo de Dirección:</span>
                                        <span className="product-info-value">{(orden.clientes || orden.cliente).tipo_direccion}</span>
                                    </div>
                                )}
                                {(orden.clientes || orden.cliente).direccion && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Dirección:</span>
                                        <span className="product-info-value">{(orden.clientes || orden.cliente).direccion}</span>
                                    </div>
                                )}
                                {(orden.clientes || orden.cliente).notas_cliente && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Notas:</span>
                                        <span className="product-info-value">{(orden.clientes || orden.cliente).notas_cliente}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Información del Producto */}
            {(orden.producto || orden.productos) && (
                <div className="product-info-section">
                    <div className="product-info-header" onClick={() => setIsProductInfoExpanded(!isProductInfoExpanded)}>
                        <h2>📦 Información del Producto</h2>
                        <button className="expand-button">
                            {isProductInfoExpanded ? '▼' : '▶'}
                        </button>
                    </div>
                    {isProductInfoExpanded && (
                        <div className="product-info-content">
                            <div className="product-info-grid">
                                <div className="product-info-item">
                                    <span className="product-info-label">Nombre:</span>
                                    <span className="product-info-value">{(orden.producto || orden.productos).nombre_producto}</span>
                                </div>
                                {(orden.producto || orden.productos).identificador_interno && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Identificador Interno:</span>
                                        <span className="product-info-value">{(orden.producto || orden.productos).identificador_interno}</span>
                                    </div>
                                )}
                                {(orden.producto || orden.productos).descripcion && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Descripción:</span>
                                        <span className="product-info-value">{(orden.producto || orden.productos).descripcion}</span>
                                    </div>
                                )}
                                {(orden.producto || orden.productos).modelo && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Modelo:</span>
                                        <span className="product-info-value">{(orden.producto || orden.productos).modelo}</span>
                                    </div>
                                )}
                                {(orden.producto || orden.productos).numero_serie && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Número de Serie:</span>
                                        <span className="product-info-value">{(orden.producto || orden.productos).numero_serie}</span>
                                    </div>
                                )}
                                {(orden.producto || orden.productos).identificador_unico_adicional && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Identificador Único Adicional:</span>
                                        <span className="product-info-value">{(orden.producto || orden.productos).identificador_unico_adicional}</span>
                                    </div>
                                )}
                                {(orden.producto || orden.productos).notas_producto && (
                                    <div className="product-info-item">
                                        <span className="product-info-label">Notas:</span>
                                        <span className="product-info-value">{(orden.producto || orden.productos).notas_producto}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Línea de tiempo de estados */}
            <EstadosTimeline
                estadosFlujo={estadosFlujo}
                historial={historial}
                estadoActualId={orden.id_estado_actual}
                ordenId={orden.id_orden}
                evidencias={evidencias}
                onEstadoChange={handleEstadoChange}
                onRefresh={handleRefresh}
            />

            {/* Panel de todas las evidencias */}
            {evidencias.length > 0 && (
                <div className="all-evidencias-panel">
                    <h2>📎 Todas las Evidencias ({evidencias.length})</h2>
                    <div className="evidencias-grid">
                        {evidencias.map((evidencia) => {
                            const getFileIcon = (tipo) => {
                                if (tipo === 'image') return '🖼️';
                                if (tipo === 'pdf') return '📄';
                                if (tipo === 'document') return '📝';
                                return '📎';
                            };

                            const handleDownload = () => {
                                if (evidencia.url) {
                                    window.open(evidencia.url, '_blank');
                                }
                            };

                            const handleImageClick = () => {
                                if (evidencia.url) {
                                    window.open(evidencia.url, '_blank');
                                }
                            };

                            return (
                                <div key={evidencia.id_evidencia} className="evidencia-item" style={{ position: 'relative', cursor: 'pointer' }}>
                                    {evidencia.tipo_evidencia === 'image' ? (
                                        <>
                                            <img
                                                src={evidencia.url}
                                                alt={evidencia.nombre_archivo_original}
                                                className="evidencia-preview"
                                                onClick={handleImageClick}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <div className="evidencia-icon" style={{ display: 'none' }}>
                                                🖼️
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            className="evidencia-icon"
                                            onClick={handleDownload}
                                            style={{ cursor: 'pointer' }}
                                            title={`Descargar ${evidencia.nombre_archivo_original}`}
                                        >
                                            {getFileIcon(evidencia.tipo_evidencia)}
                                        </div>
                                    )}
                                    <div className="evidencia-overlay">
                                        <div>{evidencia.estados?.nombre_estado || 'Estado'}</div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                                            {evidencia.nombre_archivo_original}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        title="Descargar evidencia"
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: '#e0f2fe',
                                            color: '#0284c7',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '0.25rem 0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            opacity: 0.9,
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0.9}
                                    >
                                        ⬇️
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdenDetail;

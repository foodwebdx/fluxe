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
                <OrdenInfoCard orden={orden} />
            </div>

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
                        {evidencias.map((evidencia) => (
                            <div key={evidencia.id_evidencia} className="evidencia-item">
                                {evidencia.tipo_evidencia === 'image' ? (
                                    <img
                                        src={`/evidencias/${evidencia.s3_key}`}
                                        alt={evidencia.nombre_archivo_original}
                                        className="evidencia-preview"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className="evidencia-icon" style={{ display: evidencia.tipo_evidencia === 'image' ? 'none' : 'flex' }}>
                                    📄
                                </div>
                                <div className="evidencia-overlay">
                                    <div>{evidencia.estados?.nombre_estado || 'Estado'}</div>
                                    <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                                        {evidencia.nombre_archivo_original}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdenDetail;

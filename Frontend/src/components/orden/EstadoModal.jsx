import { useEffect } from 'react';
import ComentariosSection from './ComentariosSection';

const EstadoModal = ({ estado, evidencias, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNombreEstado = () => {
        return estado.estado?.nombre_estado || estado.estados?.nombre_estado || estado.nombre_estado || 'Estado';
    };

    // Cerrar con tecla ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const getFileIcon = (tipo) => {
        if (tipo === 'image') return '🖼️';
        if (tipo === 'document') return '📄';
        return '📎';
    };

    return (
        <div className="estado-modal-overlay" onClick={onClose}>
            <div className="estado-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="estado-modal-header">
                    <h3>📊 {getNombreEstado()}</h3>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Información del cambio de estado */}
                {estado.historial && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '6px'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                    Fecha del cambio
                                </div>
                                <div style={{ fontWeight: '500' }}>
                                    {formatDate(estado.historial.fecha_hora_cambio)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                    Responsable
                                </div>
                                <div style={{ fontWeight: '500' }}>
                                    {estado.historial.usuarios?.nombre || 'Usuario'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comentarios (solo lectura) */}
                <ComentariosSection
                    historialId={estado.historial?.id_historial}
                    comentarios={estado.historial?.comentarios_estado || []}
                    readOnly={true}
                />

                {/* Evidencias (solo lectura) */}
                <div className="evidencias-section" style={{ marginTop: '1.5rem' }}>
                    <h4>📎 Evidencias</h4>
                    {evidencias && evidencias.length > 0 ? (
                        <div className="evidencias-grid">
                            {evidencias.map((evidencia) => (
                                <div key={evidencia.id_evidencia} className="evidencia-item">
                                    {evidencia.tipo_evidencia === 'image' ? (
                                        <>
                                            <img
                                                src={`/evidencias/${evidencia.s3_key}`}
                                                alt={evidencia.nombre_archivo_original}
                                                className="evidencia-preview"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className="evidencia-icon" style={{ display: 'none' }}>
                                                🖼️
                                            </div>
                                        </>
                                    ) : (
                                        <div className="evidencia-icon">
                                            {getFileIcon(evidencia.tipo_evidencia)}
                                        </div>
                                    )}
                                    <div className="evidencia-overlay">
                                        {evidencia.nombre_archivo_original}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            No hay evidencias para este estado
                        </div>
                    )}
                </div>

                {/* Botón cerrar */}
                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EstadoModal;

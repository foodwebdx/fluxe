import { useEffect, useState } from 'react';
import ComentariosSection from './ComentariosSection';
import BloqueosSection from './BloqueosSection';
import { apiUrl } from '../../config/api';
import VisibilityToggle from './VisibilityToggle';

const EstadoModal = ({
    estado,
    evidencias,
    onClose,
    onRefresh,
    showVisibilityToggle = true
}) => {
    const [localEvidencias, setLocalEvidencias] = useState(evidencias || []);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        setLocalEvidencias(evidencias || []);
    }, [evidencias]);
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
        if (tipo === 'image') return 'image';
        if (tipo === 'pdf') return 'description';
        if (tipo === 'document') return 'description';
        return 'attach_file';
    };

    const handleDownload = (evidencia) => {
        if (evidencia.url) {
            window.open(evidencia.url, '_blank');
        }
    };

    const handleImageClick = (evidencia) => {
        if (evidencia.url) {
            window.open(evidencia.url, '_blank');
        }
    };

    const getIsPublic = (evidencia) => Boolean(evidencia.public ?? evidencia.Public);

    const updateLocalVisibility = (id, nextValue) => {
        setLocalEvidencias((prev) =>
            prev.map((item) =>
                item.id_evidencia === id
                    ? { ...item, public: nextValue, Public: nextValue }
                    : item
            )
        );
    };

    const handleToggleVisibility = async (evidencia) => {
        const currentValue = getIsPublic(evidencia);
        const nextValue = !currentValue;

        updateLocalVisibility(evidencia.id_evidencia, nextValue);
        setTogglingId(evidencia.id_evidencia);

        try {
            const response = await fetch(apiUrl(`/api/evidencias/${evidencia.id_evidencia}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    public: nextValue
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al actualizar visibilidad');
            }

            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al actualizar visibilidad:', err);
            updateLocalVisibility(evidencia.id_evidencia, currentValue);
            alert('Error al actualizar visibilidad: ' + err.message);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="estado-modal-overlay" onClick={onClose}>
            <div className="estado-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="estado-modal-header">
                    <h3>
                        <span className="material-icons">bar_chart</span> {getNombreEstado()}
                    </h3>
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
                <BloqueosSection
                    historialId={estado.historial?.id_historial}
                    bloqueos={estado.historial?.bloqueos_estado || []}
                    readOnly={true}
                    onRefresh={onRefresh}
                />

                <ComentariosSection
                    historialId={estado.historial?.id_historial}
                    comentarios={estado.historial?.comentarios_estado || []}
                    readOnly={true}
                    onRefresh={onRefresh}
                    showVisibilityToggle={showVisibilityToggle}
                />

                {/* Evidencias (solo lectura) */}
                <div className="evidencias-section" style={{ marginTop: '1.5rem' }}>
                    <h4>
                        <span className="material-icons">attach_file</span> Evidencias
                    </h4>
                    {localEvidencias && localEvidencias.length > 0 ? (
                        <div className="evidencias-grid">
                            {localEvidencias.map((evidencia) => (
                                <div key={evidencia.id_evidencia} className="evidencia-item">
                                    <div className="evidencia-media">
                                        {evidencia.tipo_evidencia === 'image' ? (
                                            <>
                                                <img
                                                    src={evidencia.url}
                                                    alt={evidencia.nombre_archivo_original}
                                                    className="evidencia-preview"
                                                    onClick={() => handleImageClick(evidencia)}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="evidencia-icon" style={{ display: 'none' }}>
                                                    <span className="material-icons">image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                className="evidencia-icon"
                                                onClick={() => handleDownload(evidencia)}
                                                title={`Descargar ${evidencia.nombre_archivo_original}`}
                                            >
                                                <span className="material-icons">
                                                    {getFileIcon(evidencia.tipo_evidencia)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="evidencia-overlay">
                                            {evidencia.nombre_archivo_original}
                                        </div>
                                    </div>
                                    <div className="evidencia-actions">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            onClick={() => handleDownload(evidencia)}
                                            title="Descargar evidencia"
                                        >
                                            <span className="material-icons">download</span>
                                        </button>
                                        {showVisibilityToggle && (
                                            <VisibilityToggle
                                                isPublic={getIsPublic(evidencia)}
                                                onToggle={() => handleToggleVisibility(evidencia)}
                                                disabled={togglingId === evidencia.id_evidencia}
                                                title={getIsPublic(evidencia) ? 'Visible para cliente' : 'Oculto para cliente'}
                                            />
                                        )}
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

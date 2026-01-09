import { useEffect, useState } from 'react';
import { apiUrl } from '../../config/api';

const BloqueosSection = ({
    historialId,
    bloqueos,
    onRefresh,
    readOnly = false
}) => {
    const [nuevoBloqueo, setNuevoBloqueo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localBloqueos, setLocalBloqueos] = useState(bloqueos || []);

    useEffect(() => {
        setLocalBloqueos(bloqueos || []);
    }, [bloqueos]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAgregarBloqueo = async (e) => {
        e.preventDefault();

        if (!nuevoBloqueo.trim()) {
            alert('Por favor ingrese un motivo de bloqueo');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(apiUrl('/api/bloqueos-estado'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_historial: historialId,
                    id_usuario: 1,
                    descripcion_bloqueo: nuevoBloqueo.trim(),
                    estado_bloqueado: true
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al crear bloqueo');
            }

            setNuevoBloqueo('');

            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al crear bloqueo:', err);
            alert('Error al crear bloqueo: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleEstado = async (bloqueo) => {
        const nextValue = !bloqueo.estado_bloqueado;
        setSubmitting(true);

        try {
            const response = await fetch(apiUrl(`/api/bloqueos-estado/${bloqueo.id_bloqueo}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado_bloqueado: nextValue
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al actualizar bloqueo');
            }

            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al actualizar bloqueo:', err);
            alert('Error al actualizar bloqueo: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBloqueo = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este bloqueo?')) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(apiUrl(`/api/bloqueos-estado/${id}`), {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar bloqueo');
            }

            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al eliminar bloqueo:', err);
            alert('Error al eliminar bloqueo: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bloqueos-section">
            <h4>
                <span className="material-icons">block</span> Bloqueos
            </h4>

            {localBloqueos && localBloqueos.length > 0 ? (
                <div className="bloqueos-list">
                    {localBloqueos.map((bloqueo) => (
                        <div key={bloqueo.id_bloqueo} className="bloqueo-item">
                            <div className="bloqueo-header">
                                <span className="bloqueo-usuario">
                                    {bloqueo.usuarios?.nombre || 'Usuario'}
                                </span>
                                <span className="bloqueo-fecha">
                                    {formatDate(bloqueo.fecha_hora_bloqueo)}
                                </span>
                            </div>
                            <div className="bloqueo-texto">{bloqueo.descripcion_bloqueo}</div>
                            <div className="bloqueo-respuesta">
                                Respuesta: {bloqueo.respuesta_cliente || 'Sin respuesta'}
                            </div>
                            <div className="bloqueo-actions">
                                <span className={`bloqueo-status ${bloqueo.estado_bloqueado ? 'active' : 'resolved'}`}>
                                    {bloqueo.estado_bloqueado ? 'Bloqueado' : 'Resuelto'}
                                </span>
                                {!readOnly && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn-link"
                                            disabled={submitting}
                                            onClick={() => handleToggleEstado(bloqueo)}
                                        >
                                            {bloqueo.estado_bloqueado ? 'Marcar resuelto' : 'Reabrir'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-link danger"
                                            disabled={submitting}
                                            onClick={() => handleDeleteBloqueo(bloqueo.id_bloqueo)}
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-data">No hay bloqueos para este estado</div>
            )}

            {!readOnly && (
                <form onSubmit={handleAgregarBloqueo} className="bloqueo-form">
                    <textarea
                        className="bloqueo-input"
                        placeholder="Agregar motivo de bloqueo..."
                        value={nuevoBloqueo}
                        onChange={(e) => setNuevoBloqueo(e.target.value)}
                        rows={3}
                    />
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Guardando...' : 'Crear bloqueo'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BloqueosSection;

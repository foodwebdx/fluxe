import { useState } from 'react';

const ComentariosSection = ({
    historialId,
    comentarios,
    onRefresh,
    readOnly = false
}) => {
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');

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

    const handleAgregarComentario = async (e) => {
        e.preventDefault();

        if (!nuevoComentario.trim()) {
            alert('Por favor ingrese un comentario');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/comentarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_historial: historialId,
                    id_usuario: 1, // TODO: Obtener del usuario logueado
                    texto_comentario: nuevoComentario.trim()
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al agregar comentario');
            }

            // Limpiar formulario
            setNuevoComentario('');

            // Refrescar datos
            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al agregar comentario:', err);
            alert('Error al agregar comentario: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComentario = (comentario) => {
        setEditingId(comentario.id_comentario);
        setEditingText(comentario.texto_comentario);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };

    const handleSaveEdit = async (id) => {
        if (!editingText.trim()) {
            alert('El comentario no puede estar vacío');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`http://localhost:3000/api/comentarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    texto_comentario: editingText.trim()
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al actualizar comentario');
            }

            // Resetear estado de edición
            setEditingId(null);
            setEditingText('');

            // Refrescar datos
            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al actualizar comentario:', err);
            alert('Error al actualizar comentario: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComentario = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este comentario?')) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`http://localhost:3000/api/comentarios/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar comentario');
            }

            // Refrescar datos
            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            alert('Error al eliminar comentario: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="comentarios-section">
            <h4>💬 Comentarios</h4>

            {/* Lista de comentarios existentes */}
            {comentarios && comentarios.length > 0 ? (
                <div className="comentarios-list">
                    {comentarios.map((comentario) => (
                        <div key={comentario.id_comentario} className="comentario-item">
                            <div className="comentario-header">
                                <span className="comentario-usuario">
                                    {comentario.usuarios?.nombre || 'Usuario'}
                                </span>
                                <span className="comentario-fecha">
                                    {formatDate(comentario.fecha_hora_comentario)}
                                </span>
                            </div>

                            {editingId === comentario.id_comentario ? (
                                // Modo edición
                                <div className="comentario-edit-form">
                                    <input
                                        type="text"
                                        className="comentario-input"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        disabled={submitting}
                                        autoFocus
                                    />
                                    <div className="comentario-edit-actions">
                                        <button
                                            type="button"
                                            className="btn-sm btn-primary"
                                            onClick={() => handleSaveEdit(comentario.id_comentario)}
                                            disabled={submitting || !editingText.trim()}
                                        >
                                            {submitting ? 'Guardando...' : '✓ Guardar'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-sm btn-secondary"
                                            onClick={handleCancelEdit}
                                            disabled={submitting}
                                        >
                                            ✕ Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Modo visualización
                                <>
                                    <div className="comentario-texto">
                                        {comentario.texto_comentario}
                                    </div>
                                    {!readOnly && (
                                        <div className="comentario-actions">
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => handleEditComentario(comentario)}
                                                title="Editar comentario"
                                                disabled={submitting}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDeleteComentario(comentario.id_comentario)}
                                                title="Eliminar comentario"
                                                disabled={submitting}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-data">
                    No hay comentarios para este estado
                </div>
            )}

            {/* Formulario para agregar nuevo comentario */}
            {!readOnly && (
                <form onSubmit={handleAgregarComentario} className="comentario-form">
                    <input
                        type="text"
                        className="comentario-input"
                        placeholder="Agregar un comentario..."
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting || !nuevoComentario.trim()}
                    >
                        {submitting ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ComentariosSection;

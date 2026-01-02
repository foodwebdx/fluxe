import { useState } from 'react';

const ComentariosSection = ({
    historialId,
    comentarios,
    onRefresh,
    readOnly = false
}) => {
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
                            <div className="comentario-texto">
                                {comentario.texto_comentario}
                            </div>
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

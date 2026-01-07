import { useEffect, useState } from 'react';
import { apiUrl } from '../../config/api';
import VisibilityToggle from './VisibilityToggle';


const EvidenciasSection = ({
    ordenId,
    estadoId,
    evidencias,
    onRefresh,
    readOnly = false
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [comentario, setComentario] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [localEvidencias, setLocalEvidencias] = useState(evidencias || []);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        setLocalEvidencias(evidencias || []);
    }, [evidencias]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            createPreview(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            createPreview(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const createPreview = (file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Por favor seleccione un archivo');
            return;
        }

        setUploading(true);

        try {
            // Crear FormData para enviar archivo
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('id_orden', ordenId);
            formData.append('id_estado', estadoId);
            formData.append('id_usuario', 1); // TODO: Obtener del usuario logueado
            if (comentario.trim()) {
                formData.append('comentario', comentario.trim());
            }

            const response = await fetch(apiUrl('/api/evidencias'), {
                method: 'POST',
                body: formData // NO enviar Content-Type, el navegador lo configura automáticamente
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al subir evidencia');
            }

            // Limpiar formulario
            setSelectedFile(null);
            setPreview(null);
            setComentario('');

            // Refrescar datos
            if (onRefresh) {
                await onRefresh();
            }

            alert('Evidencia subida exitosamente');
        } catch (err) {
            console.error('Error al subir evidencia:', err);
            alert('Error al subir evidencia: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (tipo) => {
        if (tipo === 'image') return '🖼️';
        if (tipo === 'pdf') return '📄';
        if (tipo === 'document') return '📝';
        return '📎';
    };

    const handleDeleteEvidencia = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta evidencia?')) {
            return;
        }

        setUploading(true);

        try {
            const response = await fetch(apiUrl(`/api/evidencias/${id}`), {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar evidencia');
            }

            // Refrescar datos
            if (onRefresh) {
                await onRefresh();
            }

            alert('Evidencia eliminada exitosamente');
        } catch (err) {
            console.error('Error al eliminar evidencia:', err);
            alert('Error al eliminar evidencia: ' + err.message);
        } finally {
            setUploading(false);
        }
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
        <div className="evidencias-section">
            <h4>📎 Evidencias</h4>

            {/* Lista de evidencias existentes */}
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
                                            🖼️
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="evidencia-icon"
                                        onClick={() => handleDownload(evidencia)}
                                        title={`Descargar ${evidencia.nombre_archivo_original}`}
                                    >
                                        {getFileIcon(evidencia.tipo_evidencia)}
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
                                    ⬇️
                                </button>
                                <VisibilityToggle
                                    isPublic={getIsPublic(evidencia)}
                                    onToggle={() => handleToggleVisibility(evidencia)}
                                    disabled={uploading || togglingId === evidencia.id_evidencia}
                                    title={getIsPublic(evidencia) ? 'Visible para cliente' : 'Oculto para cliente'}
                                />
                                {!readOnly && (
                                    <button
                                        type="button"
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDeleteEvidencia(evidencia.id_evidencia)}
                                        title="Eliminar evidencia"
                                        disabled={uploading}
                                    >
                                        🗑️
                                    </button>
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

            {/* Formulario para subir nueva evidencia */}
            {!readOnly && (
                <div style={{ marginTop: '1rem' }}>
                    {!selectedFile ? (
                        <div
                            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <div className="upload-icon">📎</div>
                            <div className="upload-text">
                                Haz clic o arrastra un archivo aquí
                            </div>
                            <input
                                id="file-input"
                                type="file"
                                onChange={handleFileSelect}
                                accept="image/*,.pdf,.doc,.docx"
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '1rem',
                            background: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '6px'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: '#f8fafc',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}>
                                        📄
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {selectedFile.name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>

                            <input
                                type="text"
                                className="comentario-input"
                                placeholder="Comentario (opcional)"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                style={{ width: '100%', marginBottom: '0.5rem' }}
                            />

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={uploading}
                                style={{ width: '100%' }}
                            >
                                {uploading ? 'Subiendo...' : 'Subir Evidencia'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EvidenciasSection;

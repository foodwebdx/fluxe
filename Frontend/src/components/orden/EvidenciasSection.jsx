import { useState } from 'react';

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
            const evidenciaData = {
                id_orden: ordenId,
                id_estado: estadoId,
                id_usuario: 1, // TODO: Obtener del usuario logueado
                tipo_evidencia: selectedFile.type.startsWith('image/') ? 'image' : 'document',
                s3_key: `evidencias/${ordenId}/${Date.now()}_${selectedFile.name}`,
                nombre_archivo_original: selectedFile.name,
                comentario: comentario.trim() || null
            };

            const response = await fetch('http://localhost:3000/api/evidencias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(evidenciaData)
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
        if (tipo === 'document') return '📄';
        return '📎';
    };

    return (
        <div className="evidencias-section">
            <h4>📎 Evidencias</h4>

            {/* Lista de evidencias existentes */}
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

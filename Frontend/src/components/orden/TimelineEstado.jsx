import ComentariosSection from './ComentariosSection';
import EvidenciasSection from './EvidenciasSection';

const TimelineEstado = ({
    estado,
    type,
    ordenId,
    evidencias,
    onClick,
    onAvanzar,
    onRetroceder,
    onRefresh,
    readOnly = false,
    showVisibilityToggle = true
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const getNombreEstado = () => {
        return estado.estado?.nombre_estado || estado.estados?.nombre_estado || estado.nombre_estado || 'Estado';
    };

    const renderIcon = () => {
        if (type === 'completed') return '✓';
        if (type === 'current') return '●';
        return '○';
    };

    return (
        <div className={`timeline-estado ${type}`}>
            <div
                className="estado-icon"
                onClick={type === 'completed' ? onClick : undefined}
            >
                {renderIcon()}
            </div>
            <div className="estado-nombre">{getNombreEstado()}</div>
            <div className="estado-fecha">
                {estado.historial?.fecha_hora_cambio
                    ? formatDate(estado.historial.fecha_hora_cambio)
                    : '--'}
            </div>

            {/* Botón retroceder para el último estado previo */}
            {type === 'completed' && onRetroceder && !readOnly && (
                <button className="btn-retroceder" onClick={onRetroceder}>
                    ← Retroceder
                </button>
            )}

            {/* Botón avanzar para el siguiente estado futuro */}
            {type === 'pending' && onAvanzar && !readOnly && (
                <button className="btn-avanzar" onClick={onAvanzar}>
                    Avanzar →
                </button>
            )}

            {/* Contenido expandido para estado actual */}
            {type === 'current' && estado.historial && (
                <div className="estado-content">
                    <ComentariosSection
                        historialId={estado.historial.id_historial}
                        comentarios={estado.historial.comentarios_estado || []}
                        onRefresh={onRefresh}
                        readOnly={readOnly}
                        showVisibilityToggle={showVisibilityToggle}
                    />

                    <EvidenciasSection
                        ordenId={ordenId}
                        estadoId={estado.id_estado}
                        evidencias={evidencias || []}
                        onRefresh={onRefresh}
                        readOnly={readOnly}
                        showVisibilityToggle={showVisibilityToggle}
                    />
                </div>
            )}
        </div>
    );
};

export default TimelineEstado;

import { useState } from 'react';
import TimelineEstado from './TimelineEstado';
import EstadoModal from './EstadoModal';
import { apiUrl } from '../../config/api';


const EstadosTimeline = ({
    estadosFlujo,
    historial,
    estadoActualId,
    ordenId,
    evidencias,
    onEstadoChange,
    onRefresh
}) => {
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Clasificar estados en previos, actual y futuros
    const clasificarEstados = () => {
        const estadosPrevios = [];
        let estadoActual = null;
        const estadosFuturos = [];

        // Encontrar posición del estado actual
        const posicionActual = estadosFlujo.find(e => e.id_estado === estadoActualId)?.posicion;

        estadosFlujo.forEach(estadoFlujo => {
            // Buscar si existe en el historial
            const historialEstado = historial.find(h => h.id_estado === estadoFlujo.id_estado);

            if (estadoFlujo.posicion < posicionActual) {
                // Estado previo
                estadosPrevios.push({
                    ...estadoFlujo,
                    historial: historialEstado,
                    status: 'completed',
                    hasData: !!historialEstado
                });
            } else if (estadoFlujo.id_estado === estadoActualId) {
                // Estado actual
                estadoActual = {
                    ...estadoFlujo,
                    historial: historialEstado,
                    status: 'current',
                    hasData: !!historialEstado
                };
            } else {
                // Estado futuro
                estadosFuturos.push({
                    ...estadoFlujo,
                    historial: null,
                    status: 'pending',
                    hasData: false
                });
            }
        });

        return { estadosPrevios, estadoActual, estadosFuturos };
    };

    const { estadosPrevios, estadoActual, estadosFuturos } = clasificarEstados();

    const handleVerEstado = (estado) => {
        setSelectedEstado(estado);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEstado(null);
    };

    const handleAvanzarEstado = async (estado) => {
        if (!confirm(`¿Está seguro de avanzar al estado "${estado.estado?.nombre_estado || estado.estados?.nombre_estado}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/ordenes/${ordenId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_estado: estado.id_estado
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al cambiar estado');
            }

            // Notificar cambio exitoso
            alert('Estado actualizado exitosamente');

            // Recargar datos
            if (onEstadoChange) {
                await onEstadoChange();
            }
        } catch (err) {
            console.error('Error al avanzar estado:', err);
            alert('Error al cambiar estado: ' + err.message);
        }
    };

    const handleRetrocederEstado = async () => {
        const estadoPrevio = estadosPrevios[estadosPrevios.length - 1];

        if (!estadoPrevio) return;

        if (!confirm(`¿Está seguro de retroceder al estado "${estadoPrevio.estado?.nombre_estado || estadoPrevio.estados?.nombre_estado}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/ordenes/${ordenId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_estado: estadoPrevio.id_estado
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al cambiar estado');
            }

            // Notificar cambio exitoso
            alert('Estado retrocedido exitosamente');

            // Recargar datos
            if (onEstadoChange) {
                await onEstadoChange();
            }
        } catch (err) {
            console.error('Error al retroceder estado:', err);
            alert('Error al cambiar estado: ' + err.message);
        }
    };

    // Filtrar evidencias del estado seleccionado para el modal
    const evidenciasEstado = selectedEstado
        ? evidencias.filter(e => e.id_estado === selectedEstado.id_estado)
        : [];

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <h2>🔄 Línea de Tiempo del Proceso</h2>
            </div>

            <div className="timeline-wrapper">
                {/* Estados Previos */}
                {estadosPrevios.map((estado, index) => (
                    <TimelineEstado
                        key={estado.id_estado}
                        estado={estado}
                        type="completed"
                        onClick={() => handleVerEstado(estado)}
                        onRetroceder={index === estadosPrevios.length - 1 ? handleRetrocederEstado : null}
                    />
                ))}

                {/* Estado Actual */}
                {estadoActual && (
                    <TimelineEstado
                        estado={estadoActual}
                        type="current"
                        ordenId={ordenId}
                        evidencias={evidencias.filter(e => e.id_estado === estadoActual.id_estado)}
                        onRefresh={onRefresh}
                    />
                )}

                {/* Estados Futuros */}
                {estadosFuturos.map((estado, index) => (
                    <TimelineEstado
                        key={estado.id_estado}
                        estado={estado}
                        type="pending"
                        onAvanzar={index === 0 ? () => handleAvanzarEstado(estado) : null}
                    />
                ))}
            </div>

            {/* Modal para ver estado previo */}
            {showModal && selectedEstado && (
                <EstadoModal
                    estado={selectedEstado}
                    evidencias={evidenciasEstado}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default EstadosTimeline;

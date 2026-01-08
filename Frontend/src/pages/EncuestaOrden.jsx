import { useEffect, useMemo, useState } from 'react';
import OrdenInfoCard from '../components/orden/OrdenInfoCard';
import { apiUrl } from '../config/api';
import './Dashboard.css';
import '../components/orden/OrdenDetail.css';
import './EncuestaOrden.css';

const EncuestaOrden = ({ isPublic = false }) => {
    const [searchInput, setSearchInput] = useState('');
    const [orden, setOrden] = useState(null);
    const [estadosFlujo, setEstadosFlujo] = useState([]);
    const [encuesta, setEncuesta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isClientInfoExpanded, setIsClientInfoExpanded] = useState(false);
    const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(false);

    const [satisfaccionServicio, setSatisfaccionServicio] = useState('');
    const [satisfaccionTiempo, setSatisfaccionTiempo] = useState('');
    const [satisfaccionGeneral, setSatisfaccionGeneral] = useState('');
    const [comentario, setComentario] = useState('');

    const initialOrdenId = useMemo(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        const searchParams = new URLSearchParams(window.location.search);
        let value = searchParams.get('orden') || searchParams.get('id');

        if (!value && window.location.hash) {
            const hashValue = window.location.hash.replace(/^#/, '');
            const queryIndex = hashValue.indexOf('?');
            if (queryIndex >= 0) {
                const hashParams = new URLSearchParams(hashValue.slice(queryIndex + 1));
                value = hashParams.get('orden') || hashParams.get('id');
            }
        }

        return value;
    }, []);

    useEffect(() => {
        if (!isPublic) {
            return;
        }

        if (initialOrdenId) {
            const parsedId = Number.parseInt(initialOrdenId, 10);
            if (!Number.isNaN(parsedId)) {
                loadOrdenData(parsedId);
            } else {
                setError('El enlace de la encuesta no es válido.');
            }
        } else {
            setError('No se encontró la orden asociada a esta encuesta.');
        }
    }, [initialOrdenId, isPublic]);

    const resetForm = () => {
        setSatisfaccionServicio('');
        setSatisfaccionTiempo('');
        setSatisfaccionGeneral('');
        setComentario('');
        setEncuesta(null);
        setSuccess(null);
    };

    const loadOrdenData = async (ordenId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            setOrden(null);
            setEstadosFlujo([]);
            resetForm();

            const ordenRes = await fetch(apiUrl(`/api/ordenes/${ordenId}`));
            if (!ordenRes.ok) {
                if (ordenRes.status === 404) {
                    throw new Error('Orden no encontrada');
                }
                throw new Error('Error al cargar la orden');
            }

            const ordenData = await ordenRes.json();
            if (!ordenData?.data) {
                throw new Error('Orden no encontrada');
            }
            setOrden(ordenData.data);

            const flujoRes = await fetch(apiUrl(`/api/flujos/${ordenData.data.id_flujo}/estados`));
            if (!flujoRes.ok) throw new Error('Error al cargar estados del flujo');
            const flujoData = await flujoRes.json();
            setEstadosFlujo(flujoData.data || []);

            const encuestaRes = await fetch(apiUrl(`/api/encuestas/orden/${ordenId}`));
            if (encuestaRes.ok) {
                const encuestaData = await encuestaRes.json();
                setEncuesta(encuestaData.data);
                setSatisfaccionServicio(encuestaData.data?.satisfaccion_servicio || '');
                setSatisfaccionTiempo(encuestaData.data?.satisfaccion_tiempo || '');
                setSatisfaccionGeneral(encuestaData.data?.satisfaccion_general || '');
                setComentario(encuestaData.data?.comentario || '');
            } else if (encuestaRes.status !== 404) {
                const encuestaError = await encuestaRes.json();
                throw new Error(encuestaError.message || 'Error al validar la encuesta');
            }
        } catch (err) {
            console.error('Error cargando datos de la encuesta:', err);
            setError(err.message || 'Error al cargar la encuesta');
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        const trimmed = searchInput.trim();

        if (!trimmed) {
            setError('Por favor ingresa un número de orden');
            setHasSearched(true);
            return;
        }

        const ordenId = Number.parseInt(trimmed, 10);
        if (Number.isNaN(ordenId)) {
            setError('Número de orden inválido');
            setHasSearched(true);
            return;
        }

        await loadOrdenData(ordenId);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!orden) {
            setError('No se encontró una orden válida para la encuesta.');
            return;
        }

        if (!satisfaccionServicio || !satisfaccionTiempo || !satisfaccionGeneral) {
            setError('Por favor completa todas las calificaciones antes de enviar.');
            return;
        }

        try {
            setSubmitLoading(true);

            const payload = {
                id_orden: orden.id_orden,
                comentario: comentario || null,
                satisfaccion_servicio: parseInt(satisfaccionServicio, 10),
                satisfaccion_tiempo: parseInt(satisfaccionTiempo, 10),
                satisfaccion_general: parseInt(satisfaccionGeneral, 10)
            };

            const response = await fetch(apiUrl('/api/encuestas'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar la encuesta');
            }

            setEncuesta(data.data);
            setSuccess('Gracias por tu respuesta. Tu encuesta fue enviada correctamente.');
        } catch (err) {
            console.error('Error enviando encuesta:', err);
            setError(err.message || 'Error al enviar la encuesta');
        } finally {
            setSubmitLoading(false);
        }
    };

    const isInFinalState = estadosFlujo.length > 0 &&
        estadosFlujo[estadosFlujo.length - 1]?.id_estado === orden?.id_estado_actual;

    const isSurveyLocked = Boolean(encuesta) || !isInFinalState;

    const ratingOptions = [1, 2, 3, 4, 5];

    const renderRatingGroup = (label, name, value, onChange) => (
        <div className="form-group">
            <label>{label}</label>
            <div className="rating-group">
                {ratingOptions.map((option) => (
                    <label
                        key={`${name}-${option}`}
                        className={`rating-option${isSurveyLocked ? ' disabled' : ''}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={Number(value) === option}
                            onChange={() => onChange(option)}
                            disabled={isSurveyLocked}
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="orden-detail-container">
            <div className="orden-detail-header" style={{ justifyContent: 'space-between' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>
                    {orden ? `Encuesta Orden #${orden.id_orden}` : 'Encuesta de Orden'}
                </h1>
            </div>

            {!isPublic && (
                <div className="filters-container">
                    <form className="filters-grid" onSubmit={handleSearch}>
                        <div className="filter-group">
                            <label htmlFor="order-search">🔎 Número de orden</label>
                            <input
                                id="order-search"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Ej: 12345"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="filter-group">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando encuesta...</p>
                </div>
            )}

            {!loading && error && (
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && !orden && hasSearched && (
                <div className="error-container">
                    <h2>Orden no encontrada</h2>
                    <p>Verifica el número e intenta nuevamente.</p>
                </div>
            )}

            {!loading && !error && !orden && !hasSearched && isPublic && (
                <div className="error-container" style={{ color: '#64748b' }}>
                    <h2>Encuesta de Orden</h2>
                    <p>Estamos preparando tu encuesta.</p>
                </div>
            )}

            {!loading && orden && (
                <>
                    <div className="orden-detail-grid">
                        <OrdenInfoCard
                            orden={orden}
                            isInFinalState={isInFinalState}
                            readOnly={true}
                        />
                    </div>

                    {(orden.clientes || orden.cliente) && (
                        <div className="product-info-section">
                            <div
                                className="product-info-header"
                                onClick={() => setIsClientInfoExpanded(!isClientInfoExpanded)}
                            >
                                <h2>👤 Información del Cliente</h2>
                                <button className="expand-button">
                                    {isClientInfoExpanded ? '▼' : '▶'}
                                </button>
                            </div>
                            {isClientInfoExpanded && (
                                <div className="product-info-content">
                                    <div className="product-info-grid">
                                        <div className="product-info-item">
                                            <span className="product-info-label">Nombre Completo:</span>
                                            <span className="product-info-value">
                                                {(orden.clientes || orden.cliente).nombre_completo}
                                            </span>
                                        </div>
                                        <div className="product-info-item">
                                            <span className="product-info-label">Tipo de Identificación:</span>
                                            <span className="product-info-value">
                                                {(orden.clientes || orden.cliente).tipo_identificacion}
                                            </span>
                                        </div>
                                        <div className="product-info-item">
                                            <span className="product-info-label">Número de Identificación:</span>
                                            <span className="product-info-value">
                                                {(orden.clientes || orden.cliente).numero_identificacion}
                                            </span>
                                        </div>
                                        <div className="product-info-item">
                                            <span className="product-info-label">Teléfono de Contacto:</span>
                                            <span className="product-info-value">
                                                {(orden.clientes || orden.cliente).telefono_contacto}
                                            </span>
                                        </div>
                                        <div className="product-info-item">
                                            <span className="product-info-label">Correo Electrónico:</span>
                                            <span className="product-info-value">
                                                {(orden.clientes || orden.cliente).correo_electronico}
                                            </span>
                                        </div>
                                        {(orden.clientes || orden.cliente).tipo_direccion && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Tipo de Dirección:</span>
                                                <span className="product-info-value">
                                                    {(orden.clientes || orden.cliente).tipo_direccion}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.clientes || orden.cliente).direccion && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Dirección:</span>
                                                <span className="product-info-value">
                                                    {(orden.clientes || orden.cliente).direccion}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.clientes || orden.cliente).notas_cliente && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Notas:</span>
                                                <span className="product-info-value">
                                                    {(orden.clientes || orden.cliente).notas_cliente}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(orden.producto || orden.productos) && (
                        <div className="product-info-section">
                            <div
                                className="product-info-header"
                                onClick={() => setIsProductInfoExpanded(!isProductInfoExpanded)}
                            >
                                <h2>📦 Información del Producto</h2>
                                <button className="expand-button">
                                    {isProductInfoExpanded ? '▼' : '▶'}
                                </button>
                            </div>
                            {isProductInfoExpanded && (
                                <div className="product-info-content">
                                    <div className="product-info-grid">
                                        <div className="product-info-item">
                                            <span className="product-info-label">Nombre:</span>
                                            <span className="product-info-value">
                                                {(orden.producto || orden.productos).nombre_producto}
                                            </span>
                                        </div>
                                        {(orden.producto || orden.productos).identificador_interno && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Identificador Interno:</span>
                                                <span className="product-info-value">
                                                    {(orden.producto || orden.productos).identificador_interno}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.producto || orden.productos).descripcion && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Descripción:</span>
                                                <span className="product-info-value">
                                                    {(orden.producto || orden.productos).descripcion}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.producto || orden.productos).modelo && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Modelo:</span>
                                                <span className="product-info-value">
                                                    {(orden.producto || orden.productos).modelo}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.producto || orden.productos).numero_serie && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Número de Serie:</span>
                                                <span className="product-info-value">
                                                    {(orden.producto || orden.productos).numero_serie}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.producto || orden.productos).identificador_unico_adicional && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Identificador Único Adicional:</span>
                                                <span className="product-info-value">
                                                    {(orden.producto || orden.productos).identificador_unico_adicional}
                                                </span>
                                            </div>
                                        )}
                                        {(orden.producto || orden.productos).notas_producto && (
                                            <div className="product-info-item">
                                                <span className="product-info-label">Notas:</span>
                                                <span className="product-info-value">
                                                    {(orden.producto || orden.productos).notas_producto}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="encuesta-card">
                        <div className="encuesta-header">
                            <h2>Queremos conocer tu experiencia</h2>
                            <p className="encuesta-helper">
                                Califica del 1 (muy malo) al 5 (excelente).
                            </p>
                        </div>

                        {success && (
                            <div className="encuesta-message success">{success}</div>
                        )}

                        {encuesta && (
                            <div className="encuesta-message info">
                                Ya registramos tu encuesta. Gracias por tu tiempo.
                            </div>
                        )}

                        {!encuesta && !isInFinalState && (
                            <div className="encuesta-message warning">
                                La encuesta solo está disponible cuando la orden está completada.
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {renderRatingGroup(
                                'Satisfacción del servicio',
                                'satisfaccion_servicio',
                                satisfaccionServicio,
                                setSatisfaccionServicio
                            )}
                            {renderRatingGroup(
                                'Satisfacción del tiempo de entrega',
                                'satisfaccion_tiempo',
                                satisfaccionTiempo,
                                setSatisfaccionTiempo
                            )}
                            {renderRatingGroup(
                                'Satisfacción general',
                                'satisfaccion_general',
                                satisfaccionGeneral,
                                setSatisfaccionGeneral
                            )}
                            <div className="form-group">
                                <label>Comentario (opcional)</label>
                                <textarea
                                    rows="3"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Cuéntanos más sobre tu experiencia"
                                    disabled={isSurveyLocked}
                                />
                            </div>
                            <div className="encuesta-actions">
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isSurveyLocked || submitLoading}
                                >
                                    {submitLoading ? 'Enviando...' : 'Enviar encuesta'}
                                </button>
                            </div>
                        </form>

                        {encuesta && (
                            <div className="encuesta-summary">
                                <h3>Resumen de tu encuesta</h3>
                                <div className="encuesta-summary-grid">
                                    <div className="encuesta-summary-item">
                                        <span>Servicio</span>
                                        {encuesta.satisfaccion_servicio}
                                    </div>
                                    <div className="encuesta-summary-item">
                                        <span>Tiempo</span>
                                        {encuesta.satisfaccion_tiempo}
                                    </div>
                                    <div className="encuesta-summary-item">
                                        <span>General</span>
                                        {encuesta.satisfaccion_general}
                                    </div>
                                    <div className="encuesta-summary-item">
                                        <span>Comentario</span>
                                        {encuesta.comentario || 'Sin comentario'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default EncuestaOrden;

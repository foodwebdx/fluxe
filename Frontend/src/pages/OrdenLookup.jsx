import { useState } from 'react';
import OrdenInfoCard from '../components/orden/OrdenInfoCard';
import EstadosTimeline from '../components/orden/EstadosTimeline';
import './Dashboard.css';
import '../components/orden/OrdenDetail.css';
import { apiUrl } from '../config/api';

const OrdenLookup = ({ isPublic = false }) => {
    const [searchInput, setSearchInput] = useState('');
    const [orden, setOrden] = useState(null);
    const [estadosFlujo, setEstadosFlujo] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [evidencias, setEvidencias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isClientInfoExpanded, setIsClientInfoExpanded] = useState(false);
    const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(false);

    const resetResults = () => {
        setOrden(null);
        setEstadosFlujo([]);
        setHistorial([]);
        setEvidencias([]);
    };

    const loadOrdenData = async (ordenId) => {
        try {
            setLoading(true);
            setError(null);
            resetResults();

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

            const historialRes = await fetch(apiUrl(`/api/historial/orden/${ordenId}`));
            if (!historialRes.ok) throw new Error('Error al cargar historial');
            const historialData = await historialRes.json();
            setHistorial(historialData.data || []);

            const evidenciasRes = await fetch(apiUrl(`/api/evidencias/orden/${ordenId}`));
            if (!evidenciasRes.ok) throw new Error('Error al cargar evidencias');
            const evidenciasData = await evidenciasRes.json();
            setEvidencias(evidenciasData.data || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.message || 'Error al buscar la orden');
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
            resetResults();
            return;
        }

        const ordenId = Number.parseInt(trimmed, 10);
        if (Number.isNaN(ordenId)) {
            setError('Número de orden inválido');
            setHasSearched(true);
            resetResults();
            return;
        }

        await loadOrdenData(ordenId);
    };

    const handleClear = () => {
        setSearchInput('');
        setError(null);
        setHasSearched(false);
        resetResults();
    };

    const isPublicItem = (item) => {
        const value = item?.public ?? item?.Public;
        if (typeof value === 'string') {
            return value.trim().toLowerCase() === 'true';
        }
        return Boolean(value);
    };

    const historialPublico = historial.map((item) => ({
        ...item,
        comentarios_estado: (item.comentarios_estado || []).filter(isPublicItem)
    }));

    const evidenciasPublicas = evidencias.filter(isPublicItem);

    const isInFinalState = estadosFlujo.length > 0 &&
        estadosFlujo[estadosFlujo.length - 1]?.id_estado === orden?.id_estado_actual;

    return (
        <div className="orden-detail-container">
            <div className="orden-detail-header" style={{ justifyContent: 'space-between' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>
                    {orden ? `Orden #${orden.id_orden}` : (isPublic ? 'Consulta de Orden' : 'Consulta de Órdenes')}
                </h1>
            </div>

            <div className="filters-container">
                <form className="filters-grid" onSubmit={handleSearch}>
                    <div className="filter-group">
                        <label htmlFor="order-search">
                            <span className="material-icons">search</span> Número de orden
                        </label>
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
                    <div className="filter-group">
                        <button
                            type="button"
                            className="btn-clear-filters"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            Limpiar
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Buscando orden...</p>
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

            {!loading && !error && !orden && !hasSearched && (
                <div className="error-container" style={{ color: '#64748b' }}>
                    <h2>Busca una orden</h2>
                    <p>Ingresa el número de orden para ver su estado.</p>
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
                                <h2>
                                    <span className="material-icons">person</span> Información del Cliente
                                </h2>
                                <button className="expand-button">
                                    <span className="material-icons">
                                        {isClientInfoExpanded ? 'expand_more' : 'chevron_right'}
                                    </span>
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
                                <h2>
                                    <span className="material-icons">inventory</span> Información del Producto
                                </h2>
                                <button className="expand-button">
                                    <span className="material-icons">
                                        {isProductInfoExpanded ? 'expand_more' : 'chevron_right'}
                                    </span>
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

                    <EstadosTimeline
                        estadosFlujo={estadosFlujo}
                        historial={historialPublico}
                        estadoActualId={orden.id_estado_actual}
                        ordenId={orden.id_orden}
                        evidencias={evidenciasPublicas}
                        readOnly={true}
                        showVisibilityToggle={false}
                    />

                    {evidenciasPublicas.length > 0 && (
                        <div className="all-evidencias-panel">
                            <h2>
                                <span className="material-icons">attach_file</span> Evidencias públicas ({evidenciasPublicas.length})
                            </h2>
                            <div className="evidencias-grid">
                                {evidenciasPublicas.map((evidencia) => {
                                    const getFileIcon = (tipo) => {
                                        if (tipo === 'image') return 'image';
                                        if (tipo === 'pdf') return 'description';
                                        if (tipo === 'document') return 'description';
                                        return 'attach_file';
                                    };

                                    const handleDownload = () => {
                                        if (evidencia.url) {
                                            window.open(evidencia.url, '_blank');
                                        }
                                    };

                                    const handleImageClick = () => {
                                        if (evidencia.url) {
                                            window.open(evidencia.url, '_blank');
                                        }
                                    };

                                    return (
                                        <div key={evidencia.id_evidencia} className="evidencia-item">
                                            <div className="evidencia-media">
                                                {evidencia.tipo_evidencia === 'image' ? (
                                                    <>
                                                        <img
                                                            src={evidencia.url}
                                                            alt={evidencia.nombre_archivo_original}
                                                            className="evidencia-preview"
                                                            onClick={handleImageClick}
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
                                                        onClick={handleDownload}
                                                        title={`Descargar ${evidencia.nombre_archivo_original}`}
                                                    >
                                                        <span className="material-icons">
                                                            {getFileIcon(evidencia.tipo_evidencia)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="evidencia-overlay">
                                                    <div>{evidencia.estados?.nombre_estado || 'Estado'}</div>
                                                    <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                                                        {evidencia.nombre_archivo_original}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="evidencia-actions">
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    onClick={handleDownload}
                                                    title="Descargar evidencia"
                                                >
                                                    <span className="material-icons">download</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrdenLookup;

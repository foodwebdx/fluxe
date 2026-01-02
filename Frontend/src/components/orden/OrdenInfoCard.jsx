const OrdenInfoCard = ({ orden }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="orden-info-card">
            <h2>📋 Información de la Orden</h2>

            <div className="info-grid">
                {/* Cliente */}
                <div className="info-section">
                    <div className="info-label">👤 Cliente</div>
                    <div className="info-value">{orden.cliente?.nombre_completo || 'N/A'}</div>
                    {orden.cliente?.telefono_contacto && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            📞 {orden.cliente.telefono_contacto}
                        </div>
                    )}
                    {orden.cliente?.correo_electronico && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            ✉️ {orden.cliente.correo_electronico}
                        </div>
                    )}
                </div>

                {/* Producto */}
                <div className="info-section">
                    <div className="info-label">📦 Producto</div>
                    <div className="info-value">{orden.producto?.nombre_producto || 'N/A'}</div>
                    {orden.producto?.modelo && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Modelo: {orden.producto.modelo}
                        </div>
                    )}
                    {orden.producto?.numero_serie && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Serie: {orden.producto.numero_serie}
                        </div>
                    )}
                </div>

                {/* Flujo */}
                <div className="info-section">
                    <div className="info-label">🌊 Flujo de Trabajo</div>
                    <div className="info-value">{orden.flujo?.nombre_flujo || orden.flujos?.nombre_flujo || 'N/A'}</div>
                    {(orden.flujo?.descripcion_flujo || orden.flujos?.descripcion_flujo) && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {orden.flujo?.descripcion_flujo || orden.flujos?.descripcion_flujo}
                        </div>
                    )}
                </div>

                {/* Estado Actual */}
                <div className="info-section">
                    <div className="info-label">📊 Estado Actual</div>
                    <div className="info-value">
                        {orden.estado_actual?.nombre_estado || orden.estados?.nombre_estado || 'N/A'}
                    </div>
                </div>
            </div>

            {/* Descripción del Servicio */}
            {orden.descripcion_servicio && (
                <div className="info-section" style={{ marginTop: '1.5rem' }}>
                    <div className="info-label">📝 Descripción del Servicio</div>
                    <div className="info-value" style={{ whiteSpace: 'pre-wrap' }}>
                        {orden.descripcion_servicio}
                    </div>
                </div>
            )}

            {/* Condiciones de Pago */}
            {orden.condiciones_pago && (
                <div className="info-section">
                    <div className="info-label">💰 Condiciones de Pago</div>
                    <div className="info-value">{orden.condiciones_pago}</div>
                </div>
            )}

            <div className="info-grid" style={{ marginTop: '1.5rem' }}>
                {/* Fecha de Creación */}
                <div className="info-section">
                    <div className="info-label">📅 Fecha de Creación</div>
                    <div className="info-value">{formatDate(orden.fecha_creacion)}</div>
                </div>

                {/* Fecha Estimada de Entrega */}
                {orden.fecha_estimada_entrega && (
                    <div className="info-section">
                        <div className="info-label">🎯 Fecha Estimada de Entrega</div>
                        <div className="info-value">{formatDate(orden.fecha_estimada_entrega)}</div>
                    </div>
                )}

                {/* Fecha de Cierre */}
                {orden.fecha_cierre && (
                    <div className="info-section">
                        <div className="info-label">✅ Fecha de Cierre</div>
                        <div className="info-value">{formatDate(orden.fecha_cierre)}</div>
                    </div>
                )}
            </div>

            {/* Notas */}
            {orden.notas_orden && (
                <div className="info-section" style={{ marginTop: '1.5rem' }}>
                    <div className="info-label">📌 Notas Adicionales</div>
                    <div className="info-value" style={{ whiteSpace: 'pre-wrap' }}>
                        {orden.notas_orden}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdenInfoCard;

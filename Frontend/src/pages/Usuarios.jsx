import { useEffect, useState } from 'react';
import './Dashboard.css';
import { apiUrl } from '../config/api';


const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    usuario_login: '',
    hash_password: '',
  });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usuariosResponse, rolesResponse] = await Promise.all([
        fetch(apiUrl('/api/usuarios')),
        fetch(apiUrl('/api/roles')),
      ]);

      if (!usuariosResponse.ok || !rolesResponse.ok) {
        throw new Error('Error al cargar usuarios o roles');
      }

      const usuariosData = await usuariosResponse.json();
      const rolesData = await rolesResponse.json();
      setUsuarios(usuariosData.data || []);
      setRoles(rolesData.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(apiUrl('/api/usuarios'));

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      setUsuarios(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  const handleOpenModal = () => {
    setModalMode('create');
    setSelectedUsuario(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      usuario_login: '',
      hash_password: '',
    });
    setSelectedRoles([]);
    setShowModal(true);
    setFormError(null);
  };

  const handleViewUsuario = (usuario) => {
    setModalMode('view');
    setSelectedUsuario(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      usuario_login: usuario.usuario_login || '',
      hash_password: '',
    });
    setSelectedRoles((usuario.roles || []).map((rol) => rol.id_rol));
    setShowModal(true);
    setFormError(null);
  };

  const handleEditUsuario = (usuario) => {
    setModalMode('edit');
    setSelectedUsuario(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      usuario_login: usuario.usuario_login || '',
      hash_password: '',
    });
    setSelectedRoles((usuario.roles || []).map((rol) => rol.id_rol));
    setShowModal(true);
    setFormError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('create');
    setSelectedUsuario(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      usuario_login: '',
      hash_password: '',
    });
    setSelectedRoles([]);
    setFormError(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleToggle = (roleId) => {
    if (modalMode === 'view') {
      return;
    }

    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }

      return [...prev, roleId];
    });
  };

  const syncRoles = async (userId, nextRoles, currentRoles) => {
    const nextRoleIds = nextRoles.map((roleId) => parseInt(roleId));
    const currentRoleIds = (currentRoles || []).map((roleId) => parseInt(roleId));

    const rolesToAdd = nextRoleIds.filter((roleId) => !currentRoleIds.includes(roleId));
    const rolesToRemove = currentRoleIds.filter(
      (roleId) => !nextRoleIds.includes(roleId)
    );

    const requests = [];

    rolesToAdd.forEach((roleId) => {
      requests.push(
        fetch('http://localhost:3000/api/usuarios-roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_usuario: userId,
            id_rol: roleId,
          }),
        })
      );
    });

    rolesToRemove.forEach((roleId) => {
      requests.push(
        fetch(`http://localhost:3000/api/usuarios-roles/${userId}/${roleId}`, {
          method: 'DELETE',
        })
      );
    });

    if (requests.length === 0) {
      return;
    }

    const responses = await Promise.all(requests);
    const failedResponse = responses.find((response) => !response.ok);

    if (failedResponse) {
      const data = await failedResponse.json().catch(() => ({}));
      throw new Error(data.message || 'Error al actualizar roles');
    }
  };

  const buildPayload = () => {
    const payload = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      usuario_login: formData.usuario_login.trim(),
    };

    if (formData.hash_password) {
      payload.hash_password = formData.hash_password;
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let response;
      let userId;
      let currentRoles = [];

      if (modalMode === 'edit') {
        response = await fetch(
          `http://localhost:3000/api/usuarios/${selectedUsuario.id_usuario}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(buildPayload()),
          }
        );
        userId = selectedUsuario.id_usuario;
        currentRoles = (selectedUsuario.roles || []).map((rol) => rol.id_rol);
      } else {
        response = await fetch('http://localhost:3000/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...buildPayload(),
            hash_password: formData.hash_password,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Error al ${modalMode === 'edit' ? 'actualizar' : 'crear'} el usuario`
        );
      }

      if (modalMode !== 'edit') {
        userId = data.data?.id_usuario;
      }

      if (userId) {
        await syncRoles(userId, selectedRoles, currentRoles);
      }

      await fetchUsuarios();
      handleCloseModal();
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el usuario');
      }

      await fetchUsuarios();
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Usuarios</h1>
          <p className="subtitle">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Usuarios</h1>
          <p className="subtitle" style={{ color: '#ef4444' }}>
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Usuarios</h1>
            <p className="subtitle">Gestion de usuarios y roles del sistema</p>
          </div>
          <button className="btn-add" onClick={handleOpenModal}>
            <span className="btn-icon">+</span>
            Agregar Usuario
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🧑‍💼</div>
          <div className="stat-content">
            <p className="stat-label">Total Usuarios</p>
            <h3 className="stat-value">{usuarios.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <p className="stat-label">Roles Disponibles</p>
            <h3 className="stat-value">{roles.length}</h3>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card full-width">
          <h3>Lista de Usuarios</h3>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Roles</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario}>
                      <td>#{usuario.id_usuario}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.usuario_login || '-'}</td>
                      <td>{usuario.email}</td>
                      <td>
                        {(usuario.roles || []).length === 0
                          ? 'Sin roles'
                          : (usuario.roles || []).map((rol) => (
                              <span key={rol.id_rol} className="badge badge-info" style={{ marginRight: '0.35rem' }}>
                                {rol.nombre_rol}
                              </span>
                            ))}
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => handleViewUsuario(usuario)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn-sm btn-secondary"
                          onClick={() => handleEditUsuario(usuario)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => handleDelete(usuario.id_usuario)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Agregar Nuevo Usuario'}
                {modalMode === 'view' && 'Detalles del Usuario'}
                {modalMode === 'edit' && 'Editar Usuario'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="form-error">{formError}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="usuario_login">Usuario *</label>
                  <input
                    type="text"
                    id="usuario_login"
                    name="usuario_login"
                    value={formData.usuario_login}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Correo Electronico *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required={modalMode !== 'view'}
                    disabled={modalMode === 'view'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Telefono</label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hash_password">
                  {modalMode === 'edit' ? 'Nueva Contrasena' : 'Contrasena'}
                  {modalMode === 'create' ? ' *' : ''}
                </label>
                <input
                  type="password"
                  id="hash_password"
                  name="hash_password"
                  value={formData.hash_password}
                  onChange={handleInputChange}
                  required={modalMode === 'create'}
                  disabled={modalMode === 'view'}
                />
              </div>

              <div className="form-group">
                <label>Roles</label>
                {roles.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No hay roles configurados</p>
                ) : (
                  <div className="roles-grid">
                    {roles.map((rol) => (
                      <label key={rol.id_rol} className="role-option">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(rol.id_rol)}
                          onChange={() => handleRoleToggle(rol.id_rol)}
                          disabled={modalMode === 'view'}
                        />
                        <span>{rol.nombre_rol}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className="btn-submit" disabled={formLoading}>
                    {formLoading
                      ? modalMode === 'edit'
                        ? 'Actualizando...'
                        : 'Creando...'
                      : modalMode === 'edit'
                        ? 'Actualizar Usuario'
                        : 'Crear Usuario'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;

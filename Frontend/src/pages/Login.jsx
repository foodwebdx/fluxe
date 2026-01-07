import { useState } from 'react';
import { apiUrl } from '../config/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!usuarioLogin.trim() || !password.trim()) {
      setError('Usuario y contrasena son requeridos');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_login: usuarioLogin.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales invalidas');
      }

      onLogin({ user: data.user });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Fluxe</h1>
        <p className="login-subtitle">Inicia sesion para continuar</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Usuario</span>
            <input
              type="text"
              value={usuarioLogin}
              onChange={(event) => setUsuarioLogin(event.target.value)}
              placeholder="tu.usuario"
              autoComplete="username"
            />
          </label>
          <label className="login-field">
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

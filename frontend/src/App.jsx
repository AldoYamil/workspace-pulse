import { useEffect, useState } from 'react';
import api from './api/axios';

function App() {
  const [mensaje, setMensaje] = useState('Cargando conexión...');
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    // Petición al endpoint de Django
    api.get('/health/')
      .then((response) => {
        setMensaje(response.data.message);
        setEstado('conectado');
      })
      .catch((error) => {
        console.error('Error al conectar con el backend:', error);
        setMensaje('No se pudo conectar con el servidor Backend.');
        setEstado('error');
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>WorkSpace Pulse</h1>
      <p>Prueba de integración Backend & Frontend</p>
      
      <div style={{
        display: 'inline-block',
        padding: '15px 25px',
        borderRadius: '8px',
        backgroundColor: estado === 'conectado' ? '#e6fffa' : '#fff5f5',
        color: estado === 'conectado' ? '#234e52' : '#9b2c2c',
        border: `1px solid ${estado === 'conectado' ? '#319795' : '#e53e3e'}`
      }}>
        <strong>Respuesta del Servidor:</strong>
        <p>{mensaje}</p>
      </div>
    </div>
  );
}

export default App;
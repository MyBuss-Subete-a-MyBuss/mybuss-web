// TODO: Conectar backend y front
// Si cambia la URL del API, solo se cambia aquí
const API_URL = 'https://github.com/MyBuss-Subete-a-MyBuss/mybuss-web.git';

// Ponlo en true mientras el endpoint no exista
const USAR_DATOS_DE_PRUEBA = true;

export async function iniciarSesion(correo, password) {

  // Modo prueba: simula la respuesta del API
  if (USAR_DATOS_DE_PRUEBA) {
    if (correo === 'laura.gomez@ejemplo.com' && password === 'Prueba123') {
      return { mensaje: 'Inicio de sesión exitoso' };
    }
    throw new Error('Correo o contraseña incorrectos');
  }

  // Modo real: llamada al API
  const respuesta = await fetch(`${API_URL}/auth/login`, {   // cambia /auth/login por la ruta real
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password })               // cambia los nombres si el API pide otros
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Correo o contraseña incorrectos');
  }

  return datos;
}
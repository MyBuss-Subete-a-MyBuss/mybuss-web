document.getElementById('registroForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que la página se recargue

  const boton = e.target.querySelector('button[type="submit"]');
  const mensaje = document.getElementById('mensaje-error');
  mensaje.textContent = '';

  //Validar contraseñas en el frontend
  const password = document.getElementById('password').value;
  const confirmar = document.getElementById('confirmar').value;

  if (password !== confirmar) {
    mensaje.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  const fecha = document.getElementById('fecha').value;
  if (!fecha) {
    mensaje.textContent = 'Selecciona tu fecha de nacimiento.';
    return;
  }

  const nacimiento = new Date(fecha + 'T00:00:00');
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if (edad < 18) {
    mensaje.textContent = 'Debes ser mayor de edad para registrarte.';
    return;
  }

  //Mapear los campos del formulario al objeto de datos
  const usuarioData = {
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    tipoDocumento: document.getElementById('tipo-documento').value.toUpperCase(),
    numeroDocumento: document.getElementById('numid').value,
    fechaNacimiento: document.getElementById('fecha').value,
    correo: document.getElementById('correo').value,
    celular: document.getElementById('celular').value,
    fotoUrl: null,
    aceptaTerminos: document.getElementById('terminos').checked,
    autorizaDatos: document.getElementById('terminos').checked,
    recibirNovedades: document.getElementById('novedades').checked,
    contrasena: password
  };

  boton.disabled = true;
  boton.classList.add('cargando');

  try {
    //Enviar la petición HTTP POST a tu API de Java
    const response = await fetch('http://localhost:8080/api/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarioData)
    });

    //Manejar la respuesta del servidor
    if (response.ok) {
      window.location.href = 'login.html';
      return;
    }

    const errorTexto = await response.text().catch(() => '');
    mensaje.textContent = errorTexto || 'Verifica los datos ingresados.';

  } catch (error) {
    console.error('Error de red:', error);
    mensaje.textContent = 'No se pudo conectar con el servidor de My Buss.';
  }

  boton.disabled = false;
  boton.classList.remove('cargando');
});

const iconoOjo = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>';
const iconoOjoTachado = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>';

document.querySelectorAll('.ver-password').forEach((boton) => {
  boton.addEventListener('click', () => {
    const input = boton.previousElementSibling;
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    boton.innerHTML = mostrar ? iconoOjoTachado : iconoOjo;
    boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});

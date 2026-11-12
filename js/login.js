document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const boton = e.target.querySelector('button[type="submit"]');
  const mensaje = document.getElementById('mensaje-error');
  mensaje.textContent = '';

  //Captura los valores de los inputs de login.html
  const correo = document.getElementById('correo').value;
  const clave = document.getElementById('clave').value;

  if (!correo || !clave) {
    mensaje.textContent = 'Por favor, completa tu correo y contraseña.';
    return;
  }

  // Armar el objeto JSON
  const loginData = {
    identificador: correo,
    contrasena: clave
  };

  boton.disabled = true;
  boton.classList.add('cargando');

  try {
    //Petición POST al endpoint de autenticación
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (response.ok) {
      const data = await response.json();
      //Guardar la sesión en el navegador para usar el idUsuario en otras vistas
      localStorage.setItem('usuarioLogueado', JSON.stringify(data));

      window.location.href = 'landingpage.html';
      return;
    }

    mensaje.textContent = 'Correo o contraseña incorrectos.';

  } catch (error) {
    console.error('Error de red:', error);
    mensaje.textContent = 'No se pudo conectar con el servidor de My Buss.';
  }

  boton.disabled = false;
  boton.classList.remove('cargando');
});

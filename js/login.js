document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  //Captura los valores de los inputs de login.html
  const correo = document.getElementById('correo').value;
  const clave = document.getElementById('clave').value;

  if (!correo || !clave) {
    alert('Por favor, completa tu correo y contraseña.');
    return;
  }

  // Armar el objeto JSON
  const loginData = {
    identificador: correo,
    contrasena: clave
  };

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
      
      alert('¡Bienvenido de vuelta!');
      // Redirige a la vista principal o de perfil (ajusta el nombre si tu página inicial se llama distinto)
      window.location.href = 'landingpage.html'; 
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert('Error al iniciar sesión: ' + (errorData.mensaje || errorData.message || 'Correo o contraseña incorrectos.'));
    }

  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor de My Buss.');
  }
});

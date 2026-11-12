document.getElementById('registroForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que la página se recargue

  //Validar contraseñas en el frontend
  const password = document.getElementById('password').value;
  const confirmar = document.getElementById('confirmar').value;

  if (password !== confirmar) {
    alert('Las contraseñas no coinciden.');
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
    contrasena_hash: password    
  };

  try {
    //Enviar la petición HTTP POST a tu API de Java
    //Reemplaza la URL por el endpoint real de tu backend
    const response = await fetch('http://localhost:8080/api/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarioData)
    });

    //Manejar la respuesta del servidor
    if (response.ok) {
      alert('¡Cuenta creada con éxito!');
      window.location.href = 'login.html'; // Redirecciona al login
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert('Error en el registro: ' + (errorData.mensaje || errorData.message || 'Verifica los datos ingresados.'));
    }

  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor de My Buss.');
  }
});

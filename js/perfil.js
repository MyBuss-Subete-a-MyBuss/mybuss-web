document.addEventListener('DOMContentLoaded', () => {
  // 1. Obtener el usuario logueado desde localStorage
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');

  if (!usuarioGuardado) {
    alert('No has iniciado sesión. Serás redirigido al login.');
    window.location.href = 'login.html';
    return;
  }

  let usuario = JSON.parse(usuarioGuardado);
  const idUsuario = usuario.idUsuario;

  // Referencias a elementos del DOM
  const btnEditar = document.getElementById('btn-editar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const accionesEdicion = document.getElementById('acciones-edicion');
  const formPerfil = document.getElementById('form-perfil');

  // Inputs editables
  const inputNombres = document.getElementById('nombres');
  const inputApellidos = document.getElementById('apellidos');
  const inputCorreo = document.getElementById('correo');
  const inputCelular = document.getElementById('celular');

  // Inputs solo lectura (datos fijos en esta vista)
  const inputDocumento = document.getElementById('documento');
  const inputNacimiento = document.getElementById('nacimiento');

  // 2. Función para pintar los datos reales del usuario en la pantalla
  function cargarDatosEnPantalla(datos) {
    // Iniciales para los avatares
    const iniciales = `${datos.nombre?.charAt(0) || ''}${datos.apellido?.charAt(0) || ''}`.toUpperCase();
    document.querySelectorAll('.avatar').forEach(el => el.textContent = iniciales);

    // Encabezado de la tarjeta principal
    document.querySelector('.datos h2').textContent = `${datos.nombre} ${datos.apellido}`;
    document.querySelector('.datos p').textContent = datos.correo;
    
    if (datos.fechaRegistro) {
      const fechaFormateada = new Date(datos.fechaRegistro).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      document.querySelector('.datos small').textContent = `Miembro desde ${fechaFormateada}`;
    }

    // Valores de los inputs
    inputNombres.value = datos.nombre || '';
    inputApellidos.value = datos.apellido || '';
    inputDocumento.value = `${datos.tipoDocumento || ''} · ${datos.numeroDocumento || ''}`;
    inputNacimiento.value = datos.fechaNacimiento || '';
    inputCorreo.value = datos.correo || '';
    inputCelular.value = datos.celular || '';
  }

  // Cargar datos iniciales al abrir la página
  cargarDatosEnPantalla(usuario);

  // 3. Habilitar modo edición al hacer clic en "Editar perfil"
  btnEditar.addEventListener('click', () => {
    inputNombres.removeAttribute('readonly');
    inputApellidos.removeAttribute('readonly');
    inputCorreo.removeAttribute('readonly');
    inputCelular.removeAttribute('readonly');

    inputNombres.focus();
    accionesEdicion.hidden = false;
    btnEditar.hidden = true;
  });

  // 4. Cancelar edición y restaurar valores originales
  btnCancelar.addEventListener('click', () => {
    cargarDatosEnPantalla(usuario);
    bloquearCampos();
  });

  function bloquearCampos() {
    inputNombres.setAttribute('readonly', true);
    inputApellidos.setAttribute('readonly', true);
    inputCorreo.setAttribute('readonly', true);
    inputCelular.setAttribute('readonly', true);

    accionesEdicion.hidden = true;
    btnEditar.hidden = false;
  }

  // 5. Enviar cambios al endpoint PATCH /api/usuario/{id}
  formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosActualizados = {
      nombre: inputNombres.value.trim(),
      apellido: inputApellidos.value.trim(),
      correo: inputCorreo.value.trim(),
      celular: inputCelular.value.trim()
    };

    try {
      const response = await fetch(`http://localhost:8080/api/usuario/${idUsuario}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
      });

      if (response.ok) {
        const usuarioRespuesta = await response.json();
        
        // Actualizar la sesión local con los nuevos datos
        usuario = usuarioRespuesta;
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
        
        cargarDatosEnPantalla(usuario);
        bloquearCampos();
        alert('¡Datos actualizados con éxito!');
      } else {
        alert('No se pudieron actualizar los datos. Verifica la información ingresada.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión con el servidor de My Buss.');
    }
  });
});

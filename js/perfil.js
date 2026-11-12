window.addEventListener('pageshow', (e) => {
  if (e.persisted && !localStorage.getItem('usuarioLogueado')) {
    window.location.replace('login.html');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar que exista sesión activa en localStorage
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');

  if (!usuarioGuardado) {
    window.location.replace('login.html');
    return;
  }

  let usuario = JSON.parse(usuarioGuardado);
  const idUsuario = usuario.idUsuario;

  // Referencias a elementos del DOM
  const btnEditar = document.getElementById('btn-editar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const accionesEdicion = document.getElementById('acciones-edicion');
  const formPerfil = document.getElementById('form-perfil');
  const btnEliminar = document.querySelector('.btn-rojo');
  const modalEliminar = document.getElementById('modal-eliminar');
  const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
  const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
  const mensajePerfil = document.getElementById('mensaje-perfil');

  // Inputs editables
  const inputNombres = document.getElementById('nombres');
  const inputApellidos = document.getElementById('apellidos');
  const inputCorreo = document.getElementById('correo');
  const inputCelular = document.getElementById('celular');

  // Inputs solo lectura
  const inputDocumento = document.getElementById('documento');
  const inputNacimiento = document.getElementById('nacimiento');

  // 2. Función para pintar los datos en la pantalla
  function cargarDatosEnPantalla(datos) {
    const iniciales = `${datos.nombre?.charAt(0) || ''}${datos.apellido?.charAt(0) || ''}`.toUpperCase();
    document.querySelectorAll('.avatar').forEach(el => el.textContent = iniciales);

    document.querySelector('.datos h2').textContent = `${datos.nombre} ${datos.apellido}`;
    document.querySelector('.datos p').textContent = datos.correo;
    
    if (datos.fechaRegistro) {
      const fechaFormateada = new Date(datos.fechaRegistro).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      document.querySelector('.datos small').textContent = `Miembro desde ${fechaFormateada}`;
    }

    inputNombres.value = datos.nombre || '';
    inputApellidos.value = datos.apellido || '';
    inputDocumento.value = `${datos.tipoDocumento || ''} · ${datos.numeroDocumento || ''}`;
    inputNacimiento.value = datos.fechaNacimiento || '';
    inputCorreo.value = datos.correo || '';
    inputCelular.value = datos.celular || '';
  }

  // Pintar datos locales primero mientras responde el servidor
  cargarDatosEnPantalla(usuario);

  // 3. Consultar datos actualizados desde la API (GET /api/usuario/{id})
  async function obtenerUsuarioDesdeAPI() {
    try {
      const response = await fetch(`http://localhost:8080/api/usuario/${idUsuario}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const datosFrescos = await response.json();
        usuario = datosFrescos;
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
        cargarDatosEnPantalla(usuario);
      } else if (response.status === 404) {
        alert('El usuario no fue encontrado en la base de datos.');
      } else {
        console.error('Error al obtener los datos del usuario:', response.status);
      }
    } catch (error) {
      console.error('Error de red al consultar el usuario:', error);
    }
  }

  // Ejecutar la consulta GET apenas abre la página
  await obtenerUsuarioDesdeAPI();

  // 4. Habilitar modo edición
  btnEditar.addEventListener('click', () => {
    inputNombres.removeAttribute('readonly');
    inputApellidos.removeAttribute('readonly');
    inputCorreo.removeAttribute('readonly');
    inputCelular.removeAttribute('readonly');

    inputNombres.focus();
    accionesEdicion.hidden = false;
    btnEditar.hidden = true;
  });

  // 5. Cancelar edición
  btnCancelar.addEventListener('click', () => {
    mensajePerfil.textContent = '';
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

  // 6. Enviar cambios al endpoint PATCH /api/usuario/{id}
  formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    const botonGuardar = formPerfil.querySelector('button[type="submit"]');
    mensajePerfil.textContent = '';

    const campos = {
      nombre: inputNombres.value.trim(),
      apellido: inputApellidos.value.trim(),
      correo: inputCorreo.value.trim(),
      celular: inputCelular.value.trim()
    };

    const datosActualizados = {};
    for (const campo in campos) {
      if (campos[campo] !== '' && campos[campo] !== usuario[campo]) {
        datosActualizados[campo] = campos[campo];
      }
    }

    if (Object.keys(datosActualizados).length === 0) {
      mensajePerfil.textContent = 'No hay cambios para guardar.';
      return;
    }

    botonGuardar.disabled = true;
    botonGuardar.classList.add('cargando');

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
        usuario = usuarioRespuesta;
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
        
        cargarDatosEnPantalla(usuario);
        bloquearCampos();
      } else if (response.status === 404) {
        mensajePerfil.textContent = 'El usuario no fue encontrado en la base de datos.';
      } else {
        mensajePerfil.textContent = 'No se pudieron actualizar los datos. Verifica la información ingresada.';
      }
    } catch (error) {
      console.error('Error de red:', error);
      mensajePerfil.textContent = 'Error de conexión con el servidor de My Buss.';
    }

    botonGuardar.disabled = false;
    botonGuardar.classList.remove('cargando');
  });

  function cerrarModal() {
    if (!btnConfirmarEliminar.disabled) {
      modalEliminar.hidden = true;
    }
  }

  btnEliminar.addEventListener('click', () => {
    mensajePerfil.textContent = '';
    modalEliminar.hidden = false;
  });

  btnCancelarEliminar.addEventListener('click', cerrarModal);

  modalEliminar.addEventListener('click', (e) => {
    if (e.target === modalEliminar) {
      cerrarModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalEliminar.hidden) {
      cerrarModal();
    }
  });

  btnConfirmarEliminar.addEventListener('click', async () => {
    btnConfirmarEliminar.disabled = true;
    btnCancelarEliminar.disabled = true;
    btnConfirmarEliminar.classList.add('cargando');

    try {
      const response = await fetch(`http://localhost:8080/api/usuario/${idUsuario}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 404) {
        localStorage.removeItem('usuarioLogueado');
        window.location.replace('landingpage.html');
        return;
      }

      mensajePerfil.textContent = 'No se pudo eliminar la cuenta. Intenta de nuevo.';
    } catch (error) {
      console.error('Error de red:', error);
      mensajePerfil.textContent = 'Error de conexión con el servidor de My Buss.';
    }

    btnConfirmarEliminar.disabled = false;
    btnCancelarEliminar.disabled = false;
    btnConfirmarEliminar.classList.remove('cargando');
    modalEliminar.hidden = true;
  });
});

